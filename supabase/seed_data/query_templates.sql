-- Common SQL Templates
INSERT INTO query_templates (name, description, query, category, database_type, is_public) VALUES
('Basic Table Statistics', 
 'Get basic statistics about a table including row count and column statistics', 
 'SELECT COUNT(*) as total_rows,
        COUNT(DISTINCT column_name) as unique_values,
        MIN(column_name) as min_value,
        MAX(column_name) as max_value,
        AVG(numeric_column) as average
 FROM {table_name}',
 'Analytics',
 'postgres',
 true),

('Time Series Analysis', 
 'Analyze trends over time with daily aggregation', 
 'SELECT DATE_TRUNC(''day'', timestamp_column) as date,
        COUNT(*) as daily_count,
        SUM(value_column) as daily_sum
 FROM {table_name}
 GROUP BY DATE_TRUNC(''day'', timestamp_column)
 ORDER BY date',
 'Analytics',
 'postgres',
 true),

('MongoDB Collection Stats', 
 'Get basic statistics about a MongoDB collection', 
 'db.collection.aggregate([
   {
     $group: {
       _id: null,
       count: { $sum: 1 },
       distinctValues: { $addToSet: "$field" },
       avgValue: { $avg: "$numericField" }
     }
   }
 ])',
 'Analytics',
 'mongodb',
 true),

('MySQL Performance Analysis', 
 'Analyze table performance and indexing', 
 'SELECT table_name, 
        table_rows,
        data_length/1024/1024 as data_size_mb,
        index_length/1024/1024 as index_size_mb
 FROM information_schema.tables
 WHERE table_schema = DATABASE()',
 'Performance',
 'mysql',
 true),

('Data Quality Check', 
 'Check for null values and data consistency', 
 'SELECT column_name, 
        COUNT(*) as total_rows,
        COUNT(column_name) as non_null_rows,
        COUNT(*) - COUNT(column_name) as null_rows,
        COUNT(DISTINCT column_name) as unique_values
 FROM {table_name}
 GROUP BY column_name',
 'Data Quality',
 'postgres',
 true),

('Recent Changes Monitor', 
 'Monitor recent changes in the table', 
 'SELECT *
 FROM {table_name}
 WHERE updated_at >= NOW() - INTERVAL ''24 hours''
 ORDER BY updated_at DESC',
 'Monitoring',
 'postgres',
 true),

('Duplicate Records Finder', 
 'Find and analyze duplicate records', 
 'SELECT column1, column2, COUNT(*) as occurrence_count
 FROM {table_name}
 GROUP BY column1, column2
 HAVING COUNT(*) > 1
 ORDER BY occurrence_count DESC',
 'Data Quality',
 'postgres',
 true),

('MongoDB Aggregation Pipeline', 
 'Complex data analysis using MongoDB aggregation', 
 'db.collection.aggregate([
   { $match: { field: { $exists: true } } },
   { $group: { 
       _id: "$category",
       count: { $sum: 1 },
       avgValue: { $avg: "$value" },
       maxValue: { $max: "$value" }
     }
   },
   { $sort: { count: -1 } }
 ])',
 'Analytics',
 'mongodb',
 true);
