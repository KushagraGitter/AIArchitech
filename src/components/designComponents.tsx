
import type { ComponentConfig } from '@/components/properties-panel';
import { 
  StickyNote, Shuffle, Waypoints, Server, Database, Zap, GitFork, Cloud, ShieldCheck, Box, BarChartBig, Users, MessageSquare, Link2, ServerCog, Smartphone, Globe, Network as NetworkIcon, DatabaseZap as DatabaseIcon, Archive as StorageIcon, MessageCircle as MessagingIcon, Shield as SecurityIcon, Activity as MonitoringIcon, Settings2 as ServicesIcon, Users2 as GeneralIcon, Cpu as ComputeIcon, FolderKanban,
  Container, CloudCog, Warehouse, Spline, Fingerprint, ScrollText, Workflow, Wrench, Shapes,
  // New Icons
  GitMerge, Search, Clock, KeyRound, LineChart, BrainCircuit
} from 'lucide-react';

export interface ComponentGroup {
  groupName: string;
  groupIcon: React.ElementType;
  color: string;
  borderColor: string;
  components: ComponentConfig[];
}

const nameProperty = { id: 'name', label: 'Name', type: 'text' as const };

const generalComponents: ComponentConfig[] = [
  {
    name: "Info Note",
    icon: StickyNote,
    iconName: "StickyNote",
    description: "Add notes and requirements.",
    initialProperties: { title: "Note", content: "Enter your text here..." },
    configurableProperties: [
      { id: 'title', label: 'Title', type: 'text' },
      { id: 'content', label: 'Content', type: 'textarea' },
    ]
  },
  {
    name: "Generic Component",
    icon: Shapes,
    iconName: "Shapes",
    description: "A placeholder for any component.",
    initialProperties: { name: "Component" },
    configurableProperties: [ { id: 'name', label: 'Name', type: 'text' } ]
  },
];

