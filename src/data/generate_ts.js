const fs = require('fs');
const path = require('path');

const dumpFile = path.join(__dirname, 'excel_dump.json');
const data = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));

// We know from previous inspection that 'La tua realt' or similar contains the questions
const sheetNames = Object.keys(data);
const realtaSheet = sheetNames.find(s => s.includes('La tua realt'));

if (!realtaSheet) {
  console.error("Sheet 'La tua realtà' not found!");
  process.exit(1);
}

const rows = data[realtaSheet];
let currentArea = "";
const questions = [];
let idCounter = 1;

for (const row of rows) {
  // Column names based on pandas Unnamed columns
  const qNum = row['Unnamed: 0'];
  const qText = row['Unnamed: 1'];
  
  if (qNum && String(qNum).includes('.') && qText) {
    const guida = row['Unnamed: 2'] || "";
    // Parse guide string: "1 = something\n3 = something\n5 = something"
    const labels = {
      1: "Per niente / Pessimo",
      3: "Così così / Neutro",
      5: "Molto / Ottimo"
    };
    
    if (typeof guida === 'string' && guida.includes('1 =')) {
      const parts = guida.split('\n');
      for (const p of parts) {
        if (p.startsWith('1 =')) labels[1] = p.replace('1 =', '').trim();
        if (p.startsWith('3 =')) labels[3] = p.replace('3 =', '').trim();
        if (p.startsWith('5 =')) labels[5] = p.replace('5 =', '').trim();
      }
    }

    questions.push({
      id: idCounter++,
      area: currentArea,
      number: qNum,
      text: qText.trim(),
      labels: labels,
      activity_types: ['commercio', 'ricettivita']
    });
  } 
  else if (qNum && typeof qNum === 'string' && qNum === qNum.toUpperCase() && !String(qNum).includes('.')) {
    // It seems "1. LA TUA VOCE" is in Unnamed: 0
    currentArea = qNum.trim();
  }
}

const fileContent = `export type Question = {
  id: number;
  area: string;
  number: string;
  text: string;
  labels: { 1: string; 3: string; 5: string };
  activity_types: string[];
};

export const questions: Question[] = ${JSON.stringify(questions, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'questions.ts'), fileContent);
console.log(`Generated questions.ts with ${questions.length} questions.`);
