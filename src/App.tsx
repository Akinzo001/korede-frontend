import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HospitalRegistrationPage } from "./pages/HospitalRegistrationPage";
import { HospitalDashboardPage } from "./pages/HospitalDashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { OtpVerificationPage } from "./pages/OtpVerificationPage";
import { PatientRegistrationPage } from "./pages/PatientRegistrationPage";
import { PatientOtpVerificationPage } from "./pages/PatientOtpVerificationPage";
import { PatientDashboardPage } from "./pages/PatientDashboardPage";
import { PublicCasePage } from "./pages/PublicCasePage";
import { PublicDonorsPage } from "./pages/PublicDonorsPage";

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/hospital/register" element={<HospitalRegistrationPage />} />
          <Route path="/hospital/verify-email" element={<OtpVerificationPage />} />
          <Route path="/hospital/dashboard" element={<HospitalDashboardPage />} />
          <Route path="/patient/register" element={<PatientRegistrationPage />} />
          <Route path="/patient/verify-email" element={<PatientOtpVerificationPage />} />
          <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="/cases/:publicSlug/donors" element={<PublicDonorsPage />} />
          <Route path="/cases/:publicSlug" element={<PublicCasePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </div>
  );
}
