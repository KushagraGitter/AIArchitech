import { generate } from '@genkit-ai/ai';
import { defineFlow, run } from '@genkit-ai/flow';
import * as z from 'zod';

export const generateSystemDesign = flow(
  {
    name: 'generateSystemDesign',
    inputSchema: z.string(),
  },
  async (requirements: string) => {
    const design = await generate({
      model: 'gemini-1.5-flash-latest',
      prompt: `Generate a system design based on the following feature requirements:

${requirements}`,
      config: {
        maxOutputTokens: 2048,
      },
    });

    return design.text();
  }
);



