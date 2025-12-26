// src/pages/recruiter/EditJobPage.tsx
import { useParams } from "react-router-dom";
import { Loader, ErrorBox } from "@/components";
import { JobForm } from "@/components/recruiter/recruiterJob";
import { useJobById, useUpdateJob, useAppNavigate } from "@/hooks";
import type { JobCreatePayload } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigate();

  const { data, isError, error } = useJobById(id);
  const { mutateAsync, isPending } = useUpdateJob();

  if (!data) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorBox message={getAxiosErrorMessage(error)} />;
  }

  async function handleUpdate(payload: JobCreatePayload) {
    if (!id) {
      return;
    }
    const job = await mutateAsync({ jobId: id, data: payload });
    if (job) {
      navigate("/recruiter/jobs");
    }
  }

  return (
    <JobForm
      mode="edit"
      initialData={data}
      loading={isPending}
      onSubmit={(e) => void handleUpdate(e)}
      onCancel={() => navigate("/recruiter/jobs")}
    />
  );
}
