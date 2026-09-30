import type { LandingTranslation } from './types';
import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';
import { ta } from './ta';
import { te } from './te';
import { bn } from './bn';
import { as } from './as';
import { gu } from './gu';
import { kn } from './kn';
import { ml } from './ml';
import { pa } from './pa';
import { ur } from './ur';
import { or_ } from './or';
import { ptBR } from './pt-BR';
import { ru } from './ru';
import { zhCN } from './zh-CN';
import { af } from './af';
import { nso } from './nso';
import { nr } from './nr';
import { st } from './st';
import { ss } from './ss';
import { ts } from './ts';
import { tn } from './tn';
import { ve } from './ve';
import { xh } from './xh';
import { zu } from './zu';

export type { LandingTranslation } from './types';

/**
 * Locale registry. Every key here is a language that is ACTUALLY translated —
 * adding a key is what makes a dropdown option honest.
 */
export const landingLocales: Record<string, LandingTranslation> = {
  en,
  hi,
  mr,
  ta,
  te,
  bn,
  as,
  gu,
  kn,
  ml,
  pa,
  ur,
  or: or_,
  'pt-BR': ptBR,
  ru,
  'zh-CN': zhCN,
  af,
  nso,
  nr,
  st,
  ss,
  ts,
  tn,
  ve,
  xh,
  zu,
};

/** Codes with a real translation. Used by the dropdown to mark coverage. */
export const TRANSLATED_CODES = new Set(Object.keys(landingLocales));
