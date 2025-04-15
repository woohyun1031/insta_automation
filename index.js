require('dotenv').config();
const { runDailyJob } = require('./src/jobs/dailyJob');

console.log('⏰ Instagram Monitor Service Start');

runDailyJob();