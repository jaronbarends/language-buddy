import clsx from 'clsx';
import type { JSX, ReactNode } from 'react';

import styles from './SpeechBalloon.module.css';

export type SpeechBalloonProps = {
  author: 'ai' | 'user';
  tag: keyof JSX.IntrinsicElements;
  children?: ReactNode;
};

export default function SpeechBalloon({ tag: Tag, author, children }: SpeechBalloonProps) {
  const authorClassName = author === 'ai' ? styles.messageFromAi : styles.messageFromUser;
  return (
    <Tag className={clsx(styles.message, authorClassName)}>
      {' '}
      <div className={styles.itemContent}>{children}</div>
    </Tag>
  );
}
