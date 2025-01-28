"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DatabaseConfigProps {
  onConfigChange: (config: {
    type: string;
    url: string;
    apiKey: string;
    tableName: string;
  }) => void;
}

export function DatabaseConfig({ onConfigChange }: DatabaseConfigProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    type: "supabase",
    url: "",
    apiKey: "",
    tableName: "",
  });

  const handleConfigChange = (field: string, value: string) => {
    const newConfig = {
      ...config,
      [field]: value,
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const dbTypes = [
    { value: "supabase", label: "Supabase" },
    { value: "postgres", label: "PostgreSQL" },
    { value: "mysql", label: "MySQL" },
    { value: "mongodb", label: "MongoDB" },
  ];

  return (
    <div className="w-full">
      <Button
        variant="outline"
        onClick={() => setShowConfig(!showConfig)}
        className="w-full mb-4"
      >
        {showConfig ? "Hide Database Config" : "Show Database Config"}
      </Button>

      {showConfig && (
        <Card className="p-6 space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="dbType">Database Type</Label>
              <Select
                value={config.type}
                onValueChange={(value) => handleConfigChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  {dbTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Database URL</Label>
              <Input
                id="url"
                type="text"
                value={config.url}
                onChange={(e) => handleConfigChange("url", e.target.value)}
                placeholder="Enter database URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key / Connection String</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                placeholder="Enter API key or connection string"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                type="text"
                value={config.tableName}
                onChange={(e) => handleConfigChange("tableName", e.target.value)}
                placeholder="Enter table name"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
