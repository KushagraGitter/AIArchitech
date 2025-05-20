
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Attempt to read the API key from the environment
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
  console.warn(
    'WARNING: GOOGLE_API_KEY environment variable is not set in the Genkit process. The Google AI plugin will likely fail.'
  );
} else {
  console.log(
    'Genkit process found GOOGLE_API_KEY. Length: ',
    googleApiKey.length // Log length to verify it's not empty or just a few characters
  );
  // Avoid logging the full key for security, but confirm it's being read.
  // console.log('First 5 chars of GOOGLE_API_KEY:', googleApiKey.substring(0,5));
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: googleApiKey, // Explicitly pass the key
      model: 'googleai/gemini-pro', // Set default model for the googleAI plugin
      // You can specify API version if needed, e.g., 'v1beta'
      // apiVersion: 'v1beta',
    }),
  ],
  // Removed: model: 'googleai/gemini-pro', as it's better placed in plugin config
});

console.log('Genkit AI object initialized. Default model for googleAI plugin set to gemini-pro.');
// Removed: console.log('Genkit initialized with ai object. Configured model:', ai.getModel().name);
