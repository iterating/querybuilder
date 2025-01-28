import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { cn } from '@/lib/utils';

export function QueryBuilder() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [dbConfig, setDbConfig] = useState({
    type: 'supabase',
    url: '',
    apiKey: '',
    tableName: ''
  });
  const [showConfig, setShowConfig] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/queries/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          dbConfig
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error executing query: ${error.message}`);
    }
  };

  const handleConfigChange = (field, value) => {
    setDbConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const dbTypes = [
    { value: 'supabase', label: 'Supabase' },
    { value: 'postgres', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'mongodb', label: 'MongoDB' }
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Query Builder</h1>
      
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => setShowConfig(!showConfig)}
          className="mb-4 bg-background text-foreground"
        >
          {showConfig ? 'Hide Database Config' : 'Show Database Config'}
        </Button>

        {showConfig && (
          <div className="space-y-4 p-4 border rounded-md bg-card">
            <div>
              <label className="block text-sm font-medium mb-2">
                Database Type
              </label>
              <Select
                value={dbConfig.type}
                onChange={(e) => handleConfigChange('type', e.target.value)}
                className="w-full"
              >
                {dbTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Database URL
              </label>
              <Input
                type="text"
                value={dbConfig.url}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="Enter database URL"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                API Key / Connection String
              </label>
              <Input
                type="password"
                value={dbConfig.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder="Enter API key or connection string"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Table Name
              </label>
              <Input
                type="text"
                value={dbConfig.tableName}
                onChange={(e) => handleConfigChange('tableName', e.target.value)}
                placeholder="Enter table name"
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="query" 
            className="block text-sm font-medium mb-2"
          >
            Enter your query
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "w-full h-32 p-2 rounded-md bg-background text-foreground",
              "border border-input focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            placeholder="Enter your query here..."
          />
        </div>

        <Button type="submit" className="w-full">
          Execute Query
        </Button>

        {result && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <pre className={cn(
              "bg-muted p-4 rounded-md overflow-auto",
              "border border-border"
            )}>
              {result}
            </pre>
          </div>
        )}
      </form>
    </div>
  );
}
