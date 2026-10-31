const cron = require('node-cron');
const renewalService = require('../services/renewalService');

function initRenewalCron() {
  const schedule = process.env.RENEWAL_CRON_SCHEDULE || '*/15 * * * *';
  console.log(`[Renewal Cron] Scheduled renewal background worker with schedule: "${schedule}"`);

  cron.schedule(schedule, async () => {
    console.log('[Renewal Cron] Running automated renewal check job...');
    try {
      const result = await renewalService.checkAndProcessRenewals();
      console.log(`[Renewal Cron] Completed check. Invoices generated: ${result.invoicesGenerated}, Expired: ${result.expiredCount}`);
    } catch (err) {
      console.error('[Renewal Cron Error]', err.message);
    }
  });
}

module.exports = { initRenewalCron };
