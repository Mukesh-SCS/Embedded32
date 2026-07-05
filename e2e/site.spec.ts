import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = '/Embedded32';

const LAB_SLUGS = [
  'lab-01-can-basics',
  'lab-02-j1939-messaging',
  'lab-03-multi-ecu-simulation',
  'lab-04-diagnostics-and-faults',
];

test.describe('Embedded32 static site (GitHub Pages export)', () => {
  test('homepage loads under /Embedded32/', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.getByTestId('home-hero')).toBeVisible();
    await expect(page.getByRole('heading', { name: /UNDERSTAND THE BUS/i })).toBeVisible();
  });

  test('mobile navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/`);
    const nav = page.getByTestId('mobile-nav');
    await expect(nav).toBeVisible();
    await nav.locator('summary').click();
    await nav.getByRole('link', { name: 'Demo' }).click();
    await expect(page).toHaveURL(/\/Embedded32\/demo\//);
  });

  test('documentation navigation works', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Docs' })
      .click();
    await expect(page).toHaveURL(/\/Embedded32\/docs\/getting-started\//);
  });

  test('package index opens', async ({ page }) => {
    await page.goto(`${BASE}/packages/`);
    await expect(page.getByTestId('packages-index-title')).toBeVisible();
  });

  test('package cards open', async ({ page }) => {
    await page.goto(`${BASE}/packages/`);
    await page.getByTestId('pkg-card-can').click();
    await expect(page).toHaveURL(/\/Embedded32\/packages\/can\//);
  });

  test('lab index opens', async ({ page }) => {
    await page.goto(`${BASE}/labs/`);
    await expect(page.getByTestId('labs-index-title')).toBeVisible();
  });

  for (const slug of LAB_SLUGS) {
    test(`lab page opens: ${slug}`, async ({ page }) => {
      await page.goto(`${BASE}/labs/${slug}/`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }

  test('lab cards link correctly', async ({ page }) => {
    await page.goto(`${BASE}/labs/`);
    await page.getByTestId('lab-card-lab-01-can-basics').click();
    await expect(page).toHaveURL(/lab-01-can-basics/);
  });

  test('browser demo starts and decodes J1939 fields', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await expect(page.getByTestId('demo-page-title')).toBeVisible();
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-frame-row').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('demo-latest-decode')).toContainText(/Engine Speed|rpm/i);
    const row = page.getByTestId('demo-frame-row').first();
    await expect(row).toContainText(/0xF004/i);
  });

  test('default scenario loads and can be changed', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    const select = page.getByTestId('demo-scenario');
    await select.selectOption('engine-overheat');
    await expect(select).toHaveValue('engine-overheat');
  });

  test('play and pause work', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-step-forward').click();
    await expect(page.getByTestId('demo-state')).toContainText(/PAUSED/i);
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-state')).toContainText(/PLAYING/i);
    await page.getByTestId('demo-pause').click();
    await expect(page.getByTestId('demo-state')).toContainText(/PAUSED/i);
  });

  test('step forward and backward work', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-step-forward').click();
    await expect(page.getByTestId('demo-frame-count')).not.toContainText('0 /');
    await page.getByTestId('demo-step-back').click();
  });

  test('seek works', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-frame-row').first()).toBeVisible({ timeout: 15_000 });
    const seek = page.getByTestId('demo-seek');
    await seek.fill('50');
    await seek.dispatchEvent('input');
  });

  test('address-claim scenario displays correctly', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-scenario').selectOption('address-claim-conflict');
    await page.getByTestId('demo-step-forward').click();
    await expect(page.getByTestId('demo-scenario-overview')).toContainText(/Address Claim/i);
  });

  test('multi-packet scenario displays progress', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-scenario').selectOption('multi-packet-message');
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-frame-row').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('demo-latest-decode')).toContainText(/BAM|TP/i);
  });

  test('frame selection opens the inspector', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-step-forward').click();
    await page.getByTestId('demo-frame-row').first().click();
    await expect(page.getByTestId('demo-inspector')).toBeVisible();
  });

  test('frame filtering works', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-frame-row').first()).toBeVisible({ timeout: 15_000 });
    const before = await page.getByTestId('demo-frame-row').count();
    await page.getByTestId('demo-pgn-filter').fill('feca');
    const after = await page.getByTestId('demo-frame-row').count();
    expect(after).toBeLessThanOrEqual(before);
  });

  test('CSV export downloads a valid file', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-frame-row').first()).toBeVisible({ timeout: 15_000 });
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('demo-export-csv').click(),
    ]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const csv = Buffer.concat(chunks).toString('utf8');
    expect(csv).toContain('timestampMs');
    expect(csv).toContain('pgnHex');
  });

  test('JSON export downloads valid JSON', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-frame-row').first()).toBeVisible({ timeout: 15_000 });
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('demo-export-json').click(),
    ]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    expect(Array.isArray(parsed.frames)).toBe(true);
    expect(parsed.frames.length).toBeGreaterThan(0);
  });

  test('valid trace imports', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-trace-input').fill(
      JSON.stringify({
        scenario: 'e2e-import',
        frames: [{ id: '18F0040E', timestampMs: 0, data: [0, 0, 0, 16, 0] }],
      })
    );
    await page.getByTestId('demo-trace-import').click();
    await expect(page.getByTestId('demo-trace-error')).toHaveCount(0);
  });

  test('invalid trace is rejected', async ({ page }) => {
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-trace-input').fill('{not valid json');
    await page.getByTestId('demo-trace-import').click();
    await expect(page.getByTestId('demo-trace-error')).toContainText(/Invalid JSON/i);
  });

  test('nested route loads directly', async ({ page }) => {
    await page.goto(`${BASE}/docs/concepts/can/`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('nested route survives browser refresh', async ({ page }) => {
    await page.goto(`${BASE}/labs/lab-01-can-basics/`);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(page.url()).toMatch(/\/Embedded32\/labs\/lab-01-can-basics\//);
  });

  test('404 page works', async ({ page }) => {
    const response = await page.goto(`${BASE}/this-route-does-not-exist/`);
    expect(response?.status()).toBe(404);
  });

  test('navigation does not lose /Embedded32/', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await Promise.all([
      page.waitForURL(/\/Embedded32\/labs\//),
      nav.getByRole('link', { name: 'Labs' }).click(),
    ]);
    expect(page.url()).toMatch(/\/Embedded32\/labs\//);
    await Promise.all([
      page.waitForURL(/\/Embedded32\/demo\//),
      nav.getByRole('link', { name: 'Demo' }).click(),
    ]);
    expect(page.url()).toMatch(/\/Embedded32\/demo\//);
  });

  test('no required request points to localhost services', async ({ page }) => {
    const localhostCalls: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (/localhost|127\.0\.0\.1/.test(url) && !url.includes('127.0.0.1:4173')) {
        localhostCalls.push(url);
      }
    });
    await page.goto(`${BASE}/demo/`);
    await page.getByTestId('demo-play').click();
    await expect(page.getByTestId('demo-frame-row').first()).toBeVisible({ timeout: 15_000 });
    expect(localhostCalls).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(`${BASE}/`);
    expect(errors).toEqual([]);
  });

  test('homepage accessibility scan', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(serious).toEqual([]);
  });
});
