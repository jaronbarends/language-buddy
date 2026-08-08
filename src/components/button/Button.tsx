import clsx from 'clsx';
import Link from 'next/link';
import { type RefObject, ReactNode } from 'react';

import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  ref?: RefObject<HTMLButtonElement | null>;
  type?: 'button' | 'submit' | 'reset';
  fontSize?: 'medium' | 'large';
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
}: ButtonProps) {
  if (href) {
    return (
      <Link className={clsx(styles.button, styles[variant])} href={href}>
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
      {children}
    </button>
  );
}
