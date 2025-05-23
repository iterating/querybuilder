import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Share2, Star, StarOff, Copy, Trash2, Save } from 'lucide-react';
import { api } from '../lib/api';

export function QueryHistory({ onSelectQuery, currentQuery }) {
  const [queries, setQueries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: '',
    database_type: ''
  });
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  useEffect(() => {
    loadQueries();
    loadTemplates();
  }, []);

  const loadQueries = () => {
    console.log('Loading query history from localStorage...');
    try {
      const savedQueries = JSON.parse(localStorage.getItem('queryHistory')) || [];
      console.log(`Successfully loaded ${savedQueries.length} queries from localStorage`);
      setQueries(savedQueries);
    } catch (error) {
      console.error('Failed to load query history from localStorage:', error);
      setQueries([]);
    }
  };

  const loadTemplates = () => {
    console.log('Loading templates from localStorage...');
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('queryTemplates')) || [];
      console.log(`Successfully loaded ${savedTemplates.length} templates`);
      setTemplates(savedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({ ...prev, [name]: value }));
  };

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '',
      description: '',
      category: '',
      database_type: ''
    });
    setShowSaveTemplate(false);
  };

  const saveAsTemplate = () => {
    try {
      const templateData = {
        ...newTemplate,
        id: `template_${Date.now()}`,
        created_at: new Date().toISOString(),
        query: currentQuery
      };
      
      const updatedTemplates = [...templates, templateData];
      localStorage.setItem('queryTemplates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
      resetNewTemplate();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleAction = {
    saveQuery: (query, name = '') => {
      console.log('Saving query to localStorage');
      try {
        const savedQueries = JSON.parse(localStorage.getItem('queryHistory')) || [];
        const newQuery = { 
          id: Date.now(),
          query, 
          name,
          created_at: new Date().toISOString(),
          is_favorite: false
        };
        localStorage.setItem('queryHistory', JSON.stringify([...savedQueries, newQuery]));
        loadQueries();
      } catch (error) {
        console.error('Error saving query:', error);
      }
    },

    toggleFavorite: (id) => {
      try {
        const savedQueries = JSON.parse(localStorage.getItem('queryHistory')) || [];
        const updated = savedQueries.map(q => q.id === id 
          ? { ...q, is_favorite: !q.is_favorite }
          : q
        );
        localStorage.setItem('queryHistory', JSON.stringify(updated));
        loadQueries();
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    },

    deleteQuery: (id) => {
      try {
        const savedQueries = JSON.parse(localStorage.getItem('queryHistory')) || [];
        const filtered = savedQueries.filter(q => q.id !== id);
        localStorage.setItem('queryHistory', JSON.stringify(filtered));
        loadQueries();
      } catch (error) {
        console.error('Error deleting query:', error);
      }
    },

    shareQuery: async (queryId) => {
      console.log('Sharing query:', queryId);
      try {
        const query = queries.find(q => q.id === queryId);
        if (query) {
          const shareText = `${query.name}\n\n${query.query}`;
          try {
            await navigator.clipboard.writeText(shareText);
            console.log('Share text copied to clipboard:', shareText);
          } catch (err) {
            console.error('Error copying to clipboard:', err);
          }
        }
      } catch (error) {
        console.error('Failed to share query:', error);
      }
    },

    deleteTemplate: (id) => {
      console.log('Deleting template:', id);
      const updatedTemplates = templates.filter(t => t.id !== id);
      localStorage.setItem('queryTemplates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    }
  };

  const filteredItems = showTemplates 
    ? templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : queries.filter(q => q.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderTemplateForm = () => (
    <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
      <div className="space-y-4">
        {Object.entries({
          name: 'Template name',
          description: 'Template description',
          category: 'Template category',
          database_type: 'Database type'
        }).map(([key, placeholder]) => (
          <Input
            key={key}
            type="text"
            name={key}
            placeholder={placeholder}
            value={newTemplate[key]}
            onChange={handleInputChange}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        ))}
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetNewTemplate}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={saveAsTemplate}
            disabled={!newTemplate.name.trim()}
          >
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder={showTemplates ? "Search templates..." : "Search history..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
        <Button
          variant="outline"
          onClick={() => {
            setShowTemplates(!showTemplates);
            setSearchTerm('');
          }}
          className="border-zinc-700 text-zinc-100 hover:bg-zinc-800"
        >
          {showTemplates ? 'Show History' : 'Show Templates'}
        </Button>
      </div>

      {!showTemplates && currentQuery && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveTemplate(true)}
            className="text-zinc-100 hover:bg-zinc-800"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current Query
          </Button>
        </div>
      )}

      {showSaveTemplate && renderTemplateForm()}

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            {showTemplates 
              ? 'No templates found. Save a query as a template to get started!'
              : 'No queries in history yet. Execute a query to see it here!'}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-zinc-100">{item.name}</h3>
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap break-words">
                    {item.query}
                  </p>
                  {showTemplates && (
                    <>
                      <p className="text-sm text-zinc-500 mt-1">{item.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-zinc-700 text-zinc-300">
                          {item.category}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-zinc-700 text-zinc-300">
                          {item.database_type}
                        </span>
                      </div>
                    </>
                  )}
                  {item.created_at && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectQuery(item.query)}
                    className="text-zinc-100 hover:bg-zinc-700"
                    title="Use this query"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {!showTemplates ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction.toggleFavorite(item.id)}
                        className="text-zinc-100 hover:bg-zinc-700"
                        title={item.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {item.is_favorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction.shareQuery(item.id)}
                        className="text-zinc-100 hover:bg-zinc-700"
                        title="Share query"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction.deleteQuery(item.id)}
                        className="text-zinc-100 hover:bg-zinc-700"
                        title="Delete query"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction.deleteTemplate(item.id)}
                      className="text-zinc-100 hover:bg-zinc-700"
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
