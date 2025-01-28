import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Button } from './ui/button';
import { Select } from './ui/select';
import DataTable from './DataTable';
import { exportData } from '../utils/exportUtils';

export function DataVisualizer({ data }) {
  const [visualizationType, setVisualizationType] = useState('table');
  const [chartConfig, setChartConfig] = useState({
    xAxis: '',
    yAxis: '',
  });

  // Get all possible columns from the data
  const columns = data && data.length > 0 
    ? Object.keys(data[0])
    : [];

  const handleExport = (format) => {
    try {
      exportData(data, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderVisualization = () => {
    if (!data || data.length === 0) {
      return <div>No data to visualize</div>;
    }

    switch (visualizationType) {
      case 'table':
        return <DataTable data={data} />;

      case 'line':
        return (
          <LineChart width={600} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={chartConfig.yAxis} stroke="#8884d8" />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart width={600} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={chartConfig.yAxis} fill="#8884d8" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              dataKey={chartConfig.yAxis}
              nameKey={chartConfig.xAxis}
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            />
            <Tooltip />
          </PieChart>
        );

      default:
        return <div>Select a visualization type</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 items-center">
        <Select
          value={visualizationType}
          onChange={(e) => setVisualizationType(e.target.value)}
          className="w-40"
        >
          <option value="table">Table</option>
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
        </Select>

        {visualizationType !== 'table' && (
          <>
            <Select
              value={chartConfig.xAxis}
              onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
              className="w-40"
            >
              <option value="">Select X-Axis</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </Select>

            <Select
              value={chartConfig.yAxis}
              onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
              className="w-40"
            >
              <option value="">Select Y-Axis</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </Select>
          </>
        )}
      </div>

      <div className="flex space-x-2">
        <Button onClick={() => handleExport('csv')}>Export CSV</Button>
        <Button onClick={() => handleExport('json')}>Export JSON</Button>
        <Button onClick={() => handleExport('hl7')}>Export HL7</Button>
        <Button onClick={() => handleExport('fhir')}>Export FHIR</Button>
      </div>

      <div className="mt-4">
        {renderVisualization()}
      </div>
    </div>
  );
}
