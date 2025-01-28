"use client";

import { useState } from "react";
import { DatabaseConfig } from "./database-config";
import { QueryEditor } from "./query-editor";
import { QueryResults } from "./query-results";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";

interface QueryResponse {
  data: any[];
  error?: string;
}

export function QueryBuilder() {
  const [dbConfig, setDbConfig] = useState({
    type: "supabase",
    url: "",
    apiKey: "",
    tableName: "",
  });
  const [results, setResults] = useState<QueryResponse | null>(null);
  const { toast } = useToast();

  const executeQuery = async (query: string) => {
    try {
      const response = await fetch("/api/queries/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          dbConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute query");
      }

      setResults(data);
      toast({
        title: "Query executed successfully",
        description: `Retrieved ${data.data.length} results`,
      });
    } catch (error) {
      console.error("Query execution error:", error);
      toast({
        variant: "destructive",
        title: "Query execution failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <div className="space-y-8">
      <DatabaseConfig onConfigChange={setDbConfig} />
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-4">
          <QueryEditor onExecute={executeQuery} />
        </Card>
        <Card className="p-4">
          <QueryResults results={results} />
        </Card>
      </div>
    </div>
  );
}
