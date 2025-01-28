"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface QueryEditorProps {
  onExecute: (query: string) => void;
}

export function QueryEditor({ onExecute }: QueryEditorProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Query Editor</h3>
        <Button
          onClick={() => onExecute(query)}
          disabled={!query.trim()}
        >
          Execute Query
        </Button>
      </div>
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query here..."
        className="font-mono min-h-[200px]"
      />
    </div>
  );
}
