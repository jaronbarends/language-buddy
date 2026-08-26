import clsx from 'clsx';
import { type ReactNode, useImperativeHandle, useState, type Ref } from 'react';

import Icon from '@/components/icon/Icon';
import { CSSPropertiesWithVars } from '@/types/css';

import styles from './Tooltip.module.css';

type TooltipProps = {
  layoutClassName?: string;
  anchorName: string;
  tooltipRef: Ref<TooltipHandle>;
  children: ReactNode;
};

export type TooltipHandle = {
  toggle: () => void;
};

export default function Tooltip({
  layoutClassName,
  anchorName,
  tooltipRef,
  children,
}: TooltipProps) {
  const [isActive, setIsActive] = useState<boolean>(false);
  useImperativeHandle(tooltipRef, () => ({
    toggle: toggleTooltip,
  }));

  return isActive ?
      <div
        className={clsx(styles.tooltip, layoutClassName, isActive && styles.isActive)}
        style={{ '--anchor-name': anchorName } as CSSPropertiesWithVars}
      >
        {children}
        <button type="button" className={styles.closeButton} onClick={closeTooltip}>
          <Icon iconName="close" />
        </button>
      </div>
    : null;

  function toggleTooltip() {
    setIsActive(!isActive);
  }

  function closeTooltip() {
    setIsActive(false);
  }
}
