"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import { DesignCanvas, type DesignCanvasHandles, type NodeData } from './design-canvas';
import { PropertiesPanel, type ComponentConfig } from './properties-panel';
import { ChatBotWindow, type ChatMessage } from './chat-bot-window';
import { WelcomeBackDialog } from './welcome-back-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Logo } from './logo';
import { ThemeToggleButton } from './theme-toggle-button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  MessageSquare, 
  Sparkles, 
  FileText, 
  Plus, 
  Trash2, 
  Copy,
  Share2,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Zap,
  Target,
  BarChart3,
  Shield,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  TrendingUp,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Grid,
  Layers,
  Search,
  Filter,
  BookOpen,
  HelpCircle,
  Star,
  History,
  Palette,
  Cpu,
  Database,
  Server,
  Cloud,
  Network,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  HardDrive,
  MemoryStick,
  Router,
  Shield as ShieldIcon,
  Gauge,
  Activity,
  BarChart,
  PieChart,
  TrendingDown,
  Workflow,
  GitBranch,
  Code,
  Terminal,
  Package,
  Layers3,
  Boxes,
  Container,
  Webhook,
  Rss,
  Mail,
  Bell,
  Calendar,
  Clock3,
  Timer,
  Stopwatch,
  PlayCircle,
  PauseCircle,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Image,
  FileImage,
  FileVideo,
  FileAudio,
  Music,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Gamepad2,
  Joystick,
  Dices,
  Puzzle,
  Trophy,
  Award,
  Medal,
  Gift,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Cry,
  Surprised,
  Confused,
  Sleepy,
  Dizzy,
  Sick,
  Injured,
  Dead,
  Ghost,
  Alien,
  Robot,
  Skull,
  Bone,
  Brain,
  Dna,
  Microscope,
  TestTube,
  Beaker,
  Flask,
  Atom,
  Molecule,
  Magnet,
  Zap as ZapIcon,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Star as StarIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Tornado,
  Rainbow,
  Umbrella,
  Thermometer,
  Wind,
  Waves,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Seedling,
  Cactus,
  PalmTree,
  Evergreen,
  Deciduous,
  Mushroom,
  Grass,
  Wheat,
  Corn,
  Apple,
  Orange,
  Banana,
  Grape,
  Cherry,
  Strawberry,
  Watermelon,
  Pineapple,
  Coconut,
  Avocado,
  Eggplant,
  Carrot,
  Potato,
  Onion,
  Garlic,
  Pepper,
  Tomato,
  Cucumber,
  Lettuce,
  Broccoli,
  Cauliflower,
  Cabbage,
  Spinach,
  Kale,
  Celery,
  Asparagus,
  Artichoke,
  Beet,
  Radish,
  Turnip,
  Parsnip,
  Sweet,
  Bitter,
  Sour,
  Salty,
  Spicy,
  Hot,
  Cold,
  Warm,
  Cool,
  Dry,
  Wet,
  Smooth,
  Rough,
  Soft,
  Hard,
  Sharp,
  Dull,
  Bright,
  Dark,
  Light,
  Heavy,
  Fast,
  Slow,
  Big,
  Small,
  Tall,
  Short,
  Wide,
  Narrow,
  Thick,
  Thin,
  Long,
  Round,
  Square,
  Triangle,
  Circle,
  Rectangle,
  Oval,
  Diamond,
  Hexagon,
  Pentagon,
  Octagon,
  Cylinder,
  Sphere,
  Cube,
  Pyramid,
  Cone,
  Prism,
  Torus,
  Helix,
  Spiral,
  Curve,
  Line,
  Point,
  Angle,
  Arc,
  Chord,
  Radius,
  Diameter,
  Circumference,
  Perimeter,
  Area,
  Volume,
  Mass,
  Weight,
  Density,
  Pressure,
  Temperature,
  Speed,
  Velocity,
  Acceleration,
  Force,
  Energy,
  Power,
  Frequency,
  Wavelength,
  Amplitude,
  Phase,
  Resonance,
  Vibration,
  Oscillation,
  Rotation,
  Revolution,
  Translation,
  Reflection,
  Refraction,
  Diffraction,
  Interference,
  Polarization,
  Absorption,
  Emission,
  Transmission,
  Scattering,
  Dispersion,
  Coherence,
  Incoherence,
  Constructive,
  Destructive,
  Positive,
  Negative,
  Neutral,
  Charged,
  Electric,
  Magnetic,
  Electromagnetic,
  Gravitational,
  Nuclear,
  Atomic,
  Molecular,
  Chemical,
  Physical,
  Biological,
  Mechanical,
  Thermal,
  Optical,
  Acoustic,
  Digital,
  Analog,
  Binary,
  Decimal,
  Hexadecimal,
  Octal,
  Boolean,
  Integer,
  Float,
  Double,
  String,
  Character,
  Array,
  List,
  Stack,
  Queue,
  Tree as TreeIcon,
  Graph,
  Node as NodeIcon,
  Edge as EdgeIcon,
  Vertex,
  Path,
  Cycle,
  Loop,
  Branch,
  Leaf as LeafIcon,
  Root,
  Parent,
  Child,
  Sibling,
  Ancestor,
  Descendant,
  Generation,
  Level,
  Depth,
  Height,
  Width as WidthIcon,
  Length,
  Distance,
  Time,
  Space,
  Dimension,
  Coordinate,
  Vector,
  Matrix,
  Tensor,
  Scalar,
  Function,
  Variable,
  Constant,
  Parameter,
  Argument,
  Return,
  Input,
  Output,
  Process,
  Algorithm,
  Data,
  Information,
  Knowledge,
  Wisdom,
  Intelligence,
  Learning,
  Memory,
  Storage,
  Retrieval,
  Search as SearchIcon,
  Sort,
  Filter as FilterIcon,
  Map,
  Reduce,
  Transform,
  Convert,
  Parse,
  Compile,
  Execute,
  Debug,
  Test,
  Validate,
  Verify,
  Authenticate,
  Authorize,
  Encrypt,
  Decrypt,
  Hash,
  Sign,
  Verify as VerifyIcon,
  Compress,
  Decompress,
  Encode,
  Decode,
  Serialize,
  Deserialize,
  Marshal,
  Unmarshal,
  Pack,
  Unpack,
  Zip,
  Unzip,
  Tar,
  Untar,
  Backup,
  Restore,
  Sync,
  Async,
  Parallel,
  Sequential,
  Concurrent,
  Distributed,
  Centralized,
  Decentralized,
  Federated,
  Clustered,
  Sharded,
  Replicated,
  Mirrored,
  Cached,
  Buffered,
  Queued,
  Streamed,
  Batched,
  Pipelined,
  Chained,
  Linked,
  Connected,
  Disconnected,
  Online,
  Offline,
  Local,
  Remote,
  Public,
  Private,
  Protected,
  Internal,
  External,
  Frontend,
  Backend,
  Fullstack,
  Client,
  Server as ServerIcon,
  Proxy,
  Gateway,
  Router as RouterIcon,
  Switch,
  Hub,
  Bridge,
  Firewall,
  LoadBalancer,
  CDN,
  DNS,
  DHCP,
  NAT,
  VPN,
  SSL,
  TLS,
  HTTP,
  HTTPS,
  FTP,
  SFTP,
  SSH,
  Telnet,
  SMTP,
  POP3,
  IMAP,
  TCP,
  UDP,
  IP,
  IPv4,
  IPv6,
  MAC,
  ARP,
  ICMP,
  SNMP,
  NTP,
  LDAP,
  Kerberos,
  OAuth,
  SAML,
  JWT,
  API,
  REST,
  GraphQL,
  SOAP,
  RPC,
  gRPC,
  WebSocket,
  EventSource,
  Webhook as WebhookIcon,
  Polling,
  LongPolling,
  ServerSentEvents,
  WebRTC,
  P2P,
  Mesh,
  Star as StarTopology,
  Ring,
  Bus,
  Hybrid,
  Topology,
  Protocol,
  Standard,
  Specification,
  RFC,
  ISO,
  IEEE,
  W3C,
  IETF,
  ANSI,
  Unicode,
  ASCII,
  UTF8,
  UTF16,
  UTF32,
  Base64,
  URL,
  URI,
  URN,
  UUID,
  GUID,
  Hash as HashIcon,
  MD5,
  SHA1,
  SHA256,
  SHA512,
  CRC,
  Checksum,
  Signature,
  Certificate,
  Key,
  PublicKey,
  PrivateKey,
  Symmetric,
  Asymmetric,
  RSA,
  AES,
  DES,
  Blowfish,
  Twofish,
  Serpent,
  ChaCha20,
  Salsa20,
  RC4,
  RC5,
  RC6,
  IDEA,
  CAST,
  Skipjack,
  TEA,
  XTEA,
  XXTEA,
  Camellia,
  SEED,
  ARIA,
  LEA,
  SIMON,
  SPECK,
  Threefish,
  Skein,
  BLAKE,
  BLAKE2,
  BLAKE3,
  Whirlpool,
  Tiger,
  RIPEMD,
  GOST,
  Streebog,
  Keccak,
  SHA3,
  SHAKE,
  cSHAKE,
  KMAC,
  TupleHash,
  ParallelHash,
  Kangaroo,
  Argon2,
  scrypt,
  bcrypt,
  PBKDF2,
  HKDF,
  X963KDF,
  ConcatKDF,
  ANSI_X963_KDF,
  SP800_108_KDF,
  SP800_56A_KDF,
  SP800_56C_KDF,
  TLS_KDF,
  SSH_KDF,
  IKE_KDF,
  SRTP_KDF,
  ZRTP_KDF,
  EAP_KDF,
  GSS_KDF,
  Kerberos_KDF,
  LDAP_KDF,
  RADIUS_KDF,
  TACACS_KDF,
  SNMP_KDF,
  NTP_KDF,
  DNS_KDF,
  DHCP_KDF,
  HTTP_KDF,
  HTTPS_KDF,
  FTP_KDF,
  SFTP_KDF,
  SSH_KDF as SSH_KDF_Icon,
  Telnet_KDF,
  SMTP_KDF,
  POP3_KDF,
  IMAP_KDF,
  TCP_KDF,
  UDP_KDF,
  IP_KDF,
  IPv4_KDF,
  IPv6_KDF,
  MAC_KDF,
  ARP_KDF,
  ICMP_KDF,
  SNMP_KDF as SNMP_KDF_Icon,
  NTP_KDF as NTP_KDF_Icon,
  LDAP_KDF as LDAP_KDF_Icon,
  Kerberos_KDF as Kerberos_KDF_Icon,
  OAuth_KDF,
  SAML_KDF,
  JWT_KDF,
  API_KDF,
  REST_KDF,
  GraphQL_KDF,
  SOAP_KDF,
  RPC_KDF,
  gRPC_KDF,
  WebSocket_KDF,
  EventSource_KDF,
  Webhook_KDF,
  Polling_KDF,
  LongPolling_KDF,
  ServerSentEvents_KDF,
  WebRTC_KDF,
  P2P_KDF,
  Mesh_KDF,
  Star_KDF,
  Ring_KDF,
  Bus_KDF,
  Hybrid_KDF,
  Topology_KDF,
  Protocol_KDF,
  Standard_KDF,
  Specification_KDF,
  RFC_KDF,
  ISO_KDF,
  IEEE_KDF,
  W3C_KDF,
  IETF_KDF,
  ANSI_KDF,
  Unicode_KDF,
  ASCII_KDF,
  UTF8_KDF,
  UTF16_KDF,
  UTF32_KDF,
  Base64_KDF,
  URL_KDF,
  URI_KDF,
  URN_KDF,
  UUID_KDF,
  GUID_KDF
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Firebase imports
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  type DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// AI flow imports
import { evaluateSystemDesign, type EvaluateSystemDesignInput, type EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { interviewBot, type InterviewBotInput, type InterviewBotOutput } from '@/ai/flows/interview-bot-flow';

// Enhanced component configurations with more detailed properties
const componentConfigs: ComponentConfig[] = [
  // Compute Components
  {
    name: 'Web Server',
    icon: Server,
    iconName: 'Server',
    initialProperties: { 
      instanceType: 't3.medium',
      capacity: '100 concurrent users',
      framework: 'Node.js',
      port: '3000',
      ssl: 'enabled'
    },
    configurableProperties: [
      { id: 'instanceType', label: 'Instance Type', type: 'select', options: ['t3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge', 't3.2xlarge'] },
      { id: 'capacity', label: 'Capacity', type: 'text' },
      { id: 'framework', label: 'Framework', type: 'select', options: ['Node.js', 'Python/Django', 'Java/Spring', 'Go', 'Ruby on Rails', '.NET Core'] },
      { id: 'port', label: 'Port', type: 'text' },
      { id: 'ssl', label: 'SSL/TLS', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'healthCheck', label: 'Health Check Endpoint', type: 'text' },
      { id: 'logging', label: 'Logging Level', type: 'select', options: ['debug', 'info', 'warn', 'error'] }
    ]
  },
  {
    name: 'Application Server',
    icon: Cpu,
    iconName: 'Cpu',
    initialProperties: { 
      instanceType: 'm5.large',
      runtime: 'Java 17',
      memory: '8GB',
      cpu: '4 vCPUs'
    },
    configurableProperties: [
      { id: 'instanceType', label: 'Instance Type', type: 'select', options: ['m5.large', 'm5.xlarge', 'm5.2xlarge', 'm5.4xlarge', 'c5.large', 'c5.xlarge'] },
      { id: 'runtime', label: 'Runtime', type: 'select', options: ['Java 8', 'Java 11', 'Java 17', 'Java 21', 'Python 3.9', 'Python 3.10', 'Python 3.11', 'Node.js 18', 'Node.js 20'] },
      { id: 'memory', label: 'Memory', type: 'text' },
      { id: 'cpu', label: 'CPU', type: 'text' },
      { id: 'jvmOptions', label: 'JVM Options', type: 'text' },
      { id: 'threadPool', label: 'Thread Pool Size', type: 'text' }
    ]
  },
  {
    name: 'Microservice',
    icon: Boxes,
    iconName: 'Boxes',
    initialProperties: { 
      language: 'Go',
      containerized: 'Docker',
      replicas: '3',
      resources: '500m CPU, 512Mi RAM'
    },
    configurableProperties: [
      { id: 'language', label: 'Programming Language', type: 'select', options: ['Go', 'Java', 'Python', 'Node.js', 'Rust', 'C#', 'Kotlin'] },
      { id: 'containerized', label: 'Container Runtime', type: 'select', options: ['Docker', 'Podman', 'containerd'] },
      { id: 'replicas', label: 'Replica Count', type: 'text' },
      { id: 'resources', label: 'Resource Limits', type: 'text' },
      { id: 'servicePort', label: 'Service Port', type: 'text' },
      { id: 'healthCheck', label: 'Health Check Path', type: 'text' }
    ]
  },
  {
    name: 'Container',
    icon: Container,
    iconName: 'Container',
    initialProperties: { 
      image: 'nginx:latest',
      ports: '80:8080',
      volumes: '/data:/app/data',
      environment: 'production'
    },
    configurableProperties: [
      { id: 'image', label: 'Container Image', type: 'text' },
      { id: 'ports', label: 'Port Mapping', type: 'text' },
      { id: 'volumes', label: 'Volume Mounts', type: 'text' },
      { id: 'environment', label: 'Environment', type: 'select', options: ['development', 'staging', 'production'] },
      { id: 'restart', label: 'Restart Policy', type: 'select', options: ['no', 'always', 'unless-stopped', 'on-failure'] },
      { id: 'network', label: 'Network Mode', type: 'select', options: ['bridge', 'host', 'none', 'custom'] }
    ]
  },
  {
    name: 'Serverless Function',
    icon: Zap,
    iconName: 'Zap',
    initialProperties: { 
      runtime: 'nodejs18.x',
      memory: '256MB',
      timeout: '30s',
      trigger: 'HTTP'
    },
    configurableProperties: [
      { id: 'runtime', label: 'Runtime', type: 'select', options: ['nodejs18.x', 'nodejs20.x', 'python3.9', 'python3.10', 'python3.11', 'java11', 'java17', 'go1.x', 'dotnet6'] },
      { id: 'memory', label: 'Memory', type: 'select', options: ['128MB', '256MB', '512MB', '1024MB', '2048MB', '3008MB'] },
      { id: 'timeout', label: 'Timeout', type: 'text' },
      { id: 'trigger', label: 'Trigger Type', type: 'select', options: ['HTTP', 'S3', 'DynamoDB', 'SQS', 'SNS', 'CloudWatch', 'EventBridge'] },
      { id: 'concurrency', label: 'Concurrency Limit', type: 'text' },
      { id: 'environment', label: 'Environment Variables', type: 'textarea' }
    ]
  },

  // Database Components
  {
    name: 'Database',
    icon: Database,
    iconName: 'Database',
    initialProperties: { 
      type: 'PostgreSQL',
      version: '15.0',
      instanceClass: 'db.t3.medium',
      storage: '100GB',
      role: 'primary'
    },
    configurableProperties: [
      { id: 'type', label: 'Database Type', type: 'select', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Oracle', 'SQL Server'] },
      { id: 'version', label: 'Version', type: 'text' },
      { id: 'instanceClass', label: 'Instance Class', type: 'select', options: ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.t3.large', 'db.r5.large', 'db.r5.xlarge'] },
      { id: 'storage', label: 'Storage Size', type: 'text' },
      { id: 'role', label: 'Role', type: 'select', options: ['primary', 'replica-read', 'replica-failover', 'standby'] },
      { id: 'backupRetention', label: 'Backup Retention (days)', type: 'text' },
      { id: 'multiAZ', label: 'Multi-AZ', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'encryption', label: 'Encryption at Rest', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'Cache',
    icon: MemoryStick,
    iconName: 'MemoryStick',
    initialProperties: { 
      type: 'Redis',
      version: '7.0',
      nodeType: 'cache.t3.micro',
      ttl: '3600s'
    },
    configurableProperties: [
      { id: 'type', label: 'Cache Type', type: 'select', options: ['Redis', 'Memcached', 'ElastiCache', 'Hazelcast', 'Apache Ignite'] },
      { id: 'version', label: 'Version', type: 'text' },
      { id: 'nodeType', label: 'Node Type', type: 'select', options: ['cache.t3.micro', 'cache.t3.small', 'cache.t3.medium', 'cache.r6g.large', 'cache.r6g.xlarge'] },
      { id: 'ttl', label: 'Default TTL', type: 'text' },
      { id: 'maxMemory', label: 'Max Memory Policy', type: 'select', options: ['allkeys-lru', 'volatile-lru', 'allkeys-random', 'volatile-random', 'volatile-ttl', 'noeviction'] },
      { id: 'persistence', label: 'Persistence', type: 'select', options: ['RDB', 'AOF', 'both', 'none'] },
      { id: 'clustering', label: 'Clustering', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'Data Warehouse',
    icon: HardDrive,
    iconName: 'HardDrive',
    initialProperties: { 
      type: 'Snowflake',
      size: 'X-Small',
      storage: '1TB',
      compression: 'enabled'
    },
    configurableProperties: [
      { id: 'type', label: 'Warehouse Type', type: 'select', options: ['Snowflake', 'Redshift', 'BigQuery', 'Synapse', 'Databricks'] },
      { id: 'size', label: 'Compute Size', type: 'select', options: ['X-Small', 'Small', 'Medium', 'Large', 'X-Large', '2X-Large', '3X-Large'] },
      { id: 'storage', label: 'Storage Capacity', type: 'text' },
      { id: 'compression', label: 'Compression', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'partitioning', label: 'Partitioning Strategy', type: 'text' },
      { id: 'clustering', label: 'Clustering Keys', type: 'text' }
    ]
  },

  // Networking Components
  {
    name: 'Load Balancer',
    icon: Gauge,
    iconName: 'Gauge',
    initialProperties: { 
      type: 'Application Load Balancer',
      algorithm: 'Round Robin',
      healthCheck: '/health',
      sslTermination: 'enabled'
    },
    configurableProperties: [
      { id: 'type', label: 'Load Balancer Type', type: 'select', options: ['Application Load Balancer', 'Network Load Balancer', 'Classic Load Balancer', 'Gateway Load Balancer'] },
      { id: 'algorithm', label: 'Algorithm', type: 'select', options: ['Round Robin', 'Least Connections', 'IP Hash', 'Weighted Round Robin', 'Least Response Time'] },
      { id: 'healthCheck', label: 'Health Check Path', type: 'text' },
      { id: 'sslTermination', label: 'SSL Termination', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'stickySessions', label: 'Sticky Sessions', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'timeout', label: 'Connection Timeout', type: 'text' },
      { id: 'crossZone', label: 'Cross-Zone Load Balancing', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'API Gateway',
    icon: Globe,
    iconName: 'Globe',
    initialProperties: { 
      type: 'REST API',
      authType: 'API Key',
      rateLimit: '1000 req/min',
      caching: 'enabled'
    },
    configurableProperties: [
      { id: 'type', label: 'API Type', type: 'select', options: ['REST API', 'GraphQL', 'WebSocket API', 'HTTP API'] },
      { id: 'authType', label: 'Authentication', type: 'select', options: ['API Key', 'OAuth 2.0', 'JWT', 'IAM', 'Cognito', 'Custom Authorizer'] },
      { id: 'rateLimit', label: 'Rate Limiting', type: 'text' },
      { id: 'caching', label: 'Response Caching', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'cors', label: 'CORS', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'throttling', label: 'Throttling', type: 'text' },
      { id: 'logging', label: 'Access Logging', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'CDN',
    icon: Network,
    iconName: 'Network',
    initialProperties: { 
      provider: 'CloudFront',
      caching: 'enabled',
      ttl: '86400s',
      geoRestriction: 'none'
    },
    configurableProperties: [
      { id: 'provider', label: 'CDN Provider', type: 'select', options: ['CloudFront', 'CloudFlare', 'Fastly', 'KeyCDN', 'MaxCDN', 'Azure CDN'] },
      { id: 'caching', label: 'Caching', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'ttl', label: 'Default TTL', type: 'text' },
      { id: 'geoRestriction', label: 'Geo Restriction', type: 'select', options: ['none', 'whitelist', 'blacklist'] },
      { id: 'compression', label: 'Compression', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'http2', label: 'HTTP/2 Support', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'waf', label: 'Web Application Firewall', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'Firewall',
    icon: Shield,
    iconName: 'Shield',
    initialProperties: { 
      type: 'Web Application Firewall',
      ruleset: 'OWASP Core Rule Set',
      mode: 'blocking',
      logging: 'enabled'
    },
    configurableProperties: [
      { id: 'type', label: 'Firewall Type', type: 'select', options: ['Web Application Firewall', 'Network Firewall', 'Next-Gen Firewall', 'Cloud Firewall'] },
      { id: 'ruleset', label: 'Rule Set', type: 'select', options: ['OWASP Core Rule Set', 'Custom Rules', 'Managed Rules', 'Threat Intelligence'] },
      { id: 'mode', label: 'Mode', type: 'select', options: ['blocking', 'monitoring', 'learning'] },
      { id: 'logging', label: 'Logging', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'ddosProtection', label: 'DDoS Protection', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'geoBlocking', label: 'Geo Blocking', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },

  // Messaging & Queuing
  {
    name: 'Message Queue',
    icon: Workflow,
    iconName: 'Workflow',
    initialProperties: { 
      type: 'SQS',
      deliveryGuarantee: 'at-least-once',
      retention: '14 days',
      visibility: '30s'
    },
    configurableProperties: [
      { id: 'type', label: 'Queue Type', type: 'select', options: ['SQS', 'RabbitMQ', 'Apache Kafka', 'Azure Service Bus', 'Google Pub/Sub', 'Redis Streams'] },
      { id: 'deliveryGuarantee', label: 'Delivery Guarantee', type: 'select', options: ['at-most-once', 'at-least-once', 'exactly-once'] },
      { id: 'retention', label: 'Message Retention', type: 'text' },
      { id: 'visibility', label: 'Visibility Timeout', type: 'text' },
      { id: 'dlq', label: 'Dead Letter Queue', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'encryption', label: 'Encryption', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'fifo', label: 'FIFO Queue', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'Event Bus',
    icon: Rss,
    iconName: 'Rss',
    initialProperties: { 
      type: 'EventBridge',
      pattern: 'event-driven',
      retention: '24 hours',
      replay: 'enabled'
    },
    configurableProperties: [
      { id: 'type', label: 'Event Bus Type', type: 'select', options: ['EventBridge', 'Apache Kafka', 'Azure Event Hubs', 'Google Pub/Sub', 'NATS', 'Apache Pulsar'] },
      { id: 'pattern', label: 'Pattern Matching', type: 'text' },
      { id: 'retention', label: 'Event Retention', type: 'text' },
      { id: 'replay', label: 'Event Replay', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'dlq', label: 'Dead Letter Queue', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'filtering', label: 'Content Filtering', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },

  // Storage Components
  {
    name: 'Object Storage',
    icon: Package,
    iconName: 'Package',
    initialProperties: { 
      type: 'S3',
      storageClass: 'Standard',
      versioning: 'enabled',
      encryption: 'AES-256'
    },
    configurableProperties: [
      { id: 'type', label: 'Storage Type', type: 'select', options: ['S3', 'Azure Blob', 'Google Cloud Storage', 'MinIO', 'Ceph'] },
      { id: 'storageClass', label: 'Storage Class', type: 'select', options: ['Standard', 'Infrequent Access', 'Glacier', 'Deep Archive', 'Intelligent Tiering'] },
      { id: 'versioning', label: 'Versioning', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'encryption', label: 'Encryption', type: 'select', options: ['AES-256', 'KMS', 'Customer Managed', 'disabled'] },
      { id: 'lifecycle', label: 'Lifecycle Policy', type: 'text' },
      { id: 'replication', label: 'Cross-Region Replication', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'File System',
    icon: FileText,
    iconName: 'FileText',
    initialProperties: { 
      type: 'EFS',
      performance: 'General Purpose',
      throughput: 'Provisioned',
      encryption: 'enabled'
    },
    configurableProperties: [
      { id: 'type', label: 'File System Type', type: 'select', options: ['EFS', 'FSx', 'NFS', 'CIFS/SMB', 'GlusterFS', 'CephFS'] },
      { id: 'performance', label: 'Performance Mode', type: 'select', options: ['General Purpose', 'Max I/O'] },
      { id: 'throughput', label: 'Throughput Mode', type: 'select', options: ['Bursting', 'Provisioned'] },
      { id: 'encryption', label: 'Encryption', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'backup', label: 'Automatic Backup', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'accessPoints', label: 'Access Points', type: 'text' }
    ]
  },

  // Monitoring & Observability
  {
    name: 'Monitoring',
    icon: Activity,
    iconName: 'Activity',
    initialProperties: { 
      tool: 'CloudWatch',
      retention: '30 days',
      alerting: 'enabled',
      dashboards: 'custom'
    },
    configurableProperties: [
      { id: 'tool', label: 'Monitoring Tool', type: 'select', options: ['CloudWatch', 'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Splunk', 'Elastic APM'] },
      { id: 'retention', label: 'Data Retention', type: 'text' },
      { id: 'alerting', label: 'Alerting', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'dashboards', label: 'Dashboards', type: 'select', options: ['default', 'custom', 'both'] },
      { id: 'sampling', label: 'Sampling Rate', type: 'text' },
      { id: 'tracing', label: 'Distributed Tracing', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'Logging',
    icon: FileText,
    iconName: 'FileText',
    initialProperties: { 
      tool: 'CloudWatch Logs',
      retention: '30 days',
      level: 'INFO',
      structured: 'JSON'
    },
    configurableProperties: [
      { id: 'tool', label: 'Logging Tool', type: 'select', options: ['CloudWatch Logs', 'ELK Stack', 'Fluentd', 'Logstash', 'Splunk', 'Datadog Logs'] },
      { id: 'retention', label: 'Log Retention', type: 'text' },
      { id: 'level', label: 'Log Level', type: 'select', options: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] },
      { id: 'structured', label: 'Log Format', type: 'select', options: ['JSON', 'Plain Text', 'XML', 'Custom'] },
      { id: 'encryption', label: 'Encryption', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'streaming', label: 'Real-time Streaming', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },

  // Security Components
  {
    name: 'Identity Provider',
    icon: User,
    iconName: 'User',
    initialProperties: { 
      type: 'Cognito',
      mfa: 'enabled',
      federation: 'SAML',
      passwordPolicy: 'strong'
    },
    configurableProperties: [
      { id: 'type', label: 'Identity Provider', type: 'select', options: ['Cognito', 'Auth0', 'Okta', 'Azure AD', 'Google Identity', 'Keycloak'] },
      { id: 'mfa', label: 'Multi-Factor Auth', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'federation', label: 'Federation Protocol', type: 'select', options: ['SAML', 'OAuth 2.0', 'OpenID Connect', 'LDAP'] },
      { id: 'passwordPolicy', label: 'Password Policy', type: 'select', options: ['weak', 'medium', 'strong', 'custom'] },
      { id: 'sessionTimeout', label: 'Session Timeout', type: 'text' },
      { id: 'bruteForce', label: 'Brute Force Protection', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'Secrets Manager',
    icon: Lock,
    iconName: 'Lock',
    initialProperties: { 
      type: 'AWS Secrets Manager',
      rotation: 'automatic',
      encryption: 'KMS',
      versioning: 'enabled'
    },
    configurableProperties: [
      { id: 'type', label: 'Secrets Manager', type: 'select', options: ['AWS Secrets Manager', 'HashiCorp Vault', 'Azure Key Vault', 'Google Secret Manager', 'Kubernetes Secrets'] },
      { id: 'rotation', label: 'Secret Rotation', type: 'select', options: ['automatic', 'manual', 'disabled'] },
      { id: 'encryption', label: 'Encryption', type: 'select', options: ['KMS', 'Customer Managed', 'Default'] },
      { id: 'versioning', label: 'Versioning', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'accessControl', label: 'Access Control', type: 'text' },
      { id: 'audit', label: 'Audit Logging', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },

  // Client Components
  {
    name: 'Web Client',
    icon: Monitor,
    iconName: 'Monitor',
    initialProperties: { 
      framework: 'React',
      bundler: 'Webpack',
      hosting: 'S3 + CloudFront',
      pwa: 'enabled'
    },
    configurableProperties: [
      { id: 'framework', label: 'Frontend Framework', type: 'select', options: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Vanilla JS'] },
      { id: 'bundler', label: 'Build Tool', type: 'select', options: ['Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild'] },
      { id: 'hosting', label: 'Hosting', type: 'select', options: ['S3 + CloudFront', 'Netlify', 'Vercel', 'GitHub Pages', 'Firebase Hosting'] },
      { id: 'pwa', label: 'Progressive Web App', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'ssr', label: 'Server-Side Rendering', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'caching', label: 'Client-Side Caching', type: 'select', options: ['enabled', 'disabled'] }
    ]
  },
  {
    name: 'Mobile Client',
    icon: Smartphone,
    iconName: 'Smartphone',
    initialProperties: { 
      platform: 'React Native',
      deployment: 'App Store',
      offline: 'enabled',
      push: 'FCM'
    },
    configurableProperties: [
      { id: 'platform', label: 'Mobile Platform', type: 'select', options: ['React Native', 'Flutter', 'Native iOS', 'Native Android', 'Ionic', 'Xamarin'] },
      { id: 'deployment', label: 'Deployment', type: 'select', options: ['App Store', 'Google Play', 'Enterprise', 'TestFlight', 'Internal'] },
      { id: 'offline', label: 'Offline Support', type: 'select', options: ['enabled', 'disabled'] },
      { id: 'push', label: 'Push Notifications', type: 'select', options: ['FCM', 'APNs', 'OneSignal', 'Pusher', 'disabled'] },
      { id: 'analytics', label: 'Analytics', type: 'select', options: ['Firebase Analytics', 'Mixpanel', 'Amplitude', 'Custom', 'disabled'] },
      { id: 'crashReporting', label: 'Crash Reporting', type: 'select', options: ['Crashlytics', 'Sentry', 'Bugsnag', 'Custom', 'disabled'] }
    ]
  },

  // Special Components
  {
    name: 'Info Note',
    icon: FileText,
    iconName: 'FileText',
    initialProperties: { 
      title: 'Requirements',
      content: 'Add your system requirements, assumptions, or back-of-the-envelope calculations here...'
    },
    configurableProperties: [
      { id: 'title', label: 'Title', type: 'text' },
      { id: 'content', label: 'Content', type: 'textarea' }
    ]
  }
];

// Enhanced templates with more comprehensive designs
const templates = [
  {
    name: 'E-commerce Platform',
    description: 'Scalable e-commerce system with microservices architecture',
    category: 'E-commerce',
    complexity: 'High',
    estimatedUsers: '1M+',
    nodes: [
      {
        id: 'web-client',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Web Client', 
          iconName: 'Monitor',
          properties: { 
            framework: 'React',
            bundler: 'Vite',
            hosting: 'S3 + CloudFront',
            pwa: 'enabled',
            ssr: 'enabled'
          }
        }
      },
      {
        id: 'mobile-client',
        type: 'custom',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Mobile Client', 
          iconName: 'Smartphone',
          properties: { 
            platform: 'React Native',
            deployment: 'App Store',
            offline: 'enabled',
            push: 'FCM'
          }
        }
      },
      {
        id: 'api-gateway',
        type: 'custom',
        position: { x: 200, y: 250 },
        data: { 
          label: 'API Gateway', 
          iconName: 'Globe',
          properties: { 
            type: 'REST API',
            authType: 'OAuth 2.0',
            rateLimit: '10000 req/min',
            caching: 'enabled'
          }
        }
      },
      {
        id: 'load-balancer',
        type: 'custom',
        position: { x: 200, y: 400 },
        data: { 
          label: 'Load Balancer', 
          iconName: 'Gauge',
          properties: { 
            type: 'Application Load Balancer',
            algorithm: 'Least Connections',
            healthCheck: '/health',
            sslTermination: 'enabled'
          }
        }
      },
      {
        id: 'user-service',
        type: 'custom',
        position: { x: 50, y: 550 },
        data: { 
          label: 'User Service', 
          iconName: 'Boxes',
          properties: { 
            language: 'Java',
            containerized: 'Docker',
            replicas: '3',
            resources: '1 CPU, 2Gi RAM'
          }
        }
      },
      {
        id: 'product-service',
        type: 'custom',
        position: { x: 200, y: 550 },
        data: { 
          label: 'Product Service', 
          iconName: 'Boxes',
          properties: { 
            language: 'Go',
            containerized: 'Docker',
            replicas: '5',
            resources: '500m CPU, 1Gi RAM'
          }
        }
      },
      {
        id: 'order-service',
        type: 'custom',
        position: { x: 350, y: 550 },
        data: { 
          label: 'Order Service', 
          iconName: 'Boxes',
          properties: { 
            language: 'Python',
            containerized: 'Docker',
            replicas: '4',
            resources: '1 CPU, 1.5Gi RAM'
          }
        }
      },
      {
        id: 'user-db',
        type: 'custom',
        position: { x: 50, y: 700 },
        data: { 
          label: 'User Database', 
          iconName: 'Database',
          properties: { 
            type: 'PostgreSQL',
            version: '15.0',
            instanceClass: 'db.r5.large',
            storage: '500GB',
            role: 'primary'
          }
        }
      },
      {
        id: 'product-db',
        type: 'custom',
        position: { x: 200, y: 700 },
        data: { 
          label: 'Product Database', 
          iconName: 'Database',
          properties: { 
            type: 'MongoDB',
            version: '6.0',
            instanceClass: 'db.r5.xlarge',
            storage: '1TB',
            role: 'primary'
          }
        }
      },
      {
        id: 'order-db',
        type: 'custom',
        position: { x: 350, y: 700 },
        data: { 
          label: 'Order Database', 
          iconName: 'Database',
          properties: { 
            type: 'PostgreSQL',
            version: '15.0',
            instanceClass: 'db.r5.large',
            storage: '1TB',
            role: 'primary'
          }
        }
      },
      {
        id: 'redis-cache',
        type: 'custom',
        position: { x: 500, y: 550 },
        data: { 
          label: 'Redis Cache', 
          iconName: 'MemoryStick',
          properties: { 
            type: 'Redis',
            version: '7.0',
            nodeType: 'cache.r6g.large',
            ttl: '3600s',
            clustering: 'enabled'
          }
        }
      },
      {
        id: 'message-queue',
        type: 'custom',
        position: { x: 500, y: 400 },
        data: { 
          label: 'Message Queue', 
          iconName: 'Workflow',
          properties: { 
            type: 'Apache Kafka',
            deliveryGuarantee: 'exactly-once',
            retention: '7 days',
            partitions: '12'
          }
        }
      },
      {
        id: 'requirements',
        type: 'custom',
        position: { x: 600, y: 100 },
        data: { 
          label: 'Info Note', 
          iconName: 'FileText',
          properties: { 
            title: 'E-commerce Requirements',
            content: `System Requirements:
- Support 1M+ concurrent users
- 99.9% uptime SLA
- Global distribution
- Real-time inventory updates
- Secure payment processing
- Mobile-first design

Back-of-the-envelope calculations:
- Peak traffic: 10,000 RPS
- Database size: ~5TB
- CDN bandwidth: 100 Gbps
- Cache hit ratio: 85%`
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'web-client', target: 'api-gateway', label: 'HTTPS' },
      { id: 'e2', source: 'mobile-client', target: 'api-gateway', label: 'HTTPS' },
      { id: 'e3', source: 'api-gateway', target: 'load-balancer', label: 'Route' },
      { id: 'e4', source: 'load-balancer', target: 'user-service', label: 'HTTP' },
      { id: 'e5', source: 'load-balancer', target: 'product-service', label: 'HTTP' },
      { id: 'e6', source: 'load-balancer', target: 'order-service', label: 'HTTP' },
      { id: 'e7', source: 'user-service', target: 'user-db', label: 'SQL' },
      { id: 'e8', source: 'product-service', target: 'product-db', label: 'MongoDB' },
      { id: 'e9', source: 'order-service', target: 'order-db', label: 'SQL' },
      { id: 'e10', source: 'product-service', target: 'redis-cache', label: 'Cache' },
      { id: 'e11', source: 'order-service', target: 'message-queue', label: 'Events' },
      { id: 'e12', source: 'message-queue', target: 'user-service', label: 'Notifications' }
    ]
  },
  {
    name: 'Social Media Platform',
    description: 'High-scale social media platform with real-time features',
    category: 'Social Media',
    complexity: 'Very High',
    estimatedUsers: '10M+',
    nodes: [
      {
        id: 'web-app',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Web Client', 
          iconName: 'Monitor',
          properties: { 
            framework: 'Next.js',
            bundler: 'Webpack',
            hosting: 'Vercel',
            pwa: 'enabled',
            ssr: 'enabled'
          }
        }
      },
      {
        id: 'mobile-app',
        type: 'custom',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Mobile App', 
          iconName: 'Smartphone',
          properties: { 
            platform: 'Flutter',
            deployment: 'App Store',
            offline: 'enabled',
            push: 'FCM'
          }
        }
      },
      {
        id: 'cdn',
        type: 'custom',
        position: { x: 200, y: 200 },
        data: { 
          label: 'CDN', 
          iconName: 'Network',
          properties: { 
            provider: 'CloudFront',
            caching: 'enabled',
            ttl: '3600s',
            compression: 'enabled'
          }
        }
      },
      {
        id: 'api-gateway',
        type: 'custom',
        position: { x: 200, y: 300 },
        data: { 
          label: 'API Gateway', 
          iconName: 'Globe',
          properties: { 
            type: 'GraphQL',
            authType: 'JWT',
            rateLimit: '50000 req/min',
            caching: 'enabled'
          }
        }
      },
      {
        id: 'user-service',
        type: 'custom',
        position: { x: 50, y: 450 },
        data: { 
          label: 'User Service', 
          iconName: 'Boxes',
          properties: { 
            language: 'Go',
            containerized: 'Docker',
            replicas: '10',
            resources: '2 CPU, 4Gi RAM'
          }
        }
      },
      {
        id: 'post-service',
        type: 'custom',
        position: { x: 200, y: 450 },
        data: { 
          label: 'Post Service', 
          iconName: 'Boxes',
          properties: { 
            language: 'Node.js',
            containerized: 'Docker',
            replicas: '15',
            resources: '1 CPU, 2Gi RAM'
          }
        }
      },
      {
        id: 'feed-service',
        type: 'custom',
        position: { x: 350, y: 450 },
        data: { 
          label: 'Feed Service', 
          iconName: 'Boxes',
          properties: { 
            language: 'Java',
            containerized: 'Docker',
            replicas: '20',
            resources: '4 CPU, 8Gi RAM'
          }
        }
      },
      {
        id: 'notification-service',
        type: 'custom',
        position: { x: 500, y: 450 },
        data: { 
          label: 'Notification Service', 
          iconName: 'Boxes',
          properties: { 
            language: 'Python',
            containerized: 'Docker',
            replicas: '8',
            resources: '1 CPU, 2Gi RAM'
          }
        }
      },
      {
        id: 'user-db',
        type: 'custom',
        position: { x: 50, y: 600 },
        data: { 
          label: 'User DB', 
          iconName: 'Database',
          properties: { 
            type: 'PostgreSQL',
            version: '15.0',
            instanceClass: 'db.r5.2xlarge',
            storage: '2TB',
            role: 'primary'
          }
        }
      },
      {
        id: 'post-db',
        type: 'custom',
        position: { x: 200, y: 600 },
        data: { 
          label: 'Post DB', 
          iconName: 'Database',
          properties: { 
            type: 'Cassandra',
            version: '4.0',
            instanceClass: 'db.r5.4xlarge',
            storage: '10TB',
            role: 'primary'
          }
        }
      },
      {
        id: 'feed-cache',
        type: 'custom',
        position: { x: 350, y: 600 },
        data: { 
          label: 'Feed Cache', 
          iconName: 'MemoryStick',
          properties: { 
            type: 'Redis',
            version: '7.0',
            nodeType: 'cache.r6g.2xlarge',
            ttl: '1800s',
            clustering: 'enabled'
          }
        }
      },
      {
        id: 'kafka',
        type: 'custom',
        position: { x: 500, y: 600 },
        data: { 
          label: 'Event Stream', 
          iconName: 'Workflow',
          properties: { 
            type: 'Apache Kafka',
            deliveryGuarantee: 'at-least-once',
            retention: '7 days',
            partitions: '100'
          }
        }
      },
      {
        id: 'media-storage',
        type: 'custom',
        position: { x: 650, y: 450 },
        data: { 
          label: 'Media Storage', 
          iconName: 'Package',
          properties: { 
            type: 'S3',
            storageClass: 'Standard',
            versioning: 'enabled',
            encryption: 'AES-256'
          }
        }
      },
      {
        id: 'requirements',
        type: 'custom',
        position: { x: 650, y: 100 },
        data: { 
          label: 'Info Note', 
          iconName: 'FileText',
          properties: { 
            title: 'Social Media Requirements',
            content: `System Requirements:
- Support 10M+ daily active users
- Real-time feed updates
- 99.99% uptime SLA
- Global content delivery
- Rich media support (images, videos)
- Real-time messaging
- Advanced recommendation engine

Calculations:
- Peak traffic: 100,000 RPS
- Media storage: 100TB+
- Feed generation: 1M feeds/sec
- Real-time connections: 1M concurrent`
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'web-app', target: 'cdn', label: 'HTTPS' },
      { id: 'e2', source: 'mobile-app', target: 'cdn', label: 'HTTPS' },
      { id: 'e3', source: 'cdn', target: 'api-gateway', label: 'Route' },
      { id: 'e4', source: 'api-gateway', target: 'user-service', label: 'GraphQL' },
      { id: 'e5', source: 'api-gateway', target: 'post-service', label: 'GraphQL' },
      { id: 'e6', source: 'api-gateway', target: 'feed-service', label: 'GraphQL' },
      { id: 'e7', source: 'user-service', target: 'user-db', label: 'SQL' },
      { id: 'e8', source: 'post-service', target: 'post-db', label: 'CQL' },
      { id: 'e9', source: 'feed-service', target: 'feed-cache', label: 'Cache' },
      { id: 'e10', source: 'post-service', target: 'kafka', label: 'Events' },
      { id: 'e11', source: 'kafka', target: 'notification-service', label: 'Stream' },
      { id: 'e12', source: 'kafka', target: 'feed-service', label: 'Stream' },
      { id: 'e13', source: 'post-service', target: 'media-storage', label: 'Upload' }
    ]
  },
  {
    name: 'Serverless Blog',
    description: 'Simple serverless blog with JAMstack architecture',
    category: 'Content',
    complexity: 'Low',
    estimatedUsers: '10K',
    nodes: [
      {
        id: 'web-client',
        type: 'custom',
        position: { x: 200, y: 100 },
        data: { 
          label: 'Static Site', 
          iconName: 'Monitor',
          properties: { 
            framework: 'Gatsby',
            bundler: 'Webpack',
            hosting: 'Netlify',
            pwa: 'enabled'
          }
        }
      },
      {
        id: 'cdn',
        type: 'custom',
        position: { x: 200, y: 250 },
        data: { 
          label: 'CDN', 
          iconName: 'Network',
          properties: { 
            provider: 'CloudFlare',
            caching: 'enabled',
            ttl: '86400s',
            compression: 'enabled'
          }
        }
      },
      {
        id: 'api-function',
        type: 'custom',
        position: { x: 100, y: 400 },
        data: { 
          label: 'API Function', 
          iconName: 'Zap',
          properties: { 
            runtime: 'nodejs18.x',
            memory: '256MB',
            timeout: '10s',
            trigger: 'HTTP'
          }
        }
      },
      {
        id: 'cms-function',
        type: 'custom',
        position: { x: 300, y: 400 },
        data: { 
          label: 'CMS Function', 
          iconName: 'Zap',
          properties: { 
            runtime: 'nodejs18.x',
            memory: '512MB',
            timeout: '30s',
            trigger: 'HTTP'
          }
        }
      },
      {
        id: 'database',
        type: 'custom',
        position: { x: 200, y: 550 },
        data: { 
          label: 'Database', 
          iconName: 'Database',
          properties: { 
            type: 'DynamoDB',
            billing: 'On-Demand',
            encryption: 'enabled',
            backup: 'enabled'
          }
        }
      },
      {
        id: 'requirements',
        type: 'custom',
        position: { x: 450, y: 100 },
        data: { 
          label: 'Info Note', 
          iconName: 'FileText',
          properties: { 
            title: 'Blog Requirements',
            content: `System Requirements:
- Simple blog with CMS
- Low maintenance
- Cost-effective
- Fast loading times
- SEO optimized

Calculations:
- Expected traffic: 1,000 page views/day
- Storage needs: <1GB
- Bandwidth: <10GB/month
- Function executions: <10,000/month`
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'web-client', target: 'cdn', label: 'Static Assets' },
      { id: 'e2', source: 'cdn', target: 'api-function', label: 'API Calls' },
      { id: 'e3', source: 'cdn', target: 'cms-function', label: 'CMS API' },
      { id: 'e4', source: 'api-function', target: 'database', label: 'Query' },
      { id: 'e5', source: 'cms-function', target: 'database', label: 'CRUD' }
    ]
  }
];

// Enhanced evaluation criteria with detailed descriptions
const evaluationCriteria = [
  {
    id: 'complexity',
    name: 'Complexity',
    icon: Layers,
    description: 'System design complexity and ease of understanding',
    color: 'text-blue-600'
  },
  {
    id: 'scalability',
    name: 'Scalability',
    icon: TrendingUp,
    description: 'Ability to handle increased load and growth',
    color: 'text-green-600'
  },
  {
    id: 'availability',
    name: 'Availability',
    icon: Shield,
    description: 'System uptime and resilience to failures',
    color: 'text-purple-600'
  },
  {
    id: 'faultTolerance',
    name: 'Fault Tolerance',
    icon: ShieldIcon,
    description: 'Recovery and resilience from component failures',
    color: 'text-orange-600'
  },
  {
    id: 'costEfficiency',
    name: 'Cost Efficiency',
    icon: DollarSign,
    description: 'Resource utilization and cost optimization',
    color: 'text-yellow-600'
  },
  {
    id: 'security',
    name: 'Security',
    icon: Lock,
    description: 'Data protection and security measures',
    color: 'text-red-600'
  },
  {
    id: 'maintainability',
    name: 'Maintainability',
    icon: Wrench,
    description: 'Ease of updates, debugging, and operations',
    color: 'text-indigo-600'
  }
];

// Rating color mapping
const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
    case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Poor': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Needs Improvement': return 'text-red-600 bg-red-50 border-red-200';
    case 'Not Applicable': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// User design interface
export interface UserDesign {
  id: string;
  name: string;
  description?: string;
  category?: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

// Main component
function ArchitechAppContent() {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<DesignCanvasHandles>(null);
  
  // State management
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [selectedComponentConfig, setSelectedComponentConfig] = useState<ComponentConfig | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const [currentDesignName, setCurrentDesignName] = useState('Untitled Design');
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [diagramChangedSinceLastSave, setDiagramChangedSinceLastSave] = useState(false);
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateSystemDesignOutput | null>(null);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');
  const [newDesignDescription, setNewDesignDescription] = useState('');

  // Get unique categories from components
  const categories = ['All', ...Array.from(new Set(componentConfigs.map(config => {
    if (config.name.includes('Service') || config.name.includes('Server')) return 'Compute';
    if (config.name.includes('Database') || config.name.includes('Cache') || config.name.includes('Storage')) return 'Storage';
    if (config.name.includes('Load Balancer') || config.name.includes('Gateway') || config.name.includes('CDN') || config.name.includes('Firewall')) return 'Network';
    if (config.name.includes('Queue') || config.name.includes('Event')) return 'Messaging';
    if (config.name.includes('Monitor') || config.name.includes('Logging')) return 'Observability';
    if (config.name.includes('Identity') || config.name.includes('Secrets')) return 'Security';
    if (config.name.includes('Client') || config.name.includes('Mobile') || config.name.includes('Web')) return 'Client';
    return 'Other';
  })))];

  // Filter components based on search and category
  const filteredComponents = componentConfigs.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (() => {
      if (config.name.includes('Service') || config.name.includes('Server')) return selectedCategory === 'Compute';
      if (config.name.includes('Database') || config.name.includes('Cache') || config.name.includes('Storage')) return selectedCategory === 'Storage';
      if (config.name.includes('Load Balancer') || config.name.includes('Gateway') || config.name.includes('CDN') || config.name.includes('Firewall')) return selectedCategory === 'Network';
      if (config.name.includes('Queue') || config.name.includes('Event')) return selectedCategory === 'Messaging';
      if (config.name.includes('Monitor') || config.name.includes('Logging')) return selectedCategory === 'Observability';
      if (config.name.includes('Identity') || config.name.includes('Secrets')) return selectedCategory === 'Security';
      if (config.name.includes('Client') || config.name.includes('Mobile') || config.name.includes('Web')) return selectedCategory === 'Client';
      return selectedCategory === 'Other';
    })();
    return matchesSearch && matchesCategory;
  });

  // Load user designs on component mount
  useEffect(() => {
    if (currentUser) {
      loadUserDesigns();
      // Show welcome dialog for returning users with designs
      setTimeout(() => {
        if (userDesigns.length > 0) {
          setShowWelcomeDialog(true);
        }
      }, 1000);
    }
  }, [currentUser]);

  // Auto-save functionality
  useEffect(() => {
    if (diagramChangedSinceLastSave && currentDesignId && currentUser) {
      const autoSaveTimer = setTimeout(() => {
        handleSaveDesign(true); // Auto-save
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [diagramChangedSinceLastSave, currentDesignId, currentUser]);

  // Load user designs from Firestore
  const loadUserDesigns = async () => {
    if (!currentUser) return;
    
    setIsLoadingDesigns(true);
    try {
      const designsQuery = query(
        collection(db, 'designs'),
        where('userId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(designsQuery);
      const designs: UserDesign[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<UserDesign, 'id'>;
        designs.push({ id: doc.id, ...data });
      });
      
      setUserDesigns(designs);
    } catch (error) {
      console.error('Error loading designs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your designs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDesigns(false);
    }
  };

  // Handle node selection
  const handleNodeSelect = useCallback((node: Node<NodeData> | null) => {
    setSelectedNode(node);
    if (node) {
      const config = componentConfigs.find(c => c.name === node.data.label);
      setSelectedComponentConfig(config || null);
    } else {
      setSelectedComponentConfig(null);
    }
  }, []);

  // Handle node property updates
  const handleUpdateNodeProperties = useCallback((nodeId: string, properties: Record<string, any>) => {
    if (canvasRef.current) {
      canvasRef.current.updateNodeProperties(nodeId, properties);
      setDiagramChangedSinceLastSave(true);
    }
  }, []);

  // Handle structural changes (for auto-save)
  const handleStructuralChange = useCallback(() => {
    setDiagramChangedSinceLastSave(true);
  }, []);

  // Handle drag start for components
  const handleDragStart = (event: React.DragEvent, config: ComponentConfig) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      name: config.name,
      iconName: config.iconName,
      properties: config.initialProperties
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Save design to Firestore
  const handleSaveDesign = async (isAutoSave = false) => {
    if (!currentUser || !canvasRef.current) return;

    try {
      const diagramJson = canvasRef.current.getDiagramJson();
      const { nodes, edges } = JSON.parse(diagramJson);

      const designData = {
        name: currentDesignName,
        description: newDesignDescription || '',
        category: 'Custom',
        nodes,
        edges,
        userId: currentUser.uid,
        updatedAt: Timestamp.now(),
      };

      if (currentDesignId) {
        // Update existing design
        await setDoc(doc(db, 'designs', currentDesignId), designData);
      } else {
        // Create new design
        const newDesignRef = doc(collection(db, 'designs'));
        await setDoc(newDesignRef, {
          ...designData,
          createdAt: Timestamp.now(),
        });
        setCurrentDesignId(newDesignRef.id);
      }

      setDiagramChangedSinceLastSave(false);
      
      if (!isAutoSave) {
        toast({
          title: 'Success',
          description: 'Design saved successfully!',
        });
        setShowSaveDialog(false);
      }

      // Reload designs to update the list
      await loadUserDesigns();
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save design. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Load design from template or saved design
  const handleLoadDesign = (nodes: Node<NodeData>[], edges: Edge[], designName?: string, designId?: string) => {
    if (canvasRef.current) {
      canvasRef.current.loadTemplate(nodes, edges);
      setCurrentDesignName(designName || 'Untitled Design');
      setCurrentDesignId(designId || null);
      setDiagramChangedSinceLastSave(false);
      setSelectedNode(null);
      setSelectedComponentConfig(null);
      setShowTemplateDialog(false);
      setShowLoadDialog(false);
      setShowWelcomeDialog(false);
    }
  };

  // Create new design
  const handleNewDesign = () => {
    if (canvasRef.current) {
      canvasRef.current.loadTemplate([], []);
      setCurrentDesignName('Untitled Design');
      setCurrentDesignId(null);
      setDiagramChangedSinceLastSave(false);
      setSelectedNode(null);
      setSelectedComponentConfig(null);
      setShowWelcomeDialog(false);
    }
  };

  // Delete design
  const handleDeleteDesign = async (designId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'designs', designId));
      toast({
        title: 'Success',
        description: 'Design deleted successfully!',
      });
      await loadUserDesigns();
      
      // If we deleted the current design, reset to new design
      if (designId === currentDesignId) {
        handleNewDesign();
      }
    } catch (error) {
      console.error('Error deleting design:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete design. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Export design as JSON
  const handleExportDesign = () => {
    if (!canvasRef.current) return;

    const diagramJson = canvasRef.current.getDiagramJson();
    const exportData = {
      name: currentDesignName,
      description: newDesignDescription,
      diagram: JSON.parse(diagramJson),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDesignName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Design exported successfully!',
    });
  };

  // Import design from JSON
  const handleImportDesign = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.diagram && importData.diagram.nodes && importData.diagram.edges) {
          handleLoadDesign(
            importData.diagram.nodes,
            importData.diagram.edges,
            importData.name || 'Imported Design'
          );
          toast({
            title: 'Success',
            description: 'Design imported successfully!',
          });
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        console.error('Error importing design:', error);
        toast({
          title: 'Error',
          description: 'Failed to import design. Please check the file format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Evaluate system design with AI
  const handleEvaluateDesign = async () => {
    if (!canvasRef.current) return;

    setIsEvaluating(true);
    try {
      const diagramJson = canvasRef.current.getDiagramJson();
      const { nodes } = JSON.parse(diagramJson);
      
      // Extract requirements and BOTE calculations from Info Note components
      const infoNotes = nodes.filter((node: Node<NodeData>) => node.data.label === 'Info Note');
      const requirements = infoNotes
        .filter((note: Node<NodeData>) => note.data.properties?.title?.toLowerCase().includes('requirement'))
        .map((note: Node<NodeData>) => note.data.properties?.content || '')
        .join('\n\n');
      
      const boteCalculations = infoNotes
        .filter((note: Node<NodeData>) => 
          note.data.properties?.title?.toLowerCase().includes('calculation') ||
          note.data.properties?.content?.toLowerCase().includes('calculation')
        )
        .map((note: Node<NodeData>) => note.data.properties?.content || '')
        .join('\n\n');

      const input: EvaluateSystemDesignInput = {
        requirements: requirements || 'No specific requirements provided. Please evaluate based on the system design.',
        designDiagram: diagramJson,
        backOfTheEnvelopeCalculations: boteCalculations || undefined,
      };

      const result = await evaluateSystemDesign(input);
      setEvaluationResult(result);
      setShowEvaluationDialog(true);
    } catch (error) {
      console.error('Error evaluating design:', error);
      toast({
        title: 'Error',
        description: 'Failed to evaluate design. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle chat with AI interview bot
  const handleSendChatMessage = async (message: string) => {
    if (!canvasRef.current) return;

    // Add user message to chat
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoadingAiResponse(true);

    try {
      const diagramJson = canvasRef.current.getDiagramJson();
      const { nodes } = JSON.parse(diagramJson);
      
      // Extract requirements and BOTE calculations
      const infoNotes = nodes.filter((node: Node<NodeData>) => node.data.label === 'Info Note');
      const requirements = infoNotes
        .filter((note: Node<NodeData>) => note.data.properties?.title?.toLowerCase().includes('requirement'))
        .map((note: Node<NodeData>) => note.data.properties?.content || '')
        .join('\n\n');
      
      const boteCalculations = infoNotes
        .filter((note: Node<NodeData>) => 
          note.data.properties?.title?.toLowerCase().includes('calculation') ||
          note.data.properties?.content?.toLowerCase().includes('calculation')
        )
        .map((note: Node<NodeData>) => note.data.properties?.content || '')
        .join('\n\n');

      // Filter chat history to only include user and model messages
      const filteredChatHistory = chatMessages.filter(msg => msg.role === 'user' || msg.role === 'model');

      const input: InterviewBotInput = {
        diagramJson,
        featureRequirements: requirements || 'No specific requirements provided.',
        boteCalculations: boteCalculations || undefined,
        chatHistory: filteredChatHistory,
        currentUserMessage: message,
      };

      const result = await interviewBot(input);
      
      // Add AI response to chat
      const aiMessage: ChatMessage = { role: 'model', content: result.aiResponseMessage };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage: ChatMessage = { 
        role: 'system', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingAiResponse(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Success',
        description: 'Logged out successfully!',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Logo collapsed />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">{currentDesignName}</h2>
              {diagramChangedSinceLastSave && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Unsaved
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateDialog(true)}
              className="hidden sm:flex"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Templates
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEvaluateDesign}
              disabled={isEvaluating}
              className="hidden sm:flex"
            >
              {isEvaluating ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Evaluate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChatOpen(true)}
              className="hidden sm:flex"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentUser?.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLoadDialog(true)}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Load Design
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportDesign}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById('import-input')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggleButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="px-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="components" className="text-xs">
                    <Boxes className="w-4 h-4 mr-1" />
                    Components
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Tools
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <Tabs value={activeTab} className="w-full">
              {/* Components Tab */}
              <TabsContent value="components" className="mt-0">
                <SidebarGroup>
                  <SidebarGroupLabel>
                    <Search className="w-4 h-4 mr-2" />
                    Search & Filter
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="space-y-2 px-2">
                      <Input
                        placeholder="Search components..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8"
                      />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-8 px-2 text-sm border rounded-md bg-background"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>
                    <Grid className="w-4 h-4 mr-2" />
                    Components ({filteredComponents.length})
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <SidebarMenu>
                        {filteredComponents.map((config) => {
                          const IconComponent = config.icon;
                          return (
                            <SidebarMenuItem key={config.name}>
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, config)}
                                className="flex items-center gap-2 p-2 rounded-md cursor-grab hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                              >
                                <IconComponent className="w-4 h-4 shrink-0" />
                                <span className="text-sm font-medium truncate">{config.name}</span>
                              </div>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </ScrollArea>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="mt-0">
                <SidebarGroup>
                  <SidebarGroupLabel>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Design Templates
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="space-y-2 px-2">
                        {templates.map((template) => (
                          <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {template.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    template.complexity === 'Low' ? 'text-green-600' :
                                    template.complexity === 'Medium' ? 'text-yellow-600' :
                                    template.complexity === 'High' ? 'text-orange-600' :
                                    'text-red-600'
                                  }`}
                                >
                                  {template.complexity}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => handleLoadDesign(template.nodes, template.edges, template.name)}
                              >
                                Use Template
                              </Button>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>

              {/* AI Tools Tab */}
              <TabsContent value="ai" className="mt-0">
                <SidebarGroup>
                  <SidebarGroupLabel>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-Powered Tools
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="space-y-3 px-2">
                      <Card className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-sm">Design Evaluation</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get AI-powered feedback on your system design's scalability, availability, and more.
                          </p>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={handleEvaluateDesign}
                            disabled={isEvaluating}
                          >
                            {isEvaluating ? (
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Evaluate Design
                          </Button>
                        </div>
                      </Card>

                      <Card className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-sm">Interview Bot</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Practice system design interviews with our AI interviewer.
                          </p>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setIsChatOpen(true)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Start Interview
                          </Button>
                        </div>
                      </Card>

                      <Card className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <h4 className="font-medium text-sm">Smart Suggestions</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get intelligent component and architecture suggestions.
                          </p>
                          <Button size="sm" className="w-full" variant="outline" disabled>
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Coming Soon
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              </TabsContent>
            </Tabs>
          </SidebarContent>

          <SidebarFooter>
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="truncate">{currentUser?.email}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Canvas Area */}
        <SidebarInset className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <DesignCanvas
              ref={canvasRef}
              onNodeSelect={handleNodeSelect}
              onStructuralChange={handleStructuralChange}
            />
          </div>
        </SidebarInset>

        {/* Properties Panel */}
        {selectedNode && selectedComponentConfig && (
          <div className="w-80 border-l bg-card/50 backdrop-blur-sm">
            <PropertiesPanel
              selectedNode={selectedNode}
              componentConfig={selectedComponentConfig}
              onUpdateNode={handleUpdateNodeProperties}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>

      {/* Hidden file input for import */}
      <input
        id="import-input"
        type="file"
        accept=".json"
        onChange={handleImportDesign}
        className="hidden"
      />

      {/* Chat Bot Window */}
      <ChatBotWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isLoadingAiResponse={isLoadingAiResponse}
      />

      {/* Welcome Back Dialog */}
      <WelcomeBackDialog
        isOpen={showWelcomeDialog}
        onClose={() => setShowWelcomeDialog(false)}
        designs={userDesigns}
        onLoadDesignClick={(designId, designName) => {
          const design = userDesigns.find(d => d.id === designId);
          if (design) {
            handleLoadDesign(design.nodes, design.edges, design.name, design.id);
          }
        }}
        onCreateNewClick={handleNewDesign}
      />

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Design</DialogTitle>
            <DialogDescription>
              Give your design a name and description to save it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="design-name">Design Name</Label>
              <Input
                id="design-name"
                value={currentDesignName}
                onChange={(e) => setCurrentDesignName(e.target.value)}
                placeholder="Enter design name..."
              />
            </div>
            <div>
              <Label htmlFor="design-description">Description (Optional)</Label>
              <Textarea
                id="design-description"
                value={newDesignDescription}
                onChange={(e) => setNewDesignDescription(e.target.value)}
                placeholder="Describe your design..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => handleSaveDesign()}>
              <Save className="w-4 h-4 mr-2" />
              Save Design
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Design</DialogTitle>
            <DialogDescription>
              Choose a design to load from your saved designs.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {isLoadingDesigns ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : userDesigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved designs found.</p>
                <p className="text-sm">Create and save your first design to see it here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userDesigns.map((design) => (
                  <Card key={design.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{design.name}</h4>
                        {design.description && (
                          <p className="text-sm text-muted-foreground mt-1">{design.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {design.category || 'Custom'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Updated {design.updatedAt.toDate().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleLoadDesign(design.nodes, design.edges, design.name, design.id)}
                        >
                          <FolderOpen className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Design</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{design.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDesign(design.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={handleNewDesign}>
              <Plus className="w-4 h-4 mr-2" />
              New Design
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluation Results Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Design Evaluation
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis of your system design
            </DialogDescription>
          </DialogHeader>
          
          {evaluationResult && (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Overall Assessment
                </h3>
                <p className="text-sm text-muted-foreground">{evaluationResult.overallAssessment}</p>
              </Card>

              {/* Evaluation Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluationCriteria.map((criterion) => {
                  const result = evaluationResult[criterion.id as keyof EvaluateSystemDesignOutput] as any;
                  if (!result || typeof result !== 'object' || !result.rating) return null;

                  const IconComponent = criterion.icon;
                  return (
                    <Card key={criterion.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${criterion.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{criterion.name}</h4>
                            <Badge className={getRatingColor(result.rating)}>
                              {result.rating}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {result.explanation}
                          </p>
                          {result.specificRecommendations && result.specificRecommendations.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {result.specificRecommendations.map((rec: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Calculation Review */}
              {evaluationResult.calculationReview && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Calculation Review
                  </h3>
                  <p className="text-sm text-muted-foreground">{evaluationResult.calculationReview}</p>
                </Card>
              )}

              {/* Strengths */}
              {evaluationResult.identifiedStrengths && evaluationResult.identifiedStrengths.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Identified Strengths
                  </h3>
                  <ul className="space-y-2">
                    {evaluationResult.identifiedStrengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Risks */}
              {evaluationResult.potentialRisks && evaluationResult.potentialRisks.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    Potential Risks
                  </h3>
                  <ul className="space-y-2">
                    {evaluationResult.potentialRisks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* General Suggestions */}
              {evaluationResult.suggestionsForImprovement && evaluationResult.suggestionsForImprovement.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggestions for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {evaluationResult.suggestionsForImprovement.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={() => setIsChatOpen(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Discuss with AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main exported component with providers
export function ArchitechApp() {
  return (
    <SidebarProvider>
      <ArchitechAppContent />
    </SidebarProvider>
  );
}