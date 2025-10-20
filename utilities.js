// ---- Scoring Functions ----
function parseBloodPressure(bpStr) {
  if (!bpStr || typeof bpStr !== "string" || !bpStr.includes("/")) return null;
  const [systolic, diastolic] = bpStr.split("/").map(Number);
  if (isNaN(systolic) || isNaN(diastolic)) return null;
  return { systolic, diastolic };
}

function getBpScore(bpStr) {
  const bp = parseBloodPressure(bpStr);
  if (!bp) return null;

  const { systolic, diastolic } = bp;
  if (systolic >= 140 || diastolic >= 90) return 3;
  if (systolic >= 130 || diastolic >= 80) return 2;
  if (systolic >= 120 && diastolic < 80) return 1;
  return 0;
}

function getTempScore(tempF) {
  if (tempF == null) return null;
  if (tempF >= 101) return 2;
  if (tempF >= 99.6) return 1;
  return 0;
}

function getAgeScore(age) {
  if (age == null) return null;
  if (age > 65) return 2;
  if (age >= 40) return 1;
  return 0;
}

module.exports = {
  getAgeScore,
  getTempScore,
  getBpScore,
  parseBloodPressure
}