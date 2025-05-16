
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Node, Edge } from 'reactflow';
import { ReactFlowProvider } from 'reactflow'; 

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Server, Database, Waypoints, ShieldCheck, Cloud, Zap, Box, Shuffle, Puzzle, BarChartBig, GitFork, Layers, Settings2, MessageSquare, Link2, ServerCog, Users } from 'lucide-react';

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent as ShadSidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';

import { Logo } from '@/components/logo';
import { DesignCanvas, type DesignCanvasHandles, type NodeData } from '@/components/design-canvas';
import { PropertiesPanel, type ComponentConfig } from '@/components/properties-panel';
import type { EvaluateSystemDesignInput, EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { evaluateSystemDesign } from '@/ai/flows/evaluate-system-design';
import { Separator } from './ui/separator';

const formSchema = z.object({
  featureRequirements: z.string().min(20, { message: "Feature requirements should be descriptive, at least 20 characters." }),
});
type FormValues = z.infer<typeof formSchema>;

export const designComponents: ComponentConfig[] = [
  { 
    name: "Load Balancer", 
    icon: Shuffle, 
    iconName: "Shuffle", 
    initialProperties: { type: "Application LB", algorithm: "Round Robin" },
    configurableProperties: [
      { id: 'type', label: 'LB Type', type: 'text' },
      { id: 'algorithm', label: 'Algorithm', type: 'text' },
    ]
  },
  { 
    name: "API Gateway", 
    icon: Waypoints, 
    iconName: "Waypoints", 
    initialProperties: { protocol: "HTTPS/REST", authType: "API Key" },
    configurableProperties: [
      { id: 'protocol', label: 'Protocol', type: 'text' },
      { id: 'authType', label: 'Auth Type', type: 'text' },
    ]
  },
  { 
    name: "Web Server", 
    icon: Server, 
    iconName: "Server", 
    initialProperties: { instanceType: "t3.medium", scaling: "auto" },
    configurableProperties: [
      { id: 'instanceType', label: 'Instance Type', type: 'text' },
      { id: 'scaling', label: 'Scaling', type: 'text' },
    ]
  },
  { 
    name: "App Server", 
    icon: Puzzle, 
    iconName: "Puzzle", 
    initialProperties: { language: "Node.js", framework: "Express" },
    configurableProperties: [
      { id: 'language', label: 'Language', type: 'text' },
      { id: 'framework', label: 'Framework', type: 'text' },
    ]
  },
  { 
    name: "Database", 
    icon: Database, 
    iconName: "Database", 
    initialProperties: { 
      type: "PostgreSQL", 
      size: "db.m5.large", 
      role: "primary", 
      replicationSourceId: "",
      shardingStrategy: "none",
      shardKey: ""
    },
    configurableProperties: [
      { id: 'type', label: 'DB Type', type: 'text' },
      { id: 'size', label: 'Instance Size', type: 'text' },
      { id: 'role', label: 'Role (primary/replica)', type: 'text' },
      { id: 'replicationSourceId', label: 'Replication Source ID (if replica)', type: 'text' },
      { id: 'shardingStrategy', label: 'Sharding Strategy (none/range/hash)', type: 'text' },
      { id: 'shardKey', label: 'Shard Key (if sharded)', type: 'text' },
    ]
  },
  { 
    name: "Cache", 
    icon: Zap, 
    iconName: "Zap", 
    initialProperties: { type: "Redis", evictionPolicy: "LRU" },
    configurableProperties: [
      { id: 'type', label: 'Cache Type', type: 'text' },
      { id: 'evictionPolicy', label: 'Eviction Policy', type: 'text' },
    ]
  },
  { 
    name: "Message Queue", 
    icon: GitFork, 
    iconName: "GitFork", 
    initialProperties: { type: "RabbitMQ", persistence: "durable" },
    configurableProperties: [
      { id: 'type', label: 'Queue Type', type: 'text' },
      { id: 'persistence', label: 'Persistence', type: 'text' },
    ]
  },
  { name: "CDN", icon: Cloud, iconName: "Cloud", initialProperties: { provider: "Cloudflare" }, configurableProperties: [{id: 'provider', label: 'Provider', type: 'text'}] },
  { name: "Firewall", icon: ShieldCheck, iconName: "ShieldCheck", initialProperties: { type: "WAF" }, configurableProperties: [{id: 'type', label: 'Type', type: 'text'}] },
  { name: "Storage (S3)", icon: Box, iconName: "Box", initialProperties: { bucketType: "Standard" }, configurableProperties: [{id: 'bucketType', label: 'Bucket Type', type: 'text'}] },
  { name: "Monitoring", icon: BarChartBig, iconName: "BarChartBig", initialProperties: { tool: "Prometheus" }, configurableProperties: [{id: 'tool', label: 'Tool', type: 'text'}] },
  { name: "User Service", icon: Users, iconName: "Users", initialProperties: { language: "Go", responsibilities: "User accounts, auth" }, configurableProperties: [{id: 'language', label: 'Language', type: 'text'}, {id: 'responsibilities', label: 'Responsibilities', type: 'text'}] },
  { name: "Chat Service", icon: MessageSquare, iconName: "MessageSquare", initialProperties: { language: "Java", features: "Message delivery, history" }, configurableProperties: [{id: 'language', label: 'Language', type: 'text'}, {id: 'features', label: 'Features', type: 'text'}] },
  { name: "URL Shortener Service", icon: Link2, iconName: "Link2", initialProperties: { language: "Python", db: "Key-Value Store" }, configurableProperties: [{id: 'language', label: 'Language', type: 'text'}, {id: 'db', label: 'Primary DB', type: 'text'}] },
  { name: "DB Router/Coordinator", icon: ServerCog, iconName: "ServerCog", initialProperties: { type: "ProxySQL/Vitess", strategy: "Sharding" }, configurableProperties: [{id: 'type', label: 'Router Type', type: 'text'}, {id: 'strategy', label: 'Strategy', type: 'text'}] },
];

const initialTemplates: { name: string; nodes: Node<NodeData>[]; edges: Edge[] }[] = [
  {
    name: "Basic Web Service",
    nodes: [
      { id: 'bws_lb_1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Load Balancer', iconName: 'Shuffle', properties: designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {} } },
      { id: 'bws_ws_1', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'Web Server', iconName: 'Server', properties: designComponents.find(c => c.name === "Web Server")?.initialProperties || {} } },
      { id: 'bws_db_1', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Database', iconName: 'Database', properties: designComponents.find(c => c.name === "Database")?.initialProperties || {} } },
    ],
    edges: [
      { id: 'bws_e_lb_ws', source: 'bws_lb_1', target: 'bws_ws_1', label: 'Routes to', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'bws_e_ws_db', source: 'bws_ws_1', target: 'bws_db_1', label: 'Reads/Writes', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    ],
  },
  {
    name: "Scalable API",
    nodes: [
        { id: 'sa_apigw_1', type: 'custom', position: { x: 100, y: 50 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
        { id: 'sa_app_1', type: 'custom', position: { x: 0, y: 200 }, data: { label: 'App Server', iconName: 'Puzzle', properties: designComponents.find(c => c.name === "App Server")?.initialProperties || {} } },
        { id: 'sa_app_2', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'App Server', iconName: 'Puzzle', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), instanceId: '2'} } },
        { id: 'sa_db_read_1', type: 'custom', position: { x: 100, y: 350 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: 'replica', replicationSourceId: 'sa_db_primary_implicit_id'} } }, 
    ],
    edges: [
        { id: 'sa_e_apigw_app1', source: 'sa_apigw_1', target: 'sa_app_1', label: 'Proxy', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'sa_e_apigw_app2', source: 'sa_apigw_1', target: 'sa_app_2', label: 'Proxy', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'sa_e_app1_db', source: 'sa_app_1', target: 'sa_db_read_1', label: 'Reads from', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'sa_e_app2_db', source: 'sa_app_2', target: 'sa_db_read_1', label: 'Reads from', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    ]
  },
  {
    name: "Chat Application",
    nodes: [
      { id: 'chat_client', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Client Device', iconName: 'Smartphone', properties: {type: "Mobile/Web"} } }, // Assuming Smartphone icon exists or use a generic one
      { id: 'chat_lb', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Load Balancer', iconName: 'Shuffle', properties: designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {} } },
      { id: 'chat_apigw', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
      { id: 'chat_usersvc', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'User Service', iconName: 'Users', properties: designComponents.find(c => c.name === "User Service")?.initialProperties || {} } },
      { id: 'chat_chatsvc', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'Chat Service', iconName: 'MessageSquare', properties: designComponents.find(c => c.name === "Chat Service")?.initialProperties || {} } },
      { id: 'chat_ws', type: 'custom', position: { x: 450, y: 350 }, data: { label: 'WebSocket Server', iconName: 'ServerCog', properties: {protocol: "WSS"} } },
      { id: 'chat_db', type: 'custom', position: { x: 650, y: 200 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "NoSQL (Messages)"} } },
      { id: 'chat_cache', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), use: "Sessions, Presence"} } },
    ],
    edges: [
      { id: 'chat_e_client_lb', source: 'chat_client', target: 'chat_lb', label: 'HTTP/S', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_client_ws', source: 'chat_client', target: 'chat_ws', label: 'WebSocket', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'chat_e_lb_apigw', source: 'chat_lb', target: 'chat_apigw', label: 'Routes', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_apigw_usersvc', source: 'chat_apigw', target: 'chat_usersvc', label: 'Auth, Profile', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_apigw_chatsvc', source: 'chat_apigw', target: 'chat_chatsvc', label: 'Chat API', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_chatsvc_db', source: 'chat_chatsvc', target: 'chat_db', label: 'Stores/Retrieves Msgs', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_chatsvc_ws', source: 'chat_chatsvc', target: 'chat_ws', label: 'Publishes Msgs', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'chat_e_usersvc_cache', source: 'chat_usersvc', target: 'chat_cache', label: 'User Sessions', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_ws_cache', source: 'chat_ws', target: 'chat_cache', label: 'Presence', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    ],
  },
  {
    name: "TinyURL Service",
    nodes: [
      { id: 'tiny_client', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'User Browser', iconName: 'Globe', properties: {} } }, // Assuming Globe icon
      { id: 'tiny_apigw', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
      { id: 'tiny_urlsvc', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'URL Shortener Service', iconName: 'Link2', properties: designComponents.find(c => c.name === "URL Shortener Service")?.initialProperties || {} } },
      { id: 'tiny_db', type: 'custom', position: { x: 650, y: 150 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "Key-Value Store", example: "Redis/DynamoDB"} } },
      { id: 'tiny_cache', type: 'custom', position: { x: 450, y: 300 }, data: { label: 'Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), use: "Hot URLs"} } },
    ],
    edges: [
      { id: 'tiny_e_client_apigw', source: 'tiny_client', target: 'tiny_apigw', label: 'Shorten/Redirect Req', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'tiny_e_apigw_urlsvc', source: 'tiny_apigw', target: 'tiny_urlsvc', label: 'Processes Req', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'tiny_e_urlsvc_db', source: 'tiny_urlsvc', target: 'tiny_db', label: 'Read/Write Mapping', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'tiny_e_urlsvc_cache_write', source: 'tiny_urlsvc', target: 'tiny_cache', label: 'Write to Cache', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'tiny_e_urlsvc_cache_read', source: 'tiny_urlsvc', target: 'tiny_cache', label: 'Read from Cache', animated: true, style: { stroke: 'hsl(var(--accent))', strokeDasharray: '5,5' } }, // Dashed for read path maybe
    ],
  },
  {
    name: "Sharded Database",
    nodes: [
      { id: 'shard_app', type: 'custom', position: { x: 50, y: 200 }, data: { label: 'App Server', iconName: 'Puzzle', properties: designComponents.find(c => c.name === "App Server")?.initialProperties || {} } },
      { id: 'shard_router', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'DB Router/Coordinator', iconName: 'ServerCog', properties: designComponents.find(c => c.name === "DB Router/Coordinator")?.initialProperties || {} } },
      { id: 'shard_db1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'DB Shard 1', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: "primary", shardingStrategy: "hash", shardKey: "user_id", shardName: "Shard 1"} } },
      { id: 'shard_db2', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'DB Shard 2', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: "primary", shardingStrategy: "hash", shardKey: "user_id", shardName: "Shard 2"} } },
      { id: 'shard_db3', type: 'custom', position: { x: 450, y: 350 }, data: { label: 'DB Shard 3', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: "primary", shardingStrategy: "hash", shardKey: "user_id", shardName: "Shard 3"} } },
    ],
    edges: [
      { id: 'shard_e_app_router', source: 'shard_app', target: 'shard_router', label: 'DB Queries', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'shard_e_router_db1', source: 'shard_router', target: 'shard_db1', label: 'Routes to Shard 1', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'shard_e_router_db2', source: 'shard_router', target: 'shard_db2', label: 'Routes to Shard 2', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'shard_e_router_db3', source: 'shard_router', target: 'shard_db3', label: 'Routes to Shard 3', animated: true, style: { stroke: 'hsl(var(--accent))' } },
    ],
  },
  {
    name: "Message Queue System",
    nodes: [
      { id: 'mq_producer', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Producer Service', iconName: 'Server', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), role: "Order Processor"} } },
      { id: 'mq_queue', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Message Queue', iconName: 'GitFork', properties: designComponents.find(c => c.name === "Message Queue")?.initialProperties || {} } },
      { id: 'mq_consumer1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'Consumer Service 1', iconName: 'Puzzle', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), role: "Notification Sender"} } },
      { id: 'mq_consumer2', type: 'custom', position: { x: 450, y: 250 }, data: { label: 'Consumer Service 2', iconName: 'Puzzle', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), role: "Inventory Updater"} } },
      { id: 'mq_db_notify', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), use: "Notification Logs"} } },
      { id: 'mq_db_inventory', type: 'custom', position: { x: 650, y: 250 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), use: "Inventory Records"} } },
    ],
    edges: [
      { id: 'mq_e_producer_queue', source: 'mq_producer', target: 'mq_queue', label: 'Publishes Message', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'mq_e_queue_consumer1', source: 'mq_queue', target: 'mq_consumer1', label: 'Consumes Message', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'mq_e_queue_consumer2', source: 'mq_queue', target: 'mq_consumer2', label: 'Consumes Message', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'mq_e_consumer1_db', source: 'mq_consumer1', target: 'mq_db_notify', label: 'Writes Log', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'mq_e_consumer2_db', source: 'mq_consumer2', target: 'mq_db_inventory', label: 'Updates Records', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    ],
  }
];


