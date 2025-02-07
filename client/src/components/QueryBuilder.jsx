import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { DatabaseConfig } from './DatabaseConfig';
import { DataVisualizer } from './DataVisualizer';
import { Button } from './ui/button';
import { PlayIcon, SaveIcon, HistoryIcon, BookTemplate, PencilIcon, PlusIcon } from 'lucide-react';
import { DEFAULT_TEMPLATES } from '../lib/defaultTemplates';
import { TemplateDialog } from './TemplateDialog';
import { api } from '../lib/api';
import { QueryHistory } from './QueryHistory';


export function QueryBuilder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbConfig, setDbConfig] = useState({
    type: 'postgres',
    url: ''
  });
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateDialogMode, setTemplateDialogMode] = useState('edit');
  const [showHistory, setShowHistory] = useState(false);
  

  const handleQuerySubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test API connection first
      console.log('Testing API connection...');
      await api.testConnection();

      console.log('Executing query...');
      const { data } = await api.executeQuery(query, dbConfig);
      setResults(data);
    } catch (error) {
      console.error('Query error:', error);
      setError(error.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    // Convert query to string if it's an object/array
    const queryString = typeof template.query === 'object' 
      ? JSON.stringify(template.query, null, 2) 
      : template.query;
    setQuery(queryString);
    if (template.dbConfig) {
      setDbConfig(template.dbConfig);
    }
  };

  const handleTemplateEdit = (template) => {
    setSelectedTemplate(template);
    setTemplateDialogMode('edit');
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateCreate = () => {
    setSelectedTemplate({
      id: `template_${Date.now()}`,
      name: '',
      description: '',
      query: query || '',
      category: 'Custom',
      database_type: dbConfig.type,
      is_public: false
    });
    setTemplateDialogMode('create');
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateSave = (template) => {
    if (templateDialogMode === 'create') {
      setTemplates([...templates, template]);
    } else {
      setTemplates(templates.map(t => 
        t.id === template.id ? template : t
      ));
    }
    setIsTemplateDialogOpen(false);
  };

  const isQueryEmpty = () => {
    if (!query) return true;
    if (typeof query !== 'string') return false;
    return query.trim().length === 0;
  };

  const filteredTemplates = templates.filter(
    template => template.database_type === dbConfig.type
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Query Builder
          </h1>
          <p className="text-zinc-400 mt-2">
            Build and execute database queries with ease
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded mr-2"></span>
                Database Connection
              </h2>
              <DatabaseConfig config={dbConfig} onChange={setDbConfig} />
            </div>

            <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-2 h-6 bg-purple-500 rounded mr-2"></span>
                Query Editor
              </h2>
              <div className="relative">
                <CodeEditor
                  value={query}
                  language="sql"
                  onChange={(e) => setQuery(e.target.value)}
                  padding={16}
                  style={{
                    fontSize: '14px',
                    backgroundColor: '#27272a',
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    borderRadius: '0.5rem',
                    minHeight: '200px'
                  }}
                  className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-zinc-400 hover:text-zinc-100"
                  >
                    <HistoryIcon className="w-4 h-4 mr-1" />
                    History
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                    className="text-zinc-400 hover:text-zinc-100"
                  >
                    <SaveIcon className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleQuerySubmit}
                    disabled={loading || isQueryEmpty()}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    size="sm"
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    {loading ? 'Running...' : 'Run Query'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="w-2 h-6 bg-yellow-500 rounded mr-2"></span>
                  Query Templates
                  <BookTemplate className="w-5 h-5 ml-2 text-yellow-500" />
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTemplateCreate}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  New Template
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 bg-zinc-900/50 rounded-lg group relative"
                  >
                    <button
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left w-full"
                    >
                      <h3 className="font-medium text-zinc-100 group-hover:text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1 group-hover:text-zinc-300">
                        {template.description}
                      </p>
                      <span className="inline-block px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 mt-2">
                        {template.category}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateEdit(template);
                      }}
                      className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="w-2 h-6 bg-green-500 rounded mr-2"></span>
              Results
            </h2>
            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <DataVisualizer data={results} loading={loading} />
            )}
          </div>
        </div>
      </div>

      {/* Query History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 p-6 shadow-xl">
            <QueryHistory
              onSelectQuery={(selectedQuery) => {
                setQuery(selectedQuery);
                setShowHistory(false);
              }}
              currentQuery={query}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <TemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        template={selectedTemplate}
        onSave={handleTemplateSave}
        mode={templateDialogMode}
      />

      <div className="text-center mt-8 pb-4">
        <a 
          href="https://github.com/iterating" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-300 text-sm"
        >
          Designed and Built by Jonathan Young (iterating)
        </a>
      </div>
    </div>

  );
}
