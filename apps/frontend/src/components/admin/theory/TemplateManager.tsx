/**
 * Template Manager Component
 * Quản lý LaTeX templates và custom commands
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/form/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  Settings,
  Code,
  Palette
} from 'lucide-react';

import { LatexEditor } from './LatexEditor';

// ===== INTERFACES =====

interface LaTeXTemplate {
  id: string;
  name: string;
  description: string;
  category: 'chapter' | 'section' | 'exercise' | 'example' | 'definition';
  content: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

interface CustomCommand {
  id: string;
  name: string;
  command: string;
  replacement: string;
  description: string;
  category: 'formatting' | 'math' | 'structure' | 'custom';
  isActive: boolean;
}

interface StyleConfig {
  id: string;
  name: string;
  cssRules: string;
  description: string;
  isActive: boolean;
}

// ===== MOCK DATA =====

const MOCK_TEMPLATES: LaTeXTemplate[] = [
  {
    id: '1',
    name: 'Chapter Template',
    description: 'Template chuẩn cho chapter mới',
    category: 'chapter',
    content: `\\section{{{CHAPTER_TITLE}}}

{{CHAPTER_DESCRIPTION}}

\\begin{boxkn}
\\textbf{Mục tiêu:} {{LEARNING_OBJECTIVES}}
\\end{boxkn}

\\subsection{Kiến thức cơ bản}

{{BASIC_KNOWLEDGE}}

\\begin{vd}
{{EXAMPLE_CONTENT}}
\\end{vd}`,
    variables: ['CHAPTER_TITLE', 'CHAPTER_DESCRIPTION', 'LEARNING_OBJECTIVES', 'BASIC_KNOWLEDGE', 'EXAMPLE_CONTENT'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true
  },
  {
    id: '2',
    name: 'Definition Template',
    description: 'Template cho định nghĩa',
    category: 'definition',
    content: `\\begin{boxdn}
\\textbf{Định nghĩa:} {{DEFINITION_TITLE}}

{{DEFINITION_CONTENT}}
\\end{boxdn}`,
    variables: ['DEFINITION_TITLE', 'DEFINITION_CONTENT'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: false
  }
];

const MOCK_COMMANDS: CustomCommand[] = [
  {
    id: '1',
    name: 'Icon Bullet',
    command: '\\iconMT',
    replacement: '•',
    description: 'Custom bullet point icon',
    category: 'formatting',
    isActive: true
  },
  {
    id: '2',
    name: 'Emphasis',
    command: '\\indam{([^}]+)}',
    replacement: '<strong class="theory-emphasis">$1</strong>',
    description: 'Emphasized text formatting',
    category: 'formatting',
    isActive: true
  }
];

const MOCK_STYLES: StyleConfig[] = [
  {
    id: '1',
    name: 'Knowledge Box',
    cssRules: `.theory-box-knowledge {
  background: var(--theory-knowledge-bg);
  border: 2px solid var(--theory-knowledge-border);
  border-radius: var(--theory-radius-md);
  padding: var(--theory-spacing-md);
  margin: var(--theory-spacing-md) 0;
}`,
    description: 'Styling cho knowledge boxes',
    isActive: true
  }
];

// ===== MAIN COMPONENT =====

/**
 * Template Manager Component
 * Quản lý templates, commands và styles
 */
