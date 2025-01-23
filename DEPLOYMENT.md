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
  SUPABASE_ANON_KEY=your_supabase_anon_key
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
