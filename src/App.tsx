import { Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { ProjectDetail } from '@/pages/ProjectDetail'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio/:id" element={<ProjectDetail />} />
      </Route>
    </Routes>
  )
}

export default App
