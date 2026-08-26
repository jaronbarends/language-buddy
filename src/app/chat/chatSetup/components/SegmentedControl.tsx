import { LabelWithIcon } from '@/components/icon/Icon';
import { type IconName } from '@/lib/getIconByName';

import styles from './SegmentedControl.module.css';

export type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
  iconName?: IconName;
};

export type SegmentedControlProps<T extends string> = {
  groupName: string;
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
};

export default function SegmentedControl<T extends string>({
  groupName,
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.segmentedControl}>
      {options.map((option, idx) => {
        return (
          <label key={idx} className={styles.label}>
            <input
              type="radio"
              value={option.value}
              name={groupName}
              checked={option.value === selectedValue}
              onChange={(event) => {
                onSelect(event.target.value as T);
              }}
              className="u-hidden-form-control"
            />
            {option.iconName && (
              <LabelWithIcon iconName={option.iconName} iconSize={24}>
                {option.label}
              </LabelWithIcon>
            )}
            {!option.iconName && option.label}
          </label>
        );
      })}
    </div>
  );
}
