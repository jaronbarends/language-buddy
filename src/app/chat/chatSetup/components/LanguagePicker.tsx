import { SupportedLanguageVoices, type Language } from '@/lib/language';

import styles from './LanguagePicker.module.css';

type LanguagePickerProps = {
  languages: Language[];
  selectedLanguage: Language;
  onChangeLanguage: (language: Language) => void;
  supportedLanguageVoices: SupportedLanguageVoices;
};

export default function LanguagePicker({
  languages,
  selectedLanguage,
  onChangeLanguage,
  supportedLanguageVoices,
}: LanguagePickerProps) {
  return (
    <fieldset>
      <legend className={styles.legend}>Choose your language</legend>
      <div className={styles.languageOptions}>
        {languages.map((language, idx) => {
          const id = `language-picker-${language.languageTag}`;
          const languageHasVoice = (language: Language) => {
            return supportedLanguageVoices[language.languageTag] !== undefined;
          };
          return (
            <div key={idx} className={styles.languageOption}>
              <input
                id={id}
                type="radio"
                value={language.languageTag}
                name="language"
                checked={language === selectedLanguage}
                onChange={() => {
                  onChangeLanguage(language);
                }}
                className="u-hidden-form-control"
              />
              <label className={styles.label} htmlFor={id}>
                {language.name}
                {!languageHasVoice(language) && <span>🔇</span>}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
