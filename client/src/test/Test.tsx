// src/test/Test.tsx
import { useEffect } from "react";
import { getJobs, getJobById } from "@/services";

export function TestJobService() {
  useEffect(() => {
    async function fetchData() {
      try {
        const jobs = await getJobs(1, 10);
        console.log("Danh sách jobs:", jobs);

        if (jobs.jobs.length > 0) {
          const jobDetail = await getJobById(jobs.jobs[0].id);
          console.log("Chi tiết job:", jobDetail);
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      }
    }

    void fetchData();
  }, []);

  return <div>Test Job Service - Mở console để xem kết quả</div>;
}
