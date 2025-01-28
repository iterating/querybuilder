import React, { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { DatabaseConfig } from './DatabaseConfig';

export function QueryBuilder() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [dbConfig, setDbConfig] = useState({
    type: 'supabase',
    url: '',
    apiKey: '',
    tableName: ''
  });

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

  return (
    <div className="container mx-auto p-4 max-w-6xl flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Query Builder</h1>
      
      <DatabaseConfig onConfigChange={setDbConfig} />

      <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col items-center">
        <div className="w-full text-center">
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
              "w-[800px] h-32 p-4 rounded-md font-mono",
              "bg-zinc-900 text-green-400 placeholder-green-700",
              "border-2 border-zinc-700 focus-visible:border-green-700",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500",
              "shadow-inner"
            )}
            placeholder="Enter your SQL query here..."
          />
        </div>

        <Button type="submit" className="w-full">
          Execute Query
        </Button>

        {result && (
          <div className="mt-4 w-full">
            <h2 className="text-xl font-semibold mb-2 text-center">Result:</h2>
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
