import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  const isLoginPage = window.location.pathname === "/login";

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {isLoginPage ? <LoginPage /> : <LandingPage />}
    </div>
  );
}
