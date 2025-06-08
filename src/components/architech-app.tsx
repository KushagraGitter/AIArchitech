
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Node, Edge } from 'reactflow';
import { ReactFlowProvider } from 'reactflow';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquarePlus, StickyNote, Shuffle, Waypoints, Server, Database, Zap, GitFork, Cloud, ShieldCheck, Box, BarChartBig, Users, MessageSquare, Link2, ServerCog, Smartphone, Globe } from 'lucide-react';

import { DesignCanvas, type DesignCanvasHandles, type NodeData } from '@/components/design-canvas';
import { PropertiesPanel, type ComponentConfig } from '@/components/properties-panel';
import type { EvaluateSystemDesignInput, EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { evaluateSystemDesign } from '@/ai/flows/evaluate-system-design';
import { themes as themeOptions, type ThemeOption } from '@/components/theme-toggle-button'; 
import { ChatBotWindow, type ChatMessage } from '@/components/chat-bot-window';
import type { InterviewBotInput } from '@/ai/flows/interview-bot-flow';
import { interviewBot } from '@/ai/flows/interview-bot-flow';
import { useAuth } from '@/contexts/AuthContext';
import { WelcomeBackDialog } from '@/components/welcome-back-dialog';
import { useTheme } from "next-themes";

import { AuthSection } from './auth-section';
import { AppSidebar } from './app-sidebar';
import { TopNavigationBar } from './top-navigation-bar';


const formSchema = z.object({
  // Minimal schema, actual fields are dynamic
});
type FormValues = z.infer<typeof formSchema>;


export interface UserDesign {
  id: string;
  name: string;
  updatedAt: Timestamp;
}

const LOCAL_STORAGE_ACTIVE_DESIGN_ID = 'architechAiActiveDesignId';
const LOCAL_STORAGE_ACTIVE_DESIGN_NAME = 'architechAiActiveDesignName';
const AUTOSAVE_DELAY_MS = 2000;


export const designComponents: ComponentConfig[] = [
  {
    name: "Info Note",
    icon: StickyNote,
    iconName: "StickyNote",
    initialProperties: { title: "Note", content: "Enter your text here..." },
    configurableProperties: [
      { id: 'title', label: 'Title', type: 'text' },
      { id: 'content', label: 'Content', type: 'textarea' },
    ]
  },
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
    icon: ServerCog, 
    iconName: "ServerCog", 
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
      { id: 'bws_req_1', type: 'custom', position: { x: 50, y: -50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Feature Requirements', content: 'Design a basic web service that serves user profiles.'} } },
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
        { id: 'sa_req_1', type: 'custom', position: { x: -100, y: -50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Feature Requirements', content: 'Design a scalable API for a social media application. Focus on read-heavy workloads for user timelines.'} } },
        { id: 'sa_bote_1', type: 'custom', position: { x: 300, y: -50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'BOTE Calculations', content: '1M DAU\n100 reads/user/day\n10 writes/user/day\nRead QPS: ~1k (avg), ~10k (peak)\nWrite QPS: ~100 (avg), ~1k (peak)'} } },
        { id: 'sa_apigw_1', type: 'custom', position: { x: 100, y: 50 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
        { id: 'sa_app_1', type: 'custom', position: { x: 0, y: 200 }, data: { label: 'App Server', iconName: 'ServerCog', properties: designComponents.find(c => c.name === "App Server")?.initialProperties || {} } },
        { id: 'sa_app_2', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'App Server', iconName: 'ServerCog', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), instanceId: '2'} } },
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
      { id: 'chat_req_1', type: 'custom', position: { x: -150, y: 0 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Feature Requirements', content: 'Design a chat application supporting 1-1 and group chats, message history, presence, typing indicators. Scalability: 1M concurrent users.'} } },
      { id: 'chat_client_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Client Device', iconName: 'Smartphone', properties: designComponents.find(c => c.name === "Client Device")?.initialProperties || {} } },
      { id: 'chat_lb_1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Load Balancer (API)', iconName: 'Shuffle', properties: designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {} } },
      { id: 'chat_apigw_1', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
      { id: 'chat_usersvc_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'User Service', iconName: 'Users', properties: designComponents.find(c => c.name === "User Service")?.initialProperties || {} } },
      { id: 'chat_chatsvc_1', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'Chat Service', iconName: 'MessageSquare', properties: designComponents.find(c => c.name === "Chat Service")?.initialProperties || {} } },
      { id: 'chat_ws_lb_1', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Load Balancer (WS)', iconName: 'Shuffle', properties: {...(designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {}), type: "Network LB"} } },
      { id: 'chat_ws_server_1', type: 'custom', position: { x: 450, y: 350 }, data: { label: 'WebSocket Server', iconName: 'ServerCog', properties: {protocol: "WSS", framework: "Socket.IO/SignalR", connections: "1M+"} } },
      { id: 'chat_msgdb_1', type: 'custom', position: { x: 650, y: 200 }, data: { label: 'Message Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "Cassandra", consistency: "Eventual (for messages)", custom: {purpose: "Stores chat messages, read-heavy for history"}} } },
      { id: 'chat_userdb_1', type: 'custom', position: { x: 650, y: -50 }, data: { label: 'User Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "PostgreSQL", role: "primary", custom: {purpose: "User accounts, profiles, contacts"}} } },
      { id: 'chat_cache_1', type: 'custom', position: { x: 650, y: 350 }, data: { label: 'Presence Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), type: "Redis", custom: {use: "User presence, Session data, Typing indicators"}} } },
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
      { id: 'tiny_req_1', type: 'custom', position: { x: -150, y: 50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Feature Requirements', content: 'Design a TinyURL-like service. Requirements: Shorten URL, Redirect to original URL, High availability, Low latency reads. Custom short links (optional). Analytics (optional).'} } },
      { id: 'tiny_client_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Client Device', iconName: 'Smartphone', properties: designComponents.find(c => c.name === "Client Device")?.initialProperties || {} } },
      { id: 'tiny_apigw_1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: {...(designComponents.find(c => c.name === "API Gateway")?.initialProperties || {}), rateLimit: "High for reads, Moderate for writes"} } },
      { id: 'tiny_urlsvc_1', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'URL Shortener Service', iconName: 'Link2', properties: designComponents.find(c => c.name === "URL Shortener Service")?.initialProperties || {} } },
      { id: 'tiny_kvdb_1', type: 'custom', position: { x: 650, y: 150 }, data: { label: 'Key-Value Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "Redis (as DB)", role: "standalone", consistency: "Eventual (acceptable for counters)", custom: {purpose: "Stores short_url -> long_url mapping"} } } },
      { id: 'tiny_cache_1', type: 'custom', position: { x: 450, y: 300 }, data: { label: 'Hot URL Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), type: "Redis", custom: {use: "Frequently accessed short URLs", pattern: "Cache-Aside"}} } },
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
      { id: 'shard_req_1', type: 'custom', position: { x: -150, y: 100 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Scenario', content: 'Design the database sharding for a system with a very large number of users (e.g., 1 billion users), where user data needs to be partitioned.'} } },
      { id: 'shard_app_1', type: 'custom', position: { x: 50, y: 200 }, data: { label: 'App Server', iconName: 'ServerCog', properties: designComponents.find(c => c.name === "App Server")?.initialProperties || {} } },
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
      { id: 'mq_req_1', type: 'custom', position: { x: -150, y: 50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Scenario', content: 'Design a system for asynchronous order processing. When an order is placed, events need to be reliably sent to notification and inventory services.'} } },
      { id: 'mq_producer_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Producer Service', iconName: 'Server', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), custom: {task: "Order Processing", event_type: "OrderCreatedEvent"}} } },
      { id: 'mq_queue_1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Message Queue', iconName: 'GitFork', properties: designComponents.find(c => c.name === "Message Queue")?.initialProperties || {} } },
      { id: 'mq_consumer1_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'Consumer (Notifications)', iconName: 'ServerCog', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), custom: {task: "Notification Sending", processing_logic: "Send email/SMS"}} } },
      { id: 'mq_consumer2_1', type: 'custom', position: { x: 450, y: 250 }, data: { label: 'Consumer (Inventory)', iconName: 'ServerCog', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), custom: {task: "Inventory Update", processing_logic: "Decrement stock count"}} } },
      { id: 'mq_db_notify_1', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Notification Log DB', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "MongoDB", custom: {use: "Notification Logs", access_pattern: "Write-heavy, append-only"}} } },
      { id: 'mq_db_inventory_1', type: 'custom', position: { x: 650, y: 250 }, data: { label: 'Inventory DB', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), type: "MySQL", custom: {use: "Product Inventory", access_pattern: "Transactional updates"}} } },
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

const createDefaultNotes = (): Node<NodeData>[] => {
  const infoNoteConfig = designComponents.find(c => c.name === "Info Note");
  if (!infoNoteConfig) return [];

  return [
    {
      id: 'default_req_note_0',
      type: 'custom',
      position: { x: 50, y: 50 },
      data: {
        label: 'Info Note',
        iconName: infoNoteConfig.iconName,
        properties: {
          ...(infoNoteConfig.initialProperties || {}),
          title: 'Feature Requirements',
          content: '- Define functional requirements (e.g., user actions, core features).\n- Define non-functional requirements (e.g., scalability targets like 1M DAU, availability like 99.99%, latency constraints like p99 < 200ms, security considerations).',
        },
      },
    },
    {
      id: 'default_bote_note_0',
      type: 'custom',
      position: { x: 50, y: 250 },
      data: {
        label: 'Info Note',
        iconName: infoNoteConfig.iconName,
        properties: {
          ...(infoNoteConfig.initialProperties || {}),
          title: 'BOTE Calculations',
          content: '- Estimate QPS (Queries Per Second - read/write breakdown).\n- Calculate storage needs (e.g., per user, total data size).\n- Project data growth rate.\n- Assess bandwidth requirements (ingress/egress).\n- Estimate number of servers needed for key components.',
        },
      },
    },
  ];
};


function AppContent() {
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<EvaluateSystemDesignOutput | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<DesignCanvasHandles>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isBotLoadingResponse, setIsBotLoadingResponse] = useState(false);

  const [isNewDesignDialogOpen, setIsNewDesignDialogOpen] = useState(false);
  const [newDesignNameInput, setNewDesignNameInput] = useState('');
  const [currentDesignName, setCurrentDesignName] = useState<string | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);

  const [isWelcomeBackDialogOpen, setIsWelcomeBackDialogOpen] = useState(false);
  const [isMyDesignsDialogOpen, setIsMyDesignsDialogOpen] = useState(false); 
  const [initialDialogFlowPending, setInitialDialogFlowPending] = useState(false);

  const [diagramChangedSinceLastSave, setDiagramChangedSinceLastSave] = useState(false);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [canvasLoadedDesignId, setCanvasLoadedDesignId] = useState<string | null>(null);
  const [isCanvasSyncing, setIsCanvasSyncing] = useState(false);


  const { currentUser, logout, loading: authLoading } = useAuth();
  const { setTheme } = useTheme();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleSetDiagramChanged = useCallback((changed: boolean) => {
    console.log("Setting diagramChangedSinceLastSave to:", changed);
    setDiagramChangedSinceLastSave(changed);
  }, []);

  const fetchUserDesigns = useCallback(async () => {
    if (!currentUser) {
      setUserDesigns([]);
      return;
    }
    setIsLoadingDesigns(true);
    try {
      const q = query(
        collection(db, 'designs'),
        where('userId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const designs: UserDesign[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.designName && data.updatedAt) {
            designs.push({
            id: doc.id,
            name: data.designName,
            updatedAt: data.updatedAt as Timestamp,
            });
        }
      });
      setUserDesigns(designs);
    } catch (error) {
      console.error("Error fetching user designs:", error);
      toast({
        title: "Error Fetching Designs",
        description: `Could not load your saved designs. ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDesigns(false);
    }
  }, [currentUser, toast]);


 const handleLoadDesign = useCallback(async (designId: string, designName: string): Promise<boolean> => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to load designs.", variant: "destructive" });
      return false;
    }

    setIsLoadingDesigns(true);
    try {
      const designRef = doc(db, 'designs', designId);
      const docSnap = await getDoc(designRef);

      if (docSnap.exists()) {
        const designData = docSnap.data();
        const diagram = JSON.parse(designData.diagramJson) as { nodes: Node<NodeData>[], edges: Edge[] };

        setCurrentDesignId(designId);
        setCurrentDesignName(designName);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, designId);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, designName);

        if (canvasRef.current) {
            canvasRef.current.loadTemplate(diagram.nodes, diagram.edges);
            setCanvasLoadedDesignId(designId);
            console.log(`handleLoadDesign: Successfully loaded ${designId} to canvas.`);
        } else {
            console.warn(`handleLoadDesign: Canvas not ready for ${designId}. It should load via sync effect.`);
        }

        setSelectedNode(null);
        setAiFeedback(null);
        setChatMessages([]);
        handleSetDiagramChanged(false);
        toast({ title: "Design Loaded", description: `"${designName}" is now active.` });
        return true;
      } else {
        toast({ title: "Load Failed", description: `Design "${designName}" (ID: ${designId}) not found.`, variant: "destructive" });
        if (localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID) === designId) {
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
        }
        if (currentDesignId === designId) {
            setCurrentDesignId(null);
            setCurrentDesignName(null);
            setCanvasLoadedDesignId(null);
        }
        return false;
      }
    } catch (error) {
      console.error("Error loading design:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: "Load Error", description: `Could not load design "${designName}". ${errorMessage}`, variant: "destructive" });

      if (localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID) === designId) {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
      }
       if (currentDesignId === designId) {
            setCurrentDesignId(null);
            setCurrentDesignName(null);
            setCanvasLoadedDesignId(null);
        }
      return false;
    } finally {
        setIsLoadingDesigns(false);
    }
  }, [currentUser, toast, currentDesignId, handleSetDiagramChanged]);


  const handleOpenNewDesignDialog = useCallback((promptForName = false) => {
    setNewDesignNameInput('');
    if (!currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to create and save new designs.",
            variant: "destructive"
        });
        return;
    }
    if (promptForName) {
        setIsNewDesignDialogOpen(true);
    } else {
        const newId = crypto.randomUUID();
        setCurrentDesignId(newId);
        setCurrentDesignName("Untitled Design");
        setCanvasLoadedDesignId(newId);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, newId);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, "Untitled Design");
        if (canvasRef.current) canvasRef.current.loadTemplate(createDefaultNotes(), []);
        setSelectedNode(null);
        setAiFeedback(null);
        setChatMessages([]);
        handleSetDiagramChanged(false);
    }
  },[currentUser, toast, handleSetDiagramChanged]);


  useEffect(() => {
    const initializeAppForUser = async () => {
      if (!currentUser) { // User logs out or not logged in initially
        setCurrentDesignId(null);
        setCurrentDesignName(null);
        setCanvasLoadedDesignId(null);
        setUserDesigns([]);
        if (canvasRef.current) canvasRef.current.loadTemplate(createDefaultNotes(), []);
        setAiFeedback(null);
        setChatMessages([]);
        setSelectedNode(null);
        setIsWelcomeBackDialogOpen(false);
        setIsMyDesignsDialogOpen(false);
        setInitialDialogFlowPending(false);
        handleSetDiagramChanged(false);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
        return;
      }

      // User is logged in or session restored
      await fetchUserDesigns(); 

      const storedActiveDesignId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
      const storedActiveDesignName = localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
      let activeDesignIdentifiedFromStorage = false;
      
      if (storedActiveDesignId && storedActiveDesignName) {
        console.log("Found active design in localStorage:", storedActiveDesignId, storedActiveDesignName);
        setCurrentDesignId(storedActiveDesignId); // Conceptually active
        setCurrentDesignName(storedActiveDesignName);
        activeDesignIdentifiedFromStorage = true;
        setInitialDialogFlowPending(false); // Prevent welcome dialogs if we have something from storage
        
        // Attempt to load to canvas if ready, but don't let dialog flow depend on canvas readiness here
        if (canvasRef.current) {
          const loaded = await handleLoadDesign(storedActiveDesignId, storedActiveDesignName);
          if(!loaded) { // Design from storage couldn't be loaded (e.g. deleted from DB)
             localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
             localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
             setCurrentDesignId(null);
             setCurrentDesignName(null);
             setCanvasLoadedDesignId(null);
             activeDesignIdentifiedFromStorage = false;
             setInitialDialogFlowPending(true); // Allow dialogs to show now
          }
        } else {
            console.log("initializeAppForUser: Canvas not ready, sync effect will handle loading", storedActiveDesignId);
        }

      } else {
        console.log("No active design in localStorage.");
         if (!currentDesignId && canvasRef.current) { // No current design, no storage design, and canvas ready
             console.log("No currentDesignId and no localStorage design, loading default notes.");
             canvasRef.current.loadTemplate(createDefaultNotes(), []);
             setCanvasLoadedDesignId(null); 
             handleSetDiagramChanged(false);
        }
        setInitialDialogFlowPending(true); // Dialogs might be needed if no design from storage
      }
    };

    initializeAppForUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); 


  useEffect(() => {
    const syncCanvas = async () => {
      if (currentDesignId && currentDesignName && canvasRef.current && canvasLoadedDesignId !== currentDesignId && !isCanvasSyncing) {
        console.log(`Canvas Sync: Attempting to load ${currentDesignId} ('${currentDesignName}') to canvas. Current canvas loaded: ${canvasLoadedDesignId}`);
        setIsCanvasSyncing(true);
        const loadedSuccessfully = await handleLoadDesign(currentDesignId, currentDesignName);
        if (!loadedSuccessfully) {
          console.error(`Canvas Sync: Failed to load ${currentDesignId}. Clearing from localStorage and active context.`);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
          setCurrentDesignId(null);
          setCurrentDesignName(null);
          setCanvasLoadedDesignId(null);
          setInitialDialogFlowPending(true); 
          if (canvasRef.current) canvasRef.current.loadTemplate(createDefaultNotes(), []);
        } else {
             console.log(`Canvas Sync: handleLoadDesign for ${currentDesignId} completed.`);
        }
        setIsCanvasSyncing(false);
      }
    };
    // Debounce or delay this slightly if canvasRef.current might take a moment after initial render
    const timer = setTimeout(syncCanvas, 100); 
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDesignId, currentDesignName, canvasLoadedDesignId]); // Removed canvasRef.current, it will re-run if others change anyway


  useEffect(() => {
    // This effect decides whether to show WelcomeBack or NewDesign dialog
    // Only if initialDialogFlowPending is true, user is logged in, designs are loaded, AND no design is currently active/loaded
    if (currentUser && initialDialogFlowPending && !isLoadingDesigns && currentDesignId === null) {
      if (userDesigns.length > 0) {
        console.log("Dialog Effect: Showing Welcome Back Dialog");
        setIsWelcomeBackDialogOpen(true);
      } else {
        console.log("Dialog Effect: No designs, showing New Design Dialog to name first design");
        handleOpenNewDesignDialog(true);
      }
      setInitialDialogFlowPending(false); // Mark flow as completed for this session
    }
  }, [currentUser, initialDialogFlowPending, isLoadingDesigns, userDesigns, currentDesignId, handleOpenNewDesignDialog]);


  const onDragStart = (event: React.DragEvent, componentName: string, iconName: string, initialProperties: Record<string, any>) => {
    const nodeData = { name: componentName, iconName: iconName, properties: initialProperties || {} };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadTemplate = (nodes: Node<NodeData>[], edges: Edge[], templateName: string = "Loaded Template") => {
    if (canvasRef.current) {
      canvasRef.current.loadTemplate(nodes, edges);
      setSelectedNode(null);
      setAiFeedback(null);
      setChatMessages([]);

      setCurrentDesignId(null); 
      setCurrentDesignName(`${templateName} (Unsaved)`);
      setCanvasLoadedDesignId(null); 
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
      handleSetDiagramChanged(false); 


       toast({
        title: "Template Loaded",
        description: `"${templateName}" loaded. Save it to keep changes.`,
        duration: 3000,
      });
    }
  };

  const handleNewDesignButtonClick = () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to create a new design.", variant: "destructive" });
      return;
    }
    setIsWelcomeBackDialogOpen(false);
    setIsMyDesignsDialogOpen(false);
    handleOpenNewDesignDialog(true);
  };


  const confirmNewDesign = () => {
    const name = newDesignNameInput.trim() || 'Untitled Design';
    const newId = crypto.randomUUID();

    setCurrentDesignId(newId);
    setCurrentDesignName(name);
    setCanvasLoadedDesignId(newId); 

    localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, newId);
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, name);

    if (canvasRef.current) {
      const defaultNodes = createDefaultNotes();
      canvasRef.current.loadTemplate(defaultNodes, []);
    }
    setSelectedNode(null);
    setAiFeedback(null);
    setChatMessages([]);
    setIsNewDesignDialogOpen(false);
    setIsWelcomeBackDialogOpen(false);
    setIsMyDesignsDialogOpen(false);
    setNewDesignNameInput('');
    handleSetDiagramChanged(false); 
    toast({
      title: "New Design Ready",
      description: `Design "${name}" has been created. Save it to keep your work.`,
      duration: 3000,
    });
  };

  const handleSaveDesign = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to save your design.", variant: "destructive" });
      return;
    }
    if (!currentDesignId || !currentDesignName || currentDesignName.endsWith("(Unsaved)")) {
       toast({ title: "Cannot Save", description: "Please name your design first or ensure it's not an unsaved template.", variant: "destructive" });
       handleOpenNewDesignDialog(true);
      return;
    }
    if (!canvasRef.current) {
      toast({ title: "Error", description: "Canvas not available.", variant: "destructive" });
      return;
    }

    setIsSavingDesign(true);
    console.log("Manual Save: Initiated for", currentDesignId);
    const diagramJson = canvasRef.current.getDiagramJson();
    const designData = {
      userId: currentUser.uid,
      designName: currentDesignName,
      diagramJson: diagramJson,
      updatedAt: serverTimestamp(),
    };

    try {
      const designRef = doc(db, 'designs', currentDesignId);
      await setDoc(designRef, designData, { merge: true });

      toast({ title: "Design Saved!", description: `"${currentDesignName}" has been saved successfully.` });
      handleSetDiagramChanged(false);
      setCanvasLoadedDesignId(currentDesignId); 
      fetchUserDesigns();
    } catch (error) {
      console.error("Error saving design:", error);
      toast({ title: "Save Failed", description: `Could not save design. ${error instanceof Error ? error.message : String(error)}`, variant: "destructive" });
    } finally {
      setIsSavingDesign(false);
      console.log("Manual Save: Completed for", currentDesignId);
    }
  };


  const handleNodeSelect = useCallback((node: Node<NodeData> | null) => {
    setSelectedNode(node);
  }, []);

  const handleUpdateNodeProperties = (nodeId: string, updatedProperties: Record<string, any>) => {
    if (canvasRef.current) {
      canvasRef.current.updateNodeProperties(nodeId, updatedProperties);
      handleSetDiagramChanged(true);
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

  const extractContextFromDiagram = () => {
    let designDiagramJson = JSON.stringify({ nodes: [], edges: [] });
    let extractedRequirements = "";
    let extractedBoteCalculations = "";

    if (canvasRef.current) {
      const diagramString = canvasRef.current.getDiagramJson();
      designDiagramJson = diagramString;
      const diagram = JSON.parse(diagramString) as { nodes: Node<NodeData>[], edges: Edge[] };

      const requirementsNotes: string[] = [];
      const boteNotes: string[] = [];

      diagram.nodes.forEach(node => {
        if (node.data.label === "Info Note" && node.data.properties) {
          const title = (node.data.properties.title || "").toLowerCase();
          const content = node.data.properties.content || "";
          if (title.includes("requirement")) {
            requirementsNotes.push(content);
          } else if (title.includes("bote") || title.includes("calculation")) {
            boteNotes.push(content);
          }
        }
      });
      extractedRequirements = requirementsNotes.join("\n\n---\n\n");
      extractedBoteCalculations = boteNotes.join("\n\n---\n\n");

      if (!extractedRequirements && diagram.nodes.some(n => n.data.label === "Info Note")) {
        const allNotesContent = diagram.nodes
          .filter(node => {
            const title = (node.data.properties?.title || "").toLowerCase();
            return node.data.label === "Info Note" &&
                   node.data.properties?.content &&
                   !title.includes("bote") &&
                   !title.includes("calculation");
          })
          .map(node => node.data.properties.content as string)
          .join("\n\n---\n\n");
        if(allNotesContent) extractedRequirements = allNotesContent;
      }
       if (!extractedRequirements) {
         extractedRequirements = "No feature requirements provided via Info Notes on the canvas.";
       }
    }
    return { designDiagramJson, extractedRequirements, extractedBoteCalculations };
  };

  const onSubmitEvaluation: SubmitHandler<FormValues> = async (_formData) => {
    if (!currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to evaluate designs.",
            variant: "destructive"
        });
        return;
    }
    setIsLoadingEvaluation(true);
    setAiFeedback(null);

    try {
      const { designDiagramJson, extractedRequirements, extractedBoteCalculations } = extractContextFromDiagram();

      const evaluationInput: EvaluateSystemDesignInput = {
        requirements: extractedRequirements,
        designDiagram: designDiagramJson,
        backOfTheEnvelopeCalculations: extractedBoteCalculations || undefined,
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
      setIsLoadingEvaluation(false);
    }
  };

  const handleSendMessageToBot = async (message: string) => {
    if (!message.trim()) return;
     if (!currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to use the Interview Bot.",
            variant: "destructive"
        });
        const systemMessage: ChatMessage = { role: 'system', content: "Please log in to interact with the Interview Bot."};
        setChatMessages(prev => [...prev, systemMessage]);
        return;
    }

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsBotLoadingResponse(true);

    try {
      const { designDiagramJson, extractedRequirements, extractedBoteCalculations } = extractContextFromDiagram();

      const validChatHistory = chatMessages
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => ({role: msg.role as 'user' | 'model', content: msg.content}));

      const botInput: InterviewBotInput = {
        diagramJson: designDiagramJson,
        featureRequirements: extractedRequirements,
        boteCalculations: extractedBoteCalculations || undefined,
        chatHistory: validChatHistory,
        currentUserMessage: message,
      };

      const response = await interviewBot(botInput);
      const newAiMessage: ChatMessage = { role: 'model', content: response.aiResponseMessage };
      setChatMessages(prevMessages => [...prevMessages, newAiMessage]);

    } catch (error) {
      console.error("Error with Interview Bot:", error);
      const errorResponseMessage: ChatMessage = { role: 'system', content: `Error: ${error instanceof Error ? error.message : "Could not get response from bot."}` };
      setChatMessages(prevMessages => [...prevMessages, errorResponseMessage]);
      toast({
        title: "Interview Bot Error",
        description: `Failed to get response from bot. ${error instanceof Error ? error.message : "Check console for details."}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsBotLoadingResponse(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    console.log("Autosave Effect: diagramChanged:", diagramChangedSinceLastSave, "currentUser:", !!currentUser, "currentDesignId:", currentDesignId, "name:", currentDesignName, "isSaving:", isSavingDesign);

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      console.log("Autosave Effect: Cleared previous timer");
    }

    if (
      diagramChangedSinceLastSave &&
      currentUser &&
      currentDesignId &&
      currentDesignName &&
      !currentDesignName.endsWith("(Unsaved)") &&
      canvasRef.current &&
      !isSavingDesign
    ) {
      console.log("Autosave Effect: Conditions met, setting timer for", AUTOSAVE_DELAY_MS, "ms for design", currentDesignId);
      autosaveTimer.current = setTimeout(async () => {
        console.log("Autosave Timer: Fired for design", currentDesignId);
        if (!canvasRef.current) {
            console.warn("Autosave Timer: Canvas ref not available at time of save.");
            return;
        }
        const diagramJson = canvasRef.current.getDiagramJson();
        const designData = {
          userId: currentUser.uid,
          designName: currentDesignName,
          diagramJson: diagramJson,
          updatedAt: serverTimestamp(),
        };

        try {
          const designRef = doc(db, 'designs', currentDesignId);
          await setDoc(designRef, designData, { merge: true });
          console.log(`Autosave: Successfully saved ${currentDesignId}`);
          handleSetDiagramChanged(false);
          setCanvasLoadedDesignId(currentDesignId); 
        } catch (error) {
          console.error("Autosave: Error saving design:", currentDesignId, error);
          toast({
            title: "Autosave Failed",
            description: `Could not automatically save your design "${currentDesignName}". Please try saving manually. ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive",
          });
        }
      }, AUTOSAVE_DELAY_MS);
    } else if (diagramChangedSinceLastSave) {
        console.log("Autosave Effect: Conditions NOT met, but diagramChanged is true. State:", {
            currentUser: !!currentUser,
            currentDesignId,
            currentDesignName,
            isUnsavedTemplate: currentDesignName?.endsWith("(Unsaved)"),
            canvasRefCurrent: !!canvasRef.current,
            isSavingDesign
        });
    }

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
        console.log("Autosave Effect: Cleanup - Cleared timer for design", currentDesignId);
      }
    };
  }, [diagramChangedSinceLastSave, currentUser, currentDesignId, currentDesignName, toast, isSavingDesign, handleSetDiagramChanged]);

  const handleExportDesign = () => {
    if (!canvasRef.current) {
      toast({ title: "Error", description: "Canvas not available for export.", variant: "destructive" });
      return;
    }
    const diagramJson = canvasRef.current.getDiagramJson();
    const blob = new Blob([diagramJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = currentDesignName ? `${currentDesignName.replace(/\s+/g, '_').replace(/\(Unsaved\)/i, '').replace(/[^a-z0-9_.-]/gi, '') || 'design'}.json` : 'architech-design.json';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `Design exported as ${fileName}` });
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const parsedData = JSON.parse(content);

        if (!parsedData || typeof parsedData !== 'object' || !Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.edges)) {
          throw new Error("Invalid JSON format. 'nodes' and 'edges' arrays are required.");
        }
        

        if (canvasRef.current) {
          canvasRef.current.loadTemplate(parsedData.nodes, parsedData.edges);
          
          const newName = `Imported - ${file.name.replace(/\.json$/i, '')} (Unsaved)`;
          setCurrentDesignName(newName);
          setCurrentDesignId(null); 
          setCanvasLoadedDesignId(null); 
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
          handleSetDiagramChanged(false); 
          setSelectedNode(null);
          setAiFeedback(null);
          setChatMessages([]);

          toast({ title: "Import Successful", description: `"${file.name}" loaded. Save to keep changes.` });
        }
      } catch (error) {
        console.error("Error importing design:", error);
        toast({
          title: "Import Failed",
          description: `Could not import design. ${error instanceof Error ? error.message : "Invalid file format."}`,
          variant: "destructive",
        });
      } finally {
        
        if (importFileRef.current) {
          importFileRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
      toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
       if (importFileRef.current) {
          importFileRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };


  if (authLoading && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthSection />;
  }


  return (
    <>
      <AppSidebar
        form={form}
        onSubmit={onSubmitEvaluation}
        isLoadingEvaluation={isLoadingEvaluation}
        aiFeedback={aiFeedback}
        designComponents={designComponents}
        initialTemplates={initialTemplates}
        onDragStart={onDragStart}
        onLoadTemplate={loadTemplate}
        onNewDesignButtonClick={handleNewDesignButtonClick}
      />
      
      <SidebarInset className="p-0 md:p-0 md:m-0 md:rounded-none flex flex-col">
        <TopNavigationBar
          currentDesignName={currentDesignName}
          currentUser={currentUser}
          isSavingDesign={isSavingDesign}
          onMyDesignsClick={() => {
            fetchUserDesigns();
            setIsMyDesignsDialogOpen(true);
            setIsWelcomeBackDialogOpen(false);
          }}
          onSaveDesign={handleSaveDesign}
          canSave={!!currentDesignId && !(currentDesignName || "").endsWith("(Unsaved)")}
          onExportDesign={handleExportDesign}
          onImportDesignClick={() => importFileRef.current?.click()}
          onLogout={handleLogout}
          themes={themeOptions as ThemeOption[]} 
          setTheme={setTheme}
        />
         <input 
            type="file" 
            ref={importFileRef} 
            onChange={handleImportFileChange} 
            accept=".json" 
            className="hidden"
        />


        <ReactFlowProvider>
          <div className="flex flex-1 min-h-0"> 
            <main className="flex-1 overflow-auto p-0 flex flex-col"> 
                <DesignCanvas
                    ref={canvasRef}
                    className="flex-1"
                    onNodeSelect={handleNodeSelect}
                    onStructuralChange={() => {
                        console.log("ArchitechApp: onStructuralChange called from DesignCanvas");
                        handleSetDiagramChanged(true);
                    }}
                />
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

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsChatOpen(prev => !prev)}
        aria-label="Toggle Interview Bot"
      >
        <MessageSquarePlus className="h-7 w-7" />
      </Button>

      <ChatBotWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessageToBot}
        isLoadingAiResponse={isBotLoadingResponse}
      />

      <WelcomeBackDialog
        isOpen={isWelcomeBackDialogOpen || isMyDesignsDialogOpen}
        onClose={() => {
            setIsWelcomeBackDialogOpen(false);
            setIsMyDesignsDialogOpen(false);
            if (!currentDesignId && canvasRef.current && !isMyDesignsDialogOpen) { 
                 canvasRef.current.loadTemplate(createDefaultNotes(), []);
                 setCanvasLoadedDesignId(null);
                 setCurrentDesignId(null);
                 setCurrentDesignName(null);
                 handleSetDiagramChanged(false);
            }
        }}
        dialogType={isMyDesignsDialogOpen ? "myDesigns" : "welcomeBack"}
        designs={userDesigns}
        onLoadDesignClick={(designId, designName) => {
          handleLoadDesign(designId, designName);
          setIsWelcomeBackDialogOpen(false);
          setIsMyDesignsDialogOpen(false);
        }}
        onCreateNewClick={() => {
          setIsWelcomeBackDialogOpen(false);
          setIsMyDesignsDialogOpen(false);
          handleOpenNewDesignDialog(true);
        }}
      />

      {isNewDesignDialogOpen && (
        <Dialog open={isNewDesignDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen && !currentDesignId && currentUser && canvasRef.current) {
                 if(!isWelcomeBackDialogOpen && !isMyDesignsDialogOpen) {
                    canvasRef.current.loadTemplate(createDefaultNotes(), []);
                    setCanvasLoadedDesignId(null);
                    setCurrentDesignId(null);
                    setCurrentDesignName(null);
                    handleSetDiagramChanged(false);
                 }
            }
            if (!isOpen) setNewDesignNameInput('');
            setIsNewDesignDialogOpen(isOpen);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Design</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="newDesignName" className="text-sm font-medium">
                Design Name
              </Label>
              <Input
                id="newDesignName"
                value={newDesignNameInput}
                onChange={(e) => setNewDesignNameInput(e.target.value)}
                placeholder="Enter a name for your system design"
                onKeyDown={(e) => e.key === 'Enter' && newDesignNameInput.trim() && confirmNewDesign()}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={confirmNewDesign} disabled={!newDesignNameInput.trim()}>
                Create Design
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}


export function ArchitechApp() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
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

