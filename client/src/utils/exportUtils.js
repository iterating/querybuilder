import { saveAs } from 'file-saver';

const convertToCSV = (data) => {
  if (!data || !data.length) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(header => {
    const value = obj[header];
    return typeof value === 'string' ? `"${value}"` : value;
  }).join(','));
  
  return [headers.join(','), ...rows].join('\n');
};

const generateHL7Timestamp = () => {
  const now = new Date();
  return now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/T/, '')
    .split('.')[0];
};

const escapeHL7 = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/^/g, '\\^')
    .replace(/&/g, '\\&')
    .replace(/~/g, '\\~')
    .replace(/\\/g, '\\\\');
};

const convertToHL7 = (data) => {
  if (!data || !data.length) return '';
  
  const timestamp = generateHL7Timestamp();
  const messages = data.map((row, index) => {
    const segments = [];
    
    // MSH (Message Header) segment
    segments.push([
      'MSH',
      '^~\\&',                    // Encoding Characters
      'QUERYBUILDER',             // Sending Application
      'FACILITY',                 // Sending Facility
      'REC_APP',                  // Receiving Application
      'REC_FACILITY',             // Receiving Facility
      timestamp,                  // Message Timestamp
      '',                         // Security
      'ORU^R01',                 // Message Type
      `QRY${index + 1}`,         // Message Control ID
      'P',                        // Processing ID
      '2.5.1'                    // Version ID
    ].join('|'));

    // PID (Patient Identification) segment if relevant fields exist
    if (row.patient_id || row.name || row.dob) {
      segments.push([
        'PID',                    // Segment ID
        '1',                      // Set ID
        row.patient_id || '',     // Patient ID
        '',                       // Patient ID List
        row.name || '',           // Patient Name
        '',                       // Mother's Maiden Name
        row.dob || '',           // Date of Birth
        row.gender || ''         // Gender
      ].join('|'));
    }

    // OBR (Observation Request) segment
    segments.push([
      'OBR',                     // Segment ID
      '1',                       // Set ID
      `QRY${index + 1}`,        // Placer Order Number
      '',                        // Filler Order Number
      'QUERY_RESULTS',          // Universal Service ID
      timestamp,                // Requested Date/Time
      timestamp,                // Observation Date/Time
      '',                       // Observation End Date/Time
      '',                       // Collection Volume
      '',                       // Collector Identifier
      '',                       // Specimen Action Code
      '',                       // Danger Code
      ''                        // Relevant Clinical Info
    ].join('|'));

    // OBX (Observation) segments for each field
    Object.entries(row).forEach(([key, value], obsIndex) => {
      segments.push([
        'OBX',                   // Segment ID
        String(obsIndex + 1),    // Set ID
        'ST',                    // Value Type
        escapeHL7(key),          // Observation Identifier
        '',                      // Observation Sub-ID
        escapeHL7(value),        // Observation Value
        '',                      // Units
        '',                      // References Range
        '',                      // Abnormal Flags
        '',                      // Probability
        'F',                     // Nature of Abnormal Test
        'F',                     // Observation Result Status
        timestamp               // Date/Time of the Observation
      ].join('|'));
    });

    return segments.join('\r');
  });

  return messages.join('\r\r');
};

const convertToFHIR = (data) => {
  if (!data || !data.length) return {};

  // Create a FHIR Bundle
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: data.map((item, index) => ({
      fullUrl: `urn:uuid:${index}`,
      resource: {
        resourceType: 'Observation',
        id: `${index}`,
        status: 'final',
        code: {
          text: 'Query Result'
        },
        effectiveDateTime: new Date().toISOString(),
        component: Object.entries(item).map(([key, value]) => ({
          code: {
            text: key
          },
          valueString: String(value)
        }))
      }
    }))
  };

  return bundle;
};

export const exportData = (data, format) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  let content = '';
  let filename = '';
  let type = '';

  try {
    switch (format.toLowerCase()) {
      case 'csv':
        content = convertToCSV(data);
        filename = 'export.csv';
        type = 'text/csv;charset=utf-8';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = 'export.json';
        type = 'application/json;charset=utf-8';
        break;
      case 'hl7':
        content = convertToHL7(data);
        filename = 'export.hl7';
        type = 'text/plain;charset=utf-8';
        break;
      case 'fhir':
        content = JSON.stringify(convertToFHIR(data), null, 2);
        filename = 'export.fhir.json';
        type = 'application/json;charset=utf-8';
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const blob = new Blob([content], { type });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};
