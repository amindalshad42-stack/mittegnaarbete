import { students } from './exports/initial-data.js';

if (!Array.isArray(students)) {
  addMdToPage(`
## Fel

Kunde inte läsa studentdata. Kontrollera att databasen är rätt kopplad.
  `);
  throw new Error('students is not an array');
}

function isDepressed(value) {
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'yes' || v === 'true';
}

function toPercent(value) {
  return Number(value.toFixed(1));
}

function makeStats(rows, groupFn) {
  const stats = {};

  for (const row of rows) {
    const group = groupFn(row);
    if (group === null || group === undefined || group === '') continue;

    if (!stats[group]) {
      stats[group] = {
        grupp: group,
        antal: 0,
        deprimerade: 0
      };
    }

    stats[group].antal++;
    if (isDepressed(row.depression)) {
      stats[group].deprimerade++;
    }
  }

  return Object.values(stats).map(item => ({
    grupp: item.grupp,
    antal: item.antal,
    deprimerade: item.deprimerade,
    'Andel deprimerade (%)': toPercent((item.deprimerade / item.antal) * 100)
  }));
}

function makeColumnChartData(data, categoryKey, valueKey) {
  const chartData = [[categoryKey, valueKey]];
  for (const row of data) {
    chartData.push([String(row[categoryKey]), Number(row[valueKey])]);
  }
  return chartData;
}

addMdToPage(`## Kön`);

let genderCount = {};

for (let s of students) {
  let key = s.gender || 'Unknown';
  genderCount[key] = (genderCount[key] || 0) + 1;
}

let gChart = [['Gender', 'Count']];

for (let key in genderCount) {
  gChart.push([String(key), Number(genderCount[key])]);
}

drawGoogleChart({
  type: 'PieChart',
  data: gChart
});

addMdToPage(`
Det här visar bara hur könsfördelningen ser ut i datasetet.

Det är bra som bakgrund, men det säger ännu inget om depression.
`);

addMdToPage(`## Kön och depression`);

const genderDepression = makeStats(students, s => s.gender || 'Unknown');

tableFromData({
  data: genderDepression,
  numberFormatOptions: {
    maximumFractionDigits: 1
  }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: makeColumnChartData(genderDepression, 'grupp', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per kön',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Kön' }
  }
});

addMdToPage(`
Här ser vi hur stor andel av män och kvinnor som är deprimerade.

Resultatet visar att andelen deprimerade är nästan lika stor mellan könen.
Det verkar därför inte finnas någon stor skillnad mellan män och kvinnor i detta dataset.

Detta tyder på att depression påverkar båda grupperna på ungefär samma nivå.
`);

addMdToPage(`## Ålder`);

let ageCount = {};

for (let s of students) {
  let age = Number(s.age);
  if (Number.isNaN(age)) continue;

  let key = age;
  ageCount[key] = (ageCount[key] || 0) + 1;
}

let aChart = [['Age', 'Count']];

for (let key in ageCount) {
  aChart.push([Number(key), Number(ageCount[key])]);
}

drawGoogleChart({
  type: 'ColumnChart',
  data: aChart
});

addMdToPage(`
Det här visar hur åldrarna är fördelade i datasetet.

Men för att svara på uppgiften behöver vi också se hur depression varierar med ålder.
`);

addMdToPage(`## Ålder och depression`);

function ageGroup(age) {
  if (age <= 18) return '18';
  if (age <= 20) return '19–20';
  if (age <= 23) return '21–23';
  if (age <= 26) return '24–26';
  return '27+';
}

const ageDepression = makeStats(
  students.filter(s => !Number.isNaN(Number(s.age))),
  s => ageGroup(Number(s.age))
);

const ageOrder = ['18', '19–20', '21–23', '24–26', '27+'];

ageDepression.sort(
  (a, b) => ageOrder.indexOf(a.grupp) - ageOrder.indexOf(b.grupp)
);

tableFromData({
  data: ageDepression,
  numberFormatOptions: {
    maximumFractionDigits: 1
  }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: makeColumnChartData(ageDepression, 'grupp', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per åldersgrupp',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Åldersgrupp' }
  }
});

addMdToPage(`
Diagrammet visar att yngre studenter har högre andel depression än äldre studenter.

Den högsta andelen finns bland de yngsta grupperna,
medan andelen minskar i de äldre åldersgrupperna.

Det kan bero på att yngre studenter oftare upplever osäkerhet,
stress från studier och svårigheter att anpassa sig till studentlivet.
`);