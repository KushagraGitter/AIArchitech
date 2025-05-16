
"use client";

import React, { useState, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type ReactFlowInstance,
  type OnConnect,
  type Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './custom-node';
import { Card } from './ui/card'; // Keep Card for MiniMap styling if needed

export interface DesignCanvasHandles {
  getDiagramJson: () => string;
}

let idCounter = 0;
const getNextNodeId = () => `dndnode_${idCounter++}`;

export const DesignCanvas = forwardRef<DesignCanvasHandles, {}>((props, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'hsl(var(--primary))' } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event.dataTransfer.getData('application/reactflow');
      
      if (!dataString) return;

      const { name, iconName } = JSON.parse(dataString);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getNextNodeId(),
        type: 'custom',
        position,
        data: { label: name, iconName: iconName },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  useImperativeHandle(ref, () => ({
    getDiagramJson: () => {
      if (!reactFlowInstance) {
        console.warn("ReactFlow instance not available for getDiagramJson");
        return JSON.stringify({ nodes: [], edges: [] });
      }
      // 'nodes' and 'edges' from useNodesState/useEdgesState are the source of truth
      return JSON.stringify({ nodes, edges });
    },
  }));
  
  // Ensure component fills parent for correct rendering
  return (
    <ReactFlowProvider>
      <div className="h-full w-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background shadow-inner" // Use Tailwind for background
        >
          <Controls className="[&_button]:bg-card [&_button]:border-border [&_button:hover]:bg-muted [&_svg]:fill-foreground" />
          <Background gap={16} color="hsl(var(--border))" />
          <MiniMap 
            nodeColor={(node) => {
                switch (node.type) {
                    case 'custom': return 'hsl(var(--primary))';
                    default: return 'hsl(var(--muted))';
                }
            }}
            nodeStrokeWidth={3}
            pannable 
            zoomable
            className="!bg-card border border-border rounded-md shadow-lg"
          />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
});

DesignCanvas.displayName = 'DesignCanvas';
