import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { TableIcon, BarChartIcon, Loader2Icon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DataVisualizer({ data, loading }) {
  const [view, setView] = useState('table');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
        <TableIcon className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">Run a query to see results</p>
      </div>
    );
  }

  const headers = Object.keys(data[0] || {});
  const numericColumns = headers.filter(header => 
    data.every(row => typeof row[header] === 'number')
  );

  const chartData = data.map((row, index) => ({
    name: index + 1,
    ...row
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          {data.length} {data.length === 1 ? 'row' : 'rows'}
        </div>
        <div className="flex space-x-2">
          <Button
            variant={view === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('table')}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <TableIcon className="w-4 h-4 mr-1" />
            Table
          </Button>
          {numericColumns.length > 0 && (
            <Button
              variant={view === 'chart' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('chart')}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <BarChartIcon className="w-4 h-4 mr-1" />
              Chart
            </Button>
          )}
        </div>
      </div>

      {view === 'table' ? (
        <div className="rounded-lg border border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header} className="bg-zinc-800/50">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    {headers.map((header) => (
                      <TableCell key={header} className="truncate max-w-[200px]">
                        {row[header]?.toString() || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="h-[400px] bg-zinc-800/50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.5rem',
                }}
              />
              {numericColumns.map((column, index) => (
                <Bar
                  key={column}
                  dataKey={column}
                  fill={`hsl(${(index * 60 + 200) % 360}, 70%, 60%)`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
