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
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

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

type DocumentPayload = {
  content_base64: string;
  mime_type: string;
  original_filename: string;
};

type RegistrationFormState = {
  administrator_name: string;
  bank_name: string;
  cac_document: DocumentPayload | null;
  cac_registration_number: string;
  corporate_account_name: string;
  corporate_account_number: string;
  email: string;
  medical_license_document: DocumentPayload | null;
  medical_license_number: string;
  name: string;
  official_address: string;
  password: string;
  phone_number: string;
  terms_accepted: boolean;
};

const initialFormState: RegistrationFormState = {
  administrator_name: "",
  bank_name: "",
  cac_document: null,
  cac_registration_number: "",
  corporate_account_name: "",
  corporate_account_number: "",
  email: "",
  medical_license_document: null,
  medical_license_number: "",
  name: "",
  official_address: "",
  password: "",
  phone_number: "",
  terms_accepted: false,
};

const requiredFields: Array<{
  key: keyof RegistrationFormState;
  label: string;
}> = [
  { key: "name", label: "Hospital name" },
  { key: "cac_registration_number", label: "CAC registration number" },
  { key: "medical_license_number", label: "Medical license number" },
  { key: "official_address", label: "Official address" },
  { key: "administrator_name", label: "Administrator name" },
  { key: "email", label: "Admin email" },
  { key: "password", label: "Password" },
  { key: "cac_document", label: "CAC certificate" },
  { key: "medical_license_document", label: "Medical license document" },
  { key: "bank_name", label: "Settlement bank" },
  { key: "corporate_account_number", label: "Corporate account number" },
  { key: "corporate_account_name", label: "Corporate account name" },
  { key: "phone_number", label: "Phone number" },
  { key: "terms_accepted", label: "Terms agreement" },
];

const requiredFieldsByStep: Record<
  number,
  Array<{
    key: keyof RegistrationFormState;
    label: string;
  }>
> = {
  1: [
    { key: "name", label: "Hospital name" },
    { key: "cac_registration_number", label: "CAC registration number" },
    { key: "medical_license_number", label: "Medical license number" },
    { key: "official_address", label: "Official address" },
    { key: "administrator_name", label: "Administrator name" },
    { key: "email", label: "Admin email" },
    { key: "password", label: "Password" },
  ],
  2: [
    { key: "cac_document", label: "CAC certificate" },
    { key: "medical_license_document", label: "Medical license document" },
  ],
  3: [
    { key: "bank_name", label: "Settlement bank" },
    { key: "corporate_account_number", label: "Corporate account number" },
    { key: "corporate_account_name", label: "Corporate account name" },
    { key: "phone_number", label: "Phone number" },
    { key: "terms_accepted", label: "Terms agreement" },
  ],
};

