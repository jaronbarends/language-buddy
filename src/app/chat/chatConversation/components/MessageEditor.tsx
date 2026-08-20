import { useRef, useEffect, type InputEvent } from 'react';

import styles from './MessageEditor.module.css';

type MessageEditorProps = {
  initialValue: string;
  onMessageChange: (message: string) => void;
};

export default function MessageEditor({ initialValue, onMessageChange }: MessageEditorProps) {
  const editorElmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initEditor();
    // run once on mount; parent remounts this component via `key` when the userMessage changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /* use div instead of textarea to make sure we get same styling */
    <div
      className={styles.editor}
      onInput={handleMessageChange}
      contentEditable
      ref={editorElmRef}
    />
  );

  function handleMessageChange(evt: InputEvent<HTMLDivElement>): void {
    onMessageChange(evt.currentTarget.textContent);
  }

  function initEditor() {
    const editorElm = editorElmRef.current;
    if (!editorElm) {
      return;
    }
    editorElm.textContent = initialValue;
    onMessageChange(initialValue);
    moveCaretToEnd();
  }

  function moveCaretToEnd() {
    const editorElm = editorElmRef.current;
    if (!editorElm) {
      return;
    }
    window?.getSelection()?.selectAllChildren(editorElm);
    window?.getSelection()?.collapseToEnd();
    // editorElm.focus();
  }
}