function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<EvaluateSystemDesignOutput | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { toast } = useToast();
  const { state: sidebarState } = useSidebar();
  const canvasRef = useRef<DesignCanvasHandles>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      featureRequirements: "",
    },
  });

  const onDragStart = (event: React.DragEvent, componentName: string, iconName: string, initialProperties: Record<string, any>) => {
    const nodeData = { name: componentName, iconName: iconName, properties: initialProperties || {} };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const loadTemplate = (nodes: Node<NodeData>[], edges: Edge[]) => {
    if (canvasRef.current) {
      canvasRef.current.loadTemplate(nodes, edges);
      setSelectedNode(null); // Clear selection when loading a template
       toast({
        title: "Template Loaded",
        description: "The selected template has been loaded onto the canvas.",
        duration: 3000,
      });
    }
  };

  const handleNodeSelect = useCallback((node: Node<NodeData> | null) => {
    setSelectedNode(node);
  }, []);

  const handleUpdateNodeProperties = (nodeId: string, updatedProperties: Record<string, any>) => {
    if (canvasRef.current) {
      canvasRef.current.updateNodeProperties(nodeId, updatedProperties);
    }
    // Update selectedNode state as well if it's the one being edited
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prevNode => prevNode ? ({
        ...prevNode,
        data: {
          ...prevNode.data,
          properties: { ...prevNode.data.properties, ...updatedProperties }
        }
      }) : null);
    }
  };
  
  const selectedComponentConfig = selectedNode ? designComponents.find(c => c.name === selectedNode.data.label || c.iconName === selectedNode.data.iconName) : undefined;


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAiFeedback(null);

    try {
      let designDiagramJson = JSON.stringify({ nodes: [], edges: [] });

      if (canvasRef.current) {
        designDiagramJson = canvasRef.current.getDiagramJson();
      }
      
      const evaluationInput: EvaluateSystemDesignInput = {
        requirements: data.featureRequirements,
        designDiagram: designDiagramJson,
      };

      const feedback = await evaluateSystemDesign(evaluationInput);
      setAiFeedback(feedback);
      toast({
        title: "Evaluation Complete",
        description: "AI feedback has been generated successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error evaluating system design:", error);
      toast({
        title: "Evaluation Error",
        description: "Failed to generate AI feedback. Check console for details.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="p-0">
          <Logo collapsed={sidebarState === 'collapsed'} />
        </SidebarHeader>
        <ShadSidebarContent className="p-0">
          <ScrollArea className="h-full">
            <SidebarGroup className="p-2">
              <SidebarGroupLabel className="flex items-center gap-2">
                <Box className="h-4 w-4" /> Components
              </SidebarGroupLabel>
              <SidebarMenu>
                {designComponents.map((component) => (
                  <SidebarMenuItem key={component.name}>
                    <SidebarMenuButton
                      draggable={true}
                      onDragStart={(event) => onDragStart(event, component.name, component.iconName, component.initialProperties)}
                      className="text-sm cursor-grab"
                      tooltip={component.name}
                    >
                      <component.icon className="h-4 w-4" />
                      <span>{component.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <Separator className="my-2" />

            <SidebarGroup className="p-2">
               <SidebarGroupLabel className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Templates
              </SidebarGroupLabel>
              <SidebarMenu>
                {initialTemplates.map((template) => (
                  <SidebarMenuItem key={template.name}>
                    <SidebarMenuButton
                      onClick={() => loadTemplate(template.nodes, template.edges)}
                      className="text-sm"
                      tooltip={`Load ${template.name} template`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>{template.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <Separator className="my-2" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <SidebarGroup className="p-2">
                  <SidebarGroupLabel className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Feature Requirements
                  </SidebarGroupLabel>
                  <FormField
                    control={form.control}
                    name="featureRequirements"
                    render={({ field }) => (
                      <FormItem className="px-2">
                        <FormLabel className="sr-only">Feature Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Build a YouTube-like video streaming platform for millions of users..."
                            className="min-h-[120px] text-sm bg-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="px-2 mt-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Evaluate Design
                    </Button>
                  </div>
                </SidebarGroup>
              </form>
            </Form>

            {isLoading && (
              <Card className="m-4 shadow-none border-dashed">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">AI is analyzing your design...</p>
                </CardContent>
              </Card>
            )}

            {aiFeedback && !isLoading && (
              <>
              <Separator className="my-2" />
              <SidebarGroup className="p-2">
                <SidebarGroupLabel className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Feedback
                </SidebarGroupLabel>
                <Card className="shadow-none bg-card mt-2">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base">Overall Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 text-sm text-muted-foreground">
                     {aiFeedback.overallAssessment || "No overall assessment provided."}
                  </CardContent>
                </Card>
                <Card className="shadow-none bg-card mt-2">
                  <CardContent className="p-0">
                    <Accordion type="multiple" className="w-full">
                       <AccordionItem value="strengths">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Identified Strengths</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.identifiedStrengths && aiFeedback.identifiedStrengths.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {aiFeedback.identifiedStrengths.map((item, idx) => <li key={`strength-${idx}`}>{item}</li>)}
                            </ul>
                          ) : "No specific strengths identified."}
                        </AccordionContent>
                      </AccordionItem>
                       <AccordionItem value="suggestions">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">General Suggestions</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                           {aiFeedback.suggestionsForImprovement && aiFeedback.suggestionsForImprovement.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {aiFeedback.suggestionsForImprovement.map((item, idx) => <li key={`suggestion-${idx}`}>{item}</li>)}
                            </ul>
                          ) : "No general suggestions provided."}
                        </AccordionContent>
                      </AccordionItem>
                      {[
                        {id: 'complexity', label: 'Complexity', data: aiFeedback.complexity},
                        {id: 'scalability', label: 'Scalability', data: aiFeedback.scalability},
                        {id: 'availability', label: 'Availability', data: aiFeedback.availability},
                        {id: 'faultTolerance', label: 'Fault Tolerance', data: aiFeedback.faultTolerance},
                        {id: 'costEfficiency', label: 'Cost Efficiency', data: aiFeedback.costEfficiency},
                        {id: 'security', label: 'Security', data: aiFeedback.security},
                        {id: 'maintainability', label: 'Maintainability', data: aiFeedback.maintainability},
                      ].map(criterion => (
                        criterion.data && // Ensure criterion data exists
                        <AccordionItem value={criterion.id} key={criterion.id}>
                          <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                            {criterion.label}: <span className="ml-1 font-semibold text-primary">{criterion.data.rating}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground space-y-2">
                            <p>{criterion.data.explanation}</p>
                            {criterion.data.specificRecommendations && criterion.data.specificRecommendations.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-card-foreground mb-1">Recommendations:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {criterion.data.specificRecommendations.map((rec, idx) => <li key={`${criterion.id}-rec-${idx}`}>{rec}</li>)}
                                </ul>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                       <AccordionItem value="risks">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Potential Risks</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.potentialRisks && aiFeedback.potentialRisks.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {aiFeedback.potentialRisks.map((item, idx) => <li key={`risk-${idx}`}>{item}</li>)}
                            </ul>
                          ) : "No potential risks identified."}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </SidebarGroup>
              </>
            )}
          </ScrollArea>
        </ShadSidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center w-full group-data-[collapsible=icon]:hidden">
              Architech AI &copy; {new Date().getFullYear()}
            </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-0 md:p-0 md:m-0 md:rounded-none flex">
        <header className="h-14 flex items-center px-4 border-b md:hidden">
            <SidebarTrigger />
            <span className="ml-2 font-semibold text-lg text-primary">Architech AI</span>
        </header>
        <ReactFlowProvider>
          <div className="flex flex-1"> 
            <main className="flex-1 overflow-auto p-0 h-[calc(100vh-3.5rem)] md:h-screen">
                <DesignCanvas ref={canvasRef} onNodeSelect={handleNodeSelect} />
            </main>
            {selectedNode && selectedComponentConfig && (
              <aside className="w-80 border-l border-border bg-card hidden md:block">
                <ScrollArea className="h-full">
                  <PropertiesPanel
                    key={selectedNode.id} 
                    selectedNode={selectedNode}
                    componentConfig={selectedComponentConfig}
                    onUpdateNode={handleUpdateNodeProperties}
                    onClose={() => setSelectedNode(null)}
                  />
                </ScrollArea>
              </aside>
            )}
          </div>
        </ReactFlowProvider>
      </SidebarInset>
    </>
  );
}


export function ArchitechApp() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; 
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  );
}

