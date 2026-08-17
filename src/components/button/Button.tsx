import clsx from 'clsx';
import Link from 'next/link';
import { type RefObject, ReactNode } from 'react';

import { LabelWithIcon } from '@/components/icon/Icon';
import { type IconSize } from '@/components/icon/Icon';
import { type IconName } from '@/lib/getIconByName';

import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'feedback';

export interface ButtonProps {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  ref?: RefObject<HTMLButtonElement | null>;
  type?: 'button' | 'submit';
  fontSize?: 'medium' | 'large';
  iconName?: IconName;
  iconSize?: IconSize;
}

export default function Button({
  onClick,
  href,
  children,
  variant = 'primary',
  disabled,
  ref,
  type = 'button',
  fontSize = 'medium',
  iconName,
  iconSize = 24,
}: ButtonProps) {
  if (href) {
    return (
      <Link className={clsx(styles.button, styles[variant])} href={href}>
        {iconName && (
          <LabelWithIcon iconName={iconName} iconSize={iconSize}>
            {children}
          </LabelWithIcon>
        )}
        {!iconName && children}
        {children}
      </Link>
    );
  }
  return (
    <button
      className={clsx(styles.button, styles[variant], styles[`${fontSize}Text`])}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
      type={type}
    >
      {iconName && (
        <LabelWithIcon iconName={iconName} iconSize={iconSize}>
          {children}
        </LabelWithIcon>
      )}
      {!iconName && children}
    </button>
  );
}
