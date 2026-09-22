# How to pivot data in a grid

Twelve sales rows, one per region and quarter, load already pivoted: `grid.columns.group(['region'])`
picks region as the row axis and `grid.columns.pivot(['quarter'])` turns every distinct quarter into
its own generated column group, with a Revenue and a Units cell inside it. Both value columns declare
`total: 'sum'`, so each generated cell holds the sum for that region and quarter. A button switches to
the twelve flat rows the pivot was built from, and back again.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-pivot-data/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/pivot-data/

## The snippet

```js
const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columns: [
    { field: 'region', title: 'Region' },
    { field: 'quarter', title: 'Quarter' },
    { field: 'revenue', title: 'Revenue', type: 'number', total: 'sum' },
    { field: 'units', title: 'Units', type: 'number', total: 'sum' },
  ],
  rows, // twelve rows: three regions across four quarters
});

grid.columns.group(['region']);   // the row axis
grid.columns.pivot(['quarter']);  // the column axis

// Back to the flat rows the pivot was built from:
grid.columns.group([]);
grid.columns.pivot([]);
```

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
