import { type ReactNode } from 'react';

import Logo from '@/components/Logo';

import styles from './PageHeading.module.css';

export default function PageHeading({ children }: { children: ReactNode }) {
  return (
    <div className={styles.pageHeading}>
      <Logo />
      <div>{children}</div>
    </div>
  );
}
