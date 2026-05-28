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

function normalizeSleepLabel(value) {
  const raw = String(value ?? '').trim();
  const lower = raw.toLowerCase();

  if (!raw) return 'Saknas';

  if (
    lower.includes('less than 5') ||
    lower.includes('<5') ||
    lower.includes('under 5')
  ) {
    return 'Mindre än 5 timmar';
  }

  if (
    lower.includes('5-6') ||
    lower.includes('5–6') ||
    lower.includes('5 to 6')
  ) {
    return '5–6 timmar';
  }

  if (
    lower.includes('7-8') ||
    lower.includes('7–8') ||
    lower.includes('7 to 8')
  ) {
    return '7–8 timmar';
  }

  if (
    lower.includes('more than 8') ||
    lower.includes('>8') ||
    lower.includes('over 8')
  ) {
    return 'Mer än 8 timmar';
  }

  return raw;
}

function normalizeHoursLabel(value) {
  const n = Number(value);

  if (Number.isFinite(n)) {
    return `${n} timmar`;
  }

  const raw = String(value ?? '').trim();
  return raw ? raw : 'Saknas';
}

addMdToPage(`# Livsstil, sömn och depression`);

addMdToPage(`
I den här delen tittar vi på sömn, studietimmar och kost.

Först visar vi hur svaren är fördelade i procent, och sedan jämför vi varje faktor mot depression.
`);





/* =========================
   SÖMNFÖRDELNING
========================= */

addMdToPage(`## Sömnfördelning (%)`);

const sleepDist = {};
let totalSleep = 0;

for (const s of students) {
  const key = normalizeSleepLabel(s.sleepDuration);
  sleepDist[key] = (sleepDist[key] || 0) + 1;
  totalSleep++;
}

const sleepOrder = [
  'Mindre än 5 timmar',
  '5–6 timmar',
  '7–8 timmar',
  'Mer än 8 timmar',
  'Saknas'
];

const sleepChart = [['Sömntid', 'Andel (%)']];

for (const key of sleepOrder) {
  if (!sleepDist[key]) continue;

  sleepChart.push([
    key,
    Number(((sleepDist[key] / totalSleep) * 100).toFixed(1))
  ]);
}

for (const key of Object.keys(sleepDist)) {
  if (sleepOrder.includes(key)) continue;

  sleepChart.push([
    key,
    Number(((sleepDist[key] / totalSleep) * 100).toFixed(1))
  ]);
}

drawGoogleChart({
  type: 'PieChart',
  data: sleepChart,
  options: {
    title: 'Fördelning av sömntid i procent',
    height: 380
  }
});

addMdToPage(`
Det här visar hur sömnen är fördelad i datasetet.

Det hjälper oss att förstå hur många som sover lite eller mycket, men för att svara på huvudfrågan måste vi också titta på depression.
`);





/* =========================
   SÖMN OCH DEPRESSION
========================= */

addMdToPage(`## Sömn och depression`);

const sleepDepression = makeDepressionStats(
  students,
  s => normalizeSleepLabel(s.sleepDuration)
);

tableFromData({
  data: sleepDepression,
  numberFormatOptions: {
    maximumFractionDigits: 1
  }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(sleepDepression, 'grupp', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per sömngrupp',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Sömngrupp' }
  }
});

addMdToPage(`
Här ser vi om depression verkar vara vanligare bland studenter som sover mindre.

Om andelen deprimerade är högre i grupper med kortare sömn tyder det på att sömn kan ha ett samband med psykisk hälsa.
`);





/* =========================
   STUDIETIMMAR
========================= */

addMdToPage(`## Studietimmar (%)`);

const hoursDist = {};
let totalHours = 0;

for (const s of students) {
  const key = normalizeHoursLabel(s.workStudyHours);
  hoursDist[key] = (hoursDist[key] || 0) + 1;
  totalHours++;
}

const hourKeys = Object.keys(hoursDist).sort((a, b) => {
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);

  if (Number.isNaN(aNum) && Number.isNaN(bNum)) {
    return a.localeCompare(b, 'sv');
  }
  if (Number.isNaN(aNum)) return 1;
  if (Number.isNaN(bNum)) return -1;
  return aNum - bNum;
});

const hoursChart = [['Studietimmar', 'Andel (%)']];

for (const key of hourKeys) {
  hoursChart.push([
    key,
    Number(((hoursDist[key] / totalHours) * 100).toFixed(1))
  ]);
}

drawGoogleChart({
  type: 'ColumnChart',
  data: hoursChart,
  options: {
    title: 'Fördelning av studietimmar i procent',
    height: 380,
    legend: { position: 'none' },
    hAxis: { title: 'Studietimmar' },
    vAxis: { title: 'Andel (%)', minValue: 0, maxValue: 100 }
  }
});

addMdToPage(`
Det här visar hur mycket studenterna studerar.

Det är bakgrundsinformation, men det blir mer relevant när vi jämför studietimmar mot depression.
`);





/* =========================
   STUDIETIMMAR OCH DEPRESSION
========================= */

addMdToPage(`## Studietimmar och depression`);

const hoursDepression = makeDepressionStats(students, s => normalizeHoursLabel(s.workStudyHours));

tableFromData({
  data: hoursDepression,
  numberFormatOptions: { maximumFractionDigits: 1 }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(hoursDepression, 'grupp', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per studietimmar',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Studietimmar' }
  }
});

addMdToPage(`
Här ser vi om längre studietid hänger ihop med högre andel depression.

Om andelen deprimerade ökar när studietimmarna ökar tyder det på att belastningen påverkar välmåendet negativt.
`);





/* =========================
   KOST
========================= */

addMdToPage(`## Kost (%)`);

const dietDist = {};
let totalDiet = 0;

for (const s of students) {
  const key = s.dietaryHabits || 'Saknas';
  dietDist[key] = (dietDist[key] || 0) + 1;
  totalDiet++;
}

const dietOrder = Object.keys(dietDist).sort((a, b) => dietDist[b] - dietDist[a]);
const dietChart = [['Kost', 'Andel (%)']];

for (const key of dietOrder) {
  dietChart.push([
    key,
    Number(((dietDist[key] / totalDiet) * 100).toFixed(1))
  ]);
}

drawGoogleChart({
  type: 'PieChart',
  data: dietChart,
  options: {
    title: 'Fördelning av kostvanor i procent',
    height: 380
  }
});

addMdToPage(`
Kostvanorna varierar i datasetet.

Nu tittar vi också på om olika kostvanor verkar hänga ihop med depression.
`);





/* =========================
   KOST OCH DEPRESSION
========================= */

addMdToPage(`## Kost och depression`);

const dietDepression = makeDepressionStats(students, s => s.dietaryHabits || 'Saknas');

tableFromData({
  data: dietDepression,
  numberFormatOptions: { maximumFractionDigits: 1 }
});

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData(dietDepression, 'grupp', 'Andel deprimerade (%)'),
  options: {
    title: 'Andel deprimerade per kostgrupp',
    height: 420,
    legend: { position: 'none' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Kostgrupp' }
  }
});

addMdToPage(`
Här ser vi om vissa kostvanor verkar hänga ihop med mer depression.

Det här hjälper oss att förstå om livsstilen kan vara en del av förklaringen.
`);