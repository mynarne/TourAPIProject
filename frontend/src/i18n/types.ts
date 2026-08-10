export type AppLanguage = 'kor' | 'eng' | 'jpn' | 'chs' | 'cht';

export const SUPPORTED_LANGUAGES: AppLanguage[] = ['kor', 'eng', 'jpn', 'chs', 'cht'];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  kor: '한국어',
  eng: 'English',
  jpn: '日本語',
  chs: '简体中文',
  cht: '繁體中文',
};

export function isValidLanguage(lang: string | null | undefined): lang is AppLanguage {
  return typeof lang === 'string' && SUPPORTED_LANGUAGES.includes(lang as AppLanguage);
}
