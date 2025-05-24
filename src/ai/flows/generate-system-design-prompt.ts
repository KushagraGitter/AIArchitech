
// src/ai/flows/generate-system-design-prompt.ts
'use server';

/**
 * @fileOverview A system design prompt generator flow.
 *
 * - generateSystemDesignPrompt - A function that generates a system design prompt.
 * - GenerateSystemDesignPromptInput - The input type for the generateSystemDesignPrompt function.
 * - GenerateSystemDesignPromptOutput - The return type for the generateSystemDesignPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSystemDesignPromptInputSchema = z.object({
  featureRequirements: z
    .string()
    .describe('The feature requirements for the system design.'),
});
export type GenerateSystemDesignPromptInput = z.infer<
  typeof GenerateSystemDesignPromptInputSchema
>;

const GenerateSystemDesignPromptOutputSchema = z.object({
  systemDesignPrompt: z
    .string()
    .describe('The generated system design prompt.'),
});
export type GenerateSystemDesignPromptOutput = z.infer<
  typeof GenerateSystemDesignPromptOutputSchema
>;

export async function generateSystemDesignPrompt(
  input: GenerateSystemDesignPromptInput
): Promise<GenerateSystemDesignPromptOutput> {
  return generateSystemDesignPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSystemDesignPrompt',
  model: 'googleai/gemini-pro', // Explicitly specify the model
  input: {schema: GenerateSystemDesignPromptInputSchema},
  output: {schema: GenerateSystemDesignPromptOutputSchema},
  prompt: `You are a system design expert. Generate a system design prompt based on the following feature requirements:\n\nFeature Requirements: {{{featureRequirements}}}\n\nSystem Design Prompt:`,
});

const generateSystemDesignPromptFlow = ai.defineFlow(
  {
    name: 'generateSystemDesignPromptFlow',
    inputSchema: GenerateSystemDesignPromptInputSchema,
    outputSchema: GenerateSystemDesignPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
