
"use client";

import React, { useState, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
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
  useOnSelectionChange,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './custom-node';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export interface NodeData {
  label: string;
  iconName: string;
  properties: Record<string, any>; 
}

export interface DesignCanvasHandles {
  getDiagramJson: () => string;
  loadTemplate: (nodes: Node<NodeData>[], edges: Edge[]) => void;
  updateNodeProperties: (nodeId: string, properties: Record<string, any>) => void;
}

interface DesignCanvasProps {
  onNodeSelect: (node: Node<NodeData> | null) => void;
}


let idCounter = 0;
const getNextNodeId = () => `dndnode_${idCounter++}`;
const getNextEdgeId = () => `edge_${idCounter++}`;


export const DesignCanvas = forwardRef<DesignCanvasHandles, DesignCanvasProps>(({ onNodeSelect }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const [isEdgeDialogVisible, setIsEdgeDialogVisible] = useState(false);
  const [currentEditingEdgeId, setCurrentEditingEdgeId] = useState<string | null>(null);
  const [edgeLabelInput, setEdgeLabelInput] = useState('');

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes }) => {
      if (selectedNodes.length === 1) {
        onNodeSelect(selectedNodes[0] as Node<NodeData>);
      } else {
        onNodeSelect(null);
      }
    },
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
      changes.forEach(change => {
        if (change.type === 'remove') {
          onNodeSelect(null);
        }
      });
    },
    [onNodesChangeInternal, onNodeSelect]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
    },
    [onEdgesChangeInternal]
  );


  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: getNextEdgeId(),
        animated: true,
        style: { strokeWidth: 2, stroke: 'hsl(var(--accent))' },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--accent))' },
        label: '', 
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

      const { name, iconName, properties: initialProperties } = JSON.parse(dataString);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<NodeData> = {
        id: getNextNodeId(),
        type: 'custom',
        position,
        data: { 
          label: name, 
          iconName: iconName, 
          properties: initialProperties || {} 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );
  
  const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setCurrentEditingEdgeId(edge.id);
      setEdgeLabelInput(edge.label as string || '');
      setIsEdgeDialogVisible(true);
    },
    [setEdges]
  );

  const handleSaveEdgeLabel = () => {
    if (currentEditingEdgeId) {
      setEdges((eds) =>
        eds.map((ed) =>
          ed.id === currentEditingEdgeId ? { ...ed, label: edgeLabelInput, labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500 }, labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.7 }, labelBgPadding: [4,2] } : ed
        )
      );
    }
    setIsEdgeDialogVisible(false);
    setCurrentEditingEdgeId(null);
    setEdgeLabelInput('');
  };


  useImperativeHandle(ref, () => ({
    getDiagramJson: () => {
      if (!reactFlowInstance) {
        console.warn("ReactFlow instance not available for getDiagramJson");
        return JSON.stringify({ nodes: [], edges: [] });
      }
      const nodesWithFullData = nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          properties: node.data.properties || {} 
        }
      }));
      return JSON.stringify({ nodes: nodesWithFullData, edges });
    },
    loadTemplate: (initialNodes: Node<NodeData>[], initialEdges: Edge[]) => {
      setNodes(initialNodes.map(n => ({...n, data: {...n.data, properties: n.data.properties || {}}})));
      setEdges(initialEdges);
      onNodeSelect(null); 

      const maxNodeId = initialNodes.reduce((max, node) => {
        const num = parseInt(node.id.split('_').pop() || '0');
        return Math.max(max, isNaN(num) ? 0 : num);
      }, 0);
      const maxEdgeId = initialEdges.reduce((max, edge) => {
        const num = parseInt(edge.id.split('_').pop() || '0');
        return Math.max(max, isNaN(num) ? 0 : num);
      }, 0);
      idCounter = Math.max(maxNodeId, maxEdgeId, idCounter) +1;

      setTimeout(() => { 
        if (reactFlowInstance) {
          reactFlowInstance.fitView({padding: 0.2});
        }
      }, 0);
    },
    updateNodeProperties: (nodeId: string, updatedProperties: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                properties: { ...node.data.properties, ...updatedProperties },
              },
            };
          }
          return node;
        })
      );
    },
  }));
  
  return (
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
          }}
          selectNodesOnDrag={false}
          multiSelectionKeyCode={null} 
          nodesDraggable={true}
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

        {isEdgeDialogVisible && (
          <Dialog open={isEdgeDialogVisible} onOpenChange={(isOpen) => {
            setIsEdgeDialogVisible(isOpen);
            if (!isOpen) {
              setCurrentEditingEdgeId(null);
              setEdgeLabelInput('');
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Connection Label</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="edgeLabelInput" className="sr-only">
                  Connection Label
                </Label>
                <Input
                  id="edgeLabelInput"
                  value={edgeLabelInput}
                  onChange={(e) => setEdgeLabelInput(e.target.value)}
                  placeholder="Enter label (e.g., API Call, Data Sync)"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveEdgeLabel}>
                  Save Label
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
});

DesignCanvas.displayName = 'DesignCanvas';

