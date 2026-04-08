import 'server-only';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  hi: () => import('./dictionaries/hi.json').then((module) => module.default),
  kn: () => import('./dictionaries/kn.json').then((module) => module.default),
};

export const getDictionary = async (locale) => dictionaries[locale]?.() ?? dictionaries.en();
