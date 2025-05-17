
'use server';
/**
 * @fileOverview An AI interview bot that interacts with the user about their system design.
 *
 * - interviewBot - A function that handles the conversational AI logic.
 * - InterviewBotInput - The input type for the interviewBot function.
 * - InterviewBotOutput - The return type for the interviewBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const InterviewBotInputSchema = z.object({
  diagramJson: z
    .string()
    .describe("The current system design diagram, as a JSON string. This JSON represents an object with 'nodes' and 'edges'. 'nodes' have 'data.label' and 'data.properties'. 'edges' may have 'label'."),
  featureRequirements: z
    .string()
    .describe('The feature requirements for the system being designed, extracted from "Info Note" components on the canvas.'),
  boteCalculations: z
    .string()
    .optional()
    .describe('Any back-of-the-envelope calculations or notes provided by the user, extracted from "Info Note" components on the canvas.'),
  chatHistory: z
    .array(ChatMessageSchema)
    .describe('The history of the conversation so far between the user and the AI bot. Each message has a role ("user" or "model") and content.'),
  currentUserMessage: z
    .string()
    .describe("The user's latest message in the chat."),
});
export type InterviewBotInput = z.infer<typeof InterviewBotInputSchema>;

const InterviewBotOutputSchema = z.object({
  aiResponseMessage: z
    .string()
    .describe("The AI's response message to the user."),
});
export type InterviewBotOutput = z.infer<typeof InterviewBotOutputSchema>;

export async function interviewBot(input: InterviewBotInput): Promise<InterviewBotOutput> {
  return interviewBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewBotPrompt',
  input: {schema: InterviewBotInputSchema},
  output: {schema: InterviewBotOutputSchema},
  // System message instructing the AI about its role and context
  system: `You are an expert system design interviewer. Your role is to help the user practice for a system design interview.
You have been provided with the user's current system design diagram, their feature requirements, and any back-of-the-envelope (BOTE) calculations they've made.
Your primary goal is to:
1. Understand the user's current design based on the diagram, requirements, and BOTE notes.
2. Answer any questions the user has about their design or general system design principles in the context of their problem.
3. Ask probing follow-up questions about their design choices, trade-offs, scalability, availability, fault tolerance, cost, security, etc.
4. Help them identify potential issues or areas for improvement in their design.
5. Maintain a conversational, helpful, and Socratic questioning style. Guide them to think deeper.
6. Refer to the provided 'diagramJson', 'featureRequirements', and 'boteCalculations' to make your questions and answers highly relevant.
7. Use the 'chatHistory' to maintain conversation context and avoid repetition.

Current System Design Context:
Feature Requirements:
{{{featureRequirements}}}

Back-of-the-Envelope Calculations/Notes (if provided):
{{#if boteCalculations}}
{{{boteCalculations}}}
{{else}}
No BOTE calculations provided by the user yet.
{{/if}}

System Design Diagram (JSON representation of nodes and edges):
{{#if diagramJson}}
{{{diagramJson}}}
{{else}}
No diagram provided yet. You can start by asking about the requirements.
{{/if}}
`,
  // The prompt will be a combination of history and the current user message
  prompt: `{{#each chatHistory}}
{{#if (eq role "user")}}User: {{content}}{{/if}}
{{#if (eq role "model")}}AI: {{content}}{{/if}}
{{/each}}
User: {{{currentUserMessage}}}
AI:`,
});


const interviewBotFlow = ai.defineFlow(
  {
    name: 'interviewBotFlow',
    inputSchema: InterviewBotInputSchema,
    outputSchema: InterviewBotOutputSchema,
  },
  async (input) => {
    // Construct the prompt input ensuring all fields are present, even if empty
    const promptInput = {
        diagramJson: input.diagramJson || JSON.stringify({ nodes: [], edges: [] }),
        featureRequirements: input.featureRequirements || "No requirements specified.",
        boteCalculations: input.boteCalculations || "",
        chatHistory: input.chatHistory || [],
        currentUserMessage: input.currentUserMessage
    };
    
    const { output } = await prompt(promptInput);
    if (!output) {
      throw new Error('AI failed to generate a response for the interview bot.');
    }
    return output;
  }
);
