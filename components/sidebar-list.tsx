import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache, useEffect } from 'react'
import Image from 'next/image'
import { start } from 'repl'
import { CiSettings } from 'react-icons/ci'
import LoginWallet from './login-wallet'
// import { useWalletSelector } from './contexts/WalletSelectorContext'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => {
  return await getChats(userId)
})

export async function SidebarList({ userId }: SidebarListProps) {
  const chats = (await loadChats(userId)) || []
  // const { accounts } = useWalletSelector()
  // console.log(accounts)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex p-4 pt-0 justify-between items-center">
        {/* <button className="h-10 w-full justify-center bg-sky-500 text-white px-4 shadow-none rounded-3xl border-none transition-colors hover:bg-red-500/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10">
          Sign in
        </button> */}
        <LoginWallet />
        {/* <div className="flex items-center p-4 truncate gap-3">
          <Image src="/user.png" width={35} height={35} alt="user" />{' '}
          <p>{userId}</p>
        </div>
        <CiSettings size={35} /> */}
      </div>
      {/* <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />
      </div> */}
    </div>
  )
}
