// src/hooks/useCompanyForm.ts
import { useState, useCallback } from "react";
import type { Company, CompanyFormState } from "@/types";

export function useCompanyForm() {
  const [form, setForm] = useState<CompanyFormState>({
    legal_name: "",
    registration_number: "",
    tax_id: "",
    country_code: "",
    registered_address: "",
    incorporation_date: "",
    logo: null,
  });

  const updateField = useCallback(
    <K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setFromCompany = useCallback((company: Company) => {
    setForm({
      legal_name: company.legalName,
      registration_number: company.registrationNumber,
      tax_id: company.taxId ?? "",
      country_code: company.countryCode,
      registered_address: company.registeredAddress,
      incorporation_date: company.incorporationDate?.split("T")[0] ?? "",
      logo: null,
    });
  }, []);

  const buildCreateFormData = useCallback(() => {
    const fd = new FormData();

    for (const [key, value] of Object.entries(form)) {
      if (!value) {
        continue;
      }

      if (value instanceof File) {
        fd.append(key, value);
      } else {
        fd.append(key, String(value));
      }
    }

    return fd;
  }, [form]);

  const buildUpdateFormData = useCallback(() => {
    const fd = new FormData();
    fd.append("legal_name", form.legal_name);
    fd.append("registered_address", form.registered_address);
    fd.append("tax_id", form.tax_id);
    fd.append("incorporation_date", form.incorporation_date);
    if (form.logo) {
      fd.append("logo", form.logo);
    }
    return fd;
  }, [form]);

  return {
    form,
    updateField,
    setFromCompany,
    buildCreateFormData,
    buildUpdateFormData,
  };
}
