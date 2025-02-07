# Data Analytics Sandbox

A secure and scalable platform that enables data analysts and developers to execute custom queries and build analytics tools, powered by Supabase.

## Features

- Custom query execution with security measures
- RESTful API endpoints for data access
- User authentication via Supabase Auth
- Query validation and rate limiting
- Logging and monitoring
- Query history tracking in local storage

[![](https://raw.githubusercontent.com/iterating/querybuilder/refs/heads/main/public/portfoio.querybuilder.qrcode.100.png)](https://querybuilder.vercel.app)

## Supported Databases

The Query Builder supports multiple database types. Here's how to use each one:

### Supabase

```sql
-- Example query
SELECT * FROM your_table WHERE column = 'value';
```

**Connection Details:**
- URL Format: `https://your-project.supabase.co`
- Required Fields:
  - API Key: Your Supabase anon key
  - Table Name: The table you want to query

### PostgreSQL

```sql
-- Example query
SELECT * FROM your_table WHERE column = 'value';
```

**Connection Details:**
- URL Format: `postgresql://user:password@host:5432/dbname`
- Required Fields:
  - Table Name: The table you want to query

### MySQL

```sql
-- Example query
SELECT * FROM your_table WHERE column = 'value';
```

**Connection Details:**
- URL Format: `mysql://user:password@host:3306/dbname`
- Required Fields:
  - Table Name: The table you want to query

### MongoDB

```javascript
// Example query
db.collection.find({ field: "value" })
```

**Connection Details:**
- URL Format: `mongodb://user:password@host:27017/dbname`
- Required Fields:
  - Collection Name: The collection you want to query (use this as Table Name)

## How to Use the Databases

### Quick Start

1. Start the application:
   ```bash
   pnpm dev
   ```

2. In the Query Builder interface:
   - Click "Show Database Config"
   - Select your database type
   - Enter your connection details
   - Start querying!

### Connection Details

#### Supabase
- URL Format: `https://your-project.supabase.co`
- Required Fields:
  - API Key: Your Supabase anon key
  - Table Name: The table you want to query

Example Query:
```sql
SELECT * FROM your_table WHERE column = 'value';
```

#### PostgreSQL
- URL Format: `postgresql://user:password@host:5432/dbname`
- Required Fields:
  - Table Name: The table you want to query

Example Query:
```sql
SELECT * FROM your_table WHERE column = 'value';
```

#### MySQL
- URL Format: `mysql://user:password@host:3306/dbname`
- Required Fields:
  - Table Name: The table you want to query

Example Query:
```sql
SELECT * FROM your_table WHERE column = 'value';
```

#### MongoDB
- URL Format: `mongodb://user:password@host:27017/dbname`
- Required Fields:
  - Collection Name: The collection you want to query (use this as Table Name)

Example Queries:
```javascript
// Find all documents
db.collection.find({})

// Filter documents
db.collection.find({ field: "value" })

// Complex queries
db.collection.find({
  field1: "value1",
  field2: { $gt: 100 }
})
```

### Security Best Practices

1. Use read-only database users when possible
2. Set appropriate database permissions
3. For production:
   - Enable SSL/TLS for database connections
   - Set up proper firewall rules
   - Use environment variables in your deployment platform


## API Documentation

### Authentication
POST `/api/auth/login` - Sign in with email and password
POST `/api/auth/register` - Register a new user

### Queries
POST `/api/queries/execute` - Execute a custom query
GET `/api/queries/history` - Get query execution history

### Data Access
GET `/api/data/tables` - Get list of available tables
GET `/api/data/schemas` - Get database schema information

## Security

- All database operations are performed through Supabase's secure connection
- Custom queries are executed through a database function with proper security policies
- Authentication is handled by Supabase Auth
- Row Level Security (RLS) policies ensure data access control
