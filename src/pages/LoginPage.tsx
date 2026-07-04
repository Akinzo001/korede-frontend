import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { savePatientSession, type LoginResponse } from "../lib/auth";
import { BrandLogo } from "../components/BrandLogo";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (!password) {
      toast.error("Password is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const responseBody = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(getApiErrorMessage(responseBody, "Unable to login."));
      }

      const loginResponse = parseLoginResponse(responseBody);
      savePatientSession(loginResponse);
      toast.success(loginResponse.message || "Login successful.");
      navigate("/patient/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-white text-slate-950">
      <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6">
        <section className="w-full max-w-md">
          <div className="text-center">
            <Link to="/" className="inline-flex justify-center text-4xl">
              <BrandLogo />
            </Link>
            <p className="mt-3 text-base font-medium text-slate-800">
              Welcome back to Korede.
            </p>
          </div>

          <form
            className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            onSubmit={handleLogin}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-950"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-950"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 pr-11 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((isVisible) => !isVisible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-teal-800"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-800"
                />
                Remember me
              </label>
              <a
                href="#"
                className="font-medium text-teal-800 transition hover:text-teal-950"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 h-11 w-full rounded-lg bg-teal-800 text-sm font-bold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm text-slate-800">
            <p>
              Need a verification check?{" "}
              <Link to="/hospital/register" className="font-medium text-teal-800">
                Hospital Partner Signup.
              </Link>
            </p>
            <p>
              Need to raise funds?{" "}
              <Link to="/patient/register" className="font-medium text-amber-700">
                Start a Patient Case.
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function getApiErrorMessage(responseBody: unknown, fallbackMessage: string) {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "message" in responseBody &&
    typeof responseBody.message === "string"
  ) {
    return responseBody.message;
  }

  if (
    responseBody &&
    typeof responseBody === "object" &&
    "detail" in responseBody &&
    typeof responseBody.detail === "string"
  ) {
    return responseBody.detail;
  }

  return fallbackMessage;
}

function parseLoginResponse(responseBody: unknown): LoginResponse {
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Invalid login response.");
  }

  const body = responseBody as Partial<LoginResponse>;

  if (!body.access_token || !body.refresh_token || !body.patient) {
    throw new Error("Invalid login response.");
  }

  return {
    access_token: body.access_token,
    email: body.email ?? body.patient.email,
    expires_in: body.expires_in ?? 0,
    login_challenge_id: body.login_challenge_id,
    medical_cases: Array.isArray(body.medical_cases) ? body.medical_cases : [],
    message: body.message ?? "Login successful.",
    otp_expires_in_seconds: body.otp_expires_in_seconds,
    otp_required: body.otp_required,
    patient: body.patient,
    refresh_expires_in: body.refresh_expires_in ?? 0,
    refresh_token: body.refresh_token,
    role: body.role ?? "patient",
    token_type: body.token_type ?? "Bearer",
  };
}
