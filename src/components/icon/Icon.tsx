import clsx from 'clsx';
import { type ReactNode } from 'react';

import { ICONS, type IconName } from '@/lib/getIconByName';

import styles from './Icon.module.css';

export type IconSize = 16 | 24 | 32;

interface IconProps {
  iconName: IconName;
  iconSize?: IconSize;
  isFlagIcon?: boolean;
  ariaLabel?: string;
}
export default function Icon({ iconName, iconSize, isFlagIcon, ariaLabel }: IconProps) {
  const IconComponent = ICONS[iconName];
  const sizeStyle =
    iconSize ? ({ '--icon-size': `var(--size-${iconSize})` } as React.CSSProperties) : {};

  return (
    <div
      className={clsx(styles.icon, isFlagIcon ? styles.flagIcon : '')}
      style={sizeStyle}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      <IconComponent />
    </div>
  );
}

type LabelWithIconProps = IconProps & {
  children: ReactNode;
};

export function LabelWithIcon({ children, ...iconProps }: LabelWithIconProps) {
  return (
    <div className={styles.labelWithIcon}>
      <Icon {...iconProps} />
      <div>{children}</div>
    </div>
  );
}
