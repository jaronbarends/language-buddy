import { getChatConfig } from '@/lib/chatConfig';
import { scenarios } from '@/lib/scenarios';

import ChatClient from './components/ChatClient';

export default function ChatPage() {
  const language = {
    name: 'Norwegian (Bokmål)',
    locale: 'nb_NO',
  };
  const scenario = scenarios[0];
  const chatConfig = getChatConfig(language, scenario);

  return <ChatClient chatConfig={chatConfig} />;
}
