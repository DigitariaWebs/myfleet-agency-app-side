/**
 * Convenience hook wrapping react-i18next for the My Fleet app.
 * Exposes the translation function, the active locale, and a
 * helper to toggle between French and English.
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type SupportedLocale = 'fr' | 'en';

interface UseLocaleReturn {
  /** Translation function — `t('fleet.title')` */
  t: ReturnType<typeof useTranslation>['t'];
  /** Currently active locale code. */
  locale: SupportedLocale;
  /** Switch the app language to the given locale. */
  changeLocale: (locale: SupportedLocale) => void;
}

export function useLocale(): UseLocaleReturn {
  const { t, i18n } = useTranslation();

  const locale = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as SupportedLocale;

  const changeLocale = useCallback(
    (next: SupportedLocale) => {
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  return { t, locale, changeLocale };
}
