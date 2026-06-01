/** Central route table. Screen codes map to mockup files (F1–F4, S1–S7). */
export const ROUTES = {
  login: '/', // F1
  dashboard: '/dashboard', // F2
  cases: '/cases', // F3
  caseDetail: '/cases/:id', // F4
  reference: '/reference', // S6
  ai: {
    caseInput: '/ai/case-input', // S1
    qa: '/ai/qa', // S2
    drawing: '/ai/drawing', // S3
    programCheck: '/ai/program-check', // S4
    languageSwitch: '/ai/language-switch', // S5
    programGeneration: '/ai/program-generation', // S7
  },
} as const

/** Sample case id used by demo links into F4. */
export const DEMO_CASE_ID = 'CASE-2026-0312'
export const caseDetailPath = (id: string) => `/cases/${id}`
