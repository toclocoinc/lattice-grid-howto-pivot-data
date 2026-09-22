/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - pivoted on load, the grid shows one region-group row per region, each
 *     one carrying a generated column group for every distinct quarter, with
 *     a Revenue and a Units cell inside it;
 *   - each generated cell holds the right sum, computed here from the same
 *     inline data demo.js loads;
 *   - clicking "Show flat rows" returns the plain Region/Quarter/Revenue/Units
 *     columns and all twelve rows in their original order;
 *   - clicking it again pivots the grid back;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

// The same twelve rows demo.js loads, so the expected sums are computed here
// rather than hard-coded, and stay honest if the data ever changes.
const SALES = [
  { region: 'EMEA', quarter: 'Q1', revenue: 120, units: 40 },
  { region: 'EMEA', quarter: 'Q2', revenue: 150, units: 45 },
  { region: 'EMEA', quarter: 'Q3', revenue: 135, units: 42 },
  { region: 'EMEA', quarter: 'Q4', revenue: 170, units: 50 },
  { region: 'AMER', quarter: 'Q1', revenue: 200, units: 60 },
  { region: 'AMER', quarter: 'Q2', revenue: 215, units: 62 },
  { region: 'AMER', quarter: 'Q3', revenue: 190, units: 58 },
  { region: 'AMER', quarter: 'Q4', revenue: 230, units: 66 },
  { region: 'APAC', quarter: 'Q1', revenue: 90, units: 30 },
  { region: 'APAC', quarter: 'Q2', revenue: 95, units: 32 },
  { region: 'APAC', quarter: 'Q3', revenue: 105, units: 34 },
  { region: 'APAC', quarter: 'Q4', revenue: 110, units: 36 },
];
const REGIONS = [...new Set(SALES.map((s) => s.region))];
const QUARTERS = [...new Set(SALES.map((s) => s.quarter))];

// The grid formats revenue with { style: 'currency', currency: 'USD', decimals: 0 }
// under its default 'en-GB' locale, which disambiguates the $ sign as "US$".
const currency = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// A pivoted region's group row, by the label text the grid renders rather
// than by data-key (which the grid prefixes internally, e.g. "g\u0000AMER").
const groupRow = (region) =>
  `[...document.querySelectorAll('.lat-row--group')].find((r) => r.querySelector('.lat-group-label')?.textContent === '${region}')`;

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  // One generated header group per quarter, e.g. "Q1", "Q2", "Q3", "Q4".
  const headerGroups = await browser.evaluate(`[...document.querySelectorAll('.lat-header-group-cell')].map((c) => c.textContent.trim())`);
  if (JSON.stringify(headerGroups) !== JSON.stringify(QUARTERS)) {
    failures.push(`expected one header group per quarter ${JSON.stringify(QUARTERS)}, found ${JSON.stringify(headerGroups)}`);
  }

  // Every region-and-quarter cell holds the sum for that crossing, which is
  // just that one row's own value here since each region has exactly one row
  // per quarter.
  for (const row of SALES) {
    const cellText = await browser.evaluate(`${groupRow(row.region)}?.querySelector('[data-col="__lattice_pivot:${row.quarter} | revenue"]')?.textContent`);
    if (cellText !== currency(row.revenue)) {
      failures.push(`${row.region} ${row.quarter} revenue cell read "${cellText}", expected "${currency(row.revenue)}"`);
    }
    const unitsText = await browser.evaluate(`${groupRow(row.region)}?.querySelector('[data-col="__lattice_pivot:${row.quarter} | units"]')?.textContent`);
    if (unitsText !== String(row.units)) {
      failures.push(`${row.region} ${row.quarter} units cell read "${unitsText}", expected "${row.units}"`);
    }
  }

  // Every region has its own group row, and every group row is open so its
  // pivoted cells (checked above) were actually on screen to read.
  for (const region of REGIONS) {
    const expanded = await browser.evaluate(`${groupRow(region)}?.getAttribute('aria-expanded')`);
    if (expanded !== 'true') failures.push(`expected ${region}'s group row open (aria-expanded="true") on load, was "${expanded}"`);
  }

  // Toggle to the flat view: the plain columns return, and so do all twelve
  // original rows, in the order demo.js declared them.
  await browser.evaluate(`document.getElementById('toggle').click()`);
  await new Promise((r) => setTimeout(r, 400));

  const flatLabel = await browser.evaluate(`document.getElementById('toggle').textContent`);
  if (flatLabel !== 'Show pivot') failures.push(`toggle button read "${flatLabel}" after switching to the flat view, expected "Show pivot"`);

  const flatCount = await browser.evaluate(`window.__demoGrid.rows.count()`);
  if (flatCount !== 12) failures.push(`flat view showed ${flatCount} rows, expected 12`);

  const flatHeaders = await browser.evaluate(`[...document.querySelectorAll('.lat-header-cell')].map((c) => c.getAttribute('data-col'))`);
  if (JSON.stringify(flatHeaders) !== JSON.stringify(['region', 'quarter', 'revenue', 'units'])) {
    failures.push(`flat view's columns were ${JSON.stringify(flatHeaders)}, expected ["region","quarter","revenue","units"]`);
  }

  const firstFlatRow = await browser.evaluate(`(() => {
    const r = document.querySelector('.lat-row[data-key="1"]');
    if (!r) return null;
    return {
      region: r.querySelector('[data-col="region"]')?.textContent,
      quarter: r.querySelector('[data-col="quarter"]')?.textContent,
      revenue: r.querySelector('[data-col="revenue"]')?.textContent,
      units: r.querySelector('[data-col="units"]')?.textContent,
    };
  })()`);
  const expectedFirst = { region: 'EMEA', quarter: 'Q1', revenue: currency(120), units: '40' };
  if (JSON.stringify(firstFlatRow) !== JSON.stringify(expectedFirst)) {
    failures.push(`flat view's first row read ${JSON.stringify(firstFlatRow)}, expected ${JSON.stringify(expectedFirst)}`);
  }

  // Toggle back: the pivot returns.
  await browser.evaluate(`document.getElementById('toggle').click()`);
  await new Promise((r) => setTimeout(r, 400));

  const pivotLabel = await browser.evaluate(`document.getElementById('toggle').textContent`);
  if (pivotLabel !== 'Show flat rows') failures.push(`toggle button read "${pivotLabel}" after switching back to the pivot, expected "Show flat rows"`);

  const rePivotCount = await browser.evaluate(`window.__demoGrid.rows.count()`);
  if (rePivotCount !== 15) failures.push(`re-pivoted view showed ${rePivotCount} rows, expected 15 (3 region groups + 12 members)`);

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: pivoted on load, 3 region groups each carrying 4 quarter column groups with the right ' +
      'revenue and units sums, toggling to the flat view restores all 12 rows and the plain ' +
      'columns, toggling again re-pivots. 0 console errors.'
    );
  }
} finally {
  await browser.close();
  server.close();
}
