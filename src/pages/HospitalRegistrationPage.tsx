import {
  ArrowRight,
  ArrowLeft,
  BriefcaseMedical,
  EyeOff,
  Landmark,
  LayoutDashboard,
  MapPin,
  UploadCloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const benefits = [
  {
    title: "Dedicated Dashboard",
    description:
      "Manage patients, funding progress, verification requests, and case updates in one secure workspace.",
    icon: LayoutDashboard,
  },
  {
    title: "Direct Reconciled Settlements",
    description:
      "Receive transparent hospital-bound settlements backed by tamper-resistant ledger records.",
    icon: Landmark,
  },
  {
    title: "Seamless Case Management",
    description:
      "Create verified cases, upload documents, and keep donors updated without manual payment tracking.",
    icon: BriefcaseMedical,
  },
];

const steps = ["Basic Info", "Document Upload", "Finance Details"];

export function HospitalRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const goToNextStep = () => {
    setCurrentStep((step) => Math.min(step + 1, steps.length));
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.78fr_1fr]">
        <aside className="relative overflow-hidden bg-teal-900 px-4 py-6 text-white sm:px-8 sm:py-8 lg:px-14 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="relative flex min-h-full flex-col">
            <Link to="/" className="inline-flex w-fit items-center gap-3">
              <img
                src="/logo.png"
                alt="Korede logo"
                className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
              />
              <span className="text-xl font-bold text-white sm:text-2xl">
                Korede Health
              </span>
            </Link>

            <div className="mt-8 max-w-xl sm:mt-10 lg:mt-20">
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Transform Your Practice
              </h1>
              <p className="mt-4 text-base leading-7 text-teal-100 sm:text-lg lg:mt-6 lg:text-xl lg:leading-8">
                Join a secure Sui-backed ecosystem designed to streamline
                patient care, donor trust, and financial settlements.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:mt-10 lg:block lg:space-y-7">
              {benefits.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-lg bg-teal-950/20 p-3 lg:bg-transparent lg:p-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-950/40 text-teal-100 lg:h-12 lg:w-12">
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-white lg:text-base">
                      {title}
                    </h2>
                    <p className="mt-1 hidden max-w-md text-sm leading-6 text-teal-100 sm:block lg:mt-2">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 hidden overflow-hidden rounded-xl bg-teal-950/30 shadow-2xl shadow-teal-950/30 lg:mt-auto lg:block">
              <img
                src="https://images.unsplash.com/photo-1581093458791-9f3c3900df7b?auto=format&fit=crop&w=1000&q=80"
                alt="Medical team reviewing digital records"
                className="h-64 w-full object-cover opacity-80"
              />
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-14">
          <section className="w-full max-w-3xl">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Hospital Registration
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-700 sm:mt-4 sm:text-lg">
                Partner with Korede to provide verified care.
              </p>
            </div>

            <RegistrationStepper currentStep={currentStep} />

            <form
              className="mt-8 space-y-8 sm:mt-10 sm:space-y-10"
              onSubmit={(event) => event.preventDefault()}
            >
              {currentStep === 1 && <BasicInfoStep />}
              {currentStep === 2 && <VerificationDocumentsStep />}
              {currentStep === 3 && <FinanceDetailsStep />}

              <FormActions
                currentStep={currentStep}
                onPrevious={goToPreviousStep}
                onNext={goToNextStep}
              />

              <p className="text-center text-sm text-slate-700">
                Already registered?{" "}
                <Link to="/login" className="font-medium text-teal-800">
                  Sign in to your dashboard
                </Link>
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

type RegistrationStepperProps = {
  currentStep: number;
};

function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  return (
    <div className="mt-8 sm:mt-10">
      <div className="grid grid-cols-3 items-start">
        {steps.map((step, index) => (
          <div key={step} className="relative text-center">
            {index < steps.length - 1 && (
              <div
                className={`absolute left-1/2 top-4 h-0.5 w-full ${
                  index + 1 < currentStep ? "bg-teal-800" : "bg-slate-200"
                }`}
              />
            )}
            <div
              className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold sm:h-9 sm:w-9 sm:text-sm ${
                index + 1 <= currentStep
                  ? "border-teal-800 bg-teal-800 text-white"
                  : "border-slate-300 bg-slate-200 text-slate-700"
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`mx-auto mt-2 max-w-20 text-[10px] font-medium leading-4 sm:mt-3 sm:max-w-none sm:text-sm ${
                index + 1 <= currentStep ? "text-teal-800" : "text-slate-700"
              }`}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BasicInfoStep() {
  return (
    <>
      <FormSection title="Basic Information">
        <Field label="Hospital Name" className="sm:col-span-2">
          <TextInput placeholder="e.g. St. Jude Medical Center" />
        </Field>
        <Field label="CAC Registration Number">
          <TextInput placeholder="RC-1234567" />
        </Field>
        <Field label="Medical License Number">
          <TextInput placeholder="MLN-98765" />
        </Field>
        <Field label="Official Address" className="sm:col-span-2">
          <IconInput
            icon={MapPin}
            placeholder="123 Health Avenue, Medical District"
          />
        </Field>
      </FormSection>

      <FormSection title="Administrator Details">
        <Field label="Administrator Name">
          <TextInput placeholder="Dr. Jane Doe" />
        </Field>
        <Field label="Admin Email">
          <TextInput type="email" placeholder="admin@hospital.com" />
        </Field>
        <Field label="Password" className="sm:col-span-2">
          <PasswordInput />
          <p className="mt-2 text-xs text-slate-600">
            Must be at least 12 characters, including numbers and symbols.
          </p>
        </Field>
      </FormSection>
    </>
  );
}

function VerificationDocumentsStep() {
  return (
    <FormSection title="Verification Documents">
      <div className="sm:col-span-2">
        <label
          htmlFor="documents"
          className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-teal-700 hover:bg-teal-50/40 sm:min-h-64 sm:px-6 sm:py-10"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-600 sm:h-16 sm:w-16">
            <UploadCloud className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <span className="mt-4 font-semibold text-slate-950 sm:mt-5">
            Upload CAC Certificate & Medical License
          </span>
          <span className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Drag and drop files here, or click to browse. Supported formats:
            PDF, JPG, PNG. Max 10MB per file.
          </span>
          <span className="mt-6 rounded-lg border border-slate-400 bg-white px-5 py-3 text-sm font-medium text-slate-950">
            Select Files
          </span>
          <input id="documents" type="file" multiple className="sr-only" />
        </label>
      </div>

      <label className="flex gap-3 text-sm leading-6 text-slate-700 sm:col-span-2 sm:gap-4">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-teal-800 focus:ring-teal-800"
        />
        <span>
          I agree to the platform{" "}
          <a href="#" className="font-medium text-teal-800">
            Terms of Service
          </a>
          ,{" "}
          <a href="#" className="font-medium text-teal-800">
            Privacy Policy
          </a>
          , and verify that all provided information is accurate and legally
          binding.
        </span>
      </label>
    </FormSection>
  );
}

function FinanceDetailsStep() {
  return (
    <FormSection title="Finance Details">
      <Field label="Settlement Bank">
        <TextInput placeholder="e.g. Wema Bank" />
      </Field>
      <Field label="Corporate Account Number">
        <TextInput placeholder="0123456789" />
      </Field>
      <Field label="Account Name" className="sm:col-span-2">
        <TextInput placeholder="St. Jude Medical Center Limited" />
      </Field>
      <Field label="Finance Contact Email">
        <TextInput type="email" placeholder="finance@hospital.com" />
      </Field>
      <Field label="Finance Contact Phone">
        <TextInput placeholder="+234 801 234 5678" />
      </Field>
    </FormSection>
  );
}

type FormActionsProps = {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
};

function FormActions({ currentStep, onPrevious, onNext }: FormActionsProps) {
  const isFinalStep = currentStep === steps.length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onPrevious}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800 sm:w-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <button
        type={isFinalStep ? "submit" : "button"}
        onClick={isFinalStep ? undefined : onNext}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-teal-800 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900"
      >
        {isFinalStep ? "Submit Verification Request" : "Next"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

function FormSection({ title, children }: FormSectionProps) {
  return (
    <section>
      <h3 className="border-b border-slate-200 pb-3 text-2xl font-bold text-slate-950 sm:pb-4 sm:text-3xl">
        {title}
      </h3>
      <div className="mt-5 grid gap-5 sm:mt-7 sm:grid-cols-2 sm:gap-6">
        {children}
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

function Field({ label, children, className = "" }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-semibold text-slate-950">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

type TextInputProps = {
  placeholder: string;
  type?: "email" | "text";
};

function TextInput({ placeholder, type = "text" }: TextInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14 sm:px-5"
    />
  );
}

type IconInputProps = {
  icon: LucideIcon;
  placeholder: string;
};

function IconInput({ icon: Icon, placeholder }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 pl-12 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14 sm:pr-5"
      />
    </div>
  );
}

function PasswordInput() {
  return (
    <div className="relative">
      <input
        type="password"
        placeholder="Enter a secure password"
        className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 pr-12 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14 sm:px-5"
      />
      <button
        type="button"
        aria-label="Show password"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-teal-800"
      >
        <EyeOff className="h-5 w-5" />
      </button>
    </div>
  );
}
