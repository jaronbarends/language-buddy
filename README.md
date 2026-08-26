# Language buddy

An AI conversation tool to practice speaking in another language. Practicing is in the form of a chat, where the user's speech is transformed to text with `SpeechRecognition`; AI's response is transformed to speech with `SpeechSynthesis`.

Can handle multiple languages and levels of proficiency.

## Tech stack

|                         |                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Next.js 15 (App Router) | Framework — chosen deliberately for learning purposes, rather than reach for a simpler SPA setup |
| TypeScript              |                                                                                                  |
| Gemini API              | AI provider                                                                                      |
| Vercel                  | Hosting                                                                                          |

## Setup

Create `.env.local`. (The public vars are for dev purposes only)

```env
GEMINI_API_KEY=

# NEXT_PUBLIC_USE_MOCK_AI=true
# NEXT_PUBLIC_DISABLE_AI_SPEECH=true
# NEXT_PUBLIC_INITIAL_LANGUAGE_DUTCH=true
# NEXT_PUBLIC_SHOW_DEV_HELPER=true
```

## Getting Started ## Getting Started

Install dependencies:

```bash
npm install
```

First, run the development server:

```bash
npm run dev
```

### Testing on mobile

```bash
ngrok http 3000
```

[ngrok quickstart](https://ngrok.com/docs/getting-started)

---

## Troubleshooting

### "Speech recognition service permission check has failed" on iOs

If you get the error "Speech recognition service permission check has failed" on iOs: Settings → Privacy & Security → Speech Recognition — is Safari toggled on there?

### Unsupported SpeechSynthesis voices

The languages supported for Text To Speech varies per computer and per browser.
When you do `speechSynthesis.getVoices()`, you'll get the list of possible voices.

#### Add Voices on Windows

- Open the Start Menu and go to Settings.
- Click on Time & Language, then select Speech.
- Look for Manage voices and click the Add voices button.
- Search for the language or voice pack you want, select it, and click Add.
- Restart your browser to load the new voices into `window.speechSynthesis`

#### Add Voices on macOS

(Not tested)

- Open the Apple Menu and go to System Settings.
- Click on Accessibility, then select Read & Speak.
- Click the Info (ⓘ) button next to System voice.
- Download and check the specific voice or language pack you want to install.
- Restart your browser so the web page can detect the updated list.

On older macOS versions, this setting is under Accessibility → Spoken Content, with a Manage/Customise dropdown next to System voice instead.
