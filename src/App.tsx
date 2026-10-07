import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { SelectionProvider } from './context/SelectionContext'
import Home from './pages/Home'

function Placeholder({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-[1120px] p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-slate">이 화면은 아직 구현 전이에요.</p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SelectionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/select" element={<Placeholder title="Select" />} />
            <Route path="/result" element={<Placeholder title="Result" />} />
            <Route path="/notes" element={<Placeholder title="Notes" />} />
          </Route>
        </Routes>
      </SelectionProvider>
    </BrowserRouter>
  )
}
