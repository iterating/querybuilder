import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Button } from './ui/button';
import { Select } from './ui/select';
import DataTable from './DataTable';
import { exportData } from '../utils/exportUtils';

export function DataVisualizer({ data }) {
  const [visualizationType, setVisualizationType] = useState('table');
  const [chartConfig, setChartConfig] = useState({
    xAxis: '',
    yAxis: '',
  });

  // Get all possible columns from the data
  const columns = data && data.length > 0 
    ? Object.keys(data[0])
    : [];

  const handleExport = (format) => {
    try {
      exportData(data, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderVisualization = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-zinc-500">
          <p>No data to visualize</p>
        </div>
      );
    }

    switch (visualizationType) {
      case 'table':
        return <DataTable data={data} />;

      case 'line':
        return (
          <div className="overflow-x-auto">
            <LineChart 
              width={600} 
              height={400} 
              data={data}
              className="mx-auto"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey={chartConfig.xAxis} 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181B',
                  border: '1px solid #3F3F46',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#D4D4D8' }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  color: '#D4D4D8'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={chartConfig.yAxis} 
                stroke="#22C55E"
                strokeWidth={2}
              />
            </LineChart>
          </div>
        );

      case 'bar':
        return (
          <div className="overflow-x-auto">
            <BarChart 
              width={600} 
              height={400} 
              data={data}
              className="mx-auto"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey={chartConfig.xAxis} 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181B',
                  border: '1px solid #3F3F46',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#D4D4D8' }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  color: '#D4D4D8'
                }}
              />
              <Bar 
                dataKey={chartConfig.yAxis} 
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </div>
        );

      case 'pie':
        return (
          <div className="overflow-x-auto">
            <PieChart 
              width={600} 
              height={400}
              className="mx-auto"
            >
              <Pie
                data={data}
                dataKey={chartConfig.yAxis}
                nameKey={chartConfig.xAxis}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#22C55E"
                label
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181B',
                  border: '1px solid #3F3F46',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#D4D4D8' }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  color: '#D4D4D8'
                }}
              />
            </PieChart>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Visualization Type
          </label>
          <Select
            value={visualizationType}
            onChange={(e) => setVisualizationType(e.target.value)}
            className="w-full bg-zinc-900 border-zinc-700 text-zinc-100"
          >
            <option value="table" className="bg-zinc-900">Table</option>
            <option value="line" className="bg-zinc-900">Line Chart</option>
            <option value="bar" className="bg-zinc-900">Bar Chart</option>
            <option value="pie" className="bg-zinc-900">Pie Chart</option>
          </Select>
        </div>

        {visualizationType !== 'table' && (
          <>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                X Axis
              </label>
              <Select
                value={chartConfig.xAxis}
                onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
                className="w-full bg-zinc-900 border-zinc-700 text-zinc-100"
              >
                <option value="" className="bg-zinc-900">Select column</option>
                {columns.map(col => (
                  <option key={col} value={col} className="bg-zinc-900">{col}</option>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Y Axis
              </label>
              <Select
                value={chartConfig.yAxis}
                onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
                className="w-full bg-zinc-900 border-zinc-700 text-zinc-100"
              >
                <option value="" className="bg-zinc-900">Select column</option>
                {columns.map(col => (
                  <option key={col} value={col} className="bg-zinc-900">{col}</option>
                ))}
              </Select>
            </div>
          </>
        )}

        <div className="flex-none pt-8 space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="hover:bg-zinc-700/50"
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            className="hover:bg-zinc-700/50"
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('hl7')}
            className="hover:bg-zinc-700/50"
          >
            Export HL7
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('fhir')}
            className="hover:bg-zinc-700/50"
          >
            Export FHIR
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-lg p-4">
        {renderVisualization()}
      </div>
    </div>
  );
}
