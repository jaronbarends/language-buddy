import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { type IconName } from '@/lib/getIconByName';

import Icon from './icon/Icon';

import styles from './Feedback.module.css';

type FeedbackType = 'error' | 'info'; /* add 'warning', 'info', 'success' when needed */

export type FeedbackProps = {
  children: ReactNode;
  type: FeedbackType;
};

const feedbackIconNames: Record<FeedbackType, IconName> = {
  error: 'error',
  info: 'info',
};

export default function Feedback({ type, children }: FeedbackProps) {
  const iconName = feedbackIconNames[type];
  return (
    <div className={clsx(styles.feedback, styles[type])}>
      <Icon iconName={iconName} size={24} />
      <div>{children}</div>
    </div>
  );
}
