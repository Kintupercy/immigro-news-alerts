import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const base = process.argv[2] || 'http://127.0.0.1:8788';
const id = 'cfdcf323-b634-4e59-8ba4-811e9ec5fc14';
const title = 'DHS Rule Covers Some Children Born in U.S. to Foreign Government Employees';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  const response = await page.goto(`${base}/news/${id}`, { waitUntil: 'networkidle0', timeout: 60000 });
  assert.equal(response.status(), 200);
  assert.equal(response.headers()['x-immigronews-render'], 'runtime-news-v1');
  await page.waitForFunction((expected) => document.querySelector('h1')?.textContent === expected && document.querySelectorAll('header a').length > 1, { timeout: 30000 }, title);
  const inspect = () => page.evaluate(() => ({
    title: document.title, h1: document.querySelector('h1')?.textContent,
    canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((x) => x.href),
    og: [...document.querySelectorAll('meta[property="og:title"]')].map((x) => x.content),
    twitter: [...document.querySelectorAll('meta[name="twitter:title"]')].map((x) => x.content),
    schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map((x) => JSON.parse(x.textContent)).filter((x) => x['@type'] === 'NewsArticle'),
  }));
  let data = await inspect();
  assert.equal(data.h1, title); assert.equal(data.title, `${title} | ImmigroNews`);
  assert.deepEqual(data.canonical, [`https://immigronews.com/news/${id}`]);
  assert.deepEqual(data.og, [data.title]); assert.deepEqual(data.twitter, [data.title]);
  assert.equal(data.schemas.length, 1); assert.equal(data.schemas[0].headline, title);
  const screenshot = '/tmp/immigronews-runtime-browser.png';
  await page.screenshot({ path: screenshot, fullPage: true });
  await page.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.textContent.includes('All immigration news')).click());
  await page.waitForFunction(() => location.pathname === '/news' && document.title.includes('Latest'), { timeout: 30000 });
  assert.equal(await page.locator('meta[property="og:title"]').map((x) => x.content).wait(), await page.title());
  await page.goBack({ waitUntil: 'networkidle0' });
  await page.waitForFunction((expected) => document.querySelector('h1')?.textContent === expected, { timeout: 30000 }, title);
  data = await inspect(); assert.equal(data.og.length, 1); assert.equal(data.schemas.length, 1); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ base, status: response.status(), renderer: response.headers()['x-immigronews-render'], ...data, navigation: 'article → /news → back passed', pageErrors: errors, screenshot }, null, 2));
} finally { await browser.close(); }
