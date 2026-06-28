const path = require('path');

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  // Keep Chrome inside node_modules/.cache so Vercel's build cache
  // persists it between deployments (avoids re-downloading 170 MB).
  cacheDirectory: path.join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};
