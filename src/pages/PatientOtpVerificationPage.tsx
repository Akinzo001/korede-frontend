import { ArrowRight, MailCheck, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";

type PatientVerificationLocationState = {
  email?: string;
  otpExpiresInSeconds?: number;
};

export function PatientOtpVerificationPage() {
  const location = useLocation();
  const state = location.state as PatientVerificationLocationState | null;
  const email = state?.email ?? "";
  const [secondsRemaining, setSecondsRemaining] = useState(
    typeof state?.otpExpiresInSeconds === "number"
      ? state.otpExpiresInSeconds
      : 0,
  );
  const [otp, setOtp] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const canVerify = useMemo(
    () => email.trim() !== "" && otp.trim() !== "",
    [email, otp],
  );
  const countdownLabel = formatCountdown(secondsRemaining);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [secondsRemaining]);

  const verifyEmail = async () => {
    setStatusMessage("");

    if (!canVerify) {
      const message = email
        ? "OTP is required."
        : "Patient email is missing. Please register again.";
      setStatusType("error");
      setStatusMessage(message);
      toast.error(message);
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patients/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const responseBody = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(getApiMessage(responseBody, "Invalid or expired OTP."));
      }

      const message = getApiMessage(
        responseBody,
        "Patient email verified successfully. You can now sign in.",
      );

      setStatusType("success");
      setStatusMessage(message);
      toast.success(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to verify email.";
      setStatusType("error");
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    setStatusMessage("");

    if (!email.trim()) {
      const message = "Patient email is missing. Please register again.";
      setStatusType("error");
      setStatusMessage(message);
      toast.error(message);
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patients/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const responseBody = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(getApiMessage(responseBody, "Unable to resend OTP."));
      }

      const otpExpiresInSeconds = getOtpExpiry(responseBody);
      const message = getApiMessage(responseBody, "A new OTP was sent.");

      setOtp("");
      setSecondsRemaining(otpExpiresInSeconds);
      setStatusType("success");
      setStatusMessage(message);
      toast.success(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to resend OTP.";
      setStatusType("error");
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] px-4 py-10 text-slate-950 [background-size:24px_24px] sm:px-6">
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
              We sent a one-time password to your patient email. Enter it below
              to activate your Korede account.
            </p>
            {email && (
              <p className="mt-3 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {email}
              </p>
            )}
            {secondsRemaining > 0 ? (
              <p className="mt-4 text-sm font-semibold text-teal-800">
                OTP expires in {countdownLabel}
              </p>
            ) : (
              <p className="mt-4 text-sm font-semibold text-red-700">
                OTP has expired. Request a new code to continue.
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
              disabled={isVerifying}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-teal-800 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={resendOtp}
              disabled={isResending}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <RotateCcw className="h-4 w-4" />
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-teal-100 bg-white p-4 text-sm leading-6 text-slate-600">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-teal-800" />
          <p>
            Verification protects your patient account and confirms that this
            funding profile belongs to you.
          </p>
        </div>
      </section>
    </div>
  );
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

function getApiMessage(responseBody: unknown, fallbackMessage: string) {
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

function getOtpExpiry(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") {
    return 0;
  }

  const body = responseBody as Record<string, unknown>;

  return typeof body.otp_expires_in_seconds === "number"
    ? body.otp_expires_in_seconds
    : 0;
}
