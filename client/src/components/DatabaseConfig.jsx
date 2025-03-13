import React, { useState } from 'react';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { InfoCircledIcon } from '@radix-ui/react-icons';

export function DatabaseConfig({ config, onChange }) {
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const getConnectionStringPlaceholder = () => {
    switch (config.type) {
      case 'postgres':
        return 'postgresql://username:password@hostname:5432/database';
      case 'mysql':
        return 'mysql://username:password@hostname:3306/database';
      case 'mongodb':
        return 'mongodb://username:password@hostname:27017/database';
      default:
        return 'Database connection string';
    }
  };

  const getHelpText = () => {
    switch (config.type) {
      case 'postgres':
        return (
          <div className="text-xs text-zinc-400 mt-2">
            <p className="font-semibold mb-1">PostgreSQL Connection Format:</p>
            <p>postgresql://username:password@hostname:5432/database</p>
            <p className="mt-1">Example: postgresql://postgres:pass123@localhost:5432/mydb</p>
            <p className="mt-2">Make sure to specify a table name when using queries with placeholders.</p>
          </div>
        );
      case 'mysql':
        return (
          <div className="text-xs text-zinc-400 mt-2">
            <p className="font-semibold mb-1">MySQL Connection Format:</p>
            <p>mysql://username:password@hostname:3306/database</p>
          </div>
        );
      case 'mongodb':
        return (
          <div className="text-xs text-zinc-400 mt-2">
            <p className="font-semibold mb-1">MongoDB Connection Format:</p>
            <p>mongodb://username:password@hostname:27017/database</p>
            <p className="mt-1">For MongoDB, the Collection Name field is required.</p>
          </div>
        );
      default:
        return null;
    }
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
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          className="text-zinc-400 hover:text-zinc-100"
        >
          <InfoCircledIcon className="w-4 h-4" />
          <span className="ml-1">Help</span>
        </Button>
      </div>

      <Input
        type="text"
        placeholder={getConnectionStringPlaceholder()}
        value={config.url}
        onChange={(e) => handleChange('url', e.target.value)}
        className="w-full min-w-[600px] h-12 bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
      />
      
      {showHelp && getHelpText()}
    </div>
  );
}
