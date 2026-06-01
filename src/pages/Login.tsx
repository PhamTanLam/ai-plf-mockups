import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const FEATURES = [
  {
    key: 'login.f1',
    desc: 'login.f1d',
    path: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    key: 'login.f2',
    desc: 'login.f2d',
    path: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408l-2.08-2.08a.75.75 0 00-1.06 1.06l2.08 2.08a.75.75 0 001.06-1.06z',
  },
  {
    key: 'login.f3',
    desc: 'login.f3d',
    path: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
  },
  {
    key: 'login.f4',
    desc: 'login.f4d',
    path: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.54-1.03-7.602-2.748m15.686 0a11.956 11.956 0 01-1.4 2.998m-12.884-2.998a11.956 11.956 0 001.4 2.998m12.884 0c-.997 2.14-2.749 3.865-4.9 4.835m-9.584-4.835c.997 2.14 2.749 3.865 4.9 4.835m.002 0a11.953 11.953 0 004.9-4.835m-4.9 4.835c-1.378-.475-2.617-1.282-3.606-2.327',
  },
]

export default function Login() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="bg-pattern min-h-screen flex items-center justify-center p-4">
      <LanguageSwitcher className="absolute top-4 right-4" />

      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_440px] gap-8 items-center">
        {/* LEFT: Marketing / branding */}
        <div className="hidden lg:flex flex-col gap-6 px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 ai-grad rounded-xl flex items-center justify-center text-white font-bold text-2xl float">
              E
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900">Engineer Design AI</div>
              <div className="text-sm text-ink-500">Platform for E-Mind株式会社</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight text-ink-900">
            <span>{t('login.heroLine1')}</span>
            <br />
            <span className="ai-grad-text">{t('login.heroLine2')}</span>
          </h1>
          <p
            className="text-ink-500 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('login.heroDesc') }}
          />

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            {FEATURES.map((f) => (
              <div key={f.key} className="bg-white border border-line rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-brand-600 mb-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.path} />
                </svg>
                <div className="font-semibold text-sm mt-1">{t(f.key)}</div>
                <div className="text-xs text-ink-500 mt-0.5">{t(f.desc)}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-ink-500">
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
              v0.3.0-beta
            </span>
            <span>{t('login.poweredBy')}</span>
          </div>
        </div>

        {/* RIGHT: Login card */}
        <div className="bg-white rounded-2xl shadow-card border border-line p-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 ai-grad rounded-lg flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <div>
              <div className="font-bold text-ink-900">Engineer Design AI</div>
              <div className="text-xs text-ink-500">E-Mind PLF</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ink-900">{t('login.title')}</h2>
          <p className="text-sm text-ink-500 mt-1">{t('login.subtitle')}</p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                {t('login.email')}
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  defaultValue="morishita@e-mind.co.jp"
                  placeholder="example@e-mind.co.jp"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-alt border border-line rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ink-700">
                  {t('login.password')}
                </label>
                <a href="#" className="text-xs text-brand-600 hover:underline">
                  {t('login.forgot')}
                </a>
              </div>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type={showPw ? 'text' : 'password'}
                  defaultValue="demopassword"
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-alt border border-line rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-brand-600 border-line" />
              <span>{t('login.remember')}</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full px-4 py-2.5 btn-floating rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>{t('login.submit')}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-ink-300">{t('login.or')}</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {/* SSO buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleLogin()}
              className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm font-medium hover:bg-surface-alt transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>{t('login.ssoMs')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleLogin()}
              className="w-full px-4 py-2.5 bg-white border border-line rounded-lg text-sm font-medium hover:bg-surface-alt transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{t('login.ssoGoogle')}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-line text-center text-xs text-ink-500">
            <span>{t('login.noAccount')} </span>
            <a href="#" className="text-brand-600 hover:underline">
              {t('login.contactAdmin')}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-ink-300">
        © 2026 E-Mind株式会社 × Cowatech × Airion ・{' '}
        <a href="#" className="hover:text-brand-600">
          {t('footer.terms')}
        </a>{' '}
        ・{' '}
        <a href="#" className="hover:text-brand-600">
          {t('footer.privacy')}
        </a>{' '}
        ・{' '}
        <a href="#" className="hover:text-brand-600">
          {t('footer.support')}
        </a>
      </div>
    </div>
  )
}
