-- Create query_history table
CREATE TABLE query_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    database_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create query_templates table
CREATE TABLE query_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    query TEXT NOT NULL,
    category TEXT,
    database_type TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create shared_queries table
CREATE TABLE shared_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    query_id UUID REFERENCES query_history(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id),
    shared_with UUID REFERENCES auth.users(id),
    access_level TEXT NOT NULL CHECK (access_level IN ('read', 'write')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_queries ENABLE ROW LEVEL SECURITY;

-- Query history policies
CREATE POLICY "Users can view their own queries"
    ON query_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queries"
    ON query_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queries"
    ON query_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queries"
    ON query_history FOR DELETE
    USING (auth.uid() = user_id);

-- Query templates policies
CREATE POLICY "Users can view public templates"
    ON query_templates FOR SELECT
    USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create templates"
    ON query_templates FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Template owners can update"
    ON query_templates FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Template owners can delete"
    ON query_templates FOR DELETE
    USING (auth.uid() = created_by);

-- Shared queries policies
CREATE POLICY "Users can view queries shared with them"
    ON shared_queries FOR SELECT
    USING (auth.uid() = shared_with OR auth.uid() = shared_by);

CREATE POLICY "Users can share their queries"
    ON shared_queries FOR INSERT
    WITH CHECK (auth.uid() = shared_by);

-- Create indexes
CREATE INDEX idx_query_history_user_id ON query_history(user_id);
CREATE INDEX idx_query_history_created_at ON query_history(created_at);
CREATE INDEX idx_query_templates_database_type ON query_templates(database_type);
CREATE INDEX idx_shared_queries_shared_with ON shared_queries(shared_with);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_query_history_updated_at
    BEFORE UPDATE ON query_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_query_templates_updated_at
    BEFORE UPDATE ON query_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