const computeComponents: ComponentConfig[] = [
  {
    name: "Web Server",
    icon: Server,
    iconName: "Server",
    description: "Serves static and dynamic web content.",
    initialProperties: { name: "Web Server", instanceType: "t3.medium", scaling: "auto", framework: "Nginx", port: 80 },
    configurableProperties: [
      nameProperty,
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
    description: "Runs application business logic.",
    initialProperties: { name: "App Server", language: "Node.js", framework: "Express", instanceType: "m5.large", scaling: "auto-scaling group", minInstances: 2, maxInstances: 10 },
    configurableProperties: [
      nameProperty,
      { id: 'language', label: 'Language', type: 'select', options: ["Node.js", "Python", "Java", "Go", "Ruby", ".NET", "PHP"] },
      { id: 'framework', label: 'Framework', type: 'text' },
      { id: 'instanceType', label: 'Instance Type', type: 'text' },
      { id: 'scaling', label: 'Scaling Mechanism', type: 'text' },
      { id: 'minInstances', label: 'Min Instances', type: 'number'},
      { id: 'maxInstances', label: 'Max Instances', type: 'number'},
    ]
  },
  {
    name: "Serverless Function",
    icon: CloudCog,
    iconName: "CloudCog",
    description: "Execute code on-demand.",
    initialProperties: { name: "Serverless Function", runtime: "Node.js 18.x", memory: "256MB", timeout: "30s", trigger: "HTTP API" },
    configurableProperties: [
      nameProperty,
      { id: 'runtime', label: 'Runtime', type: 'select', options: ["Node.js 18.x", "Python 3.10", "Java 17", "Go 1.x", "Ruby 3.2", ".NET 6"] },
      { id: 'memory', label: 'Memory (MB)', type: 'text' },
      { id: 'timeout', label: 'Timeout (s)', type: 'text' },
      { id: 'trigger', label: 'Trigger Type', type: 'text' },
    ]
  },
  {
    name: "Container",
    icon: Container,
    iconName: "Container",
    description: "Run applications in isolated environments.",
    initialProperties: { name: "Container", image: "nginx:latest", orchestrator: "Kubernetes", replicas: 3, cpuRequest: "0.5", memoryRequest: "512Mi" },
    configurableProperties: [
      nameProperty,
      { id: 'image', label: 'Image', type: 'text' },
      { id: 'orchestrator', label: 'Orchestrator', type: 'select', options: ["Kubernetes", "Docker Swarm", "ECS", "None"] },
      { id: 'replicas', label: 'Replicas', type: 'number' },
      { id: 'cpuRequest', label: 'CPU Request', type: 'text' },
      { id: 'memoryRequest', label: 'Memory Request', type: 'text' },
    ]
  },
  {
    name: "Batch Job",
    icon: Clock,
    iconName: "Clock",
    description: "Process large volumes of data offline.",
    initialProperties: { name: "Batch Job", framework: "Spring Batch", trigger: "Cron (daily)", compute: "ECS Task", inputSource: "S3 Bucket", outputSink: "Data Warehouse" },
    configurableProperties: [
      nameProperty,
      { id: 'framework', label: 'Framework', type: 'text' },
      { id: 'trigger', label: 'Trigger', type: 'text' },
      { id: 'compute', label: 'Compute Type', type: 'text' },
      { id: 'inputSource', label: 'Input Source', type: 'text' },
      { id: 'outputSink', label: 'Output Sink', type: 'text' }
    ]
  },
  {
    name: "ML Model",
    icon: BrainCircuit,
    iconName: "BrainCircuit",
    description: "Serve machine learning models.",
    initialProperties: { name: "ML Model", type: "Recommendation Engine", framework: "TensorFlow", serving: "Seldon Core", input: "User data", output: "Product list" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Model Type', type: 'text' },
      { id: 'framework', label: 'Framework', type: 'select', options: ["TensorFlow", "PyTorch", "scikit-learn", "Other"] },
      { id: 'serving', label: 'Serving Engine', type: 'text' },
      { id: 'input', label: 'Input Data', type: 'text' },
      { id: 'output', label: 'Output Data', type: 'text' }
    ]
  },
];

const networkingComponents: ComponentConfig[] = [
  {
    name: "Load Balancer",
    icon: Shuffle,
    iconName: "Shuffle",
    description: "Distribute incoming traffic.",
    initialProperties: { name: "Load Balancer", type: "Application LB", algorithm: "Round Robin", instanceCount: 2, healthCheckPath: "/health" },
    configurableProperties: [
      nameProperty,
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
    description: "Single entry point for APIs.",
    initialProperties: { name: "API Gateway", protocol: "HTTPS/REST", authType: "API Key", rateLimit: "1000/s", corsEnabled: true },
    configurableProperties: [
      nameProperty,
      { id: 'protocol', label: 'Protocol', type: 'text' },
      { id: 'authType', label: 'Auth Type', type: 'select', options: ["API Key", "OAuth 2.0", "JWT", "None"] },
      { id: 'rateLimit', label: 'Rate Limit (req/s)', type: 'text' },
      { id: 'corsEnabled', label: 'CORS Enabled', type: 'boolean' },
    ]
  },
  {
    name: "CDN",
    icon: Cloud,
    iconName: "Cloud",
    description: "Cache content closer to users.",
    initialProperties: { name: "CDN", provider: "Cloudflare", edgeLocations: "global", cachingPolicy: "Standard", WAFEnabled: true },
    configurableProperties: [
      nameProperty,
      { id: 'provider', label: 'Provider', type: 'text' },
      { id: 'edgeLocations', label: 'Edge Locations', type: 'text' },
      { id: 'cachingPolicy', label: 'Caching Policy', type: 'text' },
      { id: 'WAFEnabled', label: 'WAF Enabled', type: 'boolean' }
    ]
  },
  {
    name: "Virtual Network",
    icon: NetworkIcon,
    iconName: "Network",
    description: "Isolated network for resources.",
    initialProperties: { name: "Virtual Network", type: "VPC/VNet", cidrBlock: "10.0.0.0/16", subnets: "Public, Private", region: "us-east-1" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Network Type', type: 'select', options: ["VPC (AWS)", "VNet (Azure)", "VPC (GCP)", "Custom"] },
      { id: 'cidrBlock', label: 'CIDR Block', type: 'text' },
      { id: 'subnets', label: 'Subnet Configuration', type: 'textarea' },
      { id: 'region', label: 'Region', type: 'text' },
    ]
  },
  {
    name: "Service Mesh",
    icon: GitMerge,
    iconName: "GitMerge",
    description: "Manage service-to-service communication.",
    initialProperties: { name: "Service Mesh", type: "Istio", trafficManagement: "enabled", security: "mTLS", observability: "enabled" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Type', type: 'select', options: ["Istio", "Linkerd", "Consul Connect", "Custom"] },
      { id: 'trafficManagement', label: 'Traffic Management', type: 'boolean' },
      { id: 'security', label: 'Security (mTLS)', type: 'boolean' },
      { id: 'observability', label: 'Observability', type: 'boolean' }
    ]
  },
];

const databaseComponents: ComponentConfig[] = [
  {
    name: "Database",
    icon: Database,
    iconName: "Database",
    description: "Persistent data storage.",
    initialProperties: {
      name: "Database",
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
      nameProperty,
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
    name: "DB Router/Coordinator",
    icon: ServerCog,
    iconName: "ServerCog",
    description: "Routes queries to database shards.",
    initialProperties: { name: "DB Router/Coordinator", type: "ProxySQL/Vitess", strategy: "Sharding Coordination", connectionPooling: "enabled", queryCaching: "disabled" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Router Type', type: 'text' },
      { id: 'strategy', label: 'Strategy', type: 'text' },
      { id: 'connectionPooling', label: 'Connection Pooling', type: 'boolean' },
      { id: 'queryCaching', label: 'Query Caching', type: 'boolean' }
    ]
  },
  {
    name: "Data Warehouse",
    icon: Warehouse,
    iconName: "Warehouse",
    description: "Storage for business intelligence.",
    initialProperties: { name: "Data Warehouse", type: "Snowflake", nodeType: "Medium", clusterSize: "4 nodes", dataSources: "S3, Kafka", queryLanguage: "SQL" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'DW Type', type: 'select', options: ["Snowflake", "BigQuery", "Redshift", "Azure Synapse", "ClickHouse", "Other"] },
      { id: 'nodeType', label: 'Node Type/Size', type: 'text' },
      { id: 'clusterSize', label: 'Cluster Size/Concurrency', type: 'text' },
      { id: 'dataSources', label: 'Data Sources', type: 'textarea' },
      { id: 'queryLanguage', label: 'Query Language', type: 'text' },
    ]
  },
  {
    name: "Search Engine",
    icon: Search,
    iconName: "Search",
    description: "Powers full-text search.",
    initialProperties: { name: "Search Engine", type: "Elasticsearch", nodes: 3, indexing: "real-time", queryLanguage: "DSL", useCase: "Full-text search" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Engine Type', type: 'select', options: ["Elasticsearch", "OpenSearch", "Algolia", "Meilisearch", "Solr"] },
      { id: 'nodes', label: 'Nodes', type: 'number' },
      { id: 'indexing', label: 'Indexing Strategy', type: 'text' },
      { id: 'queryLanguage', label: 'Query Language', type: 'text' },
      { id: 'useCase', label: 'Primary Use Case', type: 'text' }
    ]
  },
];

const storageComponents: ComponentConfig[] = [
  {
    name: "Storage (S3/Blob)",
    icon: Box,
    iconName: "Box",
    description: "Scalable object storage.",
    initialProperties: { name: "Storage (S3/Blob)", bucketType: "Standard", region: "us-east-1", versioning: "enabled", lifecyclePolicy: "Archive after 90d" },
    configurableProperties: [
      nameProperty,
      { id: 'bucketType', label: 'Bucket Type', type: 'text' },
      { id: 'region', label: 'Region', type: 'text' },
      { id: 'versioning', label: 'Versioning', type: 'boolean' },
      { id: 'lifecyclePolicy', label: 'Lifecycle Policy', type: 'text' }
    ]
  },
  {
    name: "Cache",
    icon: Zap,
    iconName: "Zap",
    description: "High-speed in-memory data store.",
    initialProperties: { name: "Cache", type: "Redis", evictionPolicy: "LRU", pattern: "Cache-Aside", size: "cache.m5.large", persistence: "RDB snapshot" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Cache Type', type: 'select', options: ["Redis", "Memcached", "Hazelcast", "In-Memory", "CDN as Cache"] },
      { id: 'evictionPolicy', label: 'Eviction Policy', type: 'select', options: ["LRU", "LFU", "FIFO", "Random", "No Eviction"] },
      { id: 'pattern', label: 'Caching Pattern', type: 'select', options: ["Cache-Aside", "Read-Through", "Write-Through", "Write-Back", "Write-Around"] },
      { id: 'size', label: 'Instance Size', type: 'text' },
      { id: 'persistence', label: 'Persistence (if applicable)', type: 'text' },
    ]
  },
];

const messagingComponents: ComponentConfig[] = [
  {
    name: "Message Queue",
    icon: GitFork,
    iconName: "GitFork",
    description: "Decouple services with async messages.",
    initialProperties: { name: "Message Queue", type: "RabbitMQ", persistence: "durable", deliveryGuarantee: "at-least-once", consumerGroups: 1, deadLetterQueue: "enabled" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Queue Type', type: 'select', options: ["RabbitMQ", "Kafka", "SQS", "Redis Streams", "NATS", "Google Pub/Sub", "Azure Service Bus"] },
      { id: 'persistence', label: 'Persistence', type: 'select', options: ["durable", "transient", "configurable"] },
      { id: 'deliveryGuarantee', label: 'Delivery Guarantee', type: 'select', options: ["at-least-once", "at-most-once", "exactly-once (if supported)"] },
      { id: 'consumerGroups', label: 'Consumer Groups', type: 'number' },
      { id: 'deadLetterQueue', label: 'Dead Letter Queue', type: 'select', options: ["enabled", "disabled"] },
    ]
  },
  {
    name: "Event Bus",
    icon: Spline,
    iconName: "Spline",
    description: "Receive and route events between services.",
    initialProperties: { name: "Event Bus", type: "AWS EventBridge", schemaRegistry: "enabled", targets: "Lambda, SQS", filtering: "Attribute-based" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Bus Type', type: 'select', options: ["AWS EventBridge", "Azure Event Grid", "Google Cloud Eventarc", "Custom (e.g., Kafka based)", "NATS JetStream"] },
      { id: 'schemaRegistry', label: 'Schema Registry', type: 'select', options: ["enabled", "disabled", "external"] },
      { id: 'targets', label: 'Typical Targets', type: 'textarea' },
      { id: 'filtering', label: 'Filtering Mechanism', type: 'text' },
    ]
  },
];

const securityComponents: ComponentConfig[] = [
  {
    name: "Firewall",
    icon: ShieldCheck,
    iconName: "ShieldCheck",
    description: "Filter and monitor network traffic.",
    initialProperties: { name: "Firewall", type: "WAF", ruleset: "OWASP Top 10", deployment: "Edge", logging: "enabled" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Type', type: 'select', options: ["WAF", "Network Firewall", "NGFW"] },
      { id: 'ruleset', label: 'Ruleset', type: 'text' },
      { id: 'deployment', label: 'Deployment Location', type: 'text' },
      { id: 'logging', label: 'Logging', type: 'select', options: ["enabled", "disabled"] }
    ]
  },
  {
    name: "Identity Provider",
    icon: Fingerprint,
    iconName: "Fingerprint",
    description: "Manage user authentication and identity.",
    initialProperties: { name: "Identity Provider", type: "Keycloak", protocols: "OAuth2, OpenID Connect", userStore: "Internal DB", mfa: "TOTP enabled" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'IdP Type', type: 'select', options: ["Keycloak", "Auth0", "Okta", "AWS Cognito", "Azure AD B2C", "Custom"] },
      { id: 'protocols', label: 'Supported Protocols', type: 'text' },
      { id: 'userStore', label: 'User Store', type: 'text' },
      { id: 'mfa', label: 'MFA Support', type: 'text' },
    ]
  },
  {
    name: "Key/Secret Vault",
    icon: KeyRound,
    iconName: "KeyRound",
    description: "Securely store secrets and keys.",
    initialProperties: { name: "Key/Secret Vault", type: "HashiCorp Vault", storageBackend: "Consul", accessControl: "Policy-based", auditLogging: "enabled" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Vault Type', type: 'select', options: ["HashiCorp Vault", "AWS Secrets Manager", "Azure Key Vault", "GCP Secret Manager"] },
      { id: 'storageBackend', label: 'Storage Backend', type: 'text' },
      { id: 'accessControl', label: 'Access Control', type: 'text' },
      { id: 'auditLogging', label: 'Audit Logging', type: 'boolean' }
    ]
  },
];

const monitoringComponents: ComponentConfig[] = [
  {
    name: "Monitoring",
    icon: BarChartBig,
    iconName: "BarChartBig",
    description: "Collect and analyze system metrics.",
    initialProperties: { name: "Monitoring", tool: "Prometheus/Grafana", metrics: "Latency, Error Rate, Traffic, Saturation", alerting: "PagerDuty", dashboarding: "Grafana" },
    configurableProperties: [
      nameProperty,
      { id: 'tool', label: 'Tool', type: 'text' },
      { id: 'metrics', label: 'Key Metrics Monitored', type: 'text' },
      { id: 'alerting', label: 'Alerting System', type: 'text' },
      { id: 'dashboarding', label: 'Dashboarding Tool', type: 'text' }
    ]
  },
  {
    name: "Logging System",
    icon: ScrollText,
    iconName: "ScrollText",
    description: "Aggregate and manage system logs.",
    initialProperties: { name: "Logging System", type: "ELK Stack", ingestion: "Filebeat/Logstash", storage: "Elasticsearch", visualization: "Kibana", retention: "30 days" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'System Type', type: 'select', options: ["ELK Stack", "Splunk", "Grafana Loki", "CloudWatch Logs", "Google Cloud Logging", "Datadog Logs"] },
      { id: 'ingestion', label: 'Ingestion Method', type: 'text' },
      { id: 'storage', label: 'Storage Backend', type: 'text' },
      { id: 'visualization', label: 'Visualization Tool', type: 'text' },
      { id: 'retention', label: 'Log Retention Period', type: 'text' },
    ]
  },
  {
    name: "Analytics Service",
    icon: LineChart,
    iconName: "LineChart",
    description: "Track and analyze user behavior.",
    initialProperties: { name: "Analytics Service", type: "Mixpanel", dataTracked: "User events, funnels", integration: "SDK/API", processing: "Real-time" },
    configurableProperties: [
      nameProperty,
      { id: 'type', label: 'Service Type', type: 'select', options: ["Mixpanel", "Amplitude", "Google Analytics", "Custom (e.g., Snowplow)"] },
      { id: 'dataTracked', label: 'Data Tracked', type: 'textarea' },
      { id: 'integration', label: 'Integration Method', type: 'text' },
      { id: 'processing', label: 'Processing Type', type: 'text' }
    ]
  },
];

