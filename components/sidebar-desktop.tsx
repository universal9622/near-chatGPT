'use client'

import { Sidebar } from '@/components/sidebar'

import { ChatHistory } from '@/components/chat-history'
import { useWalletSelector } from './contexts/WalletSelectorContext'
export function SidebarDesktop() {
  // if (!session?.user?.id) {
  //   return null
  // }
  const { selector, modal, accounts } = useWalletSelector();
  const accountId = accounts.find((account) => account.active)?.accountId;
  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      <ChatHistory userId={accountId && accountId} />
    </Sidebar>
  )
}
