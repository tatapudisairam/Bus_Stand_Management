import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateAccount from './pages/CreateAccount/CreateAccount'
import AdminForgotPassword from './pages/AdminForgotPassword/AdminForgotPassword';
import AdminResetPassword from "./pages/AdminResetPassword/AdminResetPassword";
import AddBus from "./pages/AddBus/AddBus";
import AssignRoutes from './pages/AssignRoutes/AssignRoutes';
import ModifyEmployeeDetails from './pages/ModifyEmployeeDetails/ModifyEmployeeDetails';
import DisplayEmployees from './pages/DisplayEmployees/DisplayEmployees';
import CheckRouteForAnEmployee from './pages/CheckRouteForAnEmployee/CheckRouteForAnEmployee';
import EmployeeHistory from './pages/EmployeeHistory/EmployeeHistory';
import EntireHistory from './pages/EntireHistory/EntireHistory';

function App() {
  return (
    <Router>
      <div className='main-routes'>
        <Routes>
          {/*Authentication Routes*/}
          <Route path="/" element={<AdminLogin />} />
          <Route path='/forgot-password' element={<AdminForgotPassword />} />
          <Route path='/reset-password/:token' element={<AdminResetPassword />} />

          {/*Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/*Dashboard Routes */}
          <Route path='/add-bus' element={<AddBus />} />
          <Route path="/create" element={<CreateAccount />} />
          <Route path='/assign-routes' element={<AssignRoutes />} />
          <Route path='/modify-employee' element={<ModifyEmployeeDetails />} />
          <Route path='/display-employees' element={<DisplayEmployees />} />
          <Route path='/check-route' element={<CheckRouteForAnEmployee />} />
          <Route path='/an-employee-history' element={<EmployeeHistory />} />
          <Route path='/history' element={<EntireHistory />} />

          {/*If route not found */}
          <Route path="*" element={<>Not found</>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


