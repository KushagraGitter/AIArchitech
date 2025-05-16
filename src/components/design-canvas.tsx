
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
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './custom-node';

export interface DesignCanvasHandles {
  getDiagramJson: () => string;
  loadTemplate: (nodes: Node[], edges: Edge[]) => void;
}

interface NodeData {
  label: string;
  iconName: string;
  properties?: Record<string, any>;
}

let idCounter = 0;
const getNextNodeId = () => `dndnode_${idCounter++}`;
const getNextEdgeId = () => `edge_${idCounter++}`;


export const DesignCanvas = forwardRef<DesignCanvasHandles, {}>((props, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: getNextEdgeId(),
        animated: true,
        style: { strokeWidth: 2, stroke: 'hsl(var(--accent))' },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--accent))' },
        label: '', // Initialize with an empty label
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
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

      const { name, iconName, properties } = JSON.parse(dataString);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<NodeData> = {
        id: getNextNodeId(),
        type: 'custom',
        position,
        data: { label: name, iconName: iconName, properties: properties || {} },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );
  
  const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const newLabel = prompt("Enter label for this connection:", edge.label as string || "");
      if (newLabel !== null) {
        setEdges((eds) =>
          eds.map((ed) =>
            ed.id === edge.id ? { ...ed, label: newLabel, labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500 }, labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.7 }, labelBgPadding: [4,2] } : ed
          )
        );
      }
    },
    [setEdges]
  );


  useImperativeHandle(ref, () => ({
    getDiagramJson: () => {
      if (!reactFlowInstance) {
        console.warn("ReactFlow instance not available for getDiagramJson");
        return JSON.stringify({ nodes: [], edges: [] });
      }
      return JSON.stringify({ nodes, edges });
    },
    loadTemplate: (initialNodes: Node<NodeData>[], initialEdges: Edge[]) => {
      setNodes(initialNodes);
      setEdges(initialEdges);
      // Reset idCounter to avoid potential collisions if many templates are loaded
      // This is a simple reset; a more robust system might track max ID from templates
      const maxNodeId = initialNodes.reduce((max, node) => {
        const num = parseInt(node.id.split('_').pop() || '0');
        return Math.max(max, isNaN(num) ? 0 : num);
      }, 0);
      const maxEdgeId = initialEdges.reduce((max, edge) => {
        const num = parseInt(edge.id.split('_').pop() || '0');
        return Math.max(max, isNaN(num) ? 0 : num);
      }, 0);
      idCounter = Math.max(maxNodeId, maxEdgeId, idCounter) +1;

      setTimeout(() => { // Ensure nodes and edges are set before fitting view
        if (reactFlowInstance) {
          reactFlowInstance.fitView({padding: 0.2});
        }
      }, 0);
    },
  }));
  
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
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background shadow-inner"
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2, stroke: 'hsl(var(--accent))' },
            markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--accent))' },
            labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500 },
            labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.7 },
            labelBgPadding: [4,2],
          }}
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
