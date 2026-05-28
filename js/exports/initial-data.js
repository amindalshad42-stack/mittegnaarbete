// Välj databas (då kan vi ha flera i ett projekt)
dbQuery.use('student-depression');

// Här exporterar vi ut data med nyckelordet export så att vi 
// kan importera den i andra filer

// Läs in alla svar/studenter från tabellen student_depression
export let students = await dbQuery('SELECT * FROM student_depression');

// Läs in beskrivningar av de olika fälten/kolumnerna från en JSON-fil
export let fieldDescriptions = await jload('json/field-descriptions.json');

export let initialComments = `
# Initial look at the answers 
* What different answers exists for each questions?
* Note: Some dirt left, unless there really is a city called '3' or 'ME' (the latter might be true though)?
* But the main problem for some question is that we don't if 0 is the lack of an answer or a answer that respondent could actually give.
* **Note to self**: I will have decide on the 0 and maybe clean cities a bit more.  
* **Number of participants:** ${students.length}
`;
