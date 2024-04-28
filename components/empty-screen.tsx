import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  }
]

export function EmptyScreen() {
  return (
    <div className="lg:ml-56 md:32 sm:ml-4 max-w-4xl px-8">
      <div className="flex flex-col gap-2 bg-background p-8">
        <h1 className="font-semibold text-5xl text-red-300/75 pb-3">
          Hello!
        </h1>
        <h2 className=" text-3xl font-semibold text-gray-400">
          {/* How can I help you today? */}
        </h2>
      </div>
    </div>
  )
}
