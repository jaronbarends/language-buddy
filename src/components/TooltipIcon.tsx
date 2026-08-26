import clsx from 'clsx';
import { type ReactNode, useId, useRef } from 'react';

import Tooltip, { type TooltipHandle } from '@/components/Tooltip';
import Icon from '@/components/icon/Icon';
import { IconName } from '@/lib/getIconByName';
import { type CSSPropertiesWithVars } from '@/types/css';

import styles from './TooltipIcon.module.css';

type TooltipIconProps = {
  iconName?: IconName;
  children: ReactNode;
};

export default function TooltipIcon({ iconName = 'question', children }: TooltipIconProps) {
  const anchorName = `--anchor-${useId().replace(/:/g, '')}`;
  const tooltipRef = useRef<TooltipHandle>(null);

  return (
    <>
      <button
        className={clsx(styles.tooltipIcon)}
        type="button"
        onClick={toggleTooltip}
        style={{ '--anchor-name': anchorName } as CSSPropertiesWithVars}
      >
        <Icon iconName={iconName} />
      </button>
      <Tooltip
        layoutClassName={styles.tooltipLayout}
        anchorName={anchorName}
        tooltipRef={tooltipRef}
      >
        {children}
      </Tooltip>
    </>
  );

  function toggleTooltip() {
    tooltipRef.current?.toggle();
  }
}
