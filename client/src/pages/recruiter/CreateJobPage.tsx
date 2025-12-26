// src/pages/recruiter/CreateJobPage.tsx
import { JobForm } from "@/components/recruiter/recruiterJob";
import { useCreateJob, useAppNavigate } from "@/hooks";
import type { JobCreatePayload } from "@/types";

export default function CreateJobPage() {
  const navigate = useAppNavigate();
  const { mutateAsync, isPending } = useCreateJob();

  async function handleCreate(data: JobCreatePayload) {
    const job = await mutateAsync(data);
    if (job) {
      navigate("/recruiter/jobs");
    }
  }

  return (
    <JobForm
      mode="create"
      loading={isPending}
      onSubmit={(e) => void handleCreate(e)}
      onCancel={() => navigate("/recruiter/jobs")}
    />
  );
}
