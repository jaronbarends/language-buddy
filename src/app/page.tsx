import { redirect } from 'next/navigation';

import './globals.css';

// import styles from './page.module.css';

export default function HomePage() {
  // redirect to conversation until we get real home page
  redirect('/conversation');

  // return (
  //   <div className={styles.component}>
  //     <main>Home page</main>
  //   </div>
  // );
}
