require('dotenv').config();
const { runDailyJob } = require('./src/jobs/dailyJob');

(async () => {
  runDailyJob();
})();
