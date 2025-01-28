import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DatabaseConfig } from './DatabaseConfig';
import { DataVisualizer } from './DataVisualizer';
import { QueryHistory } from './QueryHistory';
import { supabase } from '../lib/supabaseClient';
import { Save } from 'lucide-react';
import { cn } from '../lib/utils';
import CodeEditor from '@uiw/react-textarea-code-editor';

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
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="container mx-auto p-6 space-y-8">
        <div className="bg-zinc-800/50 rounded-lg shadow-xl p-6 backdrop-blur-sm">
          <DatabaseConfig onConfigChange={setDbConfig} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-zinc-100">Query Editor</h2>
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:bg-zinc-700/50">
                    <Save className="h-4 w-4 mr-2" />
                    Save Query
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-100">Save Query</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Query name"
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                    <Button onClick={saveQuery} className="w-full bg-green-600 hover:bg-green-700">Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 backdrop-blur-sm">
              <CodeEditor
                value={query}
                language="sql"
                placeholder="Enter your SQL query..."
                onChange={(e) => setQuery(e.target.value)}
                padding={15}
                style={{
                  fontSize: '0.875rem',
                  backgroundColor: 'rgb(24 24 27)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  borderRadius: '0.375rem',
                  minHeight: '200px',
                }}
                className={cn(
                  "min-h-[200px] w-full",
                  "text-green-400 placeholder-green-700",
                  "border border-zinc-700 focus:border-green-700",
                  "focus:ring-1 focus:ring-green-500 focus:outline-none"
                )}
              />

              <div className="mt-4 flex justify-end space-x-3">
                <Button 
                  onClick={executeQuery}
                  disabled={loading || !query.trim() || !dbConfig.url}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? 'Executing...' : 'Execute Query'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 text-red-200 p-4 rounded-lg backdrop-blur-sm">
                <p className="font-mono text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-zinc-100 mb-4">Query History & Templates</h2>
              <QueryHistory onSelectQuery={handleSelectQuery} />
            </div>

            {results && (
              <div className="bg-zinc-800/50 rounded-lg p-4 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-zinc-100 mb-4">Results</h2>
                <DataVisualizer data={results} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
