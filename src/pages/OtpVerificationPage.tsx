import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

type VerificationLocationState = {
  email?: string;
};

export function OtpVerificationPage() {
  const location = useLocation();
  const state = location.state as VerificationLocationState | null;
  const email = state?.email ?? "";
  const [otp, setOtp] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => email.trim() !== "" && otp.trim() !== "", [email, otp]);

  const verifyEmail = async () => {
    setStatusMessage("");

    if (!canSubmit) {
      setStatusType("error");
      setStatusMessage("Email and OTP are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseBody?.message ?? "Invalid or expired OTP.");
      }

      setStatusType("success");
      setStatusMessage(
        responseBody?.message ??
          "Hospital email verified successfully. You can now sign in.",
      );
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to verify email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 sm:px-6">
      <section className="w-full max-w-lg">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-3">
            <img
              src="/logo.png"
              alt="Korede logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-3xl font-bold text-teal-900">Korede</span>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-800">
            <MailCheck className="h-8 w-8" />
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Verify your email
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              We sent a one-time password to your hospital email. Enter it below
              to complete your registration.
            </p>
            {email && (
              <p className="mt-3 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {email}
              </p>
            )}
          </div>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="block text-sm font-semibold">OTP Code</span>
              <input
                inputMode="numeric"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-center text-2xl font-semibold tracking-[0.35em] outline-none transition placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10"
              />
            </label>

            {statusMessage && (
              <p
                className={`rounded-lg px-4 py-3 text-center text-sm font-medium ${
                  statusType === "success"
                    ? "bg-teal-50 text-teal-900"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {statusMessage}
              </p>
            )}

            <button
              type="button"
              onClick={verifyEmail}
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-teal-800 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-teal-100 bg-white p-4 text-sm leading-6 text-slate-600">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-teal-800" />
          <p>
            Verification protects hospital accounts and confirms that the
            registration request came from the official administrator.
          </p>
        </div>
      </section>
    </div>
  );
}
