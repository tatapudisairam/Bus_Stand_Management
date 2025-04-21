import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminSIgnup from "./pages/AdminSignup/AdminSignup"


function App() {
  return (
    <Router>
      <div className='main-routes'>
        <Routes>
          <Route path='/' element={<AdminSIgnup />} />
          <Route path="*" element={<>Not found</>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


