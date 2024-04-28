import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { UserMessage } from './stocks/message'
import Image from 'next/image'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)

  const exampleMessages = [
    {
      heading: 'Transfer',
      icon: 'transfer.png',
      message: `What are the trending memecoins today?`
    },
    {
      heading: 'Check Balance',
      icon: 'balance.png',
      message: 'What is the price of $DOGE right now?'
    },
    {
      heading: 'Exchange ETH',
      icon: 'exchange.png',
      message: `I would like to buy 42 $DOGE`
    },
    {
      heading: 'Action name',
      icon: `action.png`,
      message: `What are some recent events about $DOGE?`
    }
  ]

  return (
    <div className="fixed  text-grey-300 inset-x-0 bottom-0 w-full from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="md:ml-32 lg:ml-56 sm:ml-4 pr-8 max-w-4xl">
        {messages.length === 0 && 
        <div
          style={{ marginBottom: '30rem' }}
          className="grid grid-cols-4 gap-2 px-4 sm:px-0"
        >
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border   bg-slate-400 p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                  index > 1 && 'hidden md:block'
                }`}
                onClick={async () => {
                  setMessages((currentMessages: any) => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>
                    }
                  ])

                  const responseMessage = await submitUserMessage(
                    example.message
                  )

                  setMessages((currentMessages: any) => [
                    ...currentMessages,
                    responseMessage
                  ])
                }}
              >
                <div className="text-2xl font-semibold">{example.heading}</div>
                <Image
                  className="float-right"
                  src={`/${example.icon}`}
                  alt={`${example.icon}`}
                  width={40}
                  height={40}
                />
              </div>
            ))}
        </div>}

        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              {id && title ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <IconShare className="mr-2" />
                    Share
                  </Button>
                  <ChatShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    shareChat={shareChat}
                    chat={{
                      id,
                      title,
                      messages: aiState.messages
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mb-8">
          <PromptForm input={input} setInput={setInput} />
          {/* <FooterText className="hidden sm:block" /> */}
        </div>
      </div>
    </div>
  )
}
