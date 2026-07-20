/**
 * Spike 1 — Gemini scenario-coherence test
 *
 * Manually tests whether gemini-3.5-flash can hold the "hiker" roleplay
 * scenario coherently across 10 conversation turns. Terminal text
 * in/out only — no TTS/STT, no frontend.
 *
 * The system instruction is read from ../docs/scenarios/hiker.md, not
 * hardcoded here — edit that file to change the scenario.
 *
 * Usage:
 *   1. cd gemini-scenario-test
 *   2. npm install
 *   3. Create a .env file in this folder containing:
 *        GEMINI_API_KEY=your-api-key-here
 *   4. node scenario-test.js
 *
 * Type "exit" at any prompt to stop early. Either way, the full
 * transcript is written to a timestamped .md file in this folder
 * when the script ends, for manual pass/fail review.
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import readline from 'node:readline/promises';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const MODEL = 'gemini-3.5-flash';
const MAX_AI_TURNS = 10;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCENARIO_PATH = path.join(__dirname, '..', 'docs', 'scenarios', 'hiker.md');
const SYSTEM_INSTRUCTION = readFileSync(SCENARIO_PATH, 'utf-8');

function timestampForFilename() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function writeTranscript(transcript, endedEarly) {
  const lines = transcript.map((turn) => `**${turn.speaker}:** ${turn.text}`);
  const footer = endedEarly
    ? '_Session ended early — user typed "exit"._'
    : `_Session ended after ${MAX_AI_TURNS} AI turns._`;
  const content = `# Scenario transcript — hiker (${MODEL})\n\n${lines.join('\n\n')}\n\n${footer}\n`;
  const filename = `transcript-${timestampForFilename()}.md`;

  writeFileSync(filename, content);
  console.log(`\nTranscript saved to ${filename}`);
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY. Add it to a .env file in this folder.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: MODEL,
    config: { systemInstruction: SYSTEM_INSTRUCTION },
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const transcript = [];
  let endedEarly = false;

  try {
    for (let aiTurn = 1; aiTurn <= MAX_AI_TURNS; aiTurn++) {
      let messageToSend;

      if (aiTurn === 1) {
        // Kickoff only — triggers the model's opening line per the system
        // instruction. Not a real human turn, so it isn't logged as USER.
        messageToSend = 'Begin the conversation as instructed by the system prompt.';
      } else {
        const userInput = await rl.question('You: ');

        if (userInput.trim().toLowerCase() === 'exit') {
          endedEarly = true;
          break;
        }

        transcript.push({ speaker: 'USER', text: userInput });
        messageToSend = userInput;
      }

      const response = await chat.sendMessage({ message: messageToSend });
      const aiText = response.text;

      console.log(`\nAI: ${aiText}\n`);
      transcript.push({ speaker: 'AI', text: aiText });
    }
  } catch (error) {
    console.error('API call failed:', error);
  } finally {
    rl.close();
    writeTranscript(transcript, endedEarly);
  }
}

main();
