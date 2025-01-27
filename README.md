ww# Data Analytics Sandbox

A secure and scalable platform that enables data analysts and developers to execute custom queries and build analytics tools, powered by Supabase.

## Features

- Custom query execution with security measures
- RESTful API endpoints for data access
- User authentication via Supabase Auth
- Query validation and rate limiting
- Logging and monitoring
- Query history tracking

## Setup

1. Create a Supabase project at https://supabase.com

2. Set up the following Supabase database functions:
   ```sql
   -- Function to execute custom queries safely
   create or replace function execute_query(query_text text, query_params json)
   returns json
   language plpgsql
   security definer
   as $$
   begin
     return query_text;
   end;
   $$;

   -- Function to get available tables
   create or replace function get_tables()
   returns json
   language plpgsql
   security definer
   as $$
   begin
     return (
       SELECT json_agg(table_name)
       FROM information_schema.tables
       WHERE table_schema = 'public'
     );
   end;
   $$;

   -- Function to get schema information
   create or replace function get_schemas()
   returns json
   language plpgsql
   security definer
   as $$
   begin
     return (
       SELECT json_agg(json_build_object(
         'table_name', t.table_name,
         'column_name', c.column_name,
         'data_type', c.data_type,
         'is_nullable', c.is_nullable,
         'column_default', c.column_default
       ))
       FROM information_schema.tables t
       JOIN information_schema.columns c ON t.table_name = c.table_name
       WHERE t.table_schema = 'public'
       ORDER BY t.table_name, c.ordinal_position
     );
   end;
   $$;
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a `.env` file with the following variables:
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the server:
   ```bash
   pnpm start
   ```

   For development:
   ```bash
   pnpm dev
   ```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
pnpm add -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Configure environment variables in Vercel:
   - Go to your project settings in the Vercel dashboard
   - Add the following environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `ALLOWED_ORIGINS`
     - `NODE_ENV` (set to "production")

4. Deploy to Vercel:
```bash
vercel
```

For production deployment:
```bash
vercel --prod
```

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
