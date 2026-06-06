export type MedicalCase = {
  admitted_at: string;
  amount_raised_kobo: number;
  bill_amount_kobo: number;
  created_at: string;
  diagnosis_summary: string;
  hospital_id: string;
  id: string;
  patient_id: string;
  public_link: string;
  public_slug: string;
  status: string;
  title: string;
  updated_at: string;
};

export type Patient = {
  created_at: string;
  date_of_birth: string;
  email: string;
  email_verified: boolean;
  email_verified_at: string;
  first_name: string;
  full_name: string;
  gender: string;
  id: string;
  last_name: string;
  phone_number: string;
  updated_at: string;
  username: string;
};

export type LoginResponse = {
  access_token: string;
  email: string;
  expires_in: number;
  login_challenge_id?: string;
  medical_cases: MedicalCase[];
  message: string;
  otp_expires_in_seconds?: number;
  otp_required?: boolean;
  patient: Patient;
  refresh_expires_in: number;
  refresh_token: string;
  role: string;
  token_type: string;
};

const patientSessionKey = "korede_patient_session";

export function savePatientSession(session: LoginResponse) {
  localStorage.setItem(patientSessionKey, JSON.stringify(session));
}

export function getPatientSession() {
  const rawSession = localStorage.getItem(patientSessionKey);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as LoginResponse;
  } catch {
    localStorage.removeItem(patientSessionKey);
    return null;
  }
}

export function clearPatientSession() {
  localStorage.removeItem(patientSessionKey);
}

export function formatNairaFromKobo(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountKobo / 100);
}
