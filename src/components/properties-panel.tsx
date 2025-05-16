
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'reactflow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, PlusCircle, Save, Settings2, Trash2 } from 'lucide-react';
import type { NodeData } from './design-canvas'; // Assuming NodeData is exported from design-canvas

export interface ConfigurableProperty {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select'; // Add more types as needed
  options?: string[]; // For select type
}

export interface ComponentConfig {
  name: string;
  icon: React.ElementType;
  iconName: string;
  initialProperties: Record<string, any>;
  configurableProperties: ConfigurableProperty[];
}

interface PropertiesPanelProps {
  selectedNode: Node<NodeData>;
  componentConfig: ComponentConfig;
  onUpdateNode: (nodeId: string, properties: Record<string, any>) => void;
  onClose: () => void;
}

export function PropertiesPanel({ selectedNode, componentConfig, onUpdateNode, onClose }: PropertiesPanelProps) {
  const [properties, setProperties] = useState<Record<string, any>>(selectedNode.data.properties || {});
  const [customProperties, setCustomProperties] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    const currentProps = selectedNode.data.properties || {};
    setProperties(currentProps);

    const custom: Array<{ key: string; value: string }> = [];
    if (currentProps.custom) {
      for (const key in currentProps.custom) {
        custom.push({ key, value: String(currentProps.custom[key]) });
      }
    }
    setCustomProperties(custom);
  }, [selectedNode]);

  const handleInputChange = (propId: string, value: string | number | boolean) => {
    setProperties(prev => ({ ...prev, [propId]: value }));
  };

  const handleCustomPropChange = (index: number, field: 'key' | 'value', value: string) => {
    setCustomProperties(prev => 
      prev.map((prop, i) => (i === index ? { ...prop, [field]: value } : prop))
    );
  };

  const addCustomProperty = () => {
    setCustomProperties(prev => [...prev, { key: '', value: '' }]);
  };

  const removeCustomProperty = (index: number) => {
    setCustomProperties(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = () => {
    const finalCustomProps: Record<string, string> = {};
    customProperties.forEach(prop => {
      if (prop.key.trim() !== '') {
        finalCustomProps[prop.key.trim()] = prop.value;
      }
    });
    
    const updatedNodeProperties = {
      ...properties,
      custom: finalCustomProps,
    };
    onUpdateNode(selectedNode.id, updatedNodeProperties);
    // onClose(); // Optionally close panel on save
  };

  if (!selectedNode || !componentConfig) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{componentConfig.name} Properties</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <CardContent className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Standard Properties</h3>
            <div className="space-y-4">
              {componentConfig.configurableProperties.map(prop => (
                <div key={prop.id}>
                  <Label htmlFor={prop.id} className="text-xs">{prop.label}</Label>
                  <Input
                    id={prop.id}
                    type={prop.type === 'number' ? 'number' : 'text'} // Basic handling for now
                    value={properties[prop.id] || ''}
                    onChange={(e) => handleInputChange(prop.id, e.target.value)}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Custom Properties</h3>
              <Button variant="outline" size="sm" onClick={addCustomProperty} className="h-7 text-xs">
                <PlusCircle className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {customProperties.map((customProp, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Key"
                    value={customProp.key}
                    onChange={(e) => handleCustomPropChange(index, 'key', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Value"
                    value={customProp.value}
                    onChange={(e) => handleCustomPropChange(index, 'value', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeCustomProperty(index)} className="h-7 w-7 text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {customProperties.length === 0 && (
                <p className="text-xs text-muted-foreground">No custom properties added.</p>
              )}
            </div>
          </div>
        </CardContent>
      </ScrollArea>

      <CardFooter className="p-4 border-t">
        <Button onClick={handleSaveChanges} className="w-full">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </div>
  );
}
