
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
  const nodeLabel = data.properties?.title && data.label === "Info Note" ? data.properties.title : data.label;


  return (
    <Card
      className={`w-48 shadow-lg border-2 rounded-lg transition-all duration-150 ease-in-out overflow-hidden ${selected ? 'border-primary scale-105 shadow-2xl' : 'border-border hover:shadow-xl'}`}
    >
      <CardHeader className={`p-3 flex flex-row items-center space-x-2 bg-card`}>
        <IconComponent className={`h-6 w-6 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        <CardTitle className={`text-sm font-semibold truncate ${selected ? 'text-primary' : 'text-card-foreground'}`}>{nodeLabel}</CardTitle>
      </CardHeader>
      
      {data.label === "Info Note" && data.properties?.content && (
        <CardContent className="p-3 pt-0 text-xs text-muted-foreground max-h-20 overflow-y-auto">
          <p className="whitespace-pre-wrap line-clamp-3">
            {String(data.properties.content).substring(0, 100)}
            {String(data.properties.content).length > 100 ? "..." : ""}
          </p>
        </CardContent>
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
    </Card>
  );
}

    