function getYesterdayMidnightISO() {
  const now = new Date();
  now.setDate(now.getDate() - 1); // 하루 전으로
  now.setHours(0, 0, 0, 0); // 00:00:00.000 으로 리셋
  return now.toISOString();
}

module.exports = { getYesterdayMidnightISO };
