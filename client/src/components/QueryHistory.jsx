import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Share2, Star, StarOff, Copy, Trash2, Save } from 'lucide-react';
import { Storage } from '../lib/storage';

export function QueryHistory({ onSelectQuery, currentQuery }) {
  const [queries, setQueries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('');
  const [newTemplateDatabaseType, setNewTemplateDatabaseType] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  useEffect(() => {
    loadQueries();
    loadTemplates();
  }, []);

  const loadQueries = () => {
    const savedQueries = Storage.getHistory();
    setQueries(savedQueries);
  };

  const loadTemplates = () => {
    const savedTemplates = Storage.getTemplates();
    setTemplates(savedTemplates);
  };

  const saveQuery = (query, name = '') => {
    const newQuery = {
      id: Date.now().toString(),
      name: name || 'Unnamed Query',
      query,
      is_favorite: false,
      created_at: new Date().toISOString()
    };

    const updatedQueries = [newQuery, ...queries];
    setQueries(updatedQueries);
    Storage.saveHistory(updatedQueries);
  };

  const toggleFavorite = (id, currentStatus) => {
    const updatedQueries = queries.map(q => 
      q.id === id ? { ...q, is_favorite: !currentStatus } : q
    );
    setQueries(updatedQueries);
    Storage.saveHistory(updatedQueries);
  };

  const shareQuery = async (queryId) => {
    const query = queries.find(q => q.id === queryId);
    if (query) {
      const shareText = `${query.name}\n\n${query.query}`;
      try {
        await navigator.clipboard.writeText(shareText);
        // You could add a toast notification here
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const deleteQuery = (id) => {
    const updatedQueries = queries.filter(q => q.id !== id);
    setQueries(updatedQueries);
    Storage.saveHistory(updatedQueries);
  };

  const saveAsTemplate = () => {
    if (!currentQuery || !newTemplateName.trim()) return;

    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim(),
      category: newTemplateCategory.trim(),
      database_type: newTemplateDatabaseType.trim(),
      query: currentQuery,
      created_at: new Date().toISOString()
    };

    const updatedTemplates = [newTemplate, ...templates];
    setTemplates(updatedTemplates);
    Storage.saveTemplates(updatedTemplates);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateCategory('');
    setNewTemplateDatabaseType('');
    setShowSaveTemplate(false);
  };

  const deleteTemplate = (id) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    Storage.saveTemplates(updatedTemplates);
  };

  const filteredItems = showTemplates 
    ? templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : queries.filter(q => q.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

      {showSaveTemplate && (
        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Template name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <Input
              type="text"
              placeholder="Template description"
              value={newTemplateDescription}
              onChange={(e) => setNewTemplateDescription(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <Input
              type="text"
              placeholder="Template category"
              value={newTemplateCategory}
              onChange={(e) => setNewTemplateCategory(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <Input
              type="text"
              placeholder="Template database type"
              value={newTemplateDatabaseType}
              onChange={(e) => setNewTemplateDatabaseType(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSaveTemplate(false);
                  setNewTemplateName('');
                  setNewTemplateDescription('');
                  setNewTemplateCategory('');
                  setNewTemplateDatabaseType('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={saveAsTemplate}
                disabled={!newTemplateName.trim()}
              >
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
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
                        onClick={() => toggleFavorite(item.id, item.is_favorite)}
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
                        onClick={() => shareQuery(item.id)}
                        className="text-zinc-100 hover:bg-zinc-700"
                        title="Share query"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuery(item.id)}
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
                      onClick={() => deleteTemplate(item.id)}
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
