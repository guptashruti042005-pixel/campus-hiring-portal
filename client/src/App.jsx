import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobsPage from './pages/JobsPage';
import RegisterPage from './pages/RegisterPage'; 
import LoginPage from './pages/LoginPage';  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobsPage />} />
         <Route path="/register" element={<RegisterPage />} />   
         <Route path="/login" element={<LoginPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;