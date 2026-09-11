// Standalone Gemini key diagnostic — run with: node test-gemini.mjs
// This bypasses Express, Vite, React, and Supabase entirely. It only
// checks: (1) is GEMINI_API_KEY actually being read from .env.local, and
// (2) does Gemini accept it. If this script works but the app doesn't,
// the problem is somewhere in the app's request path, not the key.

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { GoogleGenAI } from '@google/genai';

const key =
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GEMINI_KEY ||
  process.env.API_KEY;

console.log('--- Gemini key diagnostic ---');
console.log('Key found:', key ? `yes (starts with "${key.slice(0, 6)}...", length ${key.length})` : 'NO — nothing was read from .env.local');

if (!key) {
  console.log('\n=> GEMINI_API_KEY is not being loaded. Open .env.local and check:');
  console.log('   - The line reads exactly:  GEMINI_API_KEY="your-key-here"');
  console.log('   - No stray characters, missing quotes, or the line got merged with another one');
  console.log('   - There is a newline after it (not concatenated with VITE_GA_MEASUREMENT_ID)');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });

try {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say "ok" and nothing else.',
  });
  console.log('\nGemini responded:', response.text);
  console.log('\n=> Key is VALID and working. The problem is elsewhere in the app (see below).');
} catch (err) {
  console.log('\nGemini call FAILED:');
  console.log(err.message || err);
  console.log('\n=> The key itself is rejected. Check quota/billing at https://aistudio.google.com/app/apikey');
}
