import { getChatConfig } from '@/lib/chatConfig';
import { Language } from '@/lib/language';
import { scenarios } from '@/lib/scenarios';

import ChatConversation from './chatConversation/ChatConversation';

export default function ChatContainer() {
  // const language: Language = {
  //   name: 'Norwegian (Bokmål)',
  //   languageTag: 'nb-NO',
  // };
  const language: Language = {
    name: 'Nederlands',
    languageTag: 'nl-NL',
  };
  const scenario = scenarios[0];
  const chatConfig = getChatConfig(language, scenario);

  return <ChatConversation chatConfig={chatConfig} />;
}
