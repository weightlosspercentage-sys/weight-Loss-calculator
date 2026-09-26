
import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t<Key extends keyof (typeof ui)[typeof defaultLang]>(
    key: Key,
  ) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, targetLang: string = lang) {
    const pathSegments = path.split('/').filter(Boolean);

    if (pathSegments.length === 0) {
      return targetLang === defaultLang ? '/' : `/${targetLang}/`;
    }

    const firstSegment = pathSegments[0];
    const hasLangPrefix = firstSegment in ui;
    const basePath = hasLangPrefix
      ? '/' + pathSegments.slice(1).join('/')
      : path.startsWith('/') ? path : '/' + path;

    const normalizedBasePath = basePath.endsWith('/') || basePath === '/' ? basePath : basePath + '/';

    if (targetLang === defaultLang) {
      return normalizedBasePath;
    }

    return `/${targetLang}${normalizedBasePath === '/' ? '/' : normalizedBasePath}`;
  };
}

export function getLocalizedUrl(url: URL, lang: keyof typeof ui): URL {
  const currentPathname = url.pathname;
  const newPathname = useTranslatedPath(lang)(currentPathname, lang);
  return new URL(newPathname, url.origin);
}

