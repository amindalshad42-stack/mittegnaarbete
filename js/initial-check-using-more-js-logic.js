import { students, fieldDescriptions, initialComments } from './exports/initial-data.js';
// Notera: Importer/användning av nyckelordet "import"
// ska vara överst i en fil innan övrig kod, importera saker som exporteras i andra filer

addMdToPage(initialComments);

// Loopa igenom alla fältbeskrivningar (fältnamn/key + fältvärde/value)
for (let [key, value] of Object.entries(fieldDescriptions)) {
  addMdToPage(`## ${key}`);
  addMdToPage(value);

  // don't list all values for cgpa - more relevant to look at mean value with and without zeros
  if (key === 'cgpa') {
    let cgpas = students.map(x => x.cgpa);
    tableFromData({
      data: [
        { measurement: 'Number of 0 values', value: cgpas.filter(x => x === 0).length },
        { measurement: 'Mean (including 0 values)', value: s.mean(cgpas) },
        { measurement: 'Mean (not including 0 values)', value: s.mean(cgpas.filter(x => x !== 0)) },
        { measurement: 'Min (excluding 0 values)', value: s.min(cgpas.filter(x => x !== 0)) },
        { measurement: 'Max', value: s.max(cgpas) }
      ],
      numberFormatOptions: {
        maximumFractionDigits: 4
      }
    });
    continue; // gå till nästa varv/iteration av loopen direkt
  }

  // answerCount - varje unikt svar som en nyckel
  // och värdet som hur till varje nyckel hur många gånger svaret förekommer
  let answerCount = {};
  // loopa igenom varje rad från databastabellen (varje student)
  for (let student of students) {
    // answer - studentens svar på den specifika frågan/kolumnen
    let answer = student[key];
    // om vi inte har svaret som en nyckel i answerCount lägg till
    if (!answerCount[answer]) {
      answerCount[answer] = 0;
    }
    // addera 1 till räknaren för just det här svaret
    answerCount[answer]++;
  }
  // omvandla answerCount som är ett enda objekt med olika nycklar
  // till en array av objekt

  // steg 1 - från ett objekt till en array
  let answerCountAsAnArrayOfArrays = Object.entries(answerCount);

  // steg 2 - omvandla till en array av objekt
  let answerCountAsAnArrayOfObjects = answerCountAsAnArrayOfArrays.map(
    ([answer, count]) => ({ answer, count })
  );

  // steg 3 - sortera med det vanligaste svaret först - ovanligaste sist
  let sorted = answerCountAsAnArrayOfObjects.toSorted((a, b) => b.count - a.count);

  // skapa en tabell
  tableFromData({ data: sorted });

  // kort-version utan mellanvariabelnamn
  /*
    tableFromData(Object.entries(answerCount).map(
      ([answer, count]) => ({ answer, count }).toSorted((a, b) => b.count - a.count)
    ));
  */
}