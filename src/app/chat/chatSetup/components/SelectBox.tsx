import styles from './SelectBox.module.css';

export type SelectBoxOption<T extends string> = {
  label: string;
  value: T;
};

type SelectBoxProps<T extends string> = {
  name: string;
  options: SelectBoxOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
};

export default function SelectBox<T extends string>({
  name,
  options,
  selectedValue,
  onChange,
}: SelectBoxProps<T>) {
  return (
    <div className={styles.selectBox}>
      <select
        name={name}
        className={styles.select}
        onChange={(event) => {
          onChange(event.target.value as T);
        }}
        value={selectedValue}
      >
        {options.map((option, idx) => (
          <option key={idx} className={styles.option} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
