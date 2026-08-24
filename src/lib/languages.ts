import { type Language } from './language';

export const supportedLanguages: Language[] = [
  {
    name: 'Dutch',
    languageTag: 'nl-NL',
  },
  // {
  //   name: 'English',
  //   languageTag: 'en-GB',
  // },
  // {
  //   name: 'French',
  //   languageTag: 'fr-FR',
  // },
  // {
  //   name: 'German',
  //   languageTag: 'de-DE',
  // },
  {
    name: 'Italian',
    languageTag: 'it-IT',
  },
  {
    name: 'Norwegian',
    languageTag: 'nb-NO',
    addition: 'Bokmål',
    initiallySelected: true,
  },
  // {
  //   name: 'Non-existing',
  //   languageTag: 'nx-NX',
  // },
  {
    name: 'Spanish',
    languageTag: 'es-ES',
  },
];
