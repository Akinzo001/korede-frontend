import { ArrowRight, CalendarDays, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { BrandLogo } from "../components/BrandLogo";

type PatientRegistrationForm = {
  date_of_birth: string;
  email: string;
  first_name: string;
  gender: string;
  last_name: string;
  password: string;
  phone_number: string;
  username: string;
};

const initialFormState: PatientRegistrationForm = {
  date_of_birth: "",
  email: "",
  first_name: "",
  gender: "",
  last_name: "",
  password: "",
  phone_number: "",
  username: "",
};

const requiredFields: Array<{
  key: keyof PatientRegistrationForm;
  label: string;
}> = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "username", label: "Username" },
  { key: "email", label: "Email address" },
  { key: "date_of_birth", label: "Date of birth" },
  { key: "gender", label: "Gender" },
  { key: "phone_number", label: "Phone number" },
  { key: "password", label: "Password" },
];

export function PatientRegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] =
    useState<PatientRegistrationForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof PatientRegistrationForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const registerPatient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const missingField = getMissingRequiredField(formData);

    if (missingField) {
      toast.error(`${missingField} is required.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patients/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPatientPayload(formData)),
      });

      const responseBody = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(responseBody, "Unable to register patient."),
        );
      }

      toast.success(
        getApiErrorMessage(
          responseBody,
          "Patient account created successfully.",
        ),
      );
      navigate("/patient/verify-email", {
        state: {
          email: formData.email.trim(),
          otpExpiresInSeconds: getOtpExpiry(responseBody),
        },
      });
      setFormData(initialFormState);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to register patient.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] px-4 py-10 text-slate-950 [background-size:24px_24px] sm:px-6">
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center">
        <div className="text-center">
          <Link to="/" className="inline-flex justify-center text-5xl sm:text-6xl">
            <BrandLogo size="md" />
          </Link>
          <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
            Start Your Funding Journey
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            Create your secure Korede patient profile so a verified hospital can
            help you raise funds with transparency.
          </p>
        </div>

        <section className="mt-10 w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/80 sm:p-10">
          <div className="flex items-start gap-4 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-950">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-teal-800" />
            <p>
              Your details are used to create your patient account. Medical case
              information will be handled separately with hospital verification.
            </p>
          </div>

          <form className="mt-8 space-y-8" onSubmit={registerPatient}>
            <div className="grid gap-5 sm:grid-cols-2">
              <PatientField label="First Name">
                <PatientInput
                  value={formData.first_name}
                  onChange={(value) => updateField("first_name", value)}
                  placeholder="e.g. Amara"
                />
              </PatientField>

              <PatientField label="Last Name">
                <PatientInput
                  value={formData.last_name}
                  onChange={(value) => updateField("last_name", value)}
                  placeholder="e.g. Okafor"
                />
              </PatientField>

              <PatientField label="Username">
                <PatientInput
                  value={formData.username}
                  onChange={(value) => updateField("username", value)}
                  placeholder="amara_okafor"
                />
              </PatientField>

              <PatientField label="Email Address">
                <PatientInput
                  type="email"
                  value={formData.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="amara@example.com"
                />
              </PatientField>

              <PatientField label="Date of Birth">
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(event) =>
                      updateField("date_of_birth", event.target.value)
                    }
                    className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 pl-12 pr-4 text-base text-slate-950 outline-none transition focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14"
                  />
                </div>
              </PatientField>

              <PatientField label="Gender">
                <select
                  value={formData.gender}
                  onChange={(event) => updateField("gender", event.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14"
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </PatientField>

              <PatientField label="Phone Number">
                <PatientInput
                  value={formData.phone_number}
                  onChange={(value) => updateField("phone_number", value)}
                  placeholder="+234 801 234 5678"
                />
              </PatientField>

              <PatientField label="Password">
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Create a secure password"
                    className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 pl-12 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14"
                  />
                </div>
              </PatientField>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/login"
                className="flex h-12 items-center justify-center rounded-lg border border-slate-300 px-6 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800"
              >
                Back
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 items-center justify-center gap-3 rounded-lg bg-teal-800 px-7 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400 sm:min-w-64"
              >
                {isSubmitting ? "Creating Account..." : "Create Patient Account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>

        <p className="mt-8 flex items-center gap-2 text-center text-sm font-medium text-slate-700">
          <LockKeyhole className="h-4 w-4 text-teal-800" />
          Secure, encrypted data transmission
        </p>
      </main>
    </div>
  );
}

type PatientFieldProps = {
  label: string;
  children: React.ReactNode;
};

function PatientField({ label, children }: PatientFieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-950">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

type PatientInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "text";
};

function PatientInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: PatientInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14"
    />
  );
}

function getMissingRequiredField(formData: PatientRegistrationForm) {
  const missing = requiredFields.find(({ key }) => formData[key].trim() === "");

  return missing?.label ?? "";
}

function buildPatientPayload(formData: PatientRegistrationForm) {
  return {
    date_of_birth: formData.date_of_birth.trim(),
    email: formData.email.trim(),
    first_name: formData.first_name.trim(),
    gender: formData.gender.trim(),
    last_name: formData.last_name.trim(),
    password: formData.password,
    phone_number: formData.phone_number.trim(),
    username: formData.username.trim(),
  };
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

function getOtpExpiry(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") {
    return 0;
  }

  const body = responseBody as Record<string, unknown>;

  return typeof body.otp_expires_in_seconds === "number"
    ? body.otp_expires_in_seconds
    : 0;
}
