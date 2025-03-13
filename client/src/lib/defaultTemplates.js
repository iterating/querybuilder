export const DEFAULT_TEMPLATES = [
  {
    id: 'template_1',
    name: 'Basic Table Information',
    description: 'Get basic table statistics including row count',
    query: `SELECT COUNT(*) as total_rows FROM {table_name}`,
    category: 'Analytics',
    database_type: 'postgres',
    is_public: true,
    dbConfig: {
      type: 'postgres',
      url: '',
      tableName: '' // Will be filled by user
    }
  },
  {
    id: 'template_2',
    name: 'Table Column Information',
    description: 'View all columns and their data types in a table',
    query: `SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  column_default,
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = '{table_name}'
ORDER BY 
  ordinal_position`,
    category: 'Schema',
    database_type: 'postgres',
    is_public: true,
    dbConfig: {
      type: 'postgres',
      url: '',
      tableName: '' // Will be filled by user
    }
  },
  {
    id: 'template_3',
    name: 'MongoDB Basic Aggregation',
    description: 'Basic aggregation example with grouping and sorting',
    // This is a MongoDB aggregation pipeline in JSON format
    query: [
      { 
        "$match": { 
          "field": { "$exists": true } 
        } 
      },
      { 
        "$group": { 
          "_id": "$category",
          "count": { "$sum": 1 },
          "avgValue": { "$avg": "$value" },
          "maxValue": { "$max": "$value" }
        }
      },
      { 
        "$sort": { 
          "count": -1 
        } 
      }
    ],
    category: 'Analytics',
    database_type: 'mongodb',
    dbConfig: {
      type: 'mongodb',
      tableName: 'your_collection_name', // Replace with your collection name
      url: '' // Will be filled by user
    },
    is_public: true,
  },
  {
    id: 'template_4',
    name: 'MongoDB Collection Stats',
    description: 'Get basic statistics about a MongoDB collection',
    query: [
      {
        "$group": {
          "_id": null,
          "totalDocuments": { "$sum": 1 },
          "uniqueValues": { "$addToSet": "$field" },
          "averageValue": { "$avg": "$numericField" }
        }
      },
      {
        "$project": {
          "_id": 0,
          "totalDocuments": 1,
          "uniqueValueCount": { "$size": "$uniqueValues" },
          "averageValue": { "$round": ["$averageValue", 2] }
        }
      }
    ],
    category: 'Analytics',
    database_type: 'mongodb',
    dbConfig: {
      type: 'mongodb',
      tableName: 'your_collection_name',
      url: ''
    },
    is_public: true,
  },
  {
    id: 'template_5',
    name: 'MySQL Performance Analysis',
    description: 'Analyze table performance and indexing',
    query: `SELECT table_name, 
        table_rows,
        data_length/1024/1024 as data_size_mb,
        index_length/1024/1024 as index_size_mb
 FROM information_schema.tables
 WHERE table_schema = DATABASE()`,
    category: 'Performance',
    database_type: 'mysql',
    is_public: true,
  },
  {
    id: 'template_6',
    name: 'Sample Data Preview',
    description: 'Preview the first 10 rows of data from a table',
    query: `SELECT * FROM {table_name} LIMIT 10`,
    category: 'Data Quality',
    database_type: 'postgres',
    is_public: true,
    dbConfig: {
      type: 'postgres',
      url: '',
      tableName: '' // Will be filled by user
    }
  },
  {
    id: 'template_7',
    name: 'Table Size Information',
    description: 'Get size information about the table',
    query: `SELECT
  pg_size_pretty(pg_total_relation_size('{table_name}')) AS total_size,
  pg_size_pretty(pg_relation_size('{table_name}')) AS table_size,
  pg_size_pretty(pg_total_relation_size('{table_name}') - pg_relation_size('{table_name}')) AS index_size
FROM pg_catalog.pg_tables
WHERE tablename = '{table_name}'
LIMIT 1`,
    category: 'Performance',
    database_type: 'postgres',
    is_public: true,
    dbConfig: {
      type: 'postgres',
      url: '',
      tableName: '' // Will be filled by user
    }
  },
  {
    id: 'template_8',
    name: 'Table Indexes',
    description: 'View all indexes on a table',
    query: `SELECT
  i.relname AS index_name,
  a.attname AS column_name,
  ix.indisunique AS is_unique,
  ix.indisprimary AS is_primary
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND a.attnum = ANY(ix.indkey)
  AND t.relkind = 'r'
  AND t.relname = '{table_name}'
ORDER BY
  i.relname, a.attnum`,
    category: 'Performance',
    database_type: 'postgres',
    is_public: true,
    dbConfig: {
      type: 'postgres',
      url: '',
      tableName: '' // Will be filled by user
    }
  },
  {
    id: 'template_9',
    name: 'MongoDB Aggregation Pipeline',
    description: 'Complex data analysis using MongoDB aggregation',
    query: `db.collection.aggregate([
   { $match: { field: { $exists: true } } },
   { $group: { 
       _id: "$category",
       count: { $sum: 1 },
       avgValue: { $avg: "$value" },
       maxValue: { $max: "$value" }
     }
   },
   { $sort: { count: -1 } }
 ])`,
    category: 'Analytics',
    database_type: 'mongodb',
    is_public: true,
  }
];
