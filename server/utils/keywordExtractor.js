// utils/keywordExtractor.js
// stopword nghề nghiệp Việt + common English noise
const STOPWORDS = new Set([
  "và",
  "hoặc",
  "của",
  "cho",
  "trong",
  "với",
  "tại",
  "làm",
  "công",
  "việc",
  "tuyển",
  "dụng",
  "nhân",
  "vien",
  "nhan",
  "viên",
  "chuyên",
  "chuyen",
  "chuyen vien",
  "chuyên viên",
  "quan",
  "quản",
  "ly",
  "li",
  "vi",
  "tri",
  "vi tri",
  "ung",
  "ung vien",
  "mota",
  "mo",
  "ta",
  "mo ta",
]);

// normalize title
function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-z0-9\s.]/gi, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function extractTopKeywords(title, limit = 3) {
  const text = normalize(title);
  const words = text.split(" ").filter(Boolean);

  // 1. candidate tokens
  const tokens = words.filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  const scored = [];

  // 2. Unigram scoring
  for (const t of tokens) {
    let score = 1;

    // từ kỹ thuật
    if (/js|java|sql|api|aws|azure|gcp|devops|cloud|data|ai|ml/i.test(t)) {
      score += 1;
    }

    // tiếng anh (đa số từ nghề)
    if (/[a-z]/.test(t)) {
      score += 0.2;
    }

    // có số/công nghệ
    if (/\d/.test(t) || t.includes(".js")) {
      score += 0.3;
    }

    scored.push({ name: t, score });
  }

  // 3. Bigram simple scoring
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i];
    const b = words[i + 1];

    if (STOPWORDS.has(a) || STOPWORDS.has(b)) {
      continue;
    }
    const bigram = `${a} ${b}`;

    scored.push({ name: bigram, score: 1.5 });
  }

  // 4. Sort + unique
  const seen = new Set();
  const final = scored
    .sort((a, b) => b.score - a.score)
    .filter((item) => {
      if (seen.has(item.name)) {
        return false;
      }
      seen.add(item.name);
      return true;
    })
    .slice(0, limit);

  // 5. Normalize weight about [0..1]
  const max = final[0]?.score || 1;

  return final.map((item) => ({
    name: item.name,
    weight: Number((item.score / max).toFixed(2)),
  }));
}

module.exports = { extractTopKeywords };
