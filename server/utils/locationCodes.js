/**
 * Chuẩn hóa toàn bộ 63 tỉnh thành Việt Nam sang mã viết tắt 2–3 ký tự.
 * Tự động loại bỏ dấu, nhận dạng viết tắt, tên gọi khác như: HCM, TPHCM, Sai Gon, SG...
 */

const RAW_LOCATION_MAP = {
  // ===== Thành phố trực thuộc TƯ =====
  "ho chi minh": "HCM",
  "tp ho chi minh": "HCM",
  "thanh pho ho chi minh": "HCM",
  "tp.hcm": "HCM",
  "tp hcm": "HCM",

  "ha noi": "HN",

  "da nang": "DN",

  // ===== Miền Bắc =====
  "hai phong": "HP",
  "quang ninh": "QN",
  "lang son": "LS",
  "cao bang": "CB",
  "ha giang": "HG",
  "tuyen quang": "TQ",
  "lao cai": "LC",
  "yen bai": "YB",
  "phu tho": "PT",
  "vinh phuc": "VP",
  "bac ninh": "BN",
  "bac giang": "BG",
  "hai duong": "HD",
  "hung yen": "HY",
  "thai binh": "TB",
  "nam dinh": "ND",
  "ha nam": "HM",
  "ninh binh": "NB",
  "son la": "SL",
  "hoa binh": "HB",
  "dien bien": "DB",
  "lai chau": "LC2",

  // ===== Miền Trung =====
  "thanh hoa": "TH",
  "nghe an": "NA",
  "ha tinh": "HT",
  "quang binh": "QB",
  "quang tri": "QT",
  "thua thien hue": "HUE",
  "quang nam": "QNA",
  "quang ngai": "QNG",
  "binh dinh": "BDI",
  "phu yen": "PY",
  "khanh hoa": "KH",
  "Nha trang": "KH",
  "ninh thuan": "NT",
  "binh thuan": "BTH",

  // ===== Tây Nguyên =====
  "kon tum": "KT",
  "gia lai": "GL",
  "dak lak": "DL",
  "dak nong": "DN2",
  "lam dong": "LD",

  // ===== Miền Đông Nam Bộ =====
  "binh duong": "BD",
  "binh phuoc": "BP",
  "dong nai": "DNA",
  "tay ninh": "TN",
  "ba ria vung tau": "VT",

  // ===== Miền Tây Nam Bộ =====
  "long an": "LA",
  "tien giang": "TG",
  "ben tre": "BTR",
  "tra vinh": "TV",
  "vinh long": "VL",
  "dong thap": "DT",
  "an giang": "AG",
  "kien giang": "KG",
  "can tho": "CT",
  "hau giang": "HG2",
  "soc trang": "ST",
  "bac lieu": "BL",
  "ca mau": "CM",
};

/**
 * Loại bỏ dấu tiếng Việt → "Hồ Chí Minh" → "ho chi minh"
 */
function removeVietnamese(str = "") {
  return str
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "") // regex phải có /g
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D");
}

/**
 * Chuẩn hóa tỉnh thành → mã 2–3 ký tự
 * Ưu tiên:
 * 1) match tuyệt đối
 * 2) match contains (ví dụ: "Quan 1, TP HCM" → HCM)
 */
function normalizeLocation(input) {
  if (!input) {
    return null;
  }

  const cleaned = removeVietnamese(input).trim().toLowerCase();

  // 1) match tuyệt đối
  if (RAW_LOCATION_MAP[cleaned]) {
    return RAW_LOCATION_MAP[cleaned];
  }

  // 2) match theo chứa
  for (const [key, code] of Object.entries(RAW_LOCATION_MAP)) {
    if (cleaned.includes(key)) {
      return code;
    }
  }

  return "OTHER";
}

module.exports = {
  RAW_LOCATION_MAP,
  normalizeLocation,
  removeVietnamese,
};
