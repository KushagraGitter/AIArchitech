
"use client";

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';

// Helper to get Lucide icon component by name (case-insensitive for flexibility)
const getIconComponent = (iconName: string): React.ElementType => {
  if (!iconName) return LucideIcons.Box; // Default icon if name is missing
  const icons = LucideIcons as any;
  // Attempt to find matching icon name, trying PascalCase and direct match
  const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const foundIconKey = Object.keys(icons).find(
    key => key.toLowerCase() === normalizedIconName.toLowerCase() || key.toLowerCase() === iconName.toLowerCase()
  );
  return foundIconKey ? icons[foundIconKey] : LucideIcons.Box; // Default to Box if not found
};

// Update NodeProps to include properties in the data object
export function CustomNode({ data, selected }: NodeProps<{ label: string; iconName: string; properties?: Record<string, any> }>) {
  const IconComponent = getIconComponent(data.iconName);

  return (
    <Card
      className={`w-40 shadow-lg border-2 rounded-lg transition-all duration-150 ease-in-out ${selected ? 'border-primary scale-105 shadow-2xl' : 'border-border hover:shadow-xl'}`}
    >
      <CardHeader className={`p-3 flex flex-row items-center space-x-2 bg-card`}>
        <IconComponent className={`h-6 w-6 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        <CardTitle className={`text-sm font-semibold truncate ${selected ? 'text-primary' : 'text-card-foreground'}`}>{data.label}</CardTitle>
      </CardHeader>
      {/* 
        Future enhancement: Display some properties or a configure button
        {data.properties && Object.keys(data.properties).length > 0 && (
          <CardContent className="p-2 text-xs text-muted-foreground">
            Properties: {Object.keys(data.properties).join(', ')}
          </CardContent>
        )}
      */}
      
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
    </Card>
  );
}
