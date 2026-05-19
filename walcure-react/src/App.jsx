import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import IQTest from './pages/IQTest'
import MBTITest from './pages/MBTITest'
import CareerTest from './pages/CareerTest'
import StressTest from './pages/StressTest'
import Results from './pages/Results'
import Spinner from './pages/Spinner'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/iq-test" element={<IQTest />} />
        <Route path="/mbti-test" element={<MBTITest />} />
        <Route path="/career-test" element={<CareerTest />} />
        <Route path="/stress-test" element={<StressTest />} />
        <Route path="/results" element={<Results />} />
        <Route path="/spinner" element={<Spinner />} />
      </Routes>
    </BrowserRouter>
  )
}
