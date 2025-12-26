// server/services/recommendSystemService.js
const prisma = require("../utils/prisma");
const emailService = require("./emailService");

/**
 * Gửi email đề xuất job cho ỨNG VIÊN
 * - Lấy recommendation
 * - Gửi email
 * - Đánh dấu đã gửi
 */
async function sendJobRecommendations({
  minFitScore = 0.6,
  limitPerUser = 5,
} = {}) {
  // 1. Lấy toàn bộ recommendation hợp lệ
  const rows = await prisma.jobRecommendation.findMany({
    where: {
      status: "pending",
      is_sent: false,
      fit_score: { gte: minFitScore },
      user: {
        receive_recommendation: true,
        OR: [{ role: "applicant" }, { role: "admin" }],
      },
    },
    orderBy: [{ user_id: "asc" }, { fit_score: "desc" }],
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          company: {
            select: { legal_name: true },
          },
        },
      },
    },
  });

  if (!rows.length) {
    return { sent: 0, users: 0 };
  }

  // 2. Gom theo user
  const grouped = new Map();

  for (const row of rows) {
    const userId = row.user.id.toString();

    if (!grouped.has(userId)) {
      grouped.set(userId, {
        user: row.user,
        jobs: [],
      });
    }

    const bucket = grouped.get(userId);

    if (bucket.jobs.length >= limitPerUser) {
      continue;
    }

    bucket.jobs.push({
      recommendationId: row.id,
      jobId: row.job.id,
      title: row.job.title,
      company: row.job.company?.legal_name || null,
      location: row.job.location || null,
      fitScore: row.fit_score,
      reason: row.reason,
    });
  }

  // 3. Gửi mail + đánh dấu đã gửi
  let totalSent = 0;

  for (const { user, jobs } of grouped.values()) {
    if (!jobs.length) {
      continue;
    }

    try {
      // ===== GỬI EMAIL =====
      const subject = "Một số công việc có thể phù hợp với bạn";

      const html = `
        <div style="font-family: Arial; line-height:1.6;">
          <p>Chào <b>${user.name || "bạn"}</b>,</p>

          <p>
            Dựa trên hồ sơ và hoạt động của bạn, chúng tôi gợi ý một số vị trí
            có thể phù hợp:
          </p>

          <ul>
            ${jobs
              .map(
                (j) => `
                    <li style="margin-bottom:14px;">
                    <b>${j.title}</b>
                    ${j.company ? `- ${j.company}` : ""}
                    ${j.location ? `(${j.location})` : ""}
                    <br/>

                    <small style="color:#555;">
                        ${j.reason || "Phù hợp với hồ sơ của bạn"}
                    </small>
                    <br/>

                    <a
                        href="${process.env.CLIENT_URL}/jobs/${j.jobId}"
                        style="
                        display:inline-block;
                        margin-top:6px;
                        color:#2563eb;
                        text-decoration:none;
                        font-weight:600;
                        "
                        target="_blank"
                    >
                        Xem chi tiết công việc →
                    </a>
                    </li>
                `,
              )
              .join("")}
          </ul>

          <p>
            Bạn có thể đăng nhập để xem chi tiết và ứng tuyển nếu quan tâm.
          </p>

          <p style="margin-top:24px;">
            Trân trọng,<br/>
            <b>Recruitment System</b>
          </p>
        </div>
      `;

      await emailService.sendEmail(user.email, subject, html);

      // ===== ĐÁNH DẤU ĐÃ GỬI =====
      await prisma.jobRecommendation.updateMany({
        where: {
          id: {
            in: jobs.map((j) => BigInt(j.recommendationId)),
          },
        },
        data: {
          is_sent: true,
          sent_at: new Date(),
          status: "sent",
        },
      });

      totalSent += jobs.length;
    } catch (e) {
      console.error(
        `[JobRecommendation] Failed for user ${user.id}:`,
        e?.message,
      );
      // không throw, tránh ảnh hưởng user khác
    }
  }

  return {
    users: grouped.size,
    sent: totalSent,
  };
}

