# How to pivot data in a grid

Twelve sales rows, one per region and quarter, load already pivoted: `grid.columns.group(['region'])`
picks region as the row axis and `grid.columns.pivot(['quarter'])` turns every distinct quarter into
its own generated column group, with a Revenue and a Units cell inside it. Both value columns declare
`total: 'sum'`, so each generated cell holds the sum for that region and quarter. A button switches to
the twelve flat rows the pivot was built from, and back again.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-pivot-data/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/pivot-data/

## The full source

Two files: `index.html` loads the grid and declares the mount point, `demo.js` configures and creates it. Copy both as they are below and it runs.

### index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to pivot data in a grid</title>
    <meta
      name="description"
      content="Twelve sales rows, one per region and quarter, turn into a cross-tab: regions down the side, a column per quarter, revenue and units summed in every cell. One button switches back to the flat list. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #toolbar { margin: 0 0 0.75rem; }
      #toggle { font: inherit; padding: 0.4rem 0.75rem; border: 1px solid #ccd3dc; border-radius: 4px; background: #fff; cursor: pointer; }
      #grid { height: 320px; }
      #stat { font-size: 0.9rem; color: #4a5568; margin: 0.75rem 0 0; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to pivot data in a grid</h1>
      <p>
        Twelve sales rows, one per region and quarter, load already pivoted: region down the
        side, a generated column for every quarter across the top, and revenue and units summed
        into each crossing. Click the button to see the same twelve rows flat, the list the pivot
        was built from, and click it again to pivot them back. Read the
        <a href="https://www.latticegrid.dev/docs/how-to/pivot-data/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div id="toolbar">
        <button id="toggle" type="button">Show flat rows</button>
      </div>
      <div id="grid"></div>
      <p id="stat"></p>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

### demo.js

```js
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
```

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
