/**
 * Memos Sync Cron Job
 * Runs memos sync every day at 2:00 AM
 */

const cron = require('node-cron');
const { main } = require('./sync-memos');

console.log('Starting Memos sync cron job...');

// Schedule cron job to run every day at 2:00 AM
const task = cron.schedule('0 2 * * *', async () => {
  console.log('\n=== Running scheduled memos sync ===');
  try {
    await main();
    console.log('=== Scheduled sync completed successfully ===\n');
  } catch (error) {
    console.error('=== Scheduled sync failed ===', error);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Shanghai' // Use your local timezone
});

// Also run sync immediately when script starts
console.log('Running initial memos sync...');
main().catch(error => {
  console.error('Initial sync failed:', error);
});

console.log('Cron job scheduled. Will run every day at 2:00 AM.');
console.log('Press Ctrl+C to stop.');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping cron job...');
  task.stop();
  console.log('Cron job stopped.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping cron job...');
  task.stop();
  console.log('Cron job stopped.');
  process.exit(0);
});
