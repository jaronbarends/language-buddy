import { type Language } from './language';

export const supportedLanguages: Language[] = [
  {
    name: 'French',
    languageTag: 'fr-FR',
  },
  {
    name: 'Dutch',
    languageTag: 'nl-NL',
  },
  {
    name: 'Norwegian',
    languageTag: 'nb-NO',
    addition: 'Bokmål',
    initiallySelected: true,
    openingHint: 'Jeg vil snakke med deg om …',
  },
  {
    name: 'Non-existing',
    languageTag: 'nx-NX',
  },
  {
    name: 'Spanish',
    languageTag: 'es-ES',
  },
  // {
  //   name: 'English',
  //   languageTag: 'en-GB',
  // },
  // {
  //   name: 'German',
  //   languageTag: 'de-DE',
  // },
];
