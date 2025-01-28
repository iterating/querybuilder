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

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfigChange(config);
  };

  const dbTypes = [
    { value: 'supabase', label: 'Supabase' },
    { value: 'postgres', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'mongodb', label: 'MongoDB' }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Database Configuration</h2>
        <Button
          variant="outline"
          onClick={() => setShowConfig(!showConfig)}
          className="hover:bg-zinc-700/50"
        >
          {showConfig ? 'Hide Config' : 'Show Config'}
        </Button>
      </div>

      {showConfig && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="dbType" className="block text-sm font-medium text-zinc-300 mb-2">
                Database Type
              </label>
              <Select
                id="dbType"
                name="dbType"
                value={config.type}
                onChange={(e) => handleConfigChange('type', e.target.value)}
                className="w-full bg-zinc-900 border-zinc-700 text-zinc-100"
              >
                {dbTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-zinc-900">
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="dbUrl" className="block text-sm font-medium text-zinc-300 mb-2">
                Database URL
              </label>
              <Input
                id="dbUrl"
                name="dbUrl"
                type="url"
                value={config.url}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="Enter database URL"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-zinc-300 mb-2">
                API Key
              </label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder="Enter API key"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                required
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="tableName" className="block text-sm font-medium text-zinc-300 mb-2">
                Table Name
              </label>
              <Input
                id="tableName"
                name="tableName"
                type="text"
                value={config.tableName}
                onChange={(e) => handleConfigChange('tableName', e.target.value)}
                placeholder="Enter table name"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
