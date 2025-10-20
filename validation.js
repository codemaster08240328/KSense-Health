function isValidDataResp(resp) {
  return !!resp.data.length;
}

module.exports = isValidDataResp;