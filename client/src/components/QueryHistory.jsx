import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabaseClient';
import { Share2, Star, StarOff, Copy } from 'lucide-react';

export function QueryHistory({ onSelectQuery }) {
  const [queries, setQueries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    loadQueries();
    loadTemplates();
  }, []);

  const loadQueries = async () => {
    const { data, error } = await supabase
      .from('query_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading queries:', error);
      return;
    }
    setQueries(data);
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('query_templates')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading templates:', error);
      return;
    }
    setTemplates(data);
  };

  const saveQuery = async (query, name = '') => {
    const { error } = await supabase
      .from('query_history')
      .insert([
        {
          query,
          name: name || 'Unnamed Query',
          is_favorite: false
        }
      ]);

    if (error) {
      console.error('Error saving query:', error);
      return;
    }

    loadQueries();
  };

  const toggleFavorite = async (id, currentStatus) => {
    const { error } = await supabase
      .from('query_history')
      .update({ is_favorite: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating favorite status:', error);
      return;
    }

    loadQueries();
  };

  const shareQuery = async (queryId) => {
    const { data, error } = await supabase
      .from('query_history')
      .select('query, name')
      .eq('id', queryId)
      .single();

    if (error) {
      console.error('Error getting query:', error);
      return;
    }

    const shareUrl = `${window.location.origin}/shared-query/${queryId}`;
    await navigator.clipboard.writeText(shareUrl);
    // You could add a toast notification here
  };

  const saveAsTemplate = async (query, name, description) => {
    const { error } = await supabase
      .from('query_templates')
      .insert([
        {
          name,
          query,
          description
        }
      ]);

    if (error) {
      console.error('Error saving template:', error);
      return;
    }

    loadTemplates();
  };

  const filteredItems = showTemplates 
    ? templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : queries.filter(q => q.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          {showTemplates ? 'Show History' : 'Show Templates'}
        </Button>
      </div>

      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:bg-muted flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {item.query}
              </p>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectQuery(item.query)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {!showTemplates && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(item.id, item.is_favorite)}
                  >
                    {item.is_favorite ? (
                      <Star className="h-4 w-4 fill-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareQuery(item.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
