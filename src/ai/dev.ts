import { config } from 'dotenv';
config();

import '@/ai/flows/generate-system-design-prompt.ts';
import '@/ai/flows/evaluate-system-design.ts';