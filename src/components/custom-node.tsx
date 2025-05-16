
"use client";

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';

// Helper to get Lucide icon component by name (case-insensitive for flexibility)
const getIconComponent = (iconName: string): React.ElementType => {
  if (!iconName) return LucideIcons.Box; 
  const icons = LucideIcons as any;
  const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const foundIconKey = Object.keys(icons).find(
    key => key.toLowerCase() === normalizedIconName.toLowerCase() || key.toLowerCase() === iconName.toLowerCase()
  );
  return foundIconKey ? icons[foundIconKey] : LucideIcons.HelpCircle; // Default if not found, HelpCircle for unknown
};

export function CustomNode({ data, selected }: NodeProps<{ label: string; iconName: string; properties?: Record<string, any> }>) {
  const IconComponent = getIconComponent(data.iconName);
  const isInfoNote = data.label === "Info Note";
  const nodeLabel = data.properties?.title && isInfoNote ? data.properties.title : data.label;

  const noteBackgroundColor = 'bg-yellow-100 dark:bg-yellow-800/30';
  const noteBorderColor = 'border-yellow-400 dark:border-yellow-600';
  const componentBorderColor = selected ? 'border-primary' : 'border-border';

  return (
    <Card
      className={`w-56 shadow-lg border-2 rounded-lg transition-all duration-150 ease-in-out overflow-hidden 
                  ${isInfoNote ? `${noteBackgroundColor} ${noteBorderColor}` : 'bg-card'} 
                  ${selected && !isInfoNote ? 'scale-105 shadow-2xl' : ''}
                  ${selected && isInfoNote ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                  ${!isInfoNote ? componentBorderColor : ''}
                  ${!isInfoNote && !selected ? 'hover:shadow-xl' : ''}
                  `}
    >
      <CardHeader 
        className={`p-3 flex flex-row items-center space-x-2 
                    ${isInfoNote ? 'pb-2' : ''}
                    ${selected && !isInfoNote ? 'bg-card' : isInfoNote ? '' : 'bg-card'}`} // Ensure header bg matches card for components
      >
        <IconComponent 
            className={`h-6 w-6 shrink-0 
            ${selected && !isInfoNote ? 'text-primary' : isInfoNote ? 'text-yellow-700 dark:text-yellow-400' : 'text-muted-foreground'}`} 
        />
        <CardTitle 
            className={`text-sm font-semibold truncate 
            ${selected && !isInfoNote ? 'text-primary' : isInfoNote ? 'text-yellow-800 dark:text-yellow-200' : 'text-card-foreground'}`}
        >
            {nodeLabel}
        </CardTitle>
      </CardHeader>
      
      {isInfoNote && data.properties?.content && (
        <CardContent className="p-3 pt-0 text-xs text-yellow-900 dark:text-yellow-100 max-h-48 overflow-y-auto">
          <p className="whitespace-pre-wrap">
            {String(data.properties.content)}
          </p>
        </CardContent>
      )}
      
      {!isInfoNote && (
        <>
          <Handle 
            type="target" 
            position={Position.Top} 
            className="!w-3 !h-3 !bg-primary/50 hover:!bg-primary !border-2 !border-background rounded-full"
          />
          <Handle 
            type="source" 
            position={Position.Bottom} 
            className="!w-3 !h-3 !bg-accent/50 hover:!bg-accent !border-2 !border-background rounded-full"
          />
          <Handle 
            type="target" 
            position={Position.Left} 
            className="!w-3 !h-3 !bg-primary/50 hover:!bg-primary !border-2 !border-background rounded-full"
          />
          <Handle 
            type="source" 
            position={Position.Right} 
            className="!w-3 !h-3 !bg-accent/50 hover:!bg-accent !border-2 !border-background rounded-full"
          />
        </>
      )}
    </Card>
  );
}
    
