import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

export default function ControlsArea() {
  return (
    <div className={styles.component}>
      <Button variant="primary">Start conversation</Button>
      <Button variant="ghost">End conversation</Button>
    </div>
  );
}
