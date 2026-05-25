import { chromium } from 'playwright';

const accounts = [
  { username: 'admin',        password: 'Admin@123', label: '超级管理员' },
  { username: 'region_admin', password: 'Admin@123', label: '区域管理员' },
  { username: 'org_admin',    password: 'Admin@123', label: '机构管理员' },
  { username: 'user',         password: 'Admin@123', label: '普通用户' },
];

const browser = await chromium.launch({ headless: true });

let allPass = true;
for (const acc of accounts) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const apiResponses = [];
  page.on('response', async resp => {
    if (resp.url().includes('/api/')) {
      apiResponses.push({
        url: resp.url().replace('http://localhost:5173', ''),
        status: resp.status(),
        ct: resp.headers()['content-type'] || '',
      });
    }
  });

  console.log(`\n=== ${acc.label} (${acc.username}) ===`);

  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('.login-btn');

  await page.fill('input[autocomplete="username"]', acc.username);
  await page.fill('input[autocomplete="current-password"]', acc.password);
  await page.click('.login-btn');

  // Wait for navigation to dashboard. If the cold-start chunk-load failure fires,
  // router.onError triggers a full reload — wait for that too.
  try {
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  } catch {
    // ignore; will report below
  }

  // Wait for the first metric value to actually render (data fetched & loading=false).
  // .el-skeleton is shown while metricLoading is true.
  let metricsRendered = false;
  try {
    await page.waitForFunction(
      () => {
        const els = document.querySelectorAll('.metric-value');
        return els.length >= 4 &&
          Array.from(els).every(e => (e.textContent || '').trim().length > 0);
      },
      { timeout: 15000 },
    );
    metricsRendered = true;
  } catch {
    // timed out
  }

  const finalUrl = page.url();
  const onDashboard = finalUrl.endsWith('/dashboard');
  console.log(`  Final URL: ${finalUrl} ${onDashboard ? '✓' : '✗'}`);

  const greeting = (await page.locator('.greeting-text').textContent().catch(() => '') || '').trim();
  console.log(`  Greeting:  ${greeting || '(none)'}`);

  const metricValues = (await page.locator('.metric-value').allTextContents())
    .map(v => v.trim()).filter(Boolean);
  console.log(`  Metrics:   ${metricValues.join(' | ') || '(none)'}`);

  const rankingRows = await page.locator('.ranking-card .el-table__row').count();
  console.log(`  Ranking:   ${rankingRows} rows`);

  const alertRows = await page.locator('.alert-item').count();
  console.log(`  Alerts:    ${alertRows} items`);

  // Inspect mock responses (these are what the Network panel will show)
  const dashApi = ['/api/user/login', '/api/result/summary', '/api/result/chart/trend',
                   '/api/result/chart/type-dist', '/api/result/org-ranking', '/api/result/alerts'];
  const matched = dashApi.map(p => {
    const r = apiResponses.find(x => x.url.startsWith(p));
    return { p, r };
  });
  console.log('  Mock responses (network panel):');
  matched.forEach(({ p, r }) => {
    if (r) {
      const ok = r.status === 200 && r.ct.includes('application/json');
      console.log(`    [${ok ? '✓' : '✗'}] ${r.status} ${r.ct.split(';')[0]} ${p}`);
    } else {
      console.log(`    [✗] missing ${p}`);
    }
  });

  const allMocksOk = matched.every(({ r }) =>
    r && r.status === 200 && r.ct.includes('application/json'));

  const pass =
    onDashboard &&
    metricsRendered &&
    rankingRows >= 5 &&
    alertRows >= 5 &&
    allMocksOk;
  console.log(`  RESULT:    ${pass ? 'PASS ✓' : 'FAIL ✗'}`);
  if (!pass) allPass = false;

  await ctx.close();
}

await browser.close();
console.log(`\n${allPass ? '✓ ALL 4 ACCOUNTS PASS' : '✗ SOME ACCOUNTS FAILED'}`);
process.exit(allPass ? 0 : 1);
