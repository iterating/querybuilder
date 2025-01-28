export const DEFAULT_TEMPLATES = [
  {
    id: 'template_1',
    name: 'Basic Table Statistics',
    description: 'Get basic statistics about a table including row count and column statistics',
    query: `SELECT COUNT(*) as total_rows,
        COUNT(DISTINCT column_name) as unique_values,
        MIN(column_name) as min_value,
        MAX(column_name) as max_value,
        AVG(numeric_column) as average
 FROM {table_name}`,
    category: 'Analytics',
    database_type: 'postgres',
    is_public: true,
  },
  {
    id: 'template_2',
    name: 'Time Series Analysis',
    description: 'Analyze trends over time with daily aggregation',
    query: `SELECT DATE_TRUNC('day', timestamp_column) as date,
        COUNT(*) as daily_count,
        SUM(value_column) as daily_sum
 FROM {table_name}
 GROUP BY DATE_TRUNC('day', timestamp_column)
 ORDER BY date`,
    category: 'Analytics',
    database_type: 'postgres',
    is_public: true,
  },
  {
    id: 'template_3',
    name: 'MongoDB Collection Stats',
    description: 'Get basic statistics about a MongoDB collection',
    query: `db.collection.aggregate([
   {
     $group: {
       _id: null,
       count: { $sum: 1 },
       distinctValues: { $addToSet: "$field" },
       avgValue: { $avg: "$numericField" }
     }
   }
 ])`,
    category: 'Analytics',
    database_type: 'mongodb',
    is_public: true,
  },
  {
    id: 'template_4',
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
    id: 'template_5',
    name: 'Data Quality Check',
    description: 'Check for null values and data consistency',
    query: `SELECT column_name, 
        COUNT(*) as total_rows,
        COUNT(column_name) as non_null_rows,
        COUNT(*) - COUNT(column_name) as null_rows,
        COUNT(DISTINCT column_name) as unique_values
 FROM {table_name}
 GROUP BY column_name`,
    category: 'Data Quality',
    database_type: 'postgres',
    is_public: true,
  },
  {
    id: 'template_6',
    name: 'Recent Changes Monitor',
    description: 'Monitor recent changes in the table',
    query: `SELECT *
 FROM {table_name}
 WHERE updated_at >= NOW() - INTERVAL '24 hours'
 ORDER BY updated_at DESC`,
    category: 'Monitoring',
    database_type: 'postgres',
    is_public: true,
  },
  {
    id: 'template_7',
    name: 'Duplicate Records Finder',
    description: 'Find and analyze duplicate records',
    query: `SELECT column1, column2, COUNT(*) as occurrence_count
 FROM {table_name}
 GROUP BY column1, column2
 HAVING COUNT(*) > 1
 ORDER BY occurrence_count DESC`,
    category: 'Data Quality',
    database_type: 'postgres',
    is_public: true,
  },
  {
    id: 'template_8',
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
