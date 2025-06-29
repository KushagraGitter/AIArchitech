import type { Node, Edge } from 'reactflow';
import {type NodeData } from '@/components/design-canvas';
import { designComponents } from './designComponents';

export interface Template {
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  iconName: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
}


export const initialTemplates: Template[] = [
    {
      name: "Basic Web Service",
      description: "A fundamental setup showing a load balancer distributing traffic to a web server connected to a database.",
      level: "Beginner",
      tags: ["Web", "Core", "Database"],
      iconName: "Server",
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
      description: "A read-heavy API architecture using a primary database with a read replica to handle scalable workloads.",
      level: "Intermediate",
      tags: ["API", "Scalability", "Database"],
      iconName: "Waypoints",
      nodes: [
          { id: 'sa_req_1', type: 'custom', position: { x: -100, y: -50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Feature Requirements', content: 'Design a scalable API for a social media application. Focus on read-heavy workloads for user timelines.'} } },
          { id: 'sa_bote_1', type: 'custom', position: { x: 300, y: -50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'BOTE Calculations', content: '1M DAU\n100 reads/user/day\n10 writes/user/day\nRead QPS: ~1k (avg), ~10k (peak)\nWrite QPS: ~100 (avg), ~1k (peak)'} } },
          { id: 'sa_apigw_1', type: 'custom', position: { x: 100, y: 50 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
          { id: 'sa_app_1', type: 'custom', position: { x: 0, y: 200 }, data: { label: 'App Server', iconName: 'ServerCog', properties: designComponents.find(c => c.name === "App Server")?.initialProperties || {} } },
          { id: 'sa_app_2', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'App Server', iconName: 'ServerCog', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), name: 'App Server'} } },
          { id: 'sa_db_primary_1', type: 'custom', position: { x: 0, y: 350 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'Database (Primary)', role: 'primary'} } },
          { id: 'sa_db_replica_1', type: 'custom', position: { x: 200, y: 350 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'Database (Replica)', role: 'replica-read', replicationSourceId: 'sa_db_primary_1'} } },
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
      description: "A complete real-time chat system using WebSockets, microservices, and a presence cache for scalability.",
      level: "Advanced",
      tags: ["Real-time", "Microservices", "WebSockets"],
      iconName: "MessageSquare",
      nodes: [
        { id: 'chat_req_1', type: 'custom', position: { x: -150, y: 0 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Feature Requirements', content: 'Design a chat application supporting 1-1 and group chats, message history, presence, typing indicators. Scalability: 1M concurrent users.'} } },
        { id: 'chat_client_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Client Device', iconName: 'Smartphone', properties: designComponents.find(c => c.name === "Client Device")?.initialProperties || {} } },
        { id: 'chat_lb_1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Load Balancer', iconName: 'Shuffle', properties: {...(designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {}), name: 'Load Balancer (API)'} } },
        { id: 'chat_apigw_1', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: designComponents.find(c => c.name === "API Gateway")?.initialProperties || {} } },
        { id: 'chat_usersvc_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'User Service', iconName: 'Users', properties: designComponents.find(c => c.name === "User Service")?.initialProperties || {} } },
        { id: 'chat_chatsvc_1', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'Chat Service', iconName: 'MessageSquare', properties: designComponents.find(c => c.name === "Chat Service")?.initialProperties || {} } },
        { id: 'chat_ws_lb_1', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Load Balancer', iconName: 'Shuffle', properties: {...(designComponents.find(c => c.name === "Load Balancer")?.initialProperties || {}), name: 'Load Balancer (WS)', type: "Network LB"} } },
        { id: 'chat_ws_server_1', type: 'custom', position: { x: 450, y: 350 }, data: { label: 'App Server', iconName: 'ServerCog', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), name: "WebSocket Server", framework: "Socket.IO/SignalR"} } },
        { id: 'chat_msgdb_1', type: 'custom', position: { x: 650, y: 200 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'Message Database', type: "Cassandra", consistency: "Eventual", custom: {purpose: "Stores chat messages, read-heavy for history"}} } },
        { id: 'chat_userdb_1', type: 'custom', position: { x: 650, y: -50 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'User Database', type: "PostgreSQL", role: "primary", custom: {purpose: "User accounts, profiles, contacts"}} } },
        { id: 'chat_cache_1', type: 'custom', position: { x: 650, y: 350 }, data: { label: 'Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), name: 'Presence Cache', type: "Redis", custom: {use: "User presence, Session data, Typing indicators"}} } },
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
      description: "A classic TinyURL design focused on high-availability and low-latency reads using a Key-Value store and cache.",
      level: "Intermediate",
      tags: ["Core", "Caching", "Key-Value"],
      iconName: "Link2",
      nodes: [
        { id: 'tiny_req_1', type: 'custom', position: { x: -150, y: 50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Feature Requirements', content: 'Design a TinyURL-like service. Requirements: Shorten URL, Redirect to original URL, High availability, Low latency reads. Custom short links (optional). Analytics (optional).'} } },
        { id: 'tiny_client_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Client Device', iconName: 'Smartphone', properties: designComponents.find(c => c.name === "Client Device")?.initialProperties || {} } },
        { id: 'tiny_apigw_1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: {...(designComponents.find(c => c.name === "API Gateway")?.initialProperties || {}), rateLimit: "High for reads, Moderate for writes"} } },
        { id: 'tiny_urlsvc_1', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'URL Shortener Service', iconName: 'Link2', properties: designComponents.find(c => c.name === "URL Shortener Service")?.initialProperties || {} } },
        { id: 'tiny_kvdb_1', type: 'custom', position: { x: 650, y: 150 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'Key-Value Database', type: "Redis (as DB)", role: "standalone", consistency: "Eventual (acceptable for counters)", custom: {purpose: "Stores short_url -> long_url mapping"} } } },
        { id: 'tiny_cache_1', type: 'custom', position: { x: 450, y: 300 }, data: { label: 'Cache', iconName: 'Zap', properties: {...(designComponents.find(c => c.name === "Cache")?.initialProperties || {}), name: 'Hot URL Cache', type: "Redis", pattern: "Cache-Aside"} } },
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
      description: "Demonstrates database sharding for extreme scalability using a router/coordinator to direct traffic to appropriate shards.",
      level: "Advanced",
      tags: ["Database", "Sharding", "Scalability"],
      iconName: "GitMerge",
      nodes: [
        { id: 'shard_req_1', type: 'custom', position: { x: -150, y: 100 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Scenario', content: 'Design the database sharding for a system with a very large number of users (e.g., 1 billion users), where user data needs to be partitioned.'} } },
        { id: 'shard_app_1', type: 'custom', position: { x: 50, y: 200 }, data: { label: 'App Server', iconName: 'ServerCog', properties: designComponents.find(c => c.name === "App Server")?.initialProperties || {} } },
        { id: 'shard_router_1', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'DB Router/Coordinator', iconName: 'ServerCog', properties: designComponents.find(c => c.name === "DB Router/Coordinator")?.initialProperties || {} } },
        { id: 'shard_db1_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'DB Shard 1', role: "shard-primary", shardingStrategy: "hash-based", shardKey: "user_id", type: "MySQL", custom: {shard_info: "Shard 1 (e.g., UserIDs ending 0-4)"}} } },
        { id: 'shard_db2_1', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'DB Shard 2', role: "shard-primary", shardingStrategy: "hash-based", shardKey: "user_id", type: "MySQL", custom: {shard_info: "Shard 2 (e.g., UserIDs ending 5-9)"}} } },
        { id: 'shard_db3_1', type: 'custom', position: { x: 450, y: 350 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'DB Shard 3 (Replica)', role: "shard-replica", shardingStrategy: "hash-based", shardKey: "user_id", type: "MySQL", replicationSourceId: "shard_db1_1", custom: {shard_info: "Replica for Shard 1"}} } },
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
      description: "A producer/consumer pattern for asynchronous processing using a message queue to decouple services.",
      level: "Intermediate",
      tags: ["Messaging", "Decoupling", "Async"],
      iconName: "GitFork",
      nodes: [
        { id: 'mq_req_1', type: 'custom', position: { x: -150, y: 50 }, data: { label: 'Info Note', iconName: 'StickyNote', properties: { title: 'Scenario', content: 'Design a system for asynchronous order processing. When an order is placed, events need to be reliably sent to notification and inventory services.'} } },
        { id: 'mq_producer_1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'App Server', iconName: 'Server', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), name: 'Producer Service', custom: {task: "Order Processing", event_type: "OrderCreatedEvent"}} } },
        { id: 'mq_queue_1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Message Queue', iconName: 'GitFork', properties: designComponents.find(c => c.name === "Message Queue")?.initialProperties || {} } },
        { id: 'mq_consumer1_1', type: 'custom', position: { x: 450, y: 50 }, data: { label: 'App Server', iconName: 'ServerCog', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), name: 'Consumer (Notifications)', custom: {task: "Notification Sending", processing_logic: "Send email/SMS"}} } },
        { id: 'mq_consumer2_1', type: 'custom', position: { x: 450, y: 250 }, data: { label: 'App Server', iconName: 'ServerCog', properties: {...(designComponents.find(c => c.name === "App Server")?.initialProperties || {}), name: 'Consumer (Inventory)', custom: {task: "Inventory Update", processing_logic: "Decrement stock count"}} } },
        { id: 'mq_db_notify_1', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'Notification Log DB', type: "MongoDB", custom: {use: "Notification Logs", access_pattern: "Write-heavy, append-only"}} } },
        { id: 'mq_db_inventory_1', type: 'custom', position: { x: 650, y: 250 }, data: { label: 'Database', iconName: 'Database', properties: {...(designComponents.find(c => c.name === "Database")?.initialProperties || {}), name: 'Inventory DB', type: "MySQL", custom: {use: "Product Inventory", access_pattern: "Transactional updates"}} } },
      ],
      edges: [
        { id: 'mq_e_producer_queue', source: 'mq_producer_1', target: 'mq_queue_1', label: 'Publishes Message', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'mq_e_queue_consumer1', source: 'mq_queue_1', target: 'mq_consumer1_1', label: 'Consumes Message', animated: true, style: { stroke: 'hsl(var(--accent))' } },
        { id: 'mq_e_queue_consumer2', source: 'mq_queue_1', target: 'mq_consumer2_1', label: 'Consumes Message', animated: true, style: { stroke: 'hsl(var(--accent))' } },
        { id: 'mq_e_consumer1_db', source: 'mq_consumer1_1', target: 'mq_db_notify_1', label: 'Writes Log', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'mq_e_consumer2_db', source: 'mq_consumer2_1', target: 'mq_db_inventory_1', label: 'Updates Inventory', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      ],
    }
  ];
  
