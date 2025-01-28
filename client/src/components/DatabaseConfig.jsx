import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';

export function DatabaseConfig({ onConfigChange }) {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    type: 'supabase',
    url: '',
    apiKey: '',
    tableName: ''
  });

  const handleConfigChange = (field, value) => {
    const newConfig = {
      ...config,
      [field]: value
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const dbTypes = [
    { value: 'supabase', label: 'Supabase' },
    { value: 'postgres', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'mongodb', label: 'MongoDB' }
  ];

  return (
    <div className="mb-8 w-full flex flex-col items-center">
      <Button
        variant="outline"
        onClick={() => setShowConfig(!showConfig)}
        className="mb-4 bg-background text-foreground"
      >
        {showConfig ? 'Hide Database Config' : 'Show Database Config'}
      </Button>

      {showConfig && (
        <div className="space-y-4 p-4 border rounded-md bg-card w-full">
          <div className="text-center">
            <label className="block text-sm font-medium mb-2">
              Database Type
            </label>
            <Select
              value={config.type}
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

          <div className="text-center">
            <label className="block text-sm font-medium mb-2">
              Database URL
            </label>
            <Input
              type="text"
              value={config.url}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="Enter database URL"
              className="w-full"
            />
          </div>

          <div className="text-center">
            <label className="block text-sm font-medium mb-2">
              API Key / Connection String
            </label>
            <Input
              type="password"
              value={config.apiKey}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              placeholder="Enter API key or connection string"
              className="w-full"
            />
          </div>

          <div className="text-center">
            <label className="block text-sm font-medium mb-2">
              Table Name
            </label>
            <Input
              type="text"
              value={config.tableName}
              onChange={(e) => handleConfigChange('tableName', e.target.value)}
              placeholder="Enter table name"
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
