import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import Icon from './icon/Icon';

import styles from './Feedback.module.css';

export type FeedbackProps = {
  children: ReactNode;
  type: 'error'; /* add 'warning', 'info', 'success' when needed */
};

export default function Feedback({ type, children }: FeedbackProps) {
  return (
    <div className={clsx(styles.feedback, styles[type])}>
      <Icon iconName="error" size={24} />
      {children}
    </div>
  );
}
