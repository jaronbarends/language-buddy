import { type ReactNode } from 'react';

import Logo from './Logo';

import styles from './PageHeading.module.css';

export default function PageHeading({ children }: { children: ReactNode }) {
  return (
    <div className={styles.pageHeading}>
      {/* <div className={styles.logo}></div> */}
      <Logo />
      <div>{children}</div>
    </div>
  );
}
