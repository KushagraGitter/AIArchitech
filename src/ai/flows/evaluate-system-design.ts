// The evaluateSystemDesign flow evaluates a system design against given requirements, providing feedback on scalability, availability, fault tolerance, and cost efficiency.
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
    .describe('The system requirements, as a natural language description.'),
  designDiagram: z
    .string()
    .describe('The system design diagram, as a JSON string representing the components and their relationships.'),
});
export type EvaluateSystemDesignInput = z.infer<typeof EvaluateSystemDesignInputSchema>;

const EvaluateSystemDesignOutputSchema = z.object({
  complexity: z.string().describe('The complexity of the system design.'),
  scalability: z.string().describe('The scalability of the system design.'),
  availability: z.string().describe('The availability of the system design.'),
  faultTolerance: z.string().describe('The fault tolerance of the system design.'),
  costEfficiency: z.string().describe('The cost efficiency of the system design.'),
  suggestions: z.string().describe('Suggestions for improving the system design.'),
});
export type EvaluateSystemDesignOutput = z.infer<typeof EvaluateSystemDesignOutputSchema>;

export async function evaluateSystemDesign(input: EvaluateSystemDesignInput): Promise<EvaluateSystemDesignOutput> {
  return evaluateSystemDesignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateSystemDesignPrompt',
  input: {schema: EvaluateSystemDesignInputSchema},
  output: {schema: EvaluateSystemDesignOutputSchema},
  prompt: `You are an expert system architect. You will evaluate a system design based on the given requirements and provide feedback on various aspects.

Requirements: {{{requirements}}}

Design Diagram:
{{#if designDiagram}}{{{designDiagram}}}{{else}}No diagram provided.{{/if}}

Evaluate the design in terms of complexity, scalability, availability, fault tolerance, and cost efficiency. Provide specific suggestions for improvement.

Ensure the output is well-structured and easy to understand.

Complexity: 

Scalability:

Availability:

Fault Tolerance:

Cost Efficiency:

Suggestions: `,
});

const evaluateSystemDesignFlow = ai.defineFlow(
  {
    name: 'evaluateSystemDesignFlow',
    inputSchema: EvaluateSystemDesignInputSchema,
    outputSchema: EvaluateSystemDesignOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
