import React, { useState } from 'react';
import { Button } from './ui/button';

export function QueryBuilder() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/queries/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Query Builder</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="query" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            Enter your query
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-2 border rounded-md bg-background text-foreground"
            placeholder="Enter your query here..."
          />
        </div>
        
        <Button type="submit" className="w-full">
          Execute Query
        </Button>
      </form>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-96">
            <code>{result}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
