import Icon from './icon/Icon';

import styles from './Logo.module.css';

export default function Logo() {
  // return <div className={styles.logoOld}> </div>;
  return (
    <div className={styles.logo}>
      <div className={styles.balloon}>
        <Icon iconName="evaluation" />
      </div>
      <div className={styles.arrow} />
    </div>
  );
}
