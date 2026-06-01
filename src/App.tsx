import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '@/pages/Login'
import DashboardV2 from '@/pages/DashboardV2'
import CaseList from '@/pages/CaseList'
import CaseDetailV2 from '@/pages/CaseDetailV2'
import CaseInputV2 from '@/pages/CaseInputV2'
import CaseQAV2 from '@/pages/CaseQAV2'
import ElectricalDrawingV2 from '@/pages/ElectricalDrawingV2'
import ProgramCheck from '@/pages/ProgramCheck'
import LanguageSwitchV2 from '@/pages/LanguageSwitchV2'
import ReferenceDataV2 from '@/pages/ReferenceDataV2'
import ProgramGeneration from '@/pages/ProgramGeneration'
import { AppLayout } from '@/layout/AppLayout'
import { ROUTES } from '@/routes'

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path={ROUTES.dashboard} element={<DashboardV2 />} />
        <Route path={ROUTES.cases} element={<CaseList />} />
        <Route path={ROUTES.caseDetail} element={<CaseDetailV2 />} />
        <Route path={ROUTES.reference} element={<ReferenceDataV2 />} />
        <Route path={ROUTES.ai.caseInput} element={<CaseInputV2 />} />
        <Route path={ROUTES.ai.qa} element={<CaseQAV2 />} />
        <Route path={ROUTES.ai.drawing} element={<ElectricalDrawingV2 />} />
        <Route path={ROUTES.ai.programCheck} element={<ProgramCheck />} />
        <Route path={ROUTES.ai.languageSwitch} element={<LanguageSwitchV2 />} />
        <Route path={ROUTES.ai.programGeneration} element={<ProgramGeneration />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  )
}
