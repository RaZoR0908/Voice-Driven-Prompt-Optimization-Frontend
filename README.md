# Voice Driven Prompt Optimization Engine - Frontend

A modern React-based interface for the voice-driven deterministic prompt optimization system. Converts voice or text input into optimized prompts with real-time intent confirmation, multilingual support, and memory visualization.

## Overview

The frontend provides:

- 🎤 **Voice Input** - Real-time speech-to-text with language detection
- ✏️ **Text Fallback** - Type your prompt if speaking isn't ideal
- 🔍 **Intent Review** - See extracted intent before optimization
- ✨ **Real-time Optimization** - Watch prompts get refined with CAVEMAN MODE
- 📊 **Session History** - View all prompts from current session with decision logs
- 🧠 **Memory Graph** - Visualize knowledge relationships between similar prompts
- 🎯 **Memory Cards** - Browse reusable optimized prompts by session

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **HTTP Client:** Axios
- **Graph Visualization:** D3.js
- **Icons:** Lucide React
- **Linting:** ESLint
- **Build Tool:** Vite

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Backend server running at `http://localhost:8080` (or configured in `.env`)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voice-engine-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For production:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

Output files will be in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
voice-engine-frontend/
├── src/
│   ├── components/           # React components
│   │   ├── DecisionLog.jsx   # Pipeline decision steps
│   │   ├── HistoryList.jsx   # Session chat history
│   │   ├── IntentCard.jsx    # Intent confirmation
│   │   ├── MemoryGraph.jsx   # Knowledge graph visualization
│   │   ├── MicButton.jsx     # Voice recording button
│   │   ├── Navbar.jsx        # Navigation header
│   │   ├── PromptOutput.jsx  # Final optimized prompt display
│   │   └── TextFallback.jsx  # Text input alternative
│   ├── hooks/
│   │   └── useVoiceRecorder.js  # Web Audio API integration
│   ├── lib/
│   │   └── session.js        # Session ID management
│   ├── api/
│   │   └── index.js          # API client configuration
│   ├── pages/
│   │   ├── Home.jsx          # Main chat interface
│   │   ├── History.jsx       # Session history view
│   │   └── Memory.jsx        # Memory graph & cards
│   ├── App.jsx               # Root component
│   ├── index.css             # Global styles
│   └── main.jsx              # Entry point
├── public/
│   └── favicon.svg           # Custom favicon
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
└── package.json              # Dependencies
```

## Key Features

### 1. Voice Input

- **Real-time Recording** - Click microphone to record, click again to stop
- **Live Transcription** - Shows transcript as it's being processed
- **Language Detection** - Automatically detects English, Hindi, or Hinglish
- **Confidence Scoring** - Displays confidence level (High/Medium/Low)
- **Dual Input** - Voice or text input with consistent processing

### 2. Intent Confirmation

The system shows extracted intent before optimization:

```
INTENT: marketing_plan
TASK: Create a marketing plan for a gym app
DOMAIN: marketing
CONSTRAINTS: [under 100 words, include budget]
OUTPUT FORMAT: bullet_list
AUDIENCE: business
```

Edit if needed, then confirm to proceed.

### 3. History View

Shows all interactions in current session with:

- **Original Input** - Raw voice/text in detected language (Hindi/English/Hinglish)
- **Normalized Input** - English translation
- **Optimized Prompt** - Final output after CAVEMAN MODE
- **Language Badges** - Shows detected and normalized languages
- **Token Reduction** - Percentage of tokens saved
- **Decision Logs** - 8-step pipeline with timestamps

### 4. Memory Management

- **Session-Scoped** - Only shows memories from current session
- **Knowledge Graph** - Visualize relationships between similar prompts
- **Memory Cards** - Reusable optimized prompts with usage count
- **Empty State** - Clear message when no memories exist

## Component Reference

### Home Page (`src/pages/Home.jsx`)

Main chat interface with voice recording and prompt optimization.

**States:**
- `IDLE` - Ready for input
- `RECORDING` - Voice recording in progress
- `LOADING_STT` - Processing speech-to-text
- `REVIEW` - Showing extracted intent
- `CONFIRM` - Intent confirmation screen
- `LOADING_LLM` - Optimizing prompt
- `RESULT` - Showing optimized output

**Key Functions:**
- `handleMicClick()` - Start/stop voice recording
- `handleTextSubmit()` - Process text input
- `handleContinueToConfirm()` - Proceed with intent
- `handleConfirm()` - Confirm and optimize
- `resetToIdle()` - Return to start state

### History Page (`src/pages/History.jsx`)

Displays all messages from current session with decision logs.

**Features:**
- Session ID display
- Message filtering by session
- Expandable decision logs
- Language detection display
- Token reduction visualization

### Memory Page (`src/pages/Memory.jsx`)

Shows memory graph and reusable prompt cards.

**Features:**
- Knowledge graph visualization
- Session-scoped memory cards
- Domain-based coloring
- Usage count tracking
- Last updated timestamp

### IntentCard Component (`src/components/IntentCard.jsx`)

Editable intent confirmation interface.

**Editable Fields:**
- Intent
- Task
- Domain
- Constraints
- Output Format
- Audience

**Validation:**
- Language error detection
- Constraint management
- Format preservation

## API Integration

### Voice Input Processing

```javascript
const response = await submitVoice(formData);
// Returns: { transcript, language, confidence, intentJson }
```

### Prompt Generation

```javascript
const response = await generatePrompt(payload, sessionId);
// Returns: { optimizedPrompt, tokenInput, tokenOutput, reductionPct }
```

### Session History

```javascript
const response = await getHistory(sessionId);
// Returns: Array of messages with metadata
```

### Memory Management

```javascript
const cardResponse = await getMemoryCards(sessionId);
// Returns: Array of memory cards for session

