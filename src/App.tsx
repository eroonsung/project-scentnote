import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PERFUMES } from './lib/perfumes'

function Placeholder({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-[1120px] p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-slate">향수 {PERFUMES.length}개 로드됨</p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder title="Home" />} />
        <Route path="/select" element={<Placeholder title="Select" />} />
        <Route path="/result" element={<Placeholder title="Result" />} />
        <Route path="/notes" element={<Placeholder title="Notes" />} />
      </Routes>
    </BrowserRouter>
  )
}
