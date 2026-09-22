/**
 * Pivot a flat list of sales rows into a cross-tab, and back again.
 *
 * `grid.columns.group(['region'])` picks the row axis, `grid.columns.pivot(['quarter'])`
 * picks the column axis: each distinct quarter becomes a generated column, and every
 * cell holds the sum of that region's revenue or units in that quarter, because both
 * value columns declare `total: 'sum'`. Passing an empty list to either call leaves
 * that axis and the grid reads as the twelve rows it started from.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const SALES = [
  { id: 1, region: 'EMEA', quarter: 'Q1', revenue: 120, units: 40 },
  { id: 2, region: 'EMEA', quarter: 'Q2', revenue: 150, units: 45 },
  { id: 3, region: 'EMEA', quarter: 'Q3', revenue: 135, units: 42 },
  { id: 4, region: 'EMEA', quarter: 'Q4', revenue: 170, units: 50 },
  { id: 5, region: 'AMER', quarter: 'Q1', revenue: 200, units: 60 },
  { id: 6, region: 'AMER', quarter: 'Q2', revenue: 215, units: 62 },
  { id: 7, region: 'AMER', quarter: 'Q3', revenue: 190, units: 58 },
  { id: 8, region: 'AMER', quarter: 'Q4', revenue: 230, units: 66 },
  { id: 9, region: 'APAC', quarter: 'Q1', revenue: 90, units: 30 },
  { id: 10, region: 'APAC', quarter: 'Q2', revenue: 95, units: 32 },
  { id: 11, region: 'APAC', quarter: 'Q3', revenue: 105, units: 34 },
  { id: 12, region: 'APAC', quarter: 'Q4', revenue: 110, units: 36 },
];

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columns: [
    { field: 'region', title: 'Region' },
    { field: 'quarter', title: 'Quarter' },
    {
      field: 'revenue', title: 'Revenue', type: 'number', total: 'sum',
      format: { style: 'currency', currency: 'USD', decimals: 0 },
    },
    { field: 'units', title: 'Units', type: 'number', total: 'sum' },
  ],
  rows: SALES,
});
window.__demoGrid = grid; // read by tools/verify.mjs

// Pivoted from the start: region down the side, a column per quarter across the top.
grid.columns.group(['region']);
grid.columns.pivot(['quarter']);
let pivoted = true;

document.getElementById('toggle').addEventListener('click', () => {
  pivoted = !pivoted;
  grid.columns.group(pivoted ? ['region'] : []);
  grid.columns.pivot(pivoted ? ['quarter'] : []);
  document.getElementById('toggle').textContent = pivoted ? 'Show flat rows' : 'Show pivot';
});

document.getElementById('stat').textContent =
  '12 rows: 3 regions across 4 quarters. Pivoted, revenue and units sum into a cell ' +
  'per region and quarter; flat, they are the original rows the pivot was built from.';
