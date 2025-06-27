'use server';
/**
 * @fileOverview A Genkit flow to generate a system design diagram from requirements.
 *
 * - generateDiagram - A function that handles the diagram generation.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 * - GenerateDiagramOutput - The return type for the generateDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas for ReactFlow structure
const NodePositionSchema = z.object({
  x: z.number().describe('The x-coordinate of the node.'),
  y: z.number().describe('The y-coordinate of the node.'),
});

const NodeDataSchema = z.object({
  label: z.string().describe("The display name of the node. This will be visible on the canvas. It can be a generic component name like 'Web Server' or a specific service name like 'User Authentication Service'."),
  iconName: z.string().describe("The name of the Lucide icon for the component. MUST be one of the provided iconNames."),
  properties: z.record(z.any()).describe("An object containing the component's specific properties. Should include a 'name' property matching the 'data.label'."),
});

const NodeSchema = z.object({
  id: z.string().describe("A unique identifier for the node (e.g., 'node-1', 'web-server-0')."),
  type: z.literal('custom').describe("The type of the node, which must be 'custom'."),
  position: NodePositionSchema.describe("The x and y coordinates for the node's position on the canvas."),
  data: NodeDataSchema,
});

const EdgeSchema = z.object({
  id: z.string().describe("A unique identifier for the edge (e.g., 'edge-1')."),
  source: z.string().describe("The ID of the source node for the connection."),
  target: z.string().describe("The ID of the target node for the connection."),
  label: z.string().optional().describe("An optional label to display on the edge (e.g., 'API Call', 'Reads from')."),
  animated: z.boolean().optional().default(true).describe("Whether the edge should be animated."),
});

const GenerateDiagramInputSchema = z.object({
  requirements: z.string().describe('The system requirements, as a natural language description.'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  nodes: z.array(NodeSchema).describe("An array of node objects for the diagram."),
  edges: z.array(EdgeSchema).describe("An array of edge objects connecting the nodes."),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  return generateDiagramFlow(input);
}

// Statically define the list of available components for the prompt
const availableComponents = `
- Component Name: "Info Note", Icon Name: "StickyNote"
- Component Name: "Generic Component", Icon Name: "Shapes"
- Component Name: "Web Server", Icon Name: "Server"
- Component Name: "App Server", Icon Name: "ServerCog"
- Component Name: "Serverless Function", Icon Name: "CloudCog"
- Component Name: "Container", Icon Name: "Container"
- Component Name: "Load Balancer", Icon Name: "Shuffle"
- Component Name: "API Gateway", Icon Name: "Waypoints"
- Component Name: "CDN", Icon Name: "Cloud"
- Component Name: "Virtual Network", Icon Name: "Network"
- Component Name: "Database", Icon Name: "Database"
- Component Name: "DB Router/Coordinator", Icon Name: "ServerCog"
- Component Name: "Data Warehouse", Icon Name: "Warehouse"
- Component Name: "Storage (S3/Blob)", Icon Name: "Box"
- Component Name: "Cache", Icon Name: "Zap"
- Component Name: "Message Queue", Icon Name: "GitFork"
- Component Name: "Event Bus", Icon Name: "Spline"
- Component Name: "Firewall", Icon Name: "ShieldCheck"
- Component Name: "Identity Provider", Icon Name: "Fingerprint"
- Component Name: "Monitoring", Icon Name: "BarChartBig"
- Component Name: "Logging System", Icon Name: "ScrollText"
- Component Name: "User Service", Icon Name: "Users"
- Component Name: "Chat Service", Icon Name: "MessageSquare"
- Component Name: "URL Shortener Service", Icon Name: "Link2"
- Component Name: "Client Device", Icon Name: "Smartphone"
- Component Name: "External API", Icon Name: "Globe"
- Component Name: "CI/CD Pipeline", Icon Name: "Workflow"
`;

const prompt = ai.definePrompt({
  name: 'generateDiagramPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: GenerateDiagramInputSchema},
  output: {schema: GenerateDiagramOutputSchema},
  prompt: `You are an expert system architect. Your task is to generate a complete system design diagram in a structured JSON format based on the provided requirements. The diagram will be rendered using ReactFlow.

Follow these instructions precisely:
1.  **Analyze Requirements**: Carefully read the user's requirements to understand the core components, their relationships, and data flow.
2.  **Select Components**: Choose the most appropriate components from the available list below. You MUST use the exact "Component Name" for the 'label' and the corresponding "Icon Name" for the 'iconName' in each node's data object.
3.  **Create Nodes**:
    *   For each component in your design, create a node object.
    *   Each node MUST have a unique 'id' (e.g., "web-server-1", "user-db").
    *   The 'type' MUST always be "custom".
    *   The 'data.label' should be the component's name (e.g., "Web Server", "Database").
    *   The 'data.iconName' MUST match the icon from the available components list.
    *   The 'data.properties' object should be populated with sensible defaults. Crucially, it must include a 'name' property that is identical to the 'data.label'.
    *   The 'position' object must have 'x' and 'y' coordinates. Arrange the nodes logically on a 2D canvas (e.g., top-to-bottom, left-to-right flow). Spread them out to avoid overlap (e.g., use increments of 200-250 for x and y). A good starting point is around {x: 50, y: 50}.
4.  **Create Edges**:
    *   For each connection between components, create an edge object.
    *   Each edge MUST have a unique 'id', a 'source' (the ID of the starting node), and a 'target' (the ID of the ending node).
    *   Optionally, add a 'label' to the edge to describe the interaction (e.g., "API Call", "Replicates data", "Sends events to").
    *   Set 'animated' to true for a better visual effect.
5.  **JSON Output**: The final output MUST be a single JSON object with two top-level keys: "nodes" and "edges", containing the arrays of the objects you created.

**Available Components:**
${availableComponents}

**User Requirements:**
{{{requirements}}}

**IMPORTANT**: Generate a complete and valid JSON output that strictly adheres to the schema.
`,
});


const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: GenerateDiagramInputSchema,
    outputSchema: GenerateDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a diagram.');
    }
    // Post-process to ensure edges have the required style properties for react-flow
    const styledEdges = output.edges.map(edge => ({
      ...edge,
      style: { strokeWidth: 2, stroke: 'hsl(var(--accent))' },
      markerEnd: { type: 'arrowclosed', color: 'hsl(var(--accent))' },
    }));

    return { ...output, edges: styledEdges };
  }
);
