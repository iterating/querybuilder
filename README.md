# Data Analytics Sandbox

A secure and scalable platform that enables data analysts and developers to execute custom queries and build analytics tools.

## Why Use This App?

The Data Analytics Sandbox provides a safe environment for exploring and analyzing data across multiple database types. It's particularly useful for:

- **Data Exploration**: Quickly test queries and visualize results
- **Prototyping**: Build and test analytics tools without affecting production systems
- **Collaboration**: Share queries and results with team members
- **Learning**: Practice SQL and database concepts in a safe environment

Key Benefits:
- **Multi-Database Support**: Work with Supabase, PostgreSQL, MySQL, and MongoDB
- **Security First**: Built-in authentication and query validation
- **Real-time Results**: Immediate feedback on query execution
- **History Tracking**: Save and revisit previous queries
- **Template System**: Create reusable query templates

Try it out  

[![](https://raw.githubusercontent.com/iterating/querybuilder/refs/heads/main/public/portfolio.querybuilder.qrcode.100.png)](https://querybuilder.vercel.app)


## Features

### Custom Query Execution
- Execute SQL and NoSQL queries across supported databases
- Real-time results with data visualization
- Query validation and error handling

### Security & Monitoring
- Supabase Auth for user authentication
- Row Level Security (RLS) policies
- Query logging and monitoring
- Rate limiting to prevent abuse

### Query Management
- Save and organize queries in local storage
- Create reusable query templates
- Track query execution history
- Share queries with team members

### Data Visualization
- Built-in data visualizer for query results
- Export results to CSV/JSON
- Customizable visualization options

## Use Cases

### Data Analysis
- Explore datasets with custom queries
- Visualize trends and patterns
- Generate reports and insights

### Application Development
- Test database queries during development
- Prototype new features
- Debug complex queries

### Education & Training
- Learn SQL and database concepts
- Practice query optimization
- Understand different database systems

## Security Best Practices

The app is designed with security in mind:
- All database connections use SSL/TLS
- User authentication via Supabase Auth
- Query validation and sanitization
- Row-level security policies
- Environment variables for sensitive data


## Supported Databases

The app supports multiple database types with detailed connection guides:

- **Supabase**: Cloud-hosted PostgreSQL with built-in authentication
- **PostgreSQL**: Open-source relational database
- **MySQL**: Popular open-source relational database
- **MongoDB**: Leading NoSQL document database

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

## Security Best Practices

The app is designed with security in mind:
- All database connections use SSL/TLS
- User authentication via Supabase Auth
- Query validation and sanitization
- Row-level security policies
- Environment variables for sensitive data


## API Documentation

The app provides a RESTful API for programmatic access:
- Authentication endpoints
- Query execution
- Data access
- Schema information

### Authentication
POST `/api/auth/login` - Sign in with email and password
POST `/api/auth/register` - Register a new user

### Queries
POST `/api/queries/execute` - Execute a custom query
GET `/api/queries/history` - Get query execution history

### Data Access
GET `/api/data/tables` - Get list of available tables
GET `/api/data/schemas` - Get database schema information


## Screenshot
![](https://raw.githubusercontent.com/iterating/querybuilder/refs/heads/main/public/portfolio.querybuilder.screenshot.png)
