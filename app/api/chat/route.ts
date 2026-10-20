'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  ChevronDown,
  Copy,
  Loader2,
  MessageSquareText,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Plus,
  RefreshCcw,
  Search,
  SendHorizonal,
  Settings2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Wand2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Role = 'user' | 'assistant'

type Message = {
  id: string
  role: Role
  content: string
  createdAt: string
}

type Chat = {
  id: string
  title: string
  createdAt: string
  messages: Message[]
}

const STORAGE_KEY = 'chatgpt-ui-clone-v1'
const DEFAULT_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']

const starterChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Launch strategy',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 'm-1',
        role: 'user',
        createdAt: new Date().toISOString(),
        content: 'Create a launch plan for a productivity app.',
      },
      {
        id: 'm-2',
        role: 'assistant',
        createdAt: new Date().toISOString(),
        content: `Here’s a strong 30-day launch plan:

1. Define the value proposition
- Target: solo founders and small teams
- Promise: save 5+ hours a week
- Differentiator: AI-assisted workflow automation

2. Build the funnel
- Landing page with a clear headline and CTA
- Free trial with a guided onboarding flow
- Email capture and waitlist for early users

3. Acquire early users
- Launch on X, LinkedIn, and product communities
- Publish one case study and two short demo videos
- Offer referral bonuses

4. Improve retention
- Weekly nudges and onboarding check-ins
- Usage analytics and in-app guidance
- Feedback loop from the first 50 users

If you want, I can convert this into a detailed 90-day roadmap or landing-page copy.`,
      },
    ],
  },
  {
    id: 'chat-2',
    title: 'Brand ideas',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: 'm-3',
        role: 'user',
        createdAt: new Date().toISOString(),
        content: 'Give me 3 brand directions for a modern fintech app.',
      },
      {
        id: 'm-4',
        role: 'assistant',
        createdAt: new Date().toISOString(),
        content: `Here are three strong options:

- Trust-first: clean, secure, transparent
- Lifestyle-driven: premium and frictionless
- Builder-focused: fast, intelligent, action-oriented

The best choice depends on whether you want to position as secure infrastructure or a consumer-friendly tool.`,
      },
    ],
  },
]

