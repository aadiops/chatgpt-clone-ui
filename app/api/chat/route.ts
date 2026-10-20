'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bot,
  ChevronDown,
  Copy,
  Download,
  Flame,
  Loader2,
  LogOut,
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
  Star,
  SunMedium,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Wand2,
  X,
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

type SessionUser = {
  email: string
  name: string
}

type Settings = {
  model: string
  stream: boolean
  compact: boolean
  darkMode: boolean
  systemPrompt: string
}

const STORAGE_KEY = 'chatgpt-ui-clone-v1'
const SETTINGS_KEY = 'chatgpt-ui-settings-v1'
const DEFAULT_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']
const DEFAULT_SETTINGS: Settings = {
  model: DEFAULT_MODELS[0],
  stream: true,
  compact: false,
  darkMode: true,
  systemPrompt: 'You are a helpful, concise, and creative assistant.',
}

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
- Free trial with onboarding flow
- Email capture and waitlist for early signups

3. Acquire early users
- Launch on X, LinkedIn, and niche communities
- Publish 2 short videos and one case study
- Offer referral bonuses for beta testers

4. Improve retention
- Weekly nudges and onboarding prompts
- Usage analytics and guided check-ins
- Feedback loop from first 50 users

If you want, I can turn this into a 90-day roadmap or landing-page copy.`,
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

The best choice depends on whether you want to position as secure infrastructure or a consumer-facing product.`,
      },
    ],
  },
]

