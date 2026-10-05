import type { Locale } from '../i18n/core';
import { toolEditorialEn } from './tool-editorial-en';
import { toolEditorialDe } from './tool-editorial-de';
import { toolEditorialFr } from './tool-editorial-fr';
import { toolEditorialZh } from './tool-editorial-zh';
import type { ToolEditorialKey, ToolEditorialSection } from './tool-editorial-types';

export type { ToolEditorialKey, ToolEditorialSection } from './tool-editorial-types';

const copy = { en: toolEditorialEn, de: toolEditorialDe, fr: toolEditorialFr, 'zh-CN': toolEditorialZh };

export function getToolEditorial(key: ToolEditorialKey, locale: Locale): ToolEditorialSection[] {
  return copy[locale][key];
}
