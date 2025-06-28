
"use client";

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeData } from './design-canvas';

// Helper to get Lucide icon component by name (case-insensitive for flexibility)
const getIconComponent = (iconName: string): React.ElementType => {
  if (!iconName) return LucideIcons.Box; 
  const icons = LucideIcons as any;
  const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const foundIconKey = Object.keys(icons).find(
    key => key.toLowerCase() === normalizedIconName.toLowerCase() || key.toLowerCase() === iconName.toLowerCase()
  );
  return foundIconKey ? icons[foundIconKey] : LucideIcons.HelpCircle; // Default if not found
};

// Helper to get a descriptive string from node properties
const getNodeDescription = (data: NodeData): string => {
    if (!data.properties) return '';

    const props = data.properties;
    switch (data.label) {
        case 'Web Server':
            return props.framework || 'Web framework';
        case 'API Gateway':
            return props.protocol || 'Handles API traffic';
        case 'Database':
            return props.type || 'Stores data';
        case 'Load Balancer':
            return props.algorithm || 'Distributes load';
        case 'Cache':
            return props.type || 'In-memory store';
        case 'Message Queue':
            return props.type || 'Async messaging';
        case 'Serverless Function':
            return props.runtime || 'On-demand compute';
        default:
            return props.type || props.language || props.serviceName || '';
    }
};

export function CustomNode({ data, selected }: NodeProps<NodeData>) {
  const IconComponent = getIconComponent(data.iconName);
  const isInfoNote = data.label === "Info Note";

  const nodeLabel = isInfoNote
    ? data.properties?.title || 'Info Note'
    : data.properties?.name || data.label;
    
  const nodeDescription = isInfoNote ? '' : getNodeDescription(data);

  const noteBackgroundColor = 'bg-yellow-100 dark:bg-yellow-800/30';
  const noteBorderColor = 'border-yellow-400 dark:border-yellow-600';

  const iconColor = selected ? 'text-primary' : (data.color || 'text-primary');
  const borderColor = selected ? 'border-primary' : (data.borderColor || 'border-card');
  
  return (
    <Card
      className={cn(
        'w-64 border-2 rounded-lg transition-all duration-150 ease-in-out',
        selected ? 'shadow-2xl' : 'shadow-md',
        isInfoNote 
          ? `${noteBackgroundColor} ${noteBorderColor}` 
          : `bg-card ${borderColor}`,
        !isInfoNote && !selected ? 'hover:shadow-xl' : ''
      )}
    >
      <CardHeader 
        className="p-3 flex flex-row items-center gap-3 space-y-0"
      >
        <IconComponent 
            className={cn('h-6 w-6 shrink-0', isInfoNote ? 'text-yellow-700 dark:text-yellow-400' : iconColor)} 
        />
        <CardTitle 
            className="text-base font-semibold truncate"
        >
            {nodeLabel}
        </CardTitle>
      </CardHeader>
      
      {!isInfoNote && nodeDescription && (
        <CardContent className="p-3 pt-0 pb-2">
            <p className="text-sm text-muted-foreground truncate">{nodeDescription}</p>
        </CardContent>
      )}

      {isInfoNote && data.properties?.content && (
        <CardContent className="p-3 pt-0 text-xs text-yellow-900 dark:text-yellow-100 max-h-48 overflow-y-auto">
          <p className="whitespace-pre-wrap">
            {String(data.properties.content)}
          </p>
        </CardContent>
      )}
      
      {!isInfoNote && (
        <>
        <CardFooter className="p-3 pt-0">
             <div className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Ready
            </div>
        </CardFooter>
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
