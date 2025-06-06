
// The evaluateSystemDesign flow evaluates a system design against given requirements, providing feedback on scalability, availability, fault tolerance, cost efficiency, security, and maintainability.
//
// - evaluateSystemDesign - A function that evaluates the system design.
// - EvaluateSystemDesignInput - The input type for the evaluateSystemDesign function.
// - EvaluateSystemDesignOutput - The return type for the evaluateSystemDesign function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateSystemDesignInputSchema = z.object({
  requirements: z
    .string()
    .describe('The system requirements, as a natural language description. Include functional and non-functional requirements if available (e.g., target number of users, expected uptime, specific technologies to use/avoid, budget constraints).'),
  designDiagram: z
    .string()
    .describe("The system design diagram, as a JSON string. This JSON should represent an object with two keys: 'nodes' and 'edges'. 'nodes' is an array of objects, each representing a component with properties like id, type (usually 'custom'), position, and data. The 'data' object is crucial and contains 'label' (component name), 'iconName', and 'properties'. The 'data.properties' object holds component-specific configurations (e.g., `instanceType`, `capacity`, `role='primary'|'replica'`, `shardingStrategy`, algorithm for LBs, type for DBs/Caches/Queues which might be from a predefined list like 'PostgreSQL', 'Redis', or 'Kafka'). It can also contain a 'custom' sub-object with user-defined key-value pairs. 'edges' is an array of objects, each representing a connection with properties like id, source, target, and optionally 'label' for the connection type (e.g., 'API Call', 'Data Sync')."),
  backOfTheEnvelopeCalculations: z
    .string()
    .optional()
    .describe('User-provided back-of-the-envelope calculations, assumptions, or capacity planning notes (e.g., QPS, storage per user, DAU, data growth rate, estimated number of servers).'),
});
export type EvaluateSystemDesignInput = z.infer<typeof EvaluateSystemDesignInputSchema>;

const EvaluationCriterionSchema = z.object({
  rating: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Needs Improvement', 'Not Applicable']).describe('The rating for this criterion.'),
  explanation: z.string().describe('Detailed explanation and reasoning for the rating. Highlight specific aspects of the design that led to this rating, considering any relevant `data.properties` of nodes (including those from predefined lists or custom values) or `label` of edges, and referencing user-provided calculations if applicable.'),
  specificRecommendations: z.array(z.string()).optional().describe('Actionable recommendations to improve this specific criterion. Be specific (e.g., "Consider adding a read replica for the primary database (node ID X) to improve read scalability, as indicated by its `role` property being \'primary\' and no replicas connected. User calculation of X QPS reads might justify this.").'),
});

const EvaluateSystemDesignOutputSchema = z.object({
  overallAssessment: z.string().describe('A brief (2-3 sentences) overall summary of the system design evaluation, highlighting the most critical findings, considering requirements and calculations.'),
  complexity: EvaluationCriterionSchema.describe('Evaluation of the system design complexity. Consider factors like number of components, interdependencies, and ease of understanding.'),
  scalability: EvaluationCriterionSchema.describe('Evaluation of the system design scalability. Assess its ability to handle increased load (users, data, transactions) both horizontally and vertically. Consider component `data.properties` (e.g. `instanceType`, `scaling`, `shardingStrategy`, LB `algorithm`, selected DB/Cache/Queue `type`) and user-provided BOTE calculations that might affect this.'),
  availability: EvaluationCriterionSchema.describe('Evaluation of the system design availability and resilience. Consider single points of failure, redundancy, and failover mechanisms. Check for `role` properties (e.g. `primary`, `replica-read`, `replica-failover` for databases) and replication links.'),
  faultTolerance: EvaluationCriterionSchema.describe('Evaluation of the system design fault tolerance. How well does the system withstand and recover from component failures? Consider edge labels if they imply failure modes or node properties for redundancy (e.g. queue `deliveryGuarantee`).'),
  costEfficiency: EvaluationCriterionSchema.describe('Evaluation of the system design cost-efficiency. Consider resource utilization, choice of services (noting any `data.properties` like `instanceType`, `size`, `bucketType`, or selected DB/Cache `type` if provided), and potential for optimization. Refer to user BOTE calculations if they impact cost assumptions.'),
  security: EvaluationCriterionSchema.describe('Evaluation of the system design security. Consider data protection, authentication (e.g. `authType` in API Gateway properties), authorization, network security, and common vulnerabilities. Note edge labels if they imply security boundaries or sensitive data flow. Check Firewall `type` or `ruleset`.'),
  maintainability: EvaluationCriterionSchema.describe('Evaluation of the system design maintainability. Consider ease of updates, debugging, monitoring (e.g. `tool` in Monitoring properties, clear component responsibilities in service `properties`), and operational overhead.'),
  calculationReview: z.string().optional().describe("Brief feedback on the user's back-of-the-envelope calculations, if provided. Comment on their reasonableness, completeness, or any obvious miscalculations in relation to the design and requirements. This is not a full validation, but a sanity check."),
  suggestionsForImprovement: z.array(z.string()).describe('General suggestions for improving the overall system design, particularly those not tied to a single criterion above or cross-cutting concerns.'),
  identifiedStrengths: z.array(z.string()).optional().describe('Key strengths or well-implemented aspects identified in the design.'),
  potentialRisks: z.array(z.string()).optional().describe('Potential risks or critical concerns that need attention, beyond what is covered in individual criteria explanations.'),
});
export type EvaluateSystemDesignOutput = z.infer<typeof EvaluateSystemDesignOutputSchema>;

