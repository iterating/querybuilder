import React from 'react';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function DatabaseConfig({ config, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const dbTypes = [
    { value: 'postgres', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'mongodb', label: 'MongoDB' }
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Select
          value={config.type}
          onValueChange={(value) => handleChange('type', value)}
        >
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="Select database" />
          </SelectTrigger>
          <SelectContent>
            {dbTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder={config.type === 'mongodb' ? 'Collection Name' : 'Table Name'}
          value={config.tableName || ''}
          onChange={(e) => handleChange('tableName', e.target.value)}
          className="w-[200px] bg-zinc-800 border-zinc-700 text-zinc-100"
        />
      </div>

      <Input
        type="text"
        placeholder="Database URL"
        value={config.url}
        onChange={(e) => handleChange('url', e.target.value)}
        className="w-full min-w-[600px] h-12 bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
      />
    </div>
  );
}
