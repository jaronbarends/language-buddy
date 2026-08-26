import styles from './SelectBox.module.css';

export type SelectBoxOption<T> = {
  label: string;
  value: T;
};

type SelectBoxProps<T> = {
  name: string;
  options: SelectBoxOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
};

export default function SelectBox<T>({
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
        value={String(selectedValue)}
      >
        {options.map((option, idx) => (
          <option key={idx} className={styles.option} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
