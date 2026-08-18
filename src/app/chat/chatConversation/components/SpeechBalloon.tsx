import clsx from 'clsx';
import type { JSX, ReactNode } from 'react';

import Loader from '@/components/Loader';

import styles from './SpeechBalloon.module.css';

export type SpeechBalloonProps = {
  author: 'ai' | 'user';
  tag: keyof JSX.IntrinsicElements;
  isPending?: boolean;
  children?: ReactNode;
};

export default function SpeechBalloon({
  tag: Tag,
  author,
  isPending,
  children,
}: SpeechBalloonProps) {
  const authorClassName = author === 'ai' ? styles.messageFromAi : styles.messageFromUser;
  return (
    <Tag className={clsx(styles.message, authorClassName, isPending && styles.isPending)}>
      {isPending ?
        <Loader ariaLabel="Loading ai response" />
      : <span className={styles.messageContent}>{children}</span>}
    </Tag>
  );
}