export async function evaluateSystemDesign(input: EvaluateSystemDesignInput): Promise<EvaluateSystemDesignOutput> {
  return evaluateSystemDesignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateSystemDesignPrompt',
  model: 'googleai/gemini-2.0-flash', // Explicitly specify the model
  input: {schema: EvaluateSystemDesignInputSchema},
  output: {schema: EvaluateSystemDesignOutputSchema},
  prompt: `You are an expert system architect with years of experience designing and reviewing complex, scalable, and resilient systems. Your task is to evaluate a given system design based on the provided requirements, diagram, and any back-of-the-envelope calculations.

System Requirements:
{{{requirements}}}

System Design Diagram (JSON representation of nodes and edges):
{{#if designDiagram}}{{{designDiagram}}}{{else}}No diagram provided. Evaluate based on requirements and calculations only if possible, or state that a diagram is needed for a full evaluation.{{/if}}

Back of the Envelope Calculations / Assumptions by User (if provided):
{{#if backOfTheEnvelopeCalculations}}
{{{backOfTheEnvelopeCalculations}}}
{{else}}No specific calculations provided by the user.{{/if}}

Carefully analyze all provided information.
- The 'nodes' in the diagram have a 'data' object which contains 'label', 'iconName', and a 'properties' object.
- The 'data.properties' object is crucial. It contains component-specific configurations. Some properties might be selected from predefined lists (e.g., Database 'type' like "PostgreSQL", 'role' like "primary" or "replica-read"; Load Balancer 'algorithm' like "Round Robin"). Others are free text (e.g., 'instanceType', 'capacity'). It might also contain a 'custom' sub-object with user-defined key-value pairs. Pay close attention to all these properties when evaluating each criterion. For example, a database node's 'role' or 'shardingStrategy' property directly impacts scalability and availability. An LB's 'algorithm' affects request distribution.
- 'Edges' in the diagram might have a 'label' (e.g., 'API Call', 'Async Event', 'Replicates to'). Use this information to understand the nature of interactions.
- When evaluating criteria like Scalability, Cost Efficiency, and Availability, explicitly reference the user's BOTE calculations if they are relevant to your assessment of that criterion. For instance, if the user calculates a need for 100 web servers, and the diagram shows only 2, address this discrepancy.
- Provide a brief 'calculationReview' if the user supplied BOTE calculations. This should be a sanity check of their assumptions or results in context of the overall design and requirements.

Provide a comprehensive evaluation structured according to the output schema. For each criterion (Complexity, Scalability, Availability, Fault Tolerance, Cost Efficiency, Security, Maintainability), provide a rating, a detailed explanation for that rating (referencing specific node properties, edge labels, and user calculations where relevant), and specific, actionable recommendations for improvement if applicable.

Your evaluation should be constructive, insightful, and practical. Assume the user is looking for guidance to improve their design.

Output Structure:

Overall Assessment: (Provide a brief overall summary here)

Complexity:
  Rating: (Excellent, Good, Fair, Poor, Needs Improvement, Not Applicable)
  Explanation: (Detailed explanation)
  Specific Recommendations: (Array of specific recommendations, if any)

Scalability:
  Rating: (Excellent, Good, Fair, Poor, Needs Improvement, Not Applicable)
  Explanation: (Detailed explanation, mentioning node 'data.properties' like 'scaling', 'shardingStrategy', 'instanceType', LB 'algorithm', selected DB/Cache/Queue 'type', and user BOTE calculations if relevant)
  Specific Recommendations: (Array of specific recommendations, if any)

Availability:
  Rating: (Excellent, Good, Fair, Poor, Needs Improvement, Not Applicable)
  Explanation: (Detailed explanation, mentioning node 'data.properties' like 'role' (e.g. 'primary', 'replica-read') for databases, replication links, and user BOTE calculations if relevant to redundancy needs)
  Specific Recommendations: (Array of specific recommendations, if any)

Fault Tolerance:
  Rating: (Excellent, Good, Fair, Poor, Needs Improvement, Not Applicable)
  Explanation: (Detailed explanation, mentioning edge labels if relevant to failure modes or node properties for redundancy, e.g. queue 'deliveryGuarantee')
  Specific Recommendations: (Array of specific recommendations, if any)

Cost Efficiency:
  Rating: (Excellent, Good, Fair, Poor, Needs Improvement, Not Applicable)
  Explanation: (Detailed explanation, mentioning node 'data.properties' like 'instanceType', 'size', 'bucketType', selected DB/Cache/Queue 'type', and user BOTE calculations if relevant to cost drivers)
  Specific Recommendations: (Array of specific recommendations, if any)

Security:
  Rating: (Excellent, Good, Fair, Poor, Needs Improvement, Not Applicable)
  Explanation: (Detailed explanation, mentioning edge labels if relevant to security zones or data flow, or node 'data.properties' like API Gateway 'authType', Firewall 'type' or 'ruleset')
  Specific Recommendations: (Array of specific recommendations, if any)

Maintainability:
  Rating: (Excellent, Good, Fair, Poor, Needs Improvement, Not Applicable)
  Explanation: (Detailed explanation, mentioning node 'data.properties' like monitoring 'tool', clarity of service responsibilities)
  Specific Recommendations: (Array of specific recommendations, if any)

Calculation Review: (Brief feedback on user's BOTE calculations, if provided. Note reasonableness or potential issues.)

Suggestions For Improvement: (Array of general suggestions)

Identified Strengths: (Array of identified strengths, if any)

Potential Risks: (Array of potential risks, if any)
`,
});

const evaluateSystemDesignFlow = ai.defineFlow(
  {
    name: 'evaluateSystemDesignFlow',
    inputSchema: EvaluateSystemDesignInputSchema,
    outputSchema: EvaluateSystemDesignOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate an evaluation.');
    }
    return output;
  }
);
