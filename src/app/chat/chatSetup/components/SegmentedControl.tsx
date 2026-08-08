import styles from './SegmentedControl.module.css';

export type SegmentedControlOption<T> = {
  label: string;
  value: T;
};

export type SegmentedControlProps<T> = {
  groupName: string;
  groupLabel: string;
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
};

export default function SegmentedControl<T>({
  groupName,
  groupLabel,
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={styles.segmentedControl}>
      <legend>{groupLabel}</legend>
      {options.map((option, idx) => {
        const id = `segcontrol-${groupName}-${idx}`;
        return (
          <div key={idx}>
            <input
              type="radio"
              id={id}
              value={String(option.value)}
              name={groupName}
              checked={option.value === selectedValue}
              onChange={(event) => {
                onSelect(event.target.value as T);
              }}
            />
            <label htmlFor={id}>{option.label}</label>
          </div>
        );
      })}
    </fieldset>
  );
}