/**
 * Gửi email đề xuất ỨNG VIÊN cho NHÀ TUYỂN DỤNG
 * - Lấy candidate recommendation
 * - Gửi email
 * - Đánh dấu đã gửi
 */
async function sendCandidateRecommendations({
  minFitScore = 0.25,
  limitPerRecruiter = 5,
} = {}) {
  // 1. Lấy toàn bộ recommendation hợp lệ
  const rows = await prisma.candidateRecommendation.findMany({
    where: {
      status: "pending",
      is_sent: false,
      fit_score: { gte: minFitScore },
      recruiter: {
        OR: [{ role: "recruiter" }, { role: "admin" }],
        receive_recommendation: true,
      },
    },
    orderBy: [{ recruiter_id: "asc" }, { fit_score: "desc" }],
    include: {
      recruiter: {
        select: { id: true, name: true, email: true },
      },
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  if (!rows.length) {
    return { sent: 0, recruiters: 0 };
  }

  // 2. Gom theo recruiter
  const grouped = new Map();

  for (const row of rows) {
    const recruiterId = row.recruiter.id.toString();

    if (!grouped.has(recruiterId)) {
      grouped.set(recruiterId, {
        recruiter: row.recruiter,
        candidates: [],
      });
    }

    const bucket = grouped.get(recruiterId);

    if (bucket.candidates.length >= limitPerRecruiter) {
      continue;
    }

    bucket.candidates.push({
      recommendationId: row.id,
      applicantId: row.applicant.id,
      name: row.applicant.name,
      email: row.applicant.email,
      avatar: row.applicant.avatar,
      fitScore: row.fit_score,
      reason: row.reason,
    });
  }

  // 3. Gửi mail + đánh dấu đã gửi
  let totalSent = 0;

  for (const { recruiter, candidates } of grouped.values()) {
    if (!candidates.length) {
      continue;
    }

    try {
      // ===== GỬI EMAIL =====
      const subject =
        "Một số ứng viên có thể phù hợp với tin tuyển dụng của bạn";

      const html = `
        <div style="font-family: Arial; line-height:1.6;">
          <p>Chào <b>${recruiter.name || "bạn"}</b>,</p>

          <p>
            Dựa trên các tin tuyển dụng và yêu cầu của bạn,
            chúng tôi gợi ý một số ứng viên có thể phù hợp:
          </p>

          <ul>
            ${candidates
              .map(
                (c) => `
                  <li style="margin-bottom:14px;">
                    <b>${c.name}</b>
                    <br/>

                    <small style="color:#555;">
                      ${c.reason || "Ứng viên có mức độ phù hợp ban đầu"}
                    </small>
                    <br/>

                    <a
                      href="${process.env.CLIENT_URL}/recruiter/recommendation"
                      style="
                        display:inline-block;
                        margin-top:6px;
                        color:#2563eb;
                        text-decoration:none;
                        font-weight:600;
                      "
                      target="_blank"
                    >
                      Xem hồ sơ ứng viên →
                    </a>
                  </li>
                `,
              )
              .join("")}
          </ul>

          <p>
            Bạn có thể xem chi tiết hồ sơ và liên hệ nếu thấy phù hợp.
          </p>

          <p style="margin-top:24px;">
            Trân trọng,<br/>
            <b>Recruitment System</b>
          </p>
        </div>
      `;

      await emailService.sendEmail(recruiter.email, subject, html);

      // ===== ĐÁNH DẤU ĐÃ GỬI =====
      await prisma.candidateRecommendation.updateMany({
        where: {
          id: {
            in: candidates.map((c) => BigInt(c.recommendationId)),
          },
        },
        data: {
          is_sent: true,
          sent_at: new Date(),
          status: "sent",
        },
      });

      totalSent += candidates.length;
    } catch (e) {
      console.error(
        `[CandidateRecommendation] Failed for recruiter ${recruiter.id}:`,
        e?.message,
      );
      // không throw, tránh ảnh hưởng recruiter khác
    }
  }

  return {
    recruiters: grouped.size,
    sent: totalSent,
  };
}

module.exports = {
  sendJobRecommendations,
  sendCandidateRecommendations,
};
