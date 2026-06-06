import type { Dictionary, Locale } from '@/i18n/types'
import { LOCALES } from '@/i18n/types'
import { login } from './login'
import { common } from './common'
import { dashboard } from './dashboard'
import { caseList } from './caseList'
import { caseDetail } from './caseDetail'
import { caseInput } from './caseInput'
import { qa } from './qa'
import { elec } from './elec'
import { prog } from './prog'
import { lang } from './lang'
import { refData } from './refData'
import { gen } from './gen'
import { workspace } from './workspace'
import { presales } from './presales'

/** Add every screen dictionary here; they are merged per-locale at load. */
const TABLES: Dictionary[] = [common, login, dashboard, caseList, caseDetail, caseInput, qa, elec, prog, lang, refData, gen, workspace, presales]

function merge(tables: Dictionary[]): Dictionary {
  const out = { ja: {}, en: {}, vi: {} } as Dictionary
  for (const locale of LOCALES) {
    for (const table of tables) {
      Object.assign(out[locale], table[locale])
    }
  }
  return out
}

export const DICTIONARY: Dictionary = merge(TABLES)

export type { Locale }
