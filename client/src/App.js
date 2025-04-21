import './App.css';
import Homepage from './pages/Homepage/Homepage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserLogin from "./pages/UserLogin/UserLogin";
import EmployeeLogin from "./pages/EmployeeLogin/EmployeeLogin";
import EmployeeResetPassword from "./pages/EmployeeResetPassword/EmployeeResetPassword";
import EmployeeForgotPassword from "./pages/EmployeeForgotPassword/EmployeeForgotPassword";
import EmployeeDashboard from './pages/EmployeeDashboard/EmployeeDashboard';
import EmployeeHistory from './pages/EmployeeHistory/EmployeeHistory';

function App() {
  return (
    <Router>
      <div className='main-routes'>
        <Routes>
          <Route path="/" element={<Homepage />} />
          {/*authentication routes */}
          <Route path="/userlogin" element={<UserLogin />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/reset-password/:token" element={<EmployeeResetPassword />} />
          <Route path="/forgot-password" element={<EmployeeForgotPassword />} />

          <Route path='/dashboard' element={<EmployeeDashboard />} />
          <Route path='/employee-history' element={<EmployeeHistory />} />
          <Route path="*" element={<>Not found</>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
