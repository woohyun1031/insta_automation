function isNewerThan(dateString, baseDate) {
  return new Date(dateString) > new Date(baseDate);
}

module.exports = { isNewerThan };
