
import './App.css';
import {BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Outlet,
} from "react-router-dom";

import loginPage from "./pages/loginPage";
import registrationPage from './pages/registrationPage';
import LedgerDashboard from './pages/LedgerDashboard';

function App() {
  return (
    <>
    <Router>
      navbar
      <Routes>
        <Route path="/" element={<LedgerDashboard/>} />
        <Route path="/register" element={<registrationPage/>} />
        <Route path="/login" element={loginPage}/>
      </Routes>
    </Router>
    </>
  );
}

export default App;
