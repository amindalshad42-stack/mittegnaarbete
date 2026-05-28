import { fieldDescriptions, initialComments } from './exports/initial-data.js';
// Notera: Importer/användning av nyckelordet "import"
// ska vara överst i en fil innan övrig kod, importera saker som exporteras i andra filer

addMdToPage(initialComments);

// Loopa igenom alla fältbeskrivningar (fältnamn/key + fältvärde/value)
for (let [key, value] of Object.entries(fieldDescriptions)) {
  addMdToPage(`## ${key}`);
  addMdToPage(value);

  if (key === 'cgpa') {
    // Varför har jag små insprängda kommentarer /*sql*/
    // precis innan strängar som innehåller SQL?
    tableFromData({
      data: await dbQuery(/*sql*/`
        SELECT measurement, value 
        FROM (SELECT 'Number of zero values' AS measurement, COUNT(*) AS value, 1 AS orderBy
        FROM student_depression 
        WHERE cgpa = 0
        UNION
        SELECT 'Mean (including 0 values)', AVG(cgpa), 2 
        FROM student_depression 
        UNION
        SELECT 'Mean (not including 0 values)', AVG(cgpa), 3 
        FROM student_depression 
        WHERE cgpa != 0
        UNION 
        SELECT 'Min (excluding 0 values)', MIN(cgpa), 4
        FROM student_depression 
        WHERE cgpa != 0
        UNION
        SELECT 'Max', MAX(cgpa), 5
        FROM student_depression 
        WHERE cgpa != 0)
        ORDER BY orderBy
      `),
      numberFormatOptions: {
        maximumFractionDigits: 4
      }
    });
    continue; // gå till nästa varv/iteration av loopen direkt
  }

  let countAnswers = await dbQuery(/*sql*/`
    SELECT ${key}, COUNT(*) AS count 
    FROM student_depression
    GROUP BY ${key} 
    ORDER BY count DESC  
  `);

  tableFromData({ data: countAnswers });
}