import { students } from './exports/initial-data.js';

function isDepressed(value) {
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'yes' || v === 'true';
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
        grupp: group,
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
    grupp: item.grupp,
    antal: item.antal,
    deprimerade: item.deprimerade,
    'Andel deprimerade (%)': Number(
      ((item.deprimerade / item.antal) * 100).toFixed(1)
    )
  }));
}

function getFamilyHistory(row) {
  return row.familyHistoryMentalIllness || 'Saknas';
}

function getSuicidalThoughts(row) {
  return (
    row.suicidalThoughts ||
    row.suicidal_thoughts ||
    row.suicideThoughts ||
    'Saknas'
  );
}

addMdToPage(`# Riskfaktorer och depression`);

addMdToPage(`
I den här delen tittar vi på familjehistorik och suicidala tankar.

Det här är viktiga riskfaktorer som hjälper oss att förstå hur depression kan hänga ihop med personliga omständigheter.
`);

addMdToPage(`## Familjehistorik (%)`);

const familyDist = {};
let totalFamily = 0;

for (const s of students) {
  const key = getFamilyHistory(s);
  familyDist[key] = (familyDist[key] || 0) + 1;
  totalFamily++;
}

const familyChart = [['Familjehistorik', 'Andel (%)']];

for (const key of Object.keys(familyDist).sort((a, b) => familyDist[b] - familyDist[a])) {
  familyChart.push([
    key,
    Number(((familyDist[key] / totalFamily) * 100).toFixed(1))
  ]);
}

drawGoogleChart({
  type: 'PieChart',
  data: familyChart,
  options: {
    title: 'Fördelning av familjehistorik i procent',
    height: 380
  }
});

addMdToPage(`
Det här visar hur många som uppger familjehistorik av psykisk ohälsa.

Nu jämför vi det mot depression för att se om det finns ett tydligt samband.
`);

addMdToPage(`## Familjehistorik och depression`);

const familyDepression = makeDepressionStats(students, s => getFamilyHistory(s));

tableFromData({
  data: familyDepression,
  numberFormatOptions: { maximumFractionDigits: 1 }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(familyDepression, 'grupp', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per familjehistorik',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Familjehistorik' }
  }
});

addMdToPage(`
Här ser vi om studenter med familjehistorik av psykisk ohälsa har högre andel depression.

Om skillnaden är tydlig stärker det analysen av riskfaktorer.
`);

addMdToPage(`## Suicidala tankar (%)`);

const suicideDist = {};
let totalSuicide = 0;

for (const s of students) {
  const key = getSuicidalThoughts(s);
  suicideDist[key] = (suicideDist[key] || 0) + 1;
  totalSuicide++;
}

const suicideChart = [['Suicidala tankar', 'Andel (%)']];

for (const key of Object.keys(suicideDist).sort((a, b) => suicideDist[b] - suicideDist[a])) {
  suicideChart.push([
    key,
    Number(((suicideDist[key] / totalSuicide) * 100).toFixed(1))
  ]);
}

drawGoogleChart({
  type: 'PieChart',
  data: suicideChart,
  options: {
    title: 'Fördelning av suicidala tankar i procent',
    height: 380
  }
});

addMdToPage(`
Det här visar hur många som rapporterat suicidala tankar.

Det är en allvarlig indikator, och därför är det viktigt att jämföra den med depression.
`);

addMdToPage(`## Suicidala tankar och depression`);

const suicideDepression = makeDepressionStats(students, s => getSuicidalThoughts(s));

tableFromData({
  data: suicideDepression,
  numberFormatOptions: { maximumFractionDigits: 1 }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(suicideDepression, 'grupp', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per suicidala tankar',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Grupp' }
  }
});

addMdToPage(`
Här ser vi ofta ett tydligare samband än i många andra variabler.

Om andelen deprimerade är mycket högre bland dem som rapporterat suicidala tankar visar det att dessa faktorer hänger ihop starkt.
`);