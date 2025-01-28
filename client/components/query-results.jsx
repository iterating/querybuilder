"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";

export function QueryResults({ results }) {
  if (!results) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Execute a query to see results
      </div>
    );
  }

  if (results.error) {
    return (
      <div className="text-center p-8 text-destructive">
        Error: {results.error}
      </div>
    );
  }

  if (!results.data || results.data.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No results found
      </div>
    );
  }

  const columns = Object.keys(results.data[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Results</h3>
        <span className="text-sm text-muted-foreground">
          {results.data.length} rows
        </span>
      </div>
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {typeof row[column] === "object"
                      ? JSON.stringify(row[column])
                      : String(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
