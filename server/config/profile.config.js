// server/config/profile.config.js
module.exports = {
  EVENT_WEIGHT: {
    view: 1, // xem chi tiết
    favorite: 3, // thêm yêu thích
    apply: 5, // ứng tuyển
    unfavorite: -2, // bỏ yêu thích (tín hiệu âm)
  },

  // Số ngày để điểm giảm đi một nửa (half-life)
  TIME_DECAY_DAYS: 30,

  // Chỉ sử dụng lịch sử trong N ngày gần nhất
  HISTORY_WINDOW_DAYS: 90,

  // Lấy bao nhiêu tag có điểm cao nhất để làm profile
  TOPK_TAGS: 3,

  // Ưu tiên từ CareerPreference
  PRIOR: { tag: 4, location: 4, desSalaryWe: 0.3, salaryFallback: true },

  // Khoảng thời gian tối thiểu giữa 2 lần rebuild profile liên tiếp (phút)
  MIN_REBUILD_INTERVAL_MINUTES: 12,

  // Khoảng thời gian để coi là duplicate log (phút)
  LOG_DUPLICATE_WINDOW_MINUTES: 10,

  // Lấy bao nhiêu keyword có điểm cao nhất để làm profile
  TOPK_KEY: 2,

  // Thời gian tối thiểu giữa 2 lần rebuild vector liên tiếp (phút)
  MIN_REBUILD_VECTOR_MINUTES: 15,

  // Khoảng thời gian chạy cron để rebuild vector tự động (phút)
  VECTOR_CRON_INTERVAL_MIN: 60,

  // Cấu hình auto recommend
  ENABLE_AUTO_RECOMMEND: true, // Bật/Tắt auto recommend
  CRON_SCHEDULE: "0 2 * * *", // 2:00 AM mỗi đêm (*/10 * * * * *)
  BATCH_SIZE: 300, // Xử lý từng lô 300 users

  // Cấu hình email recommend job
  JOB_RECOMMEND_EMAIL_CRON: "0 8 * * *", // 8h sáng
  JOB_RECOMMEND_MIN_SCORE: 0.6,
  JOB_RECOMMEND_LIMIT: 5,

  // Cấu hình email recommend candidate
  CANDIDATE_RECOMMEND_EMAIL_CRON: "0 9 * * *", // 9h sáng
  CANDIDATE_RECOMMEND_MIN_SCORE: 0.25,
  CANDIDATE_RECOMMEND_LIMIT: 5,
};
