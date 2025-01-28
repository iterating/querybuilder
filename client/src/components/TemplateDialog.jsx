import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import CodeEditor from '@uiw/react-textarea-code-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const defaultTemplate = {
  name: '',
  description: '',
  query: '',
  category: '',
  database_type: 'postgres',
  is_public: false
};

export function TemplateDialog({ 
  isOpen, 
  onClose, 
  template = defaultTemplate, 
  onSave, 
  mode = 'edit' // 'edit' or 'create'
}) {
  const [editedTemplate, setEditedTemplate] = React.useState(template);

  React.useEffect(() => {
    setEditedTemplate(template || defaultTemplate);
  }, [template]);

  const handleChange = (field, value) => {
    setEditedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editedTemplate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-800">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Template' : 'Edit Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">
              Name
            </label>
            <Input
              value={editedTemplate.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              placeholder="Template name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">
              Description
            </label>
            <Input
              value={editedTemplate.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              placeholder="Template description"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">
              Category
            </label>
            <Input
              value={editedTemplate.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              placeholder="Template category"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">
              Database Type
            </label>
            <Select
              value={editedTemplate.database_type}
              onValueChange={(value) => handleChange('database_type', value)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="mongodb">MongoDB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">
              Query
            </label>
            <CodeEditor
              value={editedTemplate.query}
              language="sql"
              onChange={(e) => handleChange('query', e.target.value)}
              padding={16}
              style={{
                fontSize: '14px',
                backgroundColor: '#27272a',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                borderRadius: '0.5rem',
                minHeight: '200px'
              }}
              className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600 text-white">
            {mode === 'create' ? 'Create Template' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
