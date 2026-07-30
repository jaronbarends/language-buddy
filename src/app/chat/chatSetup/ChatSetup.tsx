import { useState } from 'react';

import Button from '@/components/button/Button';
import { getChatConfig } from '@/lib/chatConfig';
import { ChatConfig } from '@/lib/chatConfig';
import { type Language } from '@/lib/language';
import { freeformChatWithAIStart, freeformChatWithUserStart, scenarios } from '@/lib/scenarios';

import styles from './ChatSetup.module.css';

type ChatSetupProps = {
  onStartSession: (chatConfig: ChatConfig) => void;
};

type Starter = 'ai' | 'user';

export default function ChatSetup({ onStartSession }: ChatSetupProps) {
  const [starter, setStarter] = useState<Starter>('ai');
  return (
    <div className={styles.setup}>
      <form onSubmit={handleSubmit}>
        <input
          type="radio"
          id="chat-ai-starts"
          value="ai"
          name="starter"
          checked={starter === 'ai'}
          onChange={(event) => {
            setStarter(event.target.value as Starter);
          }}
        />
        <label htmlFor="chat-ai-starts">AI should start</label>

        <input
          type="radio"
          id="chat-user-starts"
          value="user"
          name="starter"
          checked={starter === 'user'}
          onChange={(event) => {
            setStarter(event.target.value as Starter);
          }}
        />
        <label htmlFor="chat-user-starts">I will start</label>
        <div>
          <Button type="submit">Start conversation</Button>
        </div>
      </form>
    </div>
  );

  function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();

    // const language: Language = {
    //   name: 'Norwegian (Bokmål)',
    //   languageTag: 'nb-NO',
    // };
    const language: Language = {
      name: 'Nederlands',
      languageTag: 'nl-NL',
    };

    const scenario = starter === 'ai' ? freeformChatWithAIStart : freeformChatWithUserStart;

    const chatConfig = getChatConfig(language, scenario);

    onStartSession(chatConfig);
  }
}
