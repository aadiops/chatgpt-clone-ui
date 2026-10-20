import { cookies } from 'next/headers'
import ChatApp from '@/components/chat-app'
import LoginPage from '@/components/login-page'
import { getUserFromCookie } from '@/lib/auth'

export default function HomePage() {
  const session = getUserFromCookie(cookies().get('chatgpt_session')?.value)

  if (!session) {
    return <LoginPage />
  }

  return <ChatApp user={session} />
}
