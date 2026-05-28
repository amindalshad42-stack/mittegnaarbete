import { students } from './exports/initial-data.js';

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function isDepressed(value) {
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'yes' || v === 'true';
}

function getCgpaDistributionGroup(cgpa) {
  const value = toNumber(cgpa);

  if (!Number.isFinite(value) || value <= 0) return null;

  if (value < 6) return 'CGPA 5.0–5.9';
  if (value < 7) return 'CGPA 6.0–6.9';
  if (value < 8) return 'CGPA 7.0–7.9';
  if (value < 9) return 'CGPA 8.0–8.9';

  return 'CGPA 9.0–10';
}

function getCgpaDepressionGroup(cgpa) {
  const value = toNumber(cgpa);

  if (!Number.isFinite(value) || value <= 0) return null;

  if (value < 6) return 'CGPA 5.0–5.9';
  if (value < 7) return 'CGPA 6.0–6.9';
  if (value < 8) return 'CGPA 7.0–7.9';
  if (value < 9) return 'CGPA 8.0–8.9';

  return 'CGPA 9.0–10';
}

function chartData(data, labelKey, valueKey) {
  const out = [[labelKey, valueKey]];
  for (const row of data) {
    out.push([String(row[labelKey]), Number(row[valueKey])]);
  }
  return out;
}

addMdToPage(`# Betyg (CGPA) och depression`);

addMdToPage(`
I den här delen undersöker vi om skolprestation hänger ihop med depression.

Först visar vi hur CGPA är fördelat i datasetet, och sedan jämför vi betygsgrupper mot andelen deprimerade.
`);

addMdToPage(`## Fördelning av CGPA (%)`);

const cgpaDistribution = {};
let totalStudents = 0;

for (const s of students) {
  const group = getCgpaDistributionGroup(s.cgpa);
  if (!group) continue;

  cgpaDistribution[group] = (cgpaDistribution[group] || 0) + 1;
  totalStudents++;
}

const distributionOrder = [
  'CGPA 5.0–5.9',
  'CGPA 6.0–6.9',
  'CGPA 7.0–7.9',
  'CGPA 8.0–8.9',
  'CGPA 9.0–10'
];

const cgpaChartData = [['Betygsgrupp', 'Andel (%)']];

for (const group of distributionOrder) {
  if (!cgpaDistribution[group]) continue;

  const percent = (cgpaDistribution[group] / totalStudents) * 100;

  cgpaChartData.push([
    group,
    Number(percent.toFixed(1))
  ]);
}

drawGoogleChart({
  type: 'ColumnChart',
  data: cgpaChartData,
  options: {
    title: 'Fördelning av CGPA i procent',
    height: 400,
    legend: {
      position: 'none'
    },
    hAxis: {
      title: 'Betygsgrupp'
    },
    vAxis: {
      title: 'Andel (%)',
      minValue: 0,
      maxValue: 100
    }
  }
});

addMdToPage(`
Det här diagrammet visar hur studenternas betyg är fördelade i olika CGPA-grupper.

Vi ser att de flesta studenter ligger mellan ungefär 6 och 9 i CGPA.

Genom att använda grupper istället för exakta decimalvärden blir diagrammet tydligare och lättare att analysera.

Diagrammet används som bakgrundsinformation innan vi jämför CGPA med depression.
`);

addMdToPage(`## Statistik`);

const cgpaAll = students
  .map(s => toNumber(s.cgpa))
  .filter(v => !Number.isNaN(v));

const zeroValues = cgpaAll.filter(v => v === 0).length;
const cgpaValues = cgpaAll.filter(v => v > 0);
const statsSource = cgpaValues.length > 0 ? cgpaValues : cgpaAll;

const meanCgpa = statsSource.length ? s.mean(statsSource) : 0;
const medianCgpa = statsSource.length ? s.median(statsSource) : 0;
const stdCgpa = statsSource.length > 1 ? s.standardDeviation(statsSource) : 0;
const minCgpa = statsSource.length ? Math.min(...statsSource) : 0;
const maxCgpa = statsSource.length ? Math.max(...statsSource) : 0;

tableFromData({
  data: [
    { Mått: 'Antal 0-värden', Värde: zeroValues },
    { Mått: 'Medelvärde', Värde: Number(meanCgpa.toFixed(2)) },
    { Mått: 'Median', Värde: Number(medianCgpa.toFixed(2)) },
    { Mått: 'Standardavvikelse', Värde: Number(stdCgpa.toFixed(2)) },
    { Mått: 'Lägsta värde', Värde: Number(minCgpa.toFixed(2)) },
    { Mått: 'Högsta värde', Värde: Number(maxCgpa.toFixed(2)) }
  ],
  numberFormatOptions: {
    maximumFractionDigits: 2
  }
});

addMdToPage(`
Medelvärdet visar den genomsnittliga nivån i materialet.

Medianen visar mittenvärdet och standardavvikelsen visar hur mycket betygen varierar mellan studenterna.

0-värdena är med i tabellen för att visa hur många som finns i materialet, men själva jämförelsen med depression görs på giltiga CGPA-värden över 0.
`);

addMdToPage(`## Betygsgrupper och depression (%)`);

const cgpaGroups = {};

for (const student of students) {
  const group = getCgpaDepressionGroup(student.cgpa);
  if (!group) continue;

  if (!cgpaGroups[group]) {
    cgpaGroups[group] = {
      betyg: group,
      antal: 0,
      deprimerade: 0
    };
  }

  cgpaGroups[group].antal++;

  if (isDepressed(student.depression)) {
    cgpaGroups[group].deprimerade++;
  }
}

const cgpaDepression = distributionOrder
  .filter(group => cgpaGroups[group])
  .map(group => {
    const item = cgpaGroups[group];
    return {
      betyg: item.betyg,
      antal: item.antal,
      deprimerade: item.deprimerade,
      'Andel deprimerade (%)': Number(
        ((item.deprimerade / item.antal) * 100).toFixed(1)
      )
    };
  });

tableFromData({
  data: cgpaDepression,
  numberFormatOptions: {
    maximumFractionDigits: 1
  }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(cgpaDepression, 'betyg', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per betygsgrupp',
    height: 420,
    legend: { position: 'none' },
    vAxis: {
      title: 'Andel deprimerade (%)',
      minValue: 0,
      maxValue: 100
    },
    hAxis: {
      title: 'Betygsgrupp'
    }
  }
});

addMdToPage(`
Här undersöker vi om depression verkar vara vanligare i vissa betygsgrupper.

Andelen deprimerade är ganska lik mellan grupperna, även om vissa grupper ligger något högre än andra.

Det tyder på att CGPA inte verkar ha ett särskilt starkt samband med depression i just det här datasetet.

En student kan därför prestera bra i skolan men ändå må psykiskt dåligt.
`);