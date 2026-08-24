import LogoSVG from '@/assets/logo.svg';

import styles from './Logo.module.css';

export default function Logo() {
  return (
    <div className={styles.logo}>
      <LogoSVG />
    </div>
  );
}
