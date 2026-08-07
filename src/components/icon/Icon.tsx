import clsx from 'clsx';

import { ICONS, type IconName } from '@/lib/getIconByName';

import styles from './Icon.module.css';

type IconSize = 16 | 24 | 32;

interface Props {
  iconName: IconName;
  size?: IconSize;
  isFlagIcon?: boolean;
}
export default function Icon({ iconName, size, isFlagIcon }: Props) {
  const IconComponent = ICONS[iconName];
  const sizeStyle = size ? ({ '--icon-size': `var(--size-${size})` } as React.CSSProperties) : {};

  return (
    <div className={clsx(styles.icon, isFlagIcon ? styles.flagIcon : '')} style={sizeStyle}>
      <IconComponent />
    </div>
  );
}