const suggestionPrompts = ['Write a launch announcement', 'Create a landing page draft', 'Explain the product roadmap']

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function MessageBubble({ message, compact }: { message: Message; compact: boolean }) {
  const isUser = message.role === 'user'

  return (
    <div className={`mb-5 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-[#1f2937] text-white' : 'bg-transparent text-slate-100'} ${
          compact ? 'max-w-[86%] md:max-w-[80%]' : 'max-w-[82%] md:max-w-[72%]'
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10a37f] text-[10px] font-semibold text-black">AI</div>
              Assistant
            </div>
            <span>{formatTime(message.createdAt)}</span>
          </div>
        )}

        <div className="prose prose-invert prose-sm max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || ' '}</ReactMarkdown>
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

export default function ChatApp({ user }: { user?: SessionUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [search, setSearch] = useState('')

  const settingsKey = `${SETTINGS_KEY}:${user?.email || 'guest'}`

  useEffect(() => {
    const savedSettings = window.localStorage.getItem(settingsKey)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as Partial<Settings>
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch {
        setSettings(DEFAULT_SETTINGS)
      }
    }
  }, [settingsKey])

  useEffect(() => {
    window.localStorage.setItem(settingsKey, JSON.stringify(settings))
  }, [settings, settingsKey])

  useEffect(() => {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${user?.email || 'guest'}`)
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
  }, [user?.email])

  useEffect(() => {
    if (chats.length > 0) {
      window.localStorage.setItem(`${STORAGE_KEY}:${user?.email || 'guest'}`, JSON.stringify(chats))
    }
  }, [chats, user?.email])

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? null,
    [activeChatId, chats]
  )

  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats
    return chats.filter((chat) => `${chat.title} ${chat.messages.map((m) => m.content).join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  }, [chats, search])

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const appendAssistantChunk = (assistantId: string, chunk: string) => {
    setChats((current) =>
      current.map((chat) => {
        if (chat.id !== activeChatId) return chat

        return {
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === assistantId ? { ...message, content: (message.content || '') + chunk } : message
          ),
        }
      })
    )
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
    const assistantId = crypto.randomUUID()

    setChats((current) =>
      current.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: chat.title === 'New chat' ? userText.slice(0, 32) || 'New chat' : chat.title,
              messages: [
                ...chat.messages,
                newMessage,
                { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
              ],
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
          model: settings.model,
          stream: settings.stream,
          messages: [...existingMessages, newMessage].map(({ role, content }) => ({ role, content })),
          systemPrompt: settings.systemPrompt,
        }),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload?.error || 'Something went wrong while generating a response.')
      }

      if (!settings.stream || !response.body) {
        const payload = await response.json()
        const assistantText = payload.content || 'I did not get a response from the model.'
        setChats((current) =>
          current.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((message) =>
                    message.id === assistantId ? { ...message, content: assistantText } : message
                  ),
                }
              : chat
          )
        )
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        appendAssistantChunk(assistantId, buffer)
        buffer = ''
      }

      const finalChunk = decoder.decode()
      if (finalChunk) {
        appendAssistantChunk(assistantId, finalChunk)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
      setChats((current) =>
        current.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: chat.messages.map((message) =>
                  message.id === assistantId ? { ...message, content: `Error: ${message}` } : message
                ),
              }
            : chat
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex h-screen bg-[#0b1020] text-white">
        <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} overflow-hidden border-r border-white/10 bg-[#111827] transition-all duration-200`}>
          <div className="flex h-full w-[280px] flex-col" aria-label="Chat history sidebar">
            <div className="flex items-center gap-2 border-b border-white/10 p-3">
              <button
                onClick={createNewChat}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                New chat
              </button>
            </div>

            <div className="border-b border-white/10 p-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search chats"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="chat-scrollbar flex-1 space-y-2 overflow-y-auto px-2 py-3">
              {filteredChats.map((chat) => (
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
              <button
                onClick={() => setShowSettings(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
              >
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
                  value={settings.model}
                  onChange={(e) => setSettings((prev) => ({ ...prev, model: e.target.value }))}
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
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" aria-label="Open favorites">
                <Star className="h-4 w-4" />
              </button>
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" aria-label="Open tools">
                <Wand2 className="h-4 w-4" />
              </button>
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" aria-label="Refresh chats">
                <RefreshCcw className="h-4 w-4" />
              </button>
              <div className="hidden rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 md:block">
                {user?.name || 'Guest'}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="chat-scrollbar flex-1 overflow-y-auto px-4 py-6 md:px-10">
            <div className="mx-auto max-w-4xl pt-2">
              {activeChat && activeChat.messages.length > 0 ? (
                activeChat.messages.map((message) => <MessageBubble key={message.id} message={message} compact={settings.compact} />)
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
                  <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> Creative</span>
                  <span className="text-slate-500">•</span>
                  <span>{settings.model}</span>
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

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preferences</p>
                <h2 className="text-xl font-semibold text-white">Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Model</span>
                <select
                  value={settings.model}
                  onChange={(event) => setSettings((prev) => ({ ...prev, model: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-100 outline-none focus:border-[#10a37f]"
                >
                  {DEFAULT_MODELS.map((item) => (
                    <option key={item} value={item} className="bg-slate-900 text-white">
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <label className="flex items-center justify-between gap-4 text-sm text-slate-200">
                  <span>Streaming responses</span>
                  <input
                    type="checkbox"
                    checked={settings.stream}
                    onChange={(event) => setSettings((prev) => ({ ...prev, stream: event.target.checked }))}
                    className="h-4 w-4 accent-[#10a37f]"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <label className="flex items-center justify-between gap-4 text-sm text-slate-200">
                  <span>Compact layout</span>
                  <input
                    type="checkbox"
                    checked={settings.compact}
                    onChange={(event) => setSettings((prev) => ({ ...prev, compact: event.target.checked }))}
                    className="h-4 w-4 accent-[#10a37f]"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <label className="flex items-center justify-between gap-4 text-sm text-slate-200">
                  <span>Dark mode</span>
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(event) => setSettings((prev) => ({ ...prev, darkMode: event.target.checked }))}
                    className="h-4 w-4 accent-[#10a37f]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Assistant behavior</span>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(event) => setSettings((prev) => ({ ...prev, systemPrompt: event.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-[#10a37f]"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-slate-200 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-xl bg-[#10a37f] px-4 py-2.5 font-medium text-black transition hover:bg-[#13b98c]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