export function TemplateManager() {
  const [templates, setTemplates] = useState<LaTeXTemplate[]>(MOCK_TEMPLATES);
  const [commands, setCommands] = useState<CustomCommand[]>(MOCK_COMMANDS);
  const [styles, setStyles] = useState<StyleConfig[]>(MOCK_STYLES);
  const [selectedTemplate, setSelectedTemplate] = useState<LaTeXTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // ===== TEMPLATE HANDLERS =====

  const handleCreateTemplate = useCallback(() => {
    const newTemplate: LaTeXTemplate = {
      id: Date.now().toString(),
      name: 'New Template',
      description: 'Template description',
      category: 'section',
      content: '\\section{New Section}\n\nContent here...',
      variables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
  }, []);

  const handleEditTemplate = useCallback((template: LaTeXTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  }, []);

  const handleSaveTemplate = useCallback((updatedTemplate: LaTeXTemplate) => {
    setTemplates(prev => 
      prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
    );
    setIsEditing(false);
  }, []);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa template này?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    }
  }, [selectedTemplate]);

  const handlePreviewTemplate = useCallback((template: LaTeXTemplate) => {
    // Replace variables với sample data
    let content = template.content;
    template.variables.forEach(variable => {
      content = content.replace(
        new RegExp(`{{${variable}}}`, 'g'),
        `[Sample ${variable.toLowerCase().replace('_', ' ')}]`
      );
    });
    setPreviewContent(content);
  }, []);

  // ===== COMMAND HANDLERS =====

  const handleCreateCommand = useCallback(() => {
    const newCommand: CustomCommand = {
      id: Date.now().toString(),
      name: 'New Command',
      command: '\\newcommand',
      replacement: 'replacement',
      description: 'Command description',
      category: 'custom',
      isActive: true
    };
    
    setCommands(prev => [...prev, newCommand]);
  }, []);

  const handleToggleCommand = useCallback((commandId: string) => {
    setCommands(prev =>
      prev.map(cmd => 
        cmd.id === commandId ? { ...cmd, isActive: !cmd.isActive } : cmd
      )
    );
  }, []);

  // ===== STYLE HANDLERS =====

  const handleCreateStyle = useCallback(() => {
    const newStyle: StyleConfig = {
      id: Date.now().toString(),
      name: 'New Style',
      cssRules: '.new-style {\n  /* CSS rules here */\n}',
      description: 'Style description',
      isActive: true
    };
    
    setStyles(prev => [...prev, newStyle]);
  }, []);

  const handleToggleStyle = useCallback((styleId: string) => {
    setStyles(prev =>
      prev.map(style => 
        style.id === styleId ? { ...style, isActive: !style.isActive } : style
      )
    );
  }, []);

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template Management
          </CardTitle>
          <CardDescription>
            Quản lý LaTeX templates, custom commands và styling configuration
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="commands" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Commands
              </TabsTrigger>
              <TabsTrigger value="styles" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Styles
              </TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">LaTeX Templates</h3>
                <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template List */}
                <div className="space-y-3">
                  {templates.map((template) => (
                    <Card key={template.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={template.isDefault ? "default" : "outline"}>
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        {!template.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="flex items-center gap-1 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Template Editor/Preview */}
                <div>
                  {isEditing && selectedTemplate ? (
                    <Card className="p-4">
                      <h4 className="font-medium mb-4">Edit Template</h4>
                      <div className="space-y-4">
                        <Input
                          value={selectedTemplate.name}
                          onChange={(e) => setSelectedTemplate(prev => 
                            prev ? { ...prev, name: e.target.value } : null
                          )}
                          placeholder="Template name"
                        />
                        <LatexEditor
                          initialContent={selectedTemplate.content}
                          fileName={`${selectedTemplate.name}.tex`}
                          height="300px"
                          onContentChange={(content) => 
                            setSelectedTemplate(prev => 
                              prev ? { ...prev, content } : null
                            )
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => selectedTemplate && handleSaveTemplate(selectedTemplate)}
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : previewContent ? (
                    <Card className="p-4">
                      <h4 className="font-medium mb-4">Template Preview</h4>
                      <LatexEditor
                        initialContent={previewContent}
                        fileName="preview.tex"
                        height="300px"
                        readOnly={true}
                        showPreview={true}
                      />
                    </Card>
                  ) : (
                    <Card className="p-8 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a template to edit or preview</p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Commands Tab */}
            <TabsContent value="commands" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Custom Commands</h3>
                <Button onClick={handleCreateCommand} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Command
                </Button>
              </div>

              <div className="grid gap-4">
                {commands.map((command) => (
                  <Card key={command.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{command.name}</h4>
                          <Badge variant={command.isActive ? "default" : "outline"}>
                            {command.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{command.description}</p>
                        <div className="text-xs font-mono bg-muted p-2 rounded">
                          <div><strong>Command:</strong> {command.command}</div>
                          <div><strong>Replacement:</strong> {command.replacement}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant={command.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleCommand(command.id)}
                        >
                          {command.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Styles Tab */}
            <TabsContent value="styles" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">CSS Styles</h3>
                <Button onClick={handleCreateStyle} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Style
                </Button>
              </div>

              <div className="grid gap-4">
                {styles.map((style) => (
                  <Card key={style.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{style.name}</h4>
                          <Badge variant={style.isActive ? "default" : "outline"}>
                            {style.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{style.description}</p>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {style.cssRules}
                        </pre>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant={style.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleStyle(style.id)}
                        >
                          {style.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default TemplateManager;
