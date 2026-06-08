import {
  useState,
} from 'react';

export type ChatMessage = {
  id: string;

  role:
    | 'user'
    | 'coach';

  message: string;
};

const initialMessages: ChatMessage[] =
  [
    {
      id: 'welcome-1',

      role: 'coach',

      message:
        'Hey 👋 I’m Neo. Tell me about your day.',
    },
  ];

export default function useChatMessages() {
  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    initialMessages,
  );

  const addMessage = (
    role:
      | 'user'
      | 'coach',

    message: string,
  ) => {
    const uniqueId =
      `${Date.now()}-${Math.random()}`;

    setMessages(prev => [
      ...prev,

      {
        id: uniqueId,

        role,

        message,
      },
    ]);
  };

  return {
    messages,

    addMessage,
  };
}