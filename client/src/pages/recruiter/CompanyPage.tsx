// src/pages/recruiter/CompanyPage.tsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Loader, ErrorBox } from "@/components";
import {
  Modal,
  CompanyForm,
  StatusBadge,
  InfoRow,
} from "@/components/recruiter";
import {
  useMyCompany,
  useCreateCompany,
  useUpdateCompany,
  useSubmitCompanyVerification,
  useCompanyForm,
} from "@/hooks";
import { getAxiosErrorMessage, resolveImage, formatDateDMY } from "@/utils";

export function RecruiterCompanyPage() {
  const { data: company, isLoading, isError, error, refetch } = useMyCompany();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const submitMutation = useSubmitCompanyVerification();

  const status = company?.verification?.status;
  const editable = status !== "verified";

  const {
    form,
    updateField,
    setFromCompany,
    buildCreateFormData,
    buildUpdateFormData,
  } = useCompanyForm();

  useEffect(() => {
    if (company) {
      setFromCompany(company);
    }
  }, [company, setFromCompany]);

  const companyLogo = resolveImage(company?.logo);
  const incorporationDate = formatDateDMY(company?.incorporationDate);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader size={26} />
      </div>
    );
  }

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

  /* ========== CASE: NO COMPANY ========== */
  if (!company) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-white shadow-lg rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Bạn chưa có hồ sơ công ty</h2>
          <p className="text-gray-600 mb-6">
            Hãy tạo công ty để bắt đầu đăng tuyển.
          </p>

          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Tạo công ty
          </button>
        </div>

        <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
          <h3 className="text-xl font-semibold mb-6">Tạo công ty mới</h3>
          <CompanyForm
            form={form}
            updateField={updateField}
            allowAllFields
            editable
          />

          <button
            type="button"
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
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

  /* ========== CASE: COMPANY EXISTS ========== */
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border"
      >
        {/* HEADER */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 border rounded-xl overflow-hidden bg-gray-50">
            <img
              src={companyLogo}
              onError={(e) => {
                e.currentTarget.src = resolveImage(null); // fallback ảnh mặc định
              }}
              className="w-full h-full object-cover"
              alt="logo"
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

        {/* ACTIONS */}
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
              className={`px-5 py-2.5 rounded-lg text-white ${
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
              className={`px-5 py-2.5 rounded-lg text-white cursor-pointer ${
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
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
          >
            Chỉnh sửa thông tin
          </button>
        </div>

        {/* INFO */}
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

      {/* EDIT MODAL */}
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
                setOpenEdit(false);
              },
              onError: () => toast.error("Cập nhật thất bại!"),
            })
          }
          className={`mt-6 px-6 py-3 rounded-xl text-white ${
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
