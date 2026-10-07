import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { SelectionProvider } from './context/SelectionContext'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Result from './pages/Result'
import Select from './pages/Select'

export default function App() {
  return (
    <BrowserRouter>
      <SelectionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/select" element={<Select />} />
            <Route path="/result" element={<Result />} />
            <Route path="/notes" element={<Notes />} />
          </Route>
        </Routes>
      </SelectionProvider>
    </BrowserRouter>
  )
}
