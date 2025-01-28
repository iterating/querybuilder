# Deployment Instructions

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > Database to get your database connection details
3. In the SQL editor, run the following functions:

```sql
-- Function to execute custom queries safely
create or replace function execute_query(query_text text, query_params json)
returns json
language plpgsql
security definer
as $$
declare
  result json;
  query_with_params text;
  param_values text[];
  i integer;
begin
  -- Prevent multiple statements
  if position(';' in query_text) > 0 then
    raise exception 'Multiple statements are not allowed';
  end if;
  
  -- Prevent dangerous operations
  if query_text ~* '\b(DROP|DELETE|TRUNCATE|ALTER|GRANT|REVOKE)\b' then
    raise exception 'Operation not permitted';
  end if;

  -- Convert parameters array to text array
  if json_array_length(query_params) > 0 then
    param_values := array(
      select json_array_elements_text(query_params)
    );
  end if;

  -- Replace $1, $2, etc. with parameters
  query_with_params := query_text;
  for i in 1..coalesce(array_length(param_values, 1), 0) loop
    query_with_params := replace(
      query_with_params,
      '$' || i::text,
      quote_literal(param_values[i])
    );
  end loop;

  -- Execute query with statement timeout
  set local statement_timeout = '30s';
  execute format('select row_to_json(t) from (%s) t', query_with_params) into result;
  
  return result;
exception
  when others then
    return json_build_object('error', SQLERRM);
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

-- Create query_history table
create table if not exists query_history (
  id serial primary key,
  user_id uuid references auth.users(id),
  query text not null,
  executed_at timestamp with time zone not null,
  status text not null,
  error_message text,
  created_at timestamp with time zone default now()
);

-- Set up RLS policies
alter table query_history enable row level security;

create policy "Users can view their own query history"
  on query_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own query history"
  on query_history for insert
  with check (auth.uid() = user_id);
```

4. Get your Supabase project URL and anon key from Project Settings > API

## Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure the following environment variables:

### Required Variables
- `SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://app.example.com,https://admin.example.com`)

### Optional Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

## CORS Configuration

The API implements a secure CORS policy that:
1. Only allows requests from whitelisted origins
2. Supports credentials for authenticated requests
3. Exposes custom headers for token refresh
4. Implements proper preflight handling

To configure CORS:

1. In development:
   - `localhost:3000` and `localhost:5000` are automatically allowed
   - Additional origins can be added via `ALLOWED_ORIGINS`

2. In production:
   - Set `ALLOWED_ORIGINS` to your frontend domain(s)
   - Example: `ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com`

3. Security considerations:
   - Always use specific origins instead of wildcards
   - Use HTTPS URLs in production
   - Keep the list of allowed origins minimal

## Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Initialize Git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

3. Create a new project on Vercel and link it:
```bash
vercel login
vercel link
```

4. Set up environment variables in Vercel:
- Go to your project settings
- Add the following environment variables:
  ```
  SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  ALLOWED_ORIGINS=your_allowed_origins
  NODE_ENV=production
  ```

5. Deploy:
```bash
vercel --prod
```

## Verify Deployment

1. Once deployed, test the health endpoint:
```
https://your-vercel-url/api/health
```

2. Test authentication:
```
POST https://your-vercel-url/api/auth/register
{
  "email": "test@example.com",
  "password": "securepassword"
}
```

Your application is now running on Vercel with Supabase as the backend!
