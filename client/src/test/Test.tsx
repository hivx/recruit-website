import { useEffect } from "react";
import { getJobs, getJobById } from "@/services/jobService";

export function TestJobService() {
  useEffect(() => {
    async function fetchData() {
      try {
        const jobs = await getJobs(1, 10); // page=1, limit=5
        console.log("📌 Danh sách jobs:", jobs);

        if (jobs.data.length > 0) {
          const firstJobId = jobs.data[0]._id;
          const jobDetail = await getJobById(firstJobId);
          console.log("📌 Chi tiết job:", jobDetail);
        }
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
      }
    }

    fetchData();
  }, []);

  return <div>Test Job Service - Mở console để xem kết quả</div>;
}
