import { type Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/app/globals.css';
import Header from '@/components/Header';

import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Language buddy',
  description: 'An AI conversation buddy for practising a foreign language',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className={styles.wrapper}>
          <Header />
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
