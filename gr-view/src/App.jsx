import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginRegister from "./pages/LoginRegister.jsx";
import ClienteDashboard from "./pages/ClienteDashboard.jsx";
import EmpleadoDashboard from "./pages/EmpleadoDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import RecuperarContrasenia from "./pages/RecuperarContrasenia.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';

import './assets/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <NavBar />
          <div className="main-content">
            <ErrorBoundary  fallback={<div>Error al cargar la aplicación</div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/nosotros" element={<LandingPage />} />
                <Route path="/informacion" element={<LandingPage />} />
                <Route path="/contacto" element={<LandingPage />} />
                <Route path="/login" element={<LoginRegister />} />
                <Route 
                  path="/cliente" 
                  element={
                      <ProtectedRoute allowedTypes={[1]}>
                          <ClienteDashboard />
                      </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/empleado" 
                  element={
                      <ProtectedRoute allowedTypes={[2]}>
                          <EmpleadoDashboard />
                      </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                      <ProtectedRoute allowedTypes={[3]}>
                          <AdminDashboard />
                      </ProtectedRoute>
                  } 
                />

                <Route path="/recuperarContrasenia" element={<RecuperarContrasenia />} />
              </Routes>
            </ErrorBoundary>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }


  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
}
}

export default App;
