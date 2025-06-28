
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

// Helper to get a primary descriptive string from node properties
const getNodeDescription = (data: NodeData): string => {
    if (!data.properties) return '';

    const props = data.properties;
    // For specific components, use a descriptive property, otherwise show the generic type
    switch (data.label) {
        case 'Web Server':
        case 'App Server':
            return props.framework || props.language || 'Application';
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
            return props.type || props.serviceName || data.label;
    }
};

// Helper to get a secondary descriptive string from node properties
const getSecondaryNodeDescription = (data: NodeData): { label: string; value: React.ReactNode } | null => {
    if (!data.properties) return null;
    const props = data.properties;

    switch (data.label) {
        case 'Web Server':
        case 'App Server':
            return props.instanceType ? { label: 'Instance', value: props.instanceType } : null;
        case 'API Gateway':
            return props.rateLimit ? { label: 'Rate Limit', value: props.rateLimit } : null;
        case 'Database':
            return props.role ? { label: 'Role', value: props.role } : null;
        case 'Load Balancer':
            return props.instanceCount ? { label: 'Instances', value: props.instanceCount } : null;
        case 'Cache':
            return props.pattern ? { label: 'Pattern', value: props.pattern } : null;
        case 'Message Queue':
            return props.deliveryGuarantee ? { label: 'Delivery', value: props.deliveryGuarantee } : null;
        case 'Serverless Function':
            return props.memory ? { label: 'Memory', value: `${props.memory}` } : null;
        case 'CDN':
            return props.provider ? { label: 'Provider', value: props.provider } : null;
        case 'CI/CD Pipeline':
            return props.tool ? { label: 'Tool', value: props.tool } : null;
        case 'Storage (S3/Blob)':
            return props.bucketType ? { label: 'Storage Tier', value: props.bucketType } : null;
        default:
            return null;
    }
};


export function CustomNode({ data, selected }: NodeProps<NodeData>) {
  const IconComponent = getIconComponent(data.iconName);
  const isInfoNote = data.label === "Info Note";

  const nodeLabel = isInfoNote
    ? data.properties?.title || 'Info Note'
    : data.properties?.name || data.label;
    
  const nodeDescription = isInfoNote ? '' : getNodeDescription(data);
  const secondaryDescription = isInfoNote ? null : getSecondaryNodeDescription(data);


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
          {secondaryDescription && (
            <CardFooter className="p-3 pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
                <span className="font-medium">{secondaryDescription.label}:</span>
                <span className="truncate ml-2 font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {String(secondaryDescription.value)}
                </span>
              </div>
            </CardFooter>
          )}

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
