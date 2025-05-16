
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
import { Loader2, Sparkles, Server, Database, Waypoints, ShieldCheck, Cloud, Zap, Box, Shuffle, Puzzle, BarChartBig, GitFork, Layers, Settings2, MessageSquare, Link2, ServerCog, Users, Smartphone, Globe } from 'lucide-react';

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
import { ThemeToggleButton } from './theme-toggle-button';


const formSchema = z.object({
  featureRequirements: z.string().min(20, { message: "Feature requirements should be descriptive, at least 20 characters." }),
});
type FormValues = z.infer<typeof formSchema>;

export const designComponents: ComponentConfig[] = [
  {
    name: "Load Balancer",
    icon: Shuffle,
    iconName: "Shuffle",
    initialProperties: { type: "Application LB", algorithm: "Round Robin", instanceCount: 2, healthCheckPath: "/health" },
    configurableProperties: [
      { id: 'type', label: 'LB Type', type: 'select', options: ["Application LB", "Network LB", "Gateway LB"] },
      { id: 'algorithm', label: 'Algorithm', type: 'select', options: ["Round Robin", "Least Connections", "IP Hash", "Weighted Round Robin"] },
      { id: 'instanceCount', label: 'Instance Count', type: 'number' },
      { id: 'healthCheckPath', label: 'Health Check Path', type: 'text' },
    ]
  },
  {
    name: "API Gateway",
    icon: Waypoints,
    iconName: "Waypoints",
    initialProperties: { protocol: "HTTPS/REST", authType: "API Key", rateLimit: "1000/s", corsEnabled: true },
    configurableProperties: [
      { id: 'protocol', label: 'Protocol', type: 'text' },
      { id: 'authType', label: 'Auth Type', type: 'select', options: ["API Key", "OAuth 2.0", "JWT", "None"] },
      { id: 'rateLimit', label: 'Rate Limit (req/s)', type: 'text' },
      { id: 'corsEnabled', label: 'CORS Enabled', type: 'boolean' },
    ]
  },
  {
    name: "Web Server",
    icon: Server,
    iconName: "Server",
    initialProperties: { instanceType: "t3.medium", scaling: "auto", framework: "Nginx", port: 80 },
    configurableProperties: [
      { id: 'instanceType', label: 'Instance Type', type: 'text' },
      { id: 'scaling', label: 'Scaling', type: 'select', options: ["auto", "fixed", "manual"] },
      { id: 'framework', label: 'Framework', type: 'select', options: ["Nginx", "Apache", "IIS", "Caddy", "Other"] },
      { id: 'port', label: 'Port', type: 'number' },
    ]
  },
  {
    name: "App Server",
    icon: Puzzle,
    iconName: "Puzzle",
    initialProperties: { language: "Node.js", framework: "Express", instanceType: "m5.large", scaling: "auto-scaling group", minInstances: 2, maxInstances: 10 },
    configurableProperties: [
      { id: 'language', label: 'Language', type: 'select', options: ["Node.js", "Python", "Java", "Go", "Ruby", ".NET", "PHP"] },
      { id: 'framework', label: 'Framework', type: 'text' },
      { id: 'instanceType', label: 'Instance Type', type: 'text' },
      { id: 'scaling', label: 'Scaling Mechanism', type: 'text' },
      { id: 'minInstances', label: 'Min Instances', type: 'number'},
      { id: 'maxInstances', label: 'Max Instances', type: 'number'},
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
      replicationType: "async",
      replicationSourceId: "",
      shardingStrategy: "none",
      shardKey: "",
      consistency: "Strong (for primary)",
      backupEnabled: true,
    },
    configurableProperties: [
      { id: 'type', label: 'DB Type', type: 'select', options: ["PostgreSQL", "MySQL", "MongoDB", "Cassandra", "DynamoDB", "SQL Server", "Oracle", "Redis (as DB)", "Spanner-like", "Other"] },
      { id: 'size', label: 'Instance Size', type: 'text' },
      { id: 'role', label: 'Role', type: 'select', options: ["primary", "replica-read", "replica-failover", "standalone", "shard-primary", "shard-replica"] },
      { id: 'replicationType', label: 'Replication (if replica)', type: 'select', options: ["async", "sync", "semi-sync", "N/A"] },
      { id: 'replicationSourceId', label: 'Replication Source Node ID', type: 'text' },
      { id: 'shardingStrategy', label: 'Sharding Strategy', type: 'select', options: ["none", "range-based", "hash-based", "directory-based", "geo-based"] },
      { id: 'shardKey', label: 'Shard Key (if sharded)', type: 'text' },
      { id: 'consistency', label: 'Consistency Model', type: 'text' },
      { id: 'backupEnabled', label: 'Backups Enabled', type: 'boolean' },
    ]
  },
  {
    name: "Cache",
    icon: Zap,
    iconName: "Zap",
    initialProperties: { type: "Redis", evictionPolicy: "LRU", pattern: "Cache-Aside", size: "cache.m5.large", persistence: "RDB snapshot" },
    configurableProperties: [
      { id: 'type', label: 'Cache Type', type: 'select', options: ["Redis", "Memcached", "Hazelcast", "In-Memory", "CDN as Cache"] },
      { id: 'evictionPolicy', label: 'Eviction Policy', type: 'select', options: ["LRU", "LFU", "FIFO", "Random", "No Eviction"] },
      { id: 'pattern', label: 'Caching Pattern', type: 'select', options: ["Cache-Aside", "Read-Through", "Write-Through", "Write-Back", "Write-Around"] },
      { id: 'size', label: 'Instance Size', type: 'text' },
      { id: 'persistence', label: 'Persistence (if applicable)', type: 'text' },
    ]
  },
  {
    name: "Message Queue",
    icon: GitFork,
    iconName: "GitFork",
    initialProperties: { type: "RabbitMQ", persistence: "durable", deliveryGuarantee: "at-least-once", consumerGroups: 1, deadLetterQueue: "enabled" },
    configurableProperties: [
      { id: 'type', label: 'Queue Type', type: 'select', options: ["RabbitMQ", "Kafka", "SQS", "Redis Streams", "NATS", "Google Pub/Sub", "Azure Service Bus"] },
      { id: 'persistence', label: 'Persistence', type: 'select', options: ["durable", "transient", "configurable"] },
      { id: 'deliveryGuarantee', label: 'Delivery Guarantee', type: 'select', options: ["at-least-once", "at-most-once", "exactly-once (if supported)"] },
      { id: 'consumerGroups', label: 'Consumer Groups', type: 'number' },
      { id: 'deadLetterQueue', label: 'Dead Letter Queue', type: 'select', options: ["enabled", "disabled"] },
    ]
  },
  { name: "CDN", icon: Cloud, iconName: "Cloud", initialProperties: { provider: "Cloudflare", edgeLocations: "global", cachingPolicy: "Standard", WAFEnabled: true }, configurableProperties: [{ id: 'provider', label: 'Provider', type: 'text' }, { id: 'edgeLocations', label: 'Edge Locations', type: 'text' }, { id: 'cachingPolicy', label: 'Caching Policy', type: 'text' }, { id: 'WAFEnabled', label: 'WAF Enabled', type: 'boolean' }] },
  { name: "Firewall", icon: ShieldCheck, iconName: "ShieldCheck", initialProperties: { type: "WAF", ruleset: "OWASP Top 10", deployment: "Edge", logging: "enabled" }, configurableProperties: [{ id: 'type', label: 'Type', type: 'select', options: ["WAF", "Network Firewall", "NGFW"] }, { id: 'ruleset', label: 'Ruleset', type: 'text' }, {id: 'deployment', label: 'Deployment Location', type: 'text'}, {id: 'logging', label: 'Logging', type: 'select', options: ["enabled", "disabled"]}] },
  { name: "Storage (S3/Blob)", icon: Box, iconName: "Box", initialProperties: { bucketType: "Standard", region: "us-east-1", versioning: "enabled", lifecyclePolicy: "Archive after 90d" }, configurableProperties: [{ id: 'bucketType', label: 'Bucket Type', type: 'text' }, { id: 'region', label: 'Region', type: 'text' }, {id: 'versioning', label: 'Versioning', type: 'boolean'}, {id: 'lifecyclePolicy', label: 'Lifecycle Policy', type: 'text'}] },
  { name: "Monitoring", icon: BarChartBig, iconName: "BarChartBig", initialProperties: { tool: "Prometheus/Grafana", metrics: "Latency, Error Rate, Traffic, Saturation", alerting: "PagerDuty", dashboarding: "Grafana" }, configurableProperties: [{ id: 'tool', label: 'Tool', type: 'text' }, { id: 'metrics', label: 'Key Metrics Monitored', type: 'text' }, {id: 'alerting', label: 'Alerting System', type: 'text'}, {id: 'dashboarding', label: 'Dashboarding Tool', type: 'text'}] },
  { name: "User Service", icon: Users, iconName: "Users", initialProperties: { language: "Go", responsibilities: "User accounts, auth, profiles", dbUsed: "User DB (Postgres)", apiType: "REST/gRPC" }, configurableProperties: [{ id: 'language', label: 'Language', type: 'text' }, { id: 'responsibilities', label: 'Responsibilities', type: 'text' }, { id: 'dbUsed', label: 'Primary Database', type: 'text' }, { id: 'apiType', label: 'API Type', type: 'text'}] },
  { name: "Chat Service", icon: MessageSquare, iconName: "MessageSquare", initialProperties: { language: "Java/Kotlin", features: "Message delivery, history, presence, typing indicators", transport: "WebSockets", scalability: "Horizontally scalable" }, configurableProperties: [{ id: 'language', label: 'Language', type: 'text' }, { id: 'features', label: 'Features', type: 'text' }, {id: 'transport', label: 'Transport Protocol', type: 'text'}, {id: 'scalability', label: 'Scalability Notes', type: 'text'}] },
  { name: "URL Shortener Service", icon: Link2, iconName: "Link2", initialProperties: { language: "Python", db: "Key-Value Store (e.g. Redis)", algorithm: "Base62 Encoding + Collision Resolution", readHeavy: true }, configurableProperties: [{ id: 'language', label: 'Language', type: 'text' }, { id: 'db', label: 'Primary DB', type: 'text' }, {id: 'algorithm', label: 'Shortening Algorithm', type: 'text'}, {id: 'readHeavy', label: 'Read Heavy Workload', type: 'boolean'}] },
  { name: "DB Router/Coordinator", icon: ServerCog, iconName: "ServerCog", initialProperties: { type: "ProxySQL/Vitess", strategy: "Sharding Coordination", connectionPooling: "enabled", queryCaching: "disabled" }, configurableProperties: [{ id: 'type', label: 'Router Type', type: 'text' }, { id: 'strategy', label: 'Strategy', type: 'text' }, {id: 'connectionPooling', label: 'Connection Pooling', type: 'boolean'}, {id: 'queryCaching', label: 'Query Caching', type: 'boolean'}] },
  { name: "Client Device", icon: Smartphone, iconName: "Smartphone", initialProperties: { type: "Mobile/Web Browser", platform: "iOS/Android/Web", connectionType: "WiFi/Cellular" }, configurableProperties: [{ id: 'type', label: 'Client Type', type: 'text' }, { id: 'platform', label: 'Platform', type: 'text' }, {id: 'connectionType', label: 'Connection Type', type: 'text'}] },
  { name: "External API", icon: Globe, iconName: "Globe", initialProperties: { serviceName: "Payment Gateway", purpose: "Processes payments", integration: "Webhook/SDK", reliability: "High (SLA based)" }, configurableProperties: [{ id: 'serviceName', label: 'Service Name', type: 'text' }, {id: 'purpose', label: 'Purpose', type: 'text'}, {id: 'integration', label: 'Integration Method', type: 'text'}, {id: 'reliability', label: 'Reliability Notes', type: 'text'}] },
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
        { id: 'sa_db_primary_1', type: 'custom', position: { x: 0, y: 350 }, data: { label: 'Database (Primary)', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: 'primary'} } },
        { id: 'sa_db_replica_1', type: 'custom', position: { x: 200, y: 350 }, data: { label: 'Database (Replica)', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: 'replica-read', replicationSourceId: 'sa_db_primary_1'} } },
    ],
    edges: [
        { id: 'sa_e_apigw_app1', source: 'sa_apigw_1', target: 'sa_app_1', label: 'Proxy', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'sa_e_apigw_app2', source: 'sa_apigw_1', target: 'sa_app_2', label: 'Proxy', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'sa_e_app1_db_w', source: 'sa_app_1', target: 'sa_db_primary_1', label: 'Writes', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'sa_e_app2_db_w', source: 'sa_app_2', target: 'sa_db_primary_1', label: 'Writes', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'sa_e_app1_db_r', source: 'sa_app_1', target: 'sa_db_replica_1', label: 'Reads', animated: true, style: { stroke: 'hsl(var(--accent))' } },
        { id: 'sa_e_app2_db_r', source: 'sa_app_2', target: 'sa_db_replica_1', label: 'Reads', animated: true, style: { stroke: 'hsl(var(--accent))' } },
        { id: 'sa_e_db_repl', source: 'sa_db_primary_1', target: 'sa_db_replica_1', label: 'Replicates to', animated: true, style: { stroke: 'hsl(var(--muted))', strokeDasharray: '5,5' } },
    ]
  },
  {
    name: "Chat Application",
    nodes: [
      { id: 'chat_client_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Client Device', iconName: 'Smartphone', properties: designComponents.find(c => c.name === "Client Device")?.initialProperties || {} } },
      { id: 'chat_lb_1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Load Balancer (API)', iconName: 'Shuffle', properties: designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {} } },
      { id: 'chat_apigw_1', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
      { id: 'chat_usersvc_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'User Service', iconName: 'Users', properties: designComponents.find(c => c.name === "User Service")?.initialProperties || {} } },
      { id: 'chat_chatsvc_1', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'Chat Service', iconName: 'MessageSquare', properties: designComponents.find(c => c.name === "Chat Service")?.initialProperties || {} } },
      { id: 'chat_ws_lb_1', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Load Balancer (WS)', iconName: 'Shuffle', properties: {...(designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {}), type: "Network LB"} } },
      { id: 'chat_ws_server_1', type: 'custom', position: { x: 450, y: 350 }, data: { label: 'WebSocket Server', iconName: 'ServerCog', properties: {protocol: "WSS", framework: "Socket.IO/SignalR", connections: "1M+"} } },
      { id: 'chat_msgdb_1', type: 'custom', position: { x: 650, y: 200 }, data: { label: 'Message Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "Cassandra", consistency: "Eventual (for messages)", purpose: "Stores chat messages, read-heavy for history"} } },
      { id: 'chat_userdb_1', type: 'custom', position: { x: 650, y: -50 }, data: { label: 'User Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "PostgreSQL", role: "primary", purpose: "User accounts, profiles, contacts"} } },
      { id: 'chat_cache_1', type: 'custom', position: { x: 650, y: 350 }, data: { label: 'Presence Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), type: "Redis", use: "User presence, Session data, Typing indicators"} } },
    ],
    edges: [
      { id: 'chat_e_client_lb', source: 'chat_client_1', target: 'chat_lb_1', label: 'HTTP/S API Calls', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_client_ws_lb', source: 'chat_client_1', target: 'chat_ws_lb_1', label: 'WSS Connection', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'chat_e_lb_apigw', source: 'chat_lb_1', target: 'chat_apigw_1', label: 'Routes', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_ws_lb_server', source: 'chat_ws_lb_1', target: 'chat_ws_server_1', label: 'Routes WS', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'chat_e_apigw_usersvc', source: 'chat_apigw_1', target: 'chat_usersvc_1', label: 'Auth, Profile API', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_apigw_chatsvc', source: 'chat_apigw_1', target: 'chat_chatsvc_1', label: 'Chat History API', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_usersvc_userdb', source: 'chat_usersvc_1', target: 'chat_userdb_1', label: 'Reads/Writes Users', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_chatsvc_msgdb', source: 'chat_chatsvc_1', target: 'chat_msgdb_1', label: 'Stores/Retrieves Msgs', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_ws_server_chatsvc', source: 'chat_ws_server_1', target: 'chat_chatsvc_1', label: 'Pub/Sub Msgs', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'chat_e_ws_server_cache', source: 'chat_ws_server_1', target: 'chat_cache_1', label: 'Updates Presence', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'chat_e_chatsvc_cache', source: 'chat_chatsvc_1', target: 'chat_cache_1', label: 'Reads Presence/Session', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    ],
  },
  {
    name: "TinyURL Service",
    nodes: [
      { id: 'tiny_client_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'User Browser', iconName: 'Smartphone', properties: designComponents.find(c => c.name === "Client Device")?.initialProperties || {} } },
      { id: 'tiny_apigw_1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: {...(designComponents.find(c => c.name === "API Gateway")?.initialProperties || {}), rateLimit: "High for reads, Moderate for writes"} } },
      { id: 'tiny_urlsvc_1', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'URL Shortener Service', iconName: 'Link2', properties: designComponents.find(c => c.name === "URL Shortener Service")?.initialProperties || {} } },
      { id: 'tiny_kvdb_1', type: 'custom', position: { x: 650, y: 150 }, data: { label: 'Key-Value Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "Redis (as DB)", role: "standalone", consistency: "Eventual (acceptable for counters)", purpose: "Stores short_url -> long_url mapping"} } },
      { id: 'tiny_cache_1', type: 'custom', position: { x: 450, y: 300 }, data: { label: 'Hot URL Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), type: "Redis", use: "Frequently accessed short URLs", pattern: "Cache-Aside"} } },
    ],
    edges: [
      { id: 'tiny_e_client_apigw', source: 'tiny_client_1', target: 'tiny_apigw_1', label: 'Shorten/Redirect Req', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'tiny_e_apigw_urlsvc', source: 'tiny_apigw_1', target: 'tiny_urlsvc_1', label: 'Processes Req', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'tiny_e_urlsvc_kvdb', source: 'tiny_urlsvc_1', target: 'tiny_kvdb_1', label: 'Read/Write Mapping', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'tiny_e_urlsvc_cache_read', source: 'tiny_urlsvc_1', target: 'tiny_cache_1', label: 'Read from Cache', animated: true, style: { stroke: 'hsl(var(--accent))', strokeDasharray: '5,5' } },
      { id: 'tiny_e_urlsvc_cache_write', source: 'tiny_urlsvc_1', target: 'tiny_cache_1', label: 'Write to Cache (on miss/create)', animated: true, style: { stroke: 'hsl(var(--accent))' } },
    ],
  },
  {
    name: "Sharded Database System",
    nodes: [
      { id: 'shard_app_1', type: 'custom', position: { x: 50, y: 200 }, data: { label: 'App Server', iconName: 'Puzzle', properties: designComponents.find(c => c.name === "App Server")?.initialProperties || {} } },
      { id: 'shard_router_1', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'DB Router/Coordinator', iconName: 'ServerCog', properties: designComponents.find(c => c.name === "DB Router/Coordinator")?.initialProperties || {} } },
      { id: 'shard_db1_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'DB Shard 1', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: "shard-primary", shardingStrategy: "hash-based", shardKey: "user_id", type: "MySQL", custom: {shard_info: "Shard 1 (e.g., UserIDs ending 0-4)"}} } },
      { id: 'shard_db2_1', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'DB Shard 2', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: "shard-primary", shardingStrategy: "hash-based", shardKey: "user_id", type: "MySQL", custom: {shard_info: "Shard 2 (e.g., UserIDs ending 5-9)"}} } },
      { id: 'shard_db3_1', type: 'custom', position: { x: 450, y: 350 }, data: { label: 'DB Shard 3 (Replica Example)', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), role: "shard-replica", shardingStrategy: "hash-based", shardKey: "user_id", type: "MySQL", replicationSourceId: "shard_db1_1", custom: {shard_info: "Replica for Shard 1"}} } },
    ],
    edges: [
      { id: 'shard_e_app_router', source: 'shard_app_1', target: 'shard_router_1', label: 'DB Queries (via shard key)', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'shard_e_router_db1', source: 'shard_router_1', target: 'shard_db1_1', label: 'Routes to Shard 1', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'shard_e_router_db2', source: 'shard_router_1', target: 'shard_db2_1', label: 'Routes to Shard 2', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'shard_e_db1_db3_repl', source: 'shard_db1_1', target: 'shard_db3_1', label: 'Replicates to', animated: true, style: { stroke: 'hsl(var(--muted))', strokeDasharray: '5,5' } },
    ],
  },
  {
    name: "Message Queue System",
    nodes: [
      { id: 'mq_producer_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Producer Service', iconName: 'Server', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), custom: {task: "Order Processing", event_type: "OrderCreatedEvent"}} } },
      { id: 'mq_queue_1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Message Queue', iconName: 'GitFork', properties: designComponents.find(c => c.name === "Message Queue")?.initialProperties || {} } },
      { id: 'mq_consumer1_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'Consumer (Notifications)', iconName: 'Puzzle', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), custom: {task: "Notification Sending", processing_logic: "Send email/SMS"}} } },
      { id: 'mq_consumer2_1', type: 'custom', position: { x: 450, y: 250 }, data: { label: 'Consumer (Inventory)', iconName: 'Puzzle', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), custom: {task: "Inventory Update", processing_logic: "Decrement stock count"}} } },
      { id: 'mq_db_notify_1', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Notification Log DB', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "MongoDB", use: "Notification Logs", custom: {access_pattern: "Write-heavy, append-only"}} } },
      { id: 'mq_db_inventory_1', type: 'custom', position: { x: 650, y: 250 }, data: { label: 'Inventory DB', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "MySQL", use: "Product Inventory", custom: {access_pattern: "Transactional updates"}} } },
    ],
    edges: [
      { id: 'mq_e_producer_queue', source: 'mq_producer_1', target: 'mq_queue_1', label: 'Publishes Message (OrderEvent)', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'mq_e_queue_consumer1', source: 'mq_queue_1', target: 'mq_consumer1_1', label: 'Consumes Message', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'mq_e_queue_consumer2', source: 'mq_queue_1', target: 'mq_consumer2_1', label: 'Consumes Message', animated: true, style: { stroke: 'hsl(var(--accent))' } },
      { id: 'mq_e_consumer1_db', source: 'mq_consumer1_1', target: 'mq_db_notify_1', label: 'Writes Log', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'mq_e_consumer2_db', source: 'mq_consumer2_1', target: 'mq_db_inventory_1', label: 'Updates Inventory', animated: true, style: { stroke: 'hsl(var(--primary))' } },
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
      setSelectedNode(null); 
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
  
  const selectedComponentConfig = selectedNode ? designComponents.find(c => c.name === selectedNode.data.label || c.iconName === selectedNode.data.iconName || c.name === selectedNode.data.label.replace(/ \(.+\)$/, '')) : undefined;


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAiFeedback(null);
    setSelectedNode(null); // Deselect node before evaluation

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
        description: `Failed to generate AI feedback. ${error instanceof Error ? error.message : "Check console for details."}`,
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
                      <Layers className="h-4 w-4" /> {/* Consistent icon for template items */}
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
                        criterion.data && 
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
        <SidebarFooter className="p-2 border-t border-sidebar-border flex items-center group-data-[collapsible=icon]:justify-center">
            <span className="text-xs text-muted-foreground flex-grow group-data-[collapsible=icon]:hidden">
              Architech AI &copy; {new Date().getFullYear()}
            </span>
            <ThemeToggleButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-0 md:p-0 md:m-0 md:rounded-none flex flex-col"> {/* Changed to flex-col */}
        <header className="h-14 flex items-center px-4 border-b md:hidden">
            <SidebarTrigger />
            <span className="ml-2 font-semibold text-lg text-primary">Architech AI</span>
        </header>
        <ReactFlowProvider>
          <div className="flex flex-1 min-h-0"> {/* Added min-h-0 for flex child */}
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
             {selectedNode && !selectedComponentConfig && (
                <aside className="w-80 border-l border-border bg-card hidden md:block p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Component Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-destructive">Could not find configuration for the selected component: "{selectedNode.data.label}".</p>
                            <p className="text-xs text-muted-foreground mt-2">This might happen if the component's label was manually changed or if its configuration is missing.</p>
                        </CardContent>
                    </Card>
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
    // Optional: render a loading skeleton or minimal UI for SSR/SSG
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  );
}
