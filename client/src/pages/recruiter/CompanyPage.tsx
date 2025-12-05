import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader, ErrorBox } from "@/components";
import {
  useMyCompany,
  useCreateCompany,
  useUpdateCompany,
  useSubmitCompanyVerification,
} from "@/hooks";
import { getAxiosErrorMessage, resolveImage, formatDateDMY } from "@/utils";

/* ============================================================
    MODAL COMPONENT — Smooth animated popup
============================================================ */
interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

function Modal({ open, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl"
          >
            {children}

            <div className="mt-6 flex justify-end">
              <button
                className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
    TYPES
============================================================ */
interface CompanyFormState {
  readonly legal_name: string;
  readonly registration_number: string;
  readonly tax_id: string;
  readonly country_code: string;
  readonly registered_address: string;
  readonly incorporation_date: string;
  readonly logo: File | null;
}

interface CompanyFormProps {
  readonly form: CompanyFormState;
  readonly updateField: <K extends keyof CompanyFormState>(
    key: K,
    value: CompanyFormState[K],
  ) => void;
  readonly allowAllFields: boolean;
  readonly editable?: boolean;
}

/* ============================================================
    LOGO INPUT (Upload + Preview)
============================================================ */
interface LogoInputProps {
  readonly label: string;
  readonly file: File | null;
  readonly onChange: (f: File | null) => void;
}

function LogoInput({ label, file, onChange }: LogoInputProps) {
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex items-center gap-4">
        {/* Preview box */}
        <div className="w-20 h-20 rounded-xl border bg-gray-100 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Logo preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs">No image</span>
          )}
        </div>

        {/* Hidden input */}
        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        {/* Upload Button */}
        <label
          htmlFor="logo-upload"
          className="
            px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700
            cursor-pointer text-sm hover:bg-gray-100 transition shadow-sm
          "
        >
          Chọn ảnh
        </label>
      </div>
    </div>
  );
}

/* ============================================================
    SMALL INPUT COMPONENT
============================================================ */
interface InputProps {
  readonly label: string;
  readonly value: string;
  readonly type?: string;
  readonly disabled?: boolean;
  readonly onChange?: (v: string) => void;
}

function Input({
  label,
  value,
  type = "text",
  disabled,
  onChange,
}: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 px-4 py-2 border rounded-xl disabled:bg-gray-100"
      />
    </div>
  );
}

/* ============================================================
    COMPANY FORM
============================================================ */
function CompanyForm({
  form,
  updateField,
  allowAllFields,
  editable = true,
}: CompanyFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Tên pháp lý"
        value={form.legal_name}
        disabled={!editable}
        onChange={(v) => updateField("legal_name", v)}
      />

      {allowAllFields && (
        <Input
          label="Mã đăng ký kinh doanh"
          value={form.registration_number}
          onChange={(v) => updateField("registration_number", v)}
        />
      )}

      {allowAllFields && (
        <Input
          label="Mã quốc gia"
          value={form.country_code}
          onChange={(v) => updateField("country_code", v)}
        />
      )}

      <Input
        label="Địa chỉ đăng ký"
        value={form.registered_address}
        disabled={!editable}
        onChange={(v) => updateField("registered_address", v)}
      />

      <Input
        label="Mã số thuế"
        value={form.tax_id}
        disabled={!editable}
        onChange={(v) => updateField("tax_id", v)}
      />

      <Input
        label="Ngày thành lập"
        type="date"
        value={form.incorporation_date}
        disabled={!editable}
        onChange={(v) => updateField("incorporation_date", v)}
      />

      <LogoInput
        label="Logo công ty"
        file={form.logo}
        onChange={(file) => updateField("logo", file)}
      />
    </div>
  );
}

