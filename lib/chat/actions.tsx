import 'server-only';

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue,
} from 'ai/rsc';
import OpenAI from 'openai';
import { TransferToken } from '../../components/TransferTokenClient';
import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
} from '@/components/stocks';

import { z } from 'zod';
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid,
} from '@/lib/utils';
import { saveChat } from '@/app/actions';
import { SpinnerMessage, UserMessage } from '@/components/stocks/message';
import { Chat } from '@/lib/types';
import { auth } from '@/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
   // @ts-ignore 
async function submitUserMessage(content: string) {
  'use server';
   // @ts-ignore 
  const aiState = getMutableAIState<typeof AI>();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content,
      },
    ],
  });

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;
   // @ts-ignore 
  const ui = render({
    model: 'gpt-3.5-turbo',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: `\
You are a token transfer conversation bot, and you can help users transfer tokens from their wallet to another wallet.
You and the user can discuss the token, amount, and receiver's address. The user can initiate the transfer in the UI.

Messages inside [] means that it's a UI element or a user event. For example:
- "[User has entered the receiver address 0x1234...]" means that the user has entered the receiver's address in the UI.

If the user requests a token transfer, call \`create_transfer_payload\` to create the transfer payload.
If the user doesn't specify the token symbol, ask them to provide it. Only ask for the symbol if it's not already present in the user's message.

Besides that, you can also chat with users and provide information about token transfers if needed.`,
      },
      // @ts-ignore 
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name,
      })),
      ...(!content.includes('ETH') && !content.includes('USDT') && !content.includes('USDC')
        ? [
            {
              role: 'assistant',
              content: 'Sure, before we proceed, could you please provide me with the token symbol?',
            },
          ]
        : []),
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('');
        textNode = <BotMessage content={textStream.value} />;
      }

      if (done) {
        textStream.done();
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content,
            },
          ],
        });
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    functions: {
      createTransferPayload: {
        description: 'Create a payload for transferring tokens',
        parameters: z.object({
          receiverId: z.string().describe('The wallet address of the receiver'),
          amount: z.string().describe('The amount of tokens to transfer'),
          symbol: z.string().describe('The symbol of the token to transfer'),
        }),
        render: async function* ({ receiverId, amount, symbol }) {
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'createTransferPayload',
                content: JSON.stringify({ receiverId, amount, symbol }),
              },
            ],
          });

          return (
            <BotCard>
              <div className="text-black">
                <p>Receiver: {receiverId}</p>
                <p>Amount: {amount}</p>
                <p>Symbol: {symbol}</p>
              </div>
              {/* @ts-ignore  */}
              <TransferToken payload={{ receiverId, amount, symbol }} />
            </BotCard>
          );
        },
      },
    },
  });

  return {
    id: nanoid(),
    display: ui,
  };
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  content: string;
  id: string;
  name?: string;
};

export type AIState = {
  chatId: string;
  messages: Message[];
};

export type UIState = {
  id: string;
  display: React.ReactNode;
}[];
   // @ts-ignore 
export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
     // @ts-ignore 
  unstable_onGetUIState: async () => {
    'use server';

    const session = await auth();

    if (session && session.user) {
      const aiState = getAIState();

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState);
        return uiState;
      }
    } else {
      return;
    }
  },
      // @ts-ignore 
  unstable_onSetAIState: async ({ state, done }) => {
    'use server';

    const session = await auth();

    if (session && session.user) {
      const { chatId, messages } = state;

      const createdAt = new Date();
      const userId = session.user.id as string;
      const path = `/chat/${chatId}`;
      const title = messages[0].content.substring(0, 100);

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path,
      };

      await saveChat(chat);
    } else {
      return;
    }
  },
});

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter((message) => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'function'
          ? message.name === 'createTransferPayload'
            ? (
                <BotCard>
                  <div>
                    <p>Receiver: {JSON.parse(message.content).receiverId}</p>
                    <p>Amount: {JSON.parse(message.content).amount}</p>
                    <p>Symbol: {JSON.parse(message.content).symbol}</p>
                  </div>
                </BotCard>
              )
            : null
          : message.role === 'user'
          ? <UserMessage>{message.content}</UserMessage>
          : <BotMessage content={message.content} />,
    }));
};