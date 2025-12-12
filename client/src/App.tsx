import { Routes, Route } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import ContactSection from "./components/ContactSection";
import FooterSection from "./components/FooterSection";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import VehicleDashboard from "./components/VehicleDashboard";
import AdminLogin from "./components/AdminLoginPage";
import Navbar from "./components/Navbar";
import VehicleLoginPage from "./components/VehicleLoginPage";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <ContactSection />
            <FooterSection />
          </>
        }
      />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/vehicle-owner-login" element={<VehicleLoginPage />} />
      <Route
        path="/vehicle-dashboard"
        element={
          <ProtectedRoute requiredRole="vehicle">
            <VehicleDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
