const isValidDataResp = require("./validation");

async function fetchWithRetry(url, option = {}, retries = 3, delay = 1000) {
  try {
    const resp = await fetch(url, option);

    if (resp.ok) {
      const res = await resp.json();

      if (retries > 0 && !isValidDataResp(res)) {
        console.warn(`Retrying api request due to bad response`);
        return fetchWithRetry(url, option, retries);
      }
      
      return res;
    }

    if ([429, 500, 503].includes(resp.status)) {
      if (retries > 0) {
        console.warn(`Retrying (${retries})... due to ${response.status}`);
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(url, option, retries - 1, delay * 2);
      }
    }

    throw new Error(`Request failed with status ${response.status}`);

  } catch (error) {
    if (retries > 0) {
      console.warn(`Network error: ${error.message}. Retrying (${retries})...`);

      await new Promise(res => setTimeout(res, delay));

      return fetchWithRetry(url, option, retries - 1, delay * 2);
    }

    throw error; // Give up after all retries
  }
}

module.exports = fetchWithRetry;