import { Navigate, Route, Routes } from 'react-router-dom'
import NotebookList from '@/pages/NotebookList'
import NotebookWorkspace from '@/pages/NotebookWorkspace'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<NotebookList />} />
      <Route path="/workspace/:id" element={<NotebookWorkspace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
