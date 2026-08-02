import clsx from 'clsx';

import styles from './SpeechBalloon.module.css';

export type SpeechBalloonProps = {
  author: 'ai' | 'user';
  tag: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
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
