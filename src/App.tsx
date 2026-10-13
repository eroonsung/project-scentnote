import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { SelectionProvider } from './context/SelectionContext'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Result from './pages/Result'
import Select from './pages/Select'
import Similar from './pages/Similar'
import Start from './pages/Start'

export default function App() {
  return (
    <BrowserRouter>
      <SelectionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/start" element={<Start />} />
            <Route path="/select" element={<Select />} />
            <Route path="/similar" element={<Similar />} />
            <Route path="/result" element={<Result />} />
            <Route path="/notes" element={<Notes />} />
          </Route>
        </Routes>
      </SelectionProvider>
    </BrowserRouter>
  )
}
