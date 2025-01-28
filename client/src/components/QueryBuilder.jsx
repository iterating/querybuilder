import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DatabaseConfig } from './DatabaseConfig';
import { DataVisualizer } from './DataVisualizer';
import { QueryHistory } from './QueryHistory';
import { supabase } from '../lib/supabaseClient';
import { Save } from 'lucide-react';
import { cn } from '../lib/utils';

// Get the API URL from environment or default to relative path
const API_URL = import.meta.env.VITE_API_URL || '';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function QueryBuilder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [dbConfig, setDbConfig] = useState({
    type: 'supabase',
    url: '',
    apiKey: '',
    tableName: ''
  });

  const executeQuery = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/queries/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          query,
          dbConfig
        }),
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
          if (errorData?.details) {
            console.error('Error details:', errorData.details);
          }
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setResults(data.data);
    } catch (err) {
      if (retryCount < MAX_RETRIES && (err.message.includes('fetch failed') || err.message.includes('network'))) {
        console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return executeQuery(retryCount + 1);
      }
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const saveQuery = async () => {
    try {
      const { error } = await supabase
        .from('query_history')
        .insert([
          {
            name: queryName || 'Unnamed Query',
            query,
            database_type: dbConfig.type
          }
        ]);

      if (error) throw error;
      setShowSaveDialog(false);
      setQueryName('');
      // You could add a toast notification here
    } catch (err) {
      console.error('Error saving query:', err);
      setError(err.message);
    }
  };

  const handleSelectQuery = (selectedQuery) => {
    setQuery(selectedQuery);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <DatabaseConfig onConfigChange={setDbConfig} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Query Editor</h2>
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Query
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Query</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Query name"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                  />
                  <Button onClick={saveQuery}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query..."
            className={cn(
              "min-h-[200px] font-mono",
              "bg-zinc-900 text-green-400 placeholder-green-700",
              "border-2 border-zinc-700 focus-visible:border-green-700",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500",
              "shadow-inner"
            )}
          />

          <Button 
            onClick={executeQuery}
            disabled={loading || !query.trim() || !dbConfig.url}
            className="w-full"
          >
            {loading ? 'Executing...' : 'Execute Query'}
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Query History & Templates</h2>
          <QueryHistory onSelectQuery={handleSelectQuery} />
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <DataVisualizer data={results} />
        </div>
      )}
    </div>
  );
}