const suggestionPrompts = ['Write a launch announcement', 'Create a landing page draft', 'Explain the product roadmap']

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`mb-5 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 md:max-w-[72%] ${isUser ? 'bg-[#1f2937] text-white' : 'bg-transparent text-slate-100'}`}>
        {!isUser && (
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10a37f] text-[10px] font-semibold text-black">AI</div>
            Assistant
          </div>
        )}

        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>

        {!isUser && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <button className="rounded-md p-1 transition hover:bg-white/5 hover:text-white" aria-label="Like response">
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-md p-1 transition hover:bg-white/5 hover:text-white" aria-label="Dislike response">
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-md p-1 transition hover:bg-white/5 hover:text-white" aria-label="Copy response">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [model, setModel] = useState(DEFAULT_MODELS[0])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Chat[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChats(parsed)
          setActiveChatId(parsed[0].id)
          return
        }
      } catch {
        // ignore invalid cache and continue
      }
    }

    setChats(starterChats)
    setActiveChatId(starterChats[0].id)
  }, [])

  useEffect(() => {
    if (chats.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    }
  }, [chats])

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? null,
    [activeChatId, chats]
  )

  const createNewChat = () => {
    const id = crypto.randomUUID()
    const nextChat: Chat = {
      id,
      title: 'New chat',
      createdAt: new Date().toISOString(),
      messages: [],
    }

    setChats((current) => [nextChat, ...current])
    setActiveChatId(id)
    setDraft('')
    setError(null)
  }

  const deleteChat = (chatId: string) => {
    setChats((current) => {
      const remaining = current.filter((chat) => chat.id !== chatId)
      if (remaining.length === 0) {
        const fresh = {
          id: crypto.randomUUID(),
          title: 'New chat',
          createdAt: new Date().toISOString(),
          messages: [],
        }
        setActiveChatId(fresh.id)
        return [fresh]
      }

      if (chatId === activeChatId) {
        setActiveChatId(remaining[0].id)
      }

      return remaining
    })
  }

  const handleSend = async () => {
    if (!draft.trim() || !activeChatId) return

    const userText = draft.trim()
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    }

    const existingMessages = activeChat?.messages ?? []

    setChats((current) =>
      current.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: chat.title === 'New chat' ? userText.slice(0, 32) || 'New chat' : chat.title,
              messages: [...chat.messages, newMessage],
            }
          : chat
      )
    )

    setDraft('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [...existingMessages, newMessage].map(({ role, content }) => ({ role, content })),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Something went wrong while generating a response.')
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: payload.content || 'I did not get a response from the model.',
        createdAt: new Date().toISOString(),
      }

      setChats((current) =>
        current.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, assistantMessage],
              }
            : chat
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#0b1020] text-white">
      <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} overflow-hidden border-r border-white/10 bg-[#111827] transition-all duration-200`}>
        <div className="flex h-full w-[280px] flex-col" aria-label="Chat history sidebar">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
            <button
              onClick={createNewChat}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </div>

          <div className="chat-scrollbar flex-1 space-y-2 overflow-y-auto px-2 py-3">
            {chats.map((chat) => (
              <div key={chat.id} className={`group flex items-center gap-2 rounded-xl ${chat.id === activeChatId ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                <button
                  className="flex flex-1 items-center gap-3 px-3 py-2 text-left text-sm text-slate-200"
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <MessageSquareText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  onClick={() => deleteChat(chat.id)}
                  className="mr-2 rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-white/5 hover:text-white group-hover:opacity-100"
                  aria-label={`Delete ${chat.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
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

      <main className="relative flex flex-1 flex-col overflow-hidden bg-[#0b1020]">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0b1020]/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-[#10a37f]" />
              <span>Model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-transparent pr-1 text-sm text-slate-200 outline-none"
                aria-label="Select model"
              >
                {DEFAULT_MODELS.map((item) => (
                  <option key={item} value={item} className="bg-slate-900 text-white">
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" aria-label="Refresh chats">
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" aria-label="Assistive tools">
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="chat-scrollbar flex-1 overflow-y-auto px-4 py-6 md:px-10">
          <div className="mx-auto max-w-4xl pt-2">
            {activeChat && activeChat.messages.length > 0 ? (
              activeChat.messages.map((message) => <MessageBubble key={message.id} message={message} />)
            ) : (
              <div className="flex h-[60vh] items-center justify-center text-center text-slate-400">
                <div>
                  <Bot className="mx-auto mb-4 h-12 w-12 text-[#10a37f]" />
                  <p className="text-lg font-medium text-white">Start a new conversation</p>
                  <p className="mt-2 text-sm">Ask anything and the assistant will reply here.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="mb-5 flex justify-start">
                <div className="flex items-center gap-3 rounded-2xl bg-transparent px-4 py-3 text-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin text-[#10a37f]" />
                  Thinking…
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0b1020] px-4 pb-5 pt-4 md:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#1f2937] p-3 shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
            <div className="mb-3 flex flex-wrap items-center gap-2 px-1 text-xs text-slate-300">
              {suggestionPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setDraft(prompt)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-[#111827] p-3">
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10" aria-label="Attach file">
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
                    void handleSend()
                  }
                }}
                className="max-h-40 min-h-[52px] flex-1 resize-none border-0 bg-transparent px-2 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10" aria-label="Voice input">
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => void handleSend()}
                  disabled={!draft.trim() || loading}
                  className="rounded-xl bg-[#10a37f] p-2 text-black transition hover:bg-[#13b98c] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <SendHorizonal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><Search className="h-3.5 w-3.5" /> Web access</span>
                <span className="text-slate-500">•</span>
                <span>{model}</span>
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
