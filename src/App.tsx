import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HospitalRegistrationPage } from "./pages/HospitalRegistrationPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { OtpVerificationPage } from "./pages/OtpVerificationPage";
import { PatientRegistrationPage } from "./pages/PatientRegistrationPage";
import { PatientOtpVerificationPage } from "./pages/PatientOtpVerificationPage";

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/hospital/register" element={<HospitalRegistrationPage />} />
          <Route path="/hospital/verify-email" element={<OtpVerificationPage />} />
          <Route path="/patient/register" element={<PatientRegistrationPage />} />
          <Route path="/patient/verify-email" element={<PatientOtpVerificationPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </div>
  );
}
