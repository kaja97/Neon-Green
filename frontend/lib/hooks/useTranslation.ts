import { useLanguageStore } from '../stores/languageStore';
import { dictionaries, Dictionary } from '../i18n/dictionaries';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  
  // Safe fallback to 'en' if dictionary doesn't exist for some reason
  const dict: Dictionary = dictionaries[language] || dictionaries.en;
  
  return {
    t: dict,
    language,
    setLanguage: useLanguageStore.getState().setLanguage,
  };
}