const serviceComponents: ComponentConfig[] = [
  {
    name: "User Service",
    icon: Users,
    iconName: "Users",
    description: "Handles user accounts and profiles.",
    initialProperties: { name: "User Service", language: "Go", responsibilities: "User accounts, auth, profiles", dbUsed: "User DB (Postgres)", apiType: "REST/gRPC" },
    configurableProperties: [
      nameProperty,
      { id: 'language', label: 'Language', type: 'text' },
      { id: 'responsibilities', label: 'Responsibilities', type: 'text' },
      { id: 'dbUsed', label: 'Primary Database', type: 'text' },
      { id: 'apiType', label: 'API Type', type: 'text' }
    ]
  },
  {
    name: "Chat Service",
    icon: MessageSquare,
    iconName: "MessageSquare",
    description: "Powers real-time chat features.",
    initialProperties: { name: "Chat Service", language: "Java/Kotlin", features: "Message delivery, history, presence, typing indicators", transport: "WebSockets", scalability: "Horizontally scalable" },
    configurableProperties: [
      nameProperty,
      { id: 'language', label: 'Language', type: 'text' },
      { id: 'features', label: 'Features', type: 'text' },
      { id: 'transport', label: 'Transport Protocol', type: 'text' },
      { id: 'scalability', label: 'Scalability Notes', type: 'text' }
    ]
  },
  {
    name: "URL Shortener Service",
    icon: Link2,
    iconName: "Link2",
    description: "Creates short links from long URLs.",
    initialProperties: { name: "URL Shortener Service", language: "Python", db: "Key-Value Store (e.g. Redis)", algorithm: "Base62 Encoding + Collision Resolution", readHeavy: true },
    configurableProperties: [
      nameProperty,
      { id: 'language', label: 'Language', type: 'text' },
      { id: 'db', label: 'Primary DB', type: 'text' },
      { id: 'algorithm', label: 'Shortening Algorithm', type: 'text' },
      { id: 'readHeavy', label: 'Read Heavy Workload', type: 'boolean' }
    ]
  },
];

