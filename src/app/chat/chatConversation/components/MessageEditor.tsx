import { useState, useRef, useEffect, type ChangeEvent } from 'react';

import styles from './MessageEditor.module.css';

type MessageEditorProps = {
  initialValue: string;
  onMessageChange: (message: string) => void;
};

export default function MessageEditor({ initialValue, onMessageChange }: MessageEditorProps) {
  const [message, setMessage] = useState<string>(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    moveCaretToEnd();
  });

  return (
    <textarea
      className={styles.editor}
      value={message}
      onChange={handleMessageChange}

      ref={textareaRef}
    ></textarea>
  );

  function handleMessageChange(evt: ChangeEvent<HTMLTextAreaElement>): void {
    setMessage(evt.currentTarget.value);
    onMessageChange(evt.currentTarget.value);
  }

  function moveCaretToEnd() {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const len = textarea.value.length;
    textarea.setSelectionRange(len, len);
    textarea.focus();
  }
}
