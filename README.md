# AI Chat Experiment

An interactive web app that lets two AI models have a conversation with each other. Watch AI models debate, discuss, and explore topics together in real-time with streaming responses.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **AI-to-AI Conversations** - Select two different AI models and watch them converse on any topic
- **Multiple Models** - Choose from a variety of models including Grok, GPT, Gemini, Llama, Mistral, and more via OpenRouter
- **Real-time Streaming** - See responses stream in character by character
- **Two View Modes**:
  - **Split View** - Side-by-side panels showing each model's perspective
  - **Timeline View** - Unified conversation thread
- **Auto and Manual Modes**:
  - **Auto Mode** - Models automatically take turns responding
  - **Manual Mode** - Press Space to trigger the next response, or type your own message as the current AI

## Getting Started

### Prerequisites

- Node.js 18+ 
- An [OpenRouter](https://openrouter.ai/) API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aichatexp.git
   cd aichatexp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select Models** - Choose an AI model for each side of the conversation (you can edit `models.json` to add/remove models)
2. **Enter a Topic** - Type in what you want the AIs to discuss
3. **Choose Mode** - Toggle between Auto mode (continuous) or Manual mode (space to continue)
4. **Start** - Click the play button and watch the conversation unfold

### Controls

| Action | Control |
|--------|---------|
| Start/Pause | Play/Pause button |
| Next response (Manual mode) | Spacebar |
| Send message as current AI | Type in the message box and press Enter |
| Reset conversation | Reset button |
| Switch view | Split/Timeline toggle |

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **AI Provider**: [OpenRouter](https://openrouter.ai/)
- **Markdown**: react-markdown with remark-gfm

## Project Structure

```
├── app/
│   ├── api/chat/       # API route for OpenRouter proxy
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/
│   ├── chat-interface.tsx   # Main chat component
│   ├── model-selector.tsx   # Model dropdown selector
│   └── ui/                  # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── models.json         # AI models configuration (edit this to add/remove models)
```

## Customizing Models

To add, remove, or modify the available AI models, edit the `models.json` file in the root directory:

```json
{
  "models": [
    { "id": "openai/gpt-4", "name": "GPT-4" },
    { "id": "anthropic/claude-3-opus", "name": "Claude 3 Opus" }
  ]
}
```

- `id`: The OpenRouter model identifier (find models at [openrouter.ai/models](https://openrouter.ai/models))
- `name`: The display name shown in the UI

> **Tip**: Models with `:free` suffix are free to use (with limits) and don't require credits.

## License

MIT License - feel free to use this project however you'd like.
