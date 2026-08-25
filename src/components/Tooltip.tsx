import { type ReactNode } from 'react';

import styles from './Tooltip.module.css';

export default function Tooltip({ children }: { children: ReactNode }) {
  return <div className={styles.tooltip}>{children}</div>;
}