/* ============================================================
    STATUS BADGE
============================================================ */
function StatusBadge({ status }: { readonly status?: string }) {
  const map: Record<string, string> = {
    submitted: "bg-yellow-100 text-yellow-700",
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
        status ? map[status] : "bg-gray-100 text-gray-600"
      }`}
    >
      {status ?? "Chưa xác định"}
    </span>
  );
}

/* ============================================================
    INFO ROW
============================================================ */
function InfoRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <div className="text-gray-500 font-medium">{label}</div>
      <div className="text-gray-800">{value}</div>
    </div>
  );
}

/* ============================================================
    MAIN PAGE
============================================================ */
export function RecruiterCompanyPage() {
  const { data: company, isLoading, isError, error, refetch } = useMyCompany();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const submitMutation = useSubmitCompanyVerification();

  const status = company?.verification?.status;
  const editable = status !== "verified";

  const companyLogo = resolveImage(company?.logo);
  const incorporationDate = formatDateDMY(company?.incorporationDate);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  /* FORM STATE */
  const [form, setForm] = useState<CompanyFormState>({
    legal_name: "",
    registration_number: "",
    tax_id: "",
    country_code: "",
    registered_address: "",
    incorporation_date: "",
    logo: null,
  });

  function updateField<K extends keyof CompanyFormState>(
    key: K,
    value: CompanyFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (!company) {
      return;
    }

    setForm({
      legal_name: company.legalName,
      registration_number: company.registrationNumber,
      tax_id: company.taxId ?? "",
      country_code: company.countryCode,
      registered_address: company.registeredAddress,
      incorporation_date: company.incorporationDate?.split("T")[0] ?? "",
      logo: null,
    });
  }, [company]);

  /* BUILD FORM DATA */
  function buildCreateFormData(): FormData {
    const fd = new FormData();

    for (const [key, value] of Object.entries(form)) {
      if (value === null || value === "") {
        continue;
      }

      if (value instanceof File) {
        fd.append(key, value);
      } else if (typeof value === "string") {
        fd.append(key, value);
      } else {
        fd.append(key, String(value));
      }
    }
    return fd;
  }

  function buildUpdateFormData() {
    const fd = new FormData();
    fd.append("legal_name", form.legal_name);
    fd.append("registered_address", form.registered_address);
    fd.append("tax_id", form.tax_id);
    fd.append("incorporation_date", form.incorporation_date);

    if (form.logo) {
      fd.append("logo", form.logo);
    }
    return fd;
  }

  /* ============================================================
      LOADING
============================================================ */
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader size={26} />
      </div>
    );
  }

  /* ============================================================
      ERROR
============================================================ */
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <ErrorBox
          message={getAxiosErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  /* ============================================================
      CASE 1 — CHƯA CÓ COMPANY
============================================================ */
  if (!company) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-white shadow-lg rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Bạn chưa có hồ sơ công ty</h2>
          <p className="text-gray-600 mb-6">
            Hãy tạo công ty để bắt đầu đăng tuyển.
          </p>

          <button
            onClick={() => setOpenCreate(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition transform hover:scale-[1.02]"
          >
            Tạo công ty
          </button>
        </div>

        {/* CREATE MODAL */}
        <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
          <h3 className="text-xl font-semibold mb-6">Tạo công ty mới</h3>

          <CompanyForm
            form={form}
            updateField={updateField}
            allowAllFields={true}
          />

          <button
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            onClick={() =>
              createMutation.mutate(buildCreateFormData(), {
                onSuccess: () => {
                  toast.success("Tạo công ty thành công!");
                  setOpenCreate(false);
                },
                onError: () => toast.error("Không thể tạo công ty!"),
              })
            }
          >
            {createMutation.isPending ? "Đang tạo..." : "Xác nhận tạo công ty"}
          </button>
        </Modal>
      </div>
    );
  }

  /* ============================================================
      CASE 2 — ĐÃ CÓ COMPANY
============================================================ */
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border"
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 border rounded-xl overflow-hidden bg-gray-50">
            <img
              src={companyLogo}
              alt="Logo công ty"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{company.legalName}</h1>
            <p className="text-gray-600">{company.registeredAddress}</p>

            {status === "rejected" && company.verification?.rejectionReason && (
              <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">
                Hồ sơ bị từ chối: {company.verification.rejectionReason}
              </div>
            )}
          </div>

          <StatusBadge status={status} />
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex gap-4">
          {status !== "verified" && (
            <button
              disabled={submitMutation.isPending}
              onClick={() =>
                submitMutation.mutate(undefined, {
                  onSuccess: () => toast.success("Đã gửi yêu cầu xác thực!"),
                  onError: () => toast.error("Không thể gửi yêu cầu xác thực!"),
                })
              }
              className={`px-5 py-2.5 rounded-lg text-white transition ${
                submitMutation.isPending
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitMutation.isPending ? "Đang gửi..." : "Nộp xác thực"}
            </button>
          )}

          {status === "verified" && (
            <button
              disabled={submitMutation.isPending}
              onClick={() =>
                submitMutation.mutate(undefined, {
                  onSuccess: () => toast.success("Đã gửi yêu cầu chỉnh sửa!"),
                  onError: () => toast.error("Không thể gửi yêu cầu!"),
                })
              }
              className={`px-5 py-2.5 rounded-lg text-white transition ${
                submitMutation.isPending
                  ? "bg-yellow-300 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {submitMutation.isPending ? "Đang gửi..." : "Yêu cầu chỉnh sửa"}
            </button>
          )}

          <button
            onClick={() => setOpenEdit(true)}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Chỉnh sửa thông tin
          </button>
        </div>

        {/* ================= DETAIL INFO ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-6">
          <InfoRow
            label="Mã đăng ký kinh doanh"
            value={company.registrationNumber}
          />
          <InfoRow
            label="Mã số thuế"
            value={company.taxId ?? "Chưa cập nhật"}
          />
          <InfoRow label="Mã quốc gia" value={company.countryCode} />
          <InfoRow
            label="Ngày thành lập"
            value={incorporationDate ?? "Chưa cập nhật"}
          />
          <InfoRow label="Địa chỉ đăng ký" value={company.registeredAddress} />
        </div>
      </motion.div>

      {/* ================= EDIT MODAL ================= */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <h3 className="text-xl font-semibold mb-6">
          Chỉnh sửa thông tin công ty
        </h3>

        <CompanyForm
          form={form}
          updateField={updateField}
          allowAllFields={false}
          editable={editable}
        />

        <button
          disabled={!editable || updateMutation.isPending}
          onClick={() =>
            updateMutation.mutate(buildUpdateFormData(), {
              onSuccess: () => {
                toast.success("Cập nhật thành công!");
                setOpenEdit(false); // Đóng popup
              },
              onError: () => toast.error("Cập nhật thất bại!"),
            })
          }
          className={`mt-6 px-6 py-3 rounded-xl text-white transition ${
            !editable || updateMutation.isPending
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </Modal>
    </div>
  );
}
