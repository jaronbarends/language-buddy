import Icon from '@/components/icon/Icon';
import { getFlagIconName, type FlagIconName } from '@/lib/getIconByName';
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
          const flagIconName: FlagIconName = getFlagIconName(language.languageTag);
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
                {flagIconName && (
                  <div className={styles.flagIcon}>
                    <Icon iconName={flagIconName} size={32} isFlagIcon />
                  </div>
                )}
                {language.name}
                {!languageHasVoice(language) && (
                  <span className={styles.hasNoVoiceWarning}>
                    <Icon iconName="volumeMute" />
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
