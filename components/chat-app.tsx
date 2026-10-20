'use client'

import { useMemo, useState } from 'react'
import { Bot, MessageSquareText, Plus, Search, SendHorizonal, Settings2, Sparkles, ChevronDown, PanelLeftClose, PanelLeftOpen, Copy, ThumbsUp, ThumbsDown, RefreshCcw, Wand2, Mic, Paperclip } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Role = 'user' | 'assistant'

type Message = {
  id: number
  role: Role
  content: string
}

type Chat = {
  id: number
  title: string
  active: boolean
  messages: Message[]
}

const conversationSeed: Chat[] = [
  {
    id: 1,
    title: 'Launch plan',
    active: true,
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'Create a launch strategy for a productivity SaaS product.'
      },
      {
        id: 2,
        role: 'assistant',
        content: `Here’s a lean launch plan you can execute in 30 days:

1. Define the positioning
- Target users: solopreneurs and small teams.
- Promise: reduce admin work by 40%.
- Differentiator: AI-powered task orchestration.

2. Build the conversion funnel
- Landing page with clear value proposition
- Free trial or waitlist signup
- Guided onboarding with sample workflows

3. Acquire users
- Launch on X and LinkedIn
- Publish 3 micro-case studies
- Partner with niche communities

4. Optimize retention
- Weekly check-ins
- Usage nudges inside the app
- Feedback loop from early users

If you want, I can turn this into a 90-day roadmap or a landing-page copy draft.`
      }
    ]
  },
  {
    id: 2,
    title: 'Brand concept',
    active: false,
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'Give me 3 brand directions for a modern fintech app.'
      },
      {
        id: 2,
        role: 'assistant',
        content: 'Here are three concept directions: ...'
      }
    ]
  },
  {
    id: 3,
    title: 'Marketing copy',
    active: false,
    messages: [
      {
        id: 1,
        role: 'user',
        content: 'Improve the onboarding message for my AI app.'
      },
      {
        id: 2,
        role: 'assistant',
        content: 'I can help refine it for clarity and conversion.'
      }
    ]
  }
]

const modelOptions = ['GPT-4o', 'GPT-4.1', 'Claude 3.5', 'Gemini 2.0']

function generateAssistantReply(prompt: string) {
  const lower = prompt.toLowerCase()

  if (lower.includes('code') || lower.includes('react') || lower.includes('next')) {
    return `Here’s a clean implementation approach:\n\n\n\`\\`tsx\nexport function App() {\n  return <div className="rounded-xl bg-slate-900 p-6 text-white">Hello world</div>\n}\n\
\`
\nThis structure keeps the component simple, readable, and easy to scale. If you want, I can also generate a full layout, component tree, or production-ready version.`
  }

  if (lower.includes('design') || lower.includes('ui') || lower.includes('landing')) {
    return `A good UI direction is to keep the layout minimal and focused:\n\n- Strong headline\n- One primary CTA\n- Clear visual system\n- Enough whitespace to guide attention\n\nThe best-performing pages usually feel calm, confident, and easy to scan.`
  }

  return `Here’s a concise answer based on your prompt:\n\n**Suggestion:** break the task into 3 parts: define the goal, generate options, and validate them with a small test. This keeps the work focused and gives you quick feedback loops.\n\nIf you'd like, I can help expand this into a detailed plan, a short brief, or a polished draft.`
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className={`max-w-[80%] md:max-w-[72%] rounded-2xl px-4 py-3 ${isUser ? 'bg-[#1f2937] text-white' : 'bg-transparent text-slate-100'}`}>
        {!isUser && (
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10a37f] text-[11px] font-semibold text-black">
              AI
            </div>
            Assistant
          </div>
        )}

        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>

        {isUser ? null : (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <button className="rounded-md p-1 transition hover:bg-white/5 hover:text-white"><ThumbsUp className="h-3.5 w-3.5" /></button>
            <button className="rounded-md p-1 transition hover:bg-white/5 hover:text-white"><ThumbsDown className="h-3.5 w-3.5" /></button>
            <button className="rounded-md p-1 transition hover:bg-white/5 hover:text-white"><Copy className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatApp() {
  const [chats, setChats] = useState<Chat[]>(conversationSeed)
  const [activeChatId, setActiveChatId] = useState(1)
  const [draft, setDraft] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedModel, setSelectedModel] = useState(modelOptions[0])

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
    [activeChatId, chats]
  )

  const addNewChat = () => {
    const newChat: Chat = {
      id: Date.now(),
      title: 'New chat',
      active: true,
      messages: []
    }

    setChats((current) => [newChat, ...current.map((chat) => ({ ...chat, active: false }))])
    setActiveChatId(newChat.id)
    setDraft('')
  }

  const handleSend = () => {
    if (!draft.trim()) return

    const prompt = draft.trim()
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: prompt
    }

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      content: generateAssistantReply(prompt)
    }

    setChats((current) =>
      current.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? prompt.slice(0, 30) || 'New chat' : chat.title,
              messages: [...chat.messages, userMessage, assistantMessage]
            }
          : chat
      )
    )

    setDraft('')
  }

  return (
    <div className="flex h-screen bg-[#111827] text-white">
      <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} overflow-hidden border-r border-white/10 bg-[#202123] transition-all duration-200`}>
        <div className="flex h-full flex-col" style={{ width: sidebarOpen ? 280 : 0 }}>
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
            <button
              onClick={addNewChat}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </div>

          <div className="chat-scrollbar flex-1 space-y-2 overflow-y-auto px-2 py-3">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                  chat.id === activeChatId ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <MessageSquareText className="h-4 w-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5">
              <Settings2 className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-hidden bg-[#111827]">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#111827]/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-[#10a37f]" />
              <span>Model</span>
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
                className="bg-transparent pr-1 text-sm text-slate-200 outline-none"
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model} className="bg-slate-900 text-white">
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="chat-scrollbar flex-1 overflow-y-auto px-4 py-6 md:px-10">
          <div className="mx-auto max-w-4xl pt-3">
            {activeChat?.messages.length ? (
              activeChat.messages.map((message) => <MessageBubble key={message.id} message={message} />)
            ) : (
              <div className="flex h-[60vh] items-center justify-center text-center text-slate-400">
                <div>
                  <Bot className="mx-auto mb-4 h-12 w-12 text-[#10a37f]" />
                  <p className="text-lg font-medium text-white">Start a new conversation</p>
                  <p className="mt-2 text-sm">Ask anything and the assistant will respond here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#111827] px-4 pb-5 pt-4 md:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#1f2937] p-3 shadow-soft">
            <div className="mb-3 flex flex-wrap items-center gap-2 px-1 text-xs text-slate-300">
              <button className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10">Ask</button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10">Create</button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10">Summarize</button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10">Brainstorm</button>
            </div>

            <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-[#202123] p-3">
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message ChatGPT..."
                rows={1}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSend()
                  }
                }}
                className="max-h-40 min-h-[52px] flex-1 resize-none border-0 bg-transparent px-2 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="rounded-xl bg-[#10a37f] p-2 text-black transition hover:bg-[#13b98c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendHorizonal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><Search className="h-3.5 w-3.5" /> Web access</span>
                <span className="text-slate-500">•</span>
                <span>{selectedModel}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>May produce inaccurate information</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
