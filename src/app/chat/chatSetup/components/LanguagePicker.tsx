import { type Language } from '@/lib/language';

import styles from './LanguagePicker.module.css';

type LanguagePickerProps = {
  languages: Language[];
  selectedLanguage: Language;
  onChangeLanguage: (language: Language) => void;
};

export default function LanguagePicker({
  languages,
  selectedLanguage,
  onChangeLanguage,
}: LanguagePickerProps) {
  return (
    <div className={styles.languagePicker}>
      {languages.map((language, idx) => {
        const id = `language-picker-${language.languageTag}`;
        return (
          <div key={idx} className={styles.languageOption}>
            <input
              type="radio"
              id={id}
              value={language.languageTag}
              name="language"
              checked={language === selectedLanguage}
              onChange={() => {
                onChangeLanguage(language);
              }}
            />
            <label htmlFor={id}>{language.name}</label>
          </div>
        );
      })}
    </div>
  );
}