export function HospitalRegistrationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormState>(initialFormState);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (
    field: keyof RegistrationFormState,
    value: string | boolean | DocumentPayload | null,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  };

  const goToNextStep = () => {
    const missingField = getMissingRequiredField(
      formData,
      requiredFieldsByStep[currentStep] ?? [],
    );

    if (missingField) {
      setStatusType("error");
      setStatusMessage(`${missingField} is required before continuing.`);
      return;
    }

    setStatusMessage("");
    setCurrentStep((step) => Math.min(step + 1, steps.length));
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const submitRegistration = async () => {
    setStatusMessage("");

    const missingField = getMissingRequiredField(formData, requiredFields);

    if (missingField) {
      setStatusType("error");
      setStatusMessage(`${missingField} is required before submitting.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        const fallbackMessage = "Unable to submit hospital registration.";
        throw new Error(responseBody?.message ?? fallbackMessage);
      }

      setStatusType("success");
      setStatusMessage(
        responseBody?.message ??
          "Hospital registered successfully. Check your email for verification details.",
      );
      navigate("/hospital/verify-email", {
        state: { email: formData.email.trim() },
      });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit hospital registration.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
                src="/hospital-registration.png"
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
              {currentStep === 1 && (
                <BasicInfoStep formData={formData} onChange={updateField} />
              )}
              {currentStep === 2 && (
                <VerificationDocumentsStep
                  formData={formData}
                  onChange={updateField}
                />
              )}
              {currentStep === 3 && (
                <FinanceDetailsStep formData={formData} onChange={updateField} />
              )}

              <FormActions
                currentStep={currentStep}
                onPrevious={goToPreviousStep}
                onNext={goToNextStep}
                onSubmit={submitRegistration}
                isSubmitting={isSubmitting}
              />

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

function getMissingRequiredField(
  formData: RegistrationFormState,
  fields: typeof requiredFields,
) {
  const missing = fields.find(({ key }) => {
    const value = formData[key];

    if (typeof value === "string") {
      return value.trim() === "";
    }

    if (typeof value === "boolean") {
      return value === false;
    }

    return value === null;
  });

  return missing?.label ?? "";
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

type StepProps = {
  formData: RegistrationFormState;
  onChange: (
    field: keyof RegistrationFormState,
    value: string | boolean | DocumentPayload | null,
  ) => void;
};

function BasicInfoStep({ formData, onChange }: StepProps) {
  return (
    <>
      <FormSection title="Basic Information">
        <Field label="Hospital Name" className="sm:col-span-2">
          <TextInput
            value={formData.name}
            onChange={(value) => onChange("name", value)}
            placeholder="e.g. St. Jude Medical Center"
          />
        </Field>
        <Field label="CAC Registration Number">
          <TextInput
            value={formData.cac_registration_number}
            onChange={(value) => onChange("cac_registration_number", value)}
            placeholder="RC-1234567"
          />
        </Field>
        <Field label="Medical License Number">
          <TextInput
            value={formData.medical_license_number}
            onChange={(value) => onChange("medical_license_number", value)}
            placeholder="MLN-98765"
          />
        </Field>
        <Field label="Official Address" className="sm:col-span-2">
          <IconInput
            icon={MapPin}
            value={formData.official_address}
            onChange={(value) => onChange("official_address", value)}
            placeholder="123 Health Avenue, Medical District"
          />
        </Field>
      </FormSection>

      <FormSection title="Administrator Details">
        <Field label="Administrator Name">
          <TextInput
            value={formData.administrator_name}
            onChange={(value) => onChange("administrator_name", value)}
            placeholder="Dr. Jane Doe"
          />
        </Field>
        <Field label="Admin Email">
          <TextInput
            type="email"
            value={formData.email}
            onChange={(value) => onChange("email", value)}
            placeholder="admin@hospital.com"
          />
        </Field>
        <Field label="Password" className="sm:col-span-2">
          <PasswordInput
            value={formData.password}
            onChange={(value) => onChange("password", value)}
          />
          <p className="mt-2 text-xs text-slate-600">
            Must be at least 12 characters, including numbers and symbols.
          </p>
        </Field>
      </FormSection>
    </>
  );
}

function VerificationDocumentsStep({ formData, onChange }: StepProps) {
  return (
    <FormSection title="Verification Documents">
      <DocumentUpload
        id="cac-document"
        title="Upload CAC Certificate"
        description="PDF, JPG, or PNG. Max 10MB."
        document={formData.cac_document}
        onDocumentChange={(document) => onChange("cac_document", document)}
      />

      <DocumentUpload
        id="medical-license-document"
        title="Upload Medical License"
        description="PDF, JPG, or PNG. Max 10MB."
        document={formData.medical_license_document}
        onDocumentChange={(document) =>
          onChange("medical_license_document", document)
        }
      />

    </FormSection>
  );
}

function FinanceDetailsStep({ formData, onChange }: StepProps) {
  return (
    <FormSection title="Finance Details">
      <Field label="Settlement Bank">
        <TextInput
          value={formData.bank_name}
          onChange={(value) => onChange("bank_name", value)}
          placeholder="e.g. Wema Bank"
        />
      </Field>
      <Field label="Corporate Account Number">
        <TextInput
          value={formData.corporate_account_number}
          onChange={(value) => onChange("corporate_account_number", value)}
          placeholder="0123456789"
        />
      </Field>
      <Field label="Account Name" className="sm:col-span-2">
        <TextInput
          value={formData.corporate_account_name}
          onChange={(value) => onChange("corporate_account_name", value)}
          placeholder="St. Jude Medical Center Limited"
        />
      </Field>
      <Field label="Phone Number" className="sm:col-span-2">
        <TextInput
          value={formData.phone_number}
          onChange={(value) => onChange("phone_number", value)}
          placeholder="+234 801 234 5678"
        />
      </Field>

      <label className="flex gap-3 text-sm leading-6 text-slate-700 sm:col-span-2 sm:gap-4">
        <input
          type="checkbox"
          checked={formData.terms_accepted}
          onChange={(event) => onChange("terms_accepted", event.target.checked)}
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

type FormActionsProps = {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

function FormActions({
  currentStep,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}: FormActionsProps) {
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
        onClick={isFinalStep ? onSubmit : onNext}
        disabled={isSubmitting}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-teal-800 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isFinalStep
          ? isSubmitting
            ? "Submitting..."
            : "Submit Verification Request"
          : "Next"}
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
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "text";
};

function TextInput({ value, onChange, placeholder, type = "text" }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14 sm:px-5"
    />
  );
}

type IconInputProps = {
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function IconInput({ icon: Icon, value, onChange, placeholder }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 pl-12 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:h-14 sm:pr-5"
      />
    </div>
  );
}

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function PasswordInput({ value, onChange }: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
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

type DocumentUploadProps = {
  id: string;
  title: string;
  description: string;
  document: DocumentPayload | null;
  onDocumentChange: (document: DocumentPayload | null) => void;
};

function DocumentUpload({
  id,
  title,
  description,
  document,
  onDocumentChange,
}: DocumentUploadProps) {
  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      onDocumentChange(null);
      return;
    }

    const content_base64 = await fileToBase64(file);
    onDocumentChange({
      content_base64,
      mime_type: file.type,
      original_filename: file.name,
    });
  };

  return (
    <label
      htmlFor={id}
      className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-teal-700 hover:bg-teal-50/40 sm:min-h-64 sm:px-6 sm:py-10"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-600 sm:h-16 sm:w-16">
        <UploadCloud className="h-6 w-6 sm:h-7 sm:w-7" />
      </span>
      <span className="mt-4 font-semibold text-slate-950 sm:mt-5">
        {title}
      </span>
      <span className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </span>
      <span className="mt-6 rounded-lg border border-slate-400 bg-white px-5 py-3 text-sm font-medium text-slate-950">
        {document ? "Replace File" : "Select File"}
      </span>
      {document && (
        <span className="mt-3 max-w-full truncate text-xs font-medium text-teal-800">
          {document.original_filename}
        </span>
      )}
      <input
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => {
          void handleFileChange(event.target.files?.[0]);
        }}
      />
    </label>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Unable to read selected file."));
        return;
      }

      resolve(result.split(",")[1] ?? "");
    };

    reader.onerror = () => reject(new Error("Unable to read selected file."));
    reader.readAsDataURL(file);
  });
}