const graphResponse = await getMemoryGraph();
// Returns: { nodes: [], edges: [] }
```

### Decision Logs

```javascript
const logsResponse = await getDecisionLogs(messageId);
// Returns: Array of pipeline decision steps
```

## Usage Examples

### Example 1: Voice Input (Hindi)

1. Click microphone button
2. Say: "मुझे एक जिम के लिए मार्केटिंग आइडिया बताओ"
3. System detects Hindi and shows translation
4. Review extracted intent
5. Click CONFIRM
6. Get optimized prompt: "Create marketing ideas for a gym app."

### Example 2: Text Input

1. Click text fallback input
2. Type: "write me a python script for data analysis"
3. System shows extracted intent
4. Click CONFIRM
5. Get optimized prompt with code format

### Example 3: View History

1. Navigate to History page
2. See all prompts from current session
3. Click "View Decision Log" to see pipeline steps
4. See language detection (Original vs Normalized)
5. Check token reduction percentage

### Example 4: Memory Exploration

1. Navigate to Memory page
2. View knowledge graph of related prompts
3. Browse memory cards by domain
4. See reuse count for similar prompts

## Styling

The application uses a dark theme with accent colors:

- **Primary Brand Color:** `#ff2d78` (Pink)
- **Secondary Accent:** `#00d9ff` (Cyan)
- **Success Color:** `#00d084` (Green)
- **Warning Color:** `#ffc000` (Amber)
- **Danger Color:** `#ff3b30` (Red)
- **Background:** `#0a0a0f` (Dark)
- **Surface:** `#16151f` (Dark Gray)

Tailwind CSS configuration in `tailwind.config.js`

## Development

### Start Development Server

```bash
npm run dev
```

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run lint -- --fix
```

### Build for Production

```bash
npm run build
```

## Session Management

Sessions are automatically created and persisted:

```javascript
// Session ID is stored in localStorage
const sessionId = getOrCreateSessionId();
// Format: UUID v4
// Example: "0be96da0-9bf0-4383-af57-c52aa2e6db40"
```

All API requests include the session ID for proper filtering and context.

## Voice Recording

Uses the Web Audio API for recording:

```javascript
// useVoiceRecorder hook handles:
- MediaRecorder API
- Audio format conversion
- Blob generation
- WebM codec support
```

Requires HTTPS in production (or localhost for development).

## Browser Compatibility

- Chrome 88+
- Firefox 87+
- Safari 14.1+
- Edge 88+

Required APIs:
- Web Audio API
- MediaRecorder API
- LocalStorage API

## Performance Optimization

- **Code Splitting** - Lazy loading of pages
- **Image Optimization** - SVG favicon
- **Bundle Size** - Tree shaking via Vite
- **Caching** - Session data in localStorage
- **API Optimization** - Batch requests where possible

## Troubleshooting

### Microphone Not Working
- Check browser permissions
- Ensure HTTPS (or localhost) is used
- Verify browser supports Web Audio API
- Check browser console for errors

### Backend Connection Failed
- Verify `VITE_API_BASE_URL` is correct in `.env`
- Check backend server is running on port 8080
- Check CORS headers from backend
- Verify network connectivity

### Session Not Persisting
- Check localStorage is enabled
- Check browser privacy settings
- Verify session ID is being generated
- Check browser console for localStorage errors

### Memory Page Empty
- Ensure chat interactions exist in current session
- Check session ID is correct
- Verify backend is storing memories
- Check for API errors in browser console

## Contributing

Follow the existing code structure:
- Keep components focused and single-responsibility
- Use functional components with hooks
- Maintain consistent styling with Tailwind CSS
- Use meaningful variable and function names
- Add comments for complex logic

## Deployment

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

Environment variables in `vercel.json`:
```json
{
  "env": {
    "VITE_API_BASE_URL": "@api_base_url"
  }
}
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Support

For issues or questions, refer to the main project README or contact the developer