const clientExternalComponents: ComponentConfig[] = [
    {
      name: "Client Device",
      icon: Smartphone,
      iconName: "Smartphone",
      description: "User's device (browser/mobile).",
      initialProperties: { name: "Client Device", type: "Mobile/Web Browser", platform: "iOS/Android/Web", connectionType: "WiFi/Cellular" },
      configurableProperties: [
        nameProperty,
        { id: 'type', label: 'Client Type', type: 'text' },
        { id: 'platform', label: 'Platform', type: 'text' },
        { id: 'connectionType', label: 'Connection Type', type: 'text' }
      ]
    },
    {
      name: "External API",
      icon: Globe,
      iconName: "Globe",
      description: "Third-party service integration.",
      initialProperties: { name: "External API", serviceName: "Payment Gateway", purpose: "Processes payments", integration: "Webhook/SDK", reliability: "High (SLA based)" },
      configurableProperties: [
        nameProperty,
        { id: 'serviceName', label: 'Service Name', type: 'text' },
        { id: 'purpose', label: 'Purpose', type: 'text' },
        { id: 'integration', label: 'Integration Method', type: 'text' },
        { id: 'reliability', label: 'Reliability Notes', type: 'text' }
      ]
    },
];

const devOpsComponents: ComponentConfig[] = [
  {
    name: "CI/CD Pipeline",
    icon: Workflow,
    iconName: "Workflow",
    description: "Automates software delivery.",
    initialProperties: { name: "CI/CD Pipeline", tool: "Jenkins", stages: "Build, Test, Deploy", trigger: "Git push", repository: "GitHub" },
    configurableProperties: [
      nameProperty,
      { id: 'tool', label: 'CI/CD Tool', type: 'select', options: ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Azure DevOps", "Google Cloud Build"] },
      { id: 'stages', label: 'Pipeline Stages', type: 'textarea' },
      { id: 'trigger', label: 'Trigger Mechanism', type: 'text' },
      { id: 'repository', label: 'Source Repository', type: 'text' },
    ]
  },
];


export const groupedDesignComponents: ComponentGroup[] = [
  { groupName: "General", groupIcon: GeneralIcon, color: "text-slate-500", borderColor: "border-slate-500", components: generalComponents },
  { groupName: "Compute", groupIcon: ComputeIcon, color: "text-sky-500", borderColor: "border-sky-500", components: computeComponents },
  { groupName: "Networking", groupIcon: NetworkIcon, color: "text-amber-500", borderColor: "border-amber-500", components: networkingComponents },
  { groupName: "Databases", groupIcon: DatabaseIcon, color: "text-violet-500", borderColor: "border-violet-500", components: databaseComponents },
  { groupName: "Storage & Caching", groupIcon: StorageIcon, color: "text-rose-500", borderColor: "border-rose-500", components: storageComponents },
  { groupName: "Messaging", groupIcon: MessagingIcon, color: "text-teal-500", borderColor: "border-teal-500", components: messagingComponents },
  { groupName: "Security", groupIcon: SecurityIcon, color: "text-red-500", borderColor: "border-red-500", components: securityComponents },
  { groupName: "Monitoring", groupIcon: MonitoringIcon, color: "text-green-500", borderColor: "border-green-500", components: monitoringComponents },
  { groupName: "Application Services", groupIcon: ServicesIcon, color: "text-indigo-500", borderColor: "border-indigo-500", components: serviceComponents },
  { groupName: "DevOps", groupIcon: Wrench, color: "text-gray-500", borderColor: "border-gray-500", components: devOpsComponents },
  { groupName: "Client & External", groupIcon: FolderKanban, color: "text-orange-500", borderColor: "border-orange-500", components: clientExternalComponents },
];

export const designComponents: ComponentConfig[] = groupedDesignComponents.flatMap(group => group.components);
