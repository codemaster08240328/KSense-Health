/**
 * Ksense Healthcare API Assessment
 * Author: Davis De Auntray
 */

const fetchWithRetry = require('./fetchWithRetry.js');
const { API_KEY, BASE_URL } = require('./constants.js');
const { getAgeScore, getBpScore, getTempScore } = require('./utilities.js');

// ---- Main Logic ----
async function runAssessment() {
  // --- Fetch all patients with retry fetch logic. ---
  console.log("Fetching all patient data...");

  let option = {
     headers: { "x-api-key": API_KEY }
  }
  
  const allPatients = [];
  let page = 1;
  let hasNext = true;
  
  while (hasNext) {
    let endpoint = `/patients?page=${page}&limit=20`;
    const res = await fetchWithRetry(`${BASE_URL}${endpoint}`, option, 5);
    allPatients.push(...res.data);
    hasNext = res.pagination.hasNext;
    page++;
  }

  console.log(`Total patients fetched: ${allPatients.length}`);

  // --- Analyze data / set score based on requirements ---

  const highRisk = [];
  const feverPatients = [];
  const dataQualityIssues = [];

  for (const p of allPatients) {
    const bpScore = getBpScore(p.blood_pressure);
    const tempScore = getTempScore(p.temperature);
    const ageScore = getAgeScore(p.age);

    // Fever check (>=99.6°F)
    if (tempScore > 0) {
      feverPatients.push(p.patient_id);
    }

    if ([bpScore, tempScore, ageScore].includes(null)) {
      dataQualityIssues.push(p.patient_id);
      continue;
    }

    const total = (bpScore || 0) + (tempScore || 0) + (ageScore || 0);
    if (total >= 4) highRisk.push(p.patient_id);
  }

  console.log(`High-risk patients: ${highRisk.length}`);
  console.log(`Fever patients: ${feverPatients.length}`);
  console.log(`Data quality issues: ${dataQualityIssues.length}`);


  // --- Post submit alert ---

  const payload = {
    high_risk_patients: highRisk,
    fever_patients: feverPatients,
    data_quality_issues: dataQualityIssues,
  };

  console.log(payload);
  console.log("Submitting results...");

  option.headers['Content-Type'] = "application/json";
  option.method = "POST";
  option.body = JSON.stringify(payload);

  const res = await fetchWithRetry(`${BASE_URL}/submit-assessment`, option, 0);

  console.log("✅ Submission Result:", res);
}

// Run
runAssessment().catch((err) => {
  console.error("❌ Error:", err);
});