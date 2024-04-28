'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useAIState, useActions, useUIState } from 'ai/rsc'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { type AI } from '@/lib/chat/actions'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { FaAngleUp } from 'react-icons/fa6'
import { UserMessage } from './stocks/message'
import Image from 'next/image'
import { IconPlus } from './ui/icons'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  // const [_, setMessages] = useUIState<typeof AI>()
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
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

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        // Optimistically add user message UI
        setMessages((currentMessages: any) => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          }
        ])

        // Submit and get response message
        const responseMessage = await submitUserMessage(value)
        setMessages((currentMessages: any) => [
          ...currentMessages,
          responseMessage
        ])
      }}
    >
      <div className="relative flex max-h-60 max-w-full grow flex-col overflow-x-auto pr-8 pl-4 bg-gray-200 sm:rounded-2xl sm:border sm:pr-12 sm:pl-4">
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 ms-7 sm:left-4"
              onClick={() => {
                router.push('/new')
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip> */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none pr-4 py-[1.3rem] bg-gray-200 focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <Image
                  src="/sendMSG.png"
                  alt="sendMSG"
                  width={40}
                  height={40}
                />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>How can I help you?</TooltipContent>
          </Tooltip>
        </div>
        <div className="w-full bg-black" style={{ height: '1px' }}></div>
        <div className="flex justify-start max-w-full py-4 overflow-x-auto gap-3">
          <div className="flex gap-1 items-center">
            <Image src={'/intent.png'} alt="intent" width={24} height={24} />
            Intent
          </div>
          {exampleMessages.map((example, index) => (
            <div
              key={example.heading}
              className={`h-8 flex items-center gap-2 px-4 py-1 rounded-xl bg-slate-400`}
              onClick={async () => {
                setMessages((currentMessages: any) => [
                  ...currentMessages,
                  {
                    id: nanoid(),
                    display: <UserMessage>{example.message}</UserMessage>
                  }
                ])

                const responseMessage = await submitUserMessage(example.message)

                setMessages((currentMessages: any) => [
                  ...currentMessages,
                  responseMessage
                ])
              }}
            >
              <Image
                src={`/${example.icon}`}
                alt={`${example.icon}`}
                width={24}
                height={24}
              />
              <div className="text-lg font-semibold text-nowrap">
                {example.heading}
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
