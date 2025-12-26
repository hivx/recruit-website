// src/types/company.ts
/** Trạng thái xác minh công ty */
export type CompanyVerificationStatus = "submitted" | "verified" | "rejected";

/** Raw từ BE (toCompanyDTO) */
export interface CompanyVerificationRaw {
  status: CompanyVerificationStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  reviewed_by: string | null;
}

export interface CompanyRaw {
  id: string;
  legal_name: string;
  registration_number: string;
  tax_id: string | null;
  country_code: string;
  registered_address: string;
  incorporation_date: string | null;
  owner_id: string;
  logo: string | null;
  created_at: string;
  updated_at: string;
  verification: CompanyVerificationRaw | null;
}

/** Company FE (camelCase) */
export interface CompanyVerification {
  status: CompanyVerificationStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  reviewedBy: string | null;
}

export interface Company {
  id: string;
  legalName: string;
  registrationNumber: string;
  taxId: string | null;
  countryCode: string;
  registeredAddress: string;
  incorporationDate: string | null;
  ownerId: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  verification: CompanyVerification | null;
}

/* ================= TYPES ================= */
export interface CompanyFormState {
  readonly legal_name: string;
  readonly registration_number: string;
  readonly tax_id: string;
  readonly country_code: string;
  readonly registered_address: string;
  readonly incorporation_date: string;
  readonly logo: File | null;
}

export interface CompanyFormProps {
  readonly form: CompanyFormState;
  readonly updateField: <K extends keyof CompanyFormState>(
    key: K,
    value: CompanyFormState[K],
  ) => void;
  readonly allowAllFields: boolean;
  readonly editable?: boolean;
}

export interface SubmitCompanyResponse {
  company_id: string;
  status: "submitted";
  submitted_at: string;
}

// Raw từ BE: GET /api/companies/admin
export interface CompanyListResponseRaw {
  companies: CompanyRaw[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CompanyListResponse {
  companies: Company[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VerifyCompanyPayload {
  status: CompanyVerificationStatus;
  reason?: string; // chỉ cần khi rejected
}

/* ===== RAW (BE) ===== */
export interface VerifyCompanyResponseRaw {
  company_id: string;
  status: CompanyVerificationStatus;
  rejection_reason: string | null;
  verified_at: string | null;
  reviewed_by: string | null;
}

/* ===== FE (camelCase) ===== */
export interface VerifyCompanyResponse {
  companyId: string;
  status: CompanyVerificationStatus;
  rejectionReason: string | null;
  verifiedAt: string | null;
  reviewedBy: string | null;
}
