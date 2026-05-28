import { students } from './exports/initial-data.js';

function isDepressed(value) {
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'yes' || v === 'true';
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function chartData(data, labelKey, valueKey) {
  const out = [[labelKey, valueKey]];
  for (const row of data) {
    out.push([String(row[labelKey]), Number(row[valueKey])]);
  }
  return out;
}

function makeDepressionStats(rows, groupFn) {
  const groups = {};

  for (const row of rows) {
    const group = groupFn(row);
    if (group === null || group === undefined || group === '') continue;

    if (!groups[group]) {
      groups[group] = {
        nivå: group,
        antal: 0,
        deprimerade: 0
      };
    }

    groups[group].antal++;

    if (isDepressed(row.depression)) {
      groups[group].deprimerade++;
    }
  }

  return Object.values(groups).map(item => ({
    nivå: item.nivå,
    antal: item.antal,
    deprimerade: item.deprimerade,
    'Andel deprimerade (%)': Number(
      ((item.deprimerade / item.antal) * 100).toFixed(1)
    )
  }));
}

function stressLabel(value) {
  const n = toNumber(value);

  if (!Number.isFinite(n) || n === 0) return null;

  if (n === 1) return '1 – låg';
  if (n === 2) return '2';
  if (n === 3) return '3 – medel';
  if (n === 4) return '4';
  if (n === 5) return '5 – hög';

  return String(n);
}

function buildPercentDistribution(rows, labelFn, order) {
  const counts = {};
  let total = 0;

  for (const row of rows) {
    const label = labelFn(row);
    if (!label) continue;

    counts[label] = (counts[label] || 0) + 1;
    total++;
  }

  const tableRows = [];
  const chartRows = [['Nivå', 'Andel (%)']];

  for (const label of order) {
    if (!counts[label]) continue;

    const percent = (counts[label] / total) * 100;

    tableRows.push({
      nivå: label,
      antal: counts[label],
      'Andel (%)': Number(percent.toFixed(1))
    });

    chartRows.push([
      label,
      Number(percent.toFixed(1))
    ]);
  }

  return { tableRows, chartRows };
}

addMdToPage(`# Stress och depression`);

addMdToPage(`
I den här delen tittar vi på akademiskt tryck och ekonomisk stress.

Först visas fördelningen i procent, och sedan jämför vi stressnivåerna mot depression.
Värdet 0 räknas inte här eftersom det oftast betyder att svaret saknas.
`);

addMdToPage(`## Studietryck (%)`);

const academicDist = buildPercentDistribution(
  students,
  s => stressLabel(s.academicPressure),
  ['1 – låg', '2', '3 – medel', '4', '5 – hög']
);

drawGoogleChart({
  type: 'BarChart',
  data: academicDist.chartRows,
  options: {
    title: 'Fördelning av studietryck i procent',
    height: 380,
    legend: { position: 'none' },
    hAxis: { title: 'Andel (%)', minValue: 0, maxValue: 100 },
    vAxis: { title: 'Studietryck' }
  }
});

addMdToPage(`
Det här visar hur stort akademiskt tryck studenterna upplever.

Det är bakgrundsinformation, men det viktigaste är att se hur trycket hänger ihop med depression.
`);

addMdToPage(`## Studietryck och depression`);

const academicDepression = makeDepressionStats(
  students,
  s => stressLabel(s.academicPressure)
);

tableFromData({
  data: academicDepression,
  numberFormatOptions: { maximumFractionDigits: 1 }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(academicDepression, 'nivå', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per studietryck',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Studietryck' }
  }
});

addMdToPage(`
Här ser vi om högre studietryck hänger ihop med högre andel depression.

Om staplarna ökar när trycket ökar stärker det analysen av att stress kan påverka studenternas psykiska hälsa.
`);

addMdToPage(`## Ekonomisk stress (%)`);

const financialDist = buildPercentDistribution(
  students,
  s => stressLabel(s.financialStress),
  ['1 – låg', '2', '3 – medel', '4', '5 – hög']
);

drawGoogleChart({
  type: 'BarChart',
  data: financialDist.chartRows,
  options: {
    title: 'Fördelning av ekonomisk stress i procent',
    height: 380,
    legend: { position: 'none' },
    hAxis: { title: 'Andel (%)', minValue: 0, maxValue: 100 },
    vAxis: { title: 'Ekonomisk stress' }
  }
});

addMdToPage(`
Det här visar hur vanligt ekonomiskt stressade studenterna är.

Nu jämför vi det med depression för att se om det finns ett samband.
`);

addMdToPage(`## Ekonomisk stress och depression`);

const financialDepression = makeDepressionStats(
  students,
  s => stressLabel(s.financialStress)
);

tableFromData({
  data: financialDepression,
  numberFormatOptions: { maximumFractionDigits: 1 }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(financialDepression, 'nivå', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per ekonomisk stress',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Ekonomisk stress' }
  }
});

addMdToPage(`
Här ser vi om hög ekonomisk stress hänger ihop med högre andel depression.

Om andelen deprimerade blir högre vid större ekonomisk stress stärker det slutsatsen att ekonomi kan påverka välmåendet.
`);