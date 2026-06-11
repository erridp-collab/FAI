/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const dump = JSON.parse(fs.readFileSync('src/data/excel_dump.json', 'utf-8'));
const prima = dump["Prima di iniziare"];
const realta = dump["La tua realtà"];

const perceptionQuestions = [];
for (const row of prima) {
  const n = row["Unnamed: 0"];
  if (typeof n === 'number' && n >= 1.1 && n <= 1.7) {
    perceptionQuestions.push({
      id: `p${n.toFixed(1)}`,
      text: row["Unnamed: 1"],
      labels: {
        1: row["Unnamed: 3"],
        3: row["Unnamed: 4"],
        5: row["Unnamed: 5"]
      }
    });
  }
}

const objectives = [];
for (const row of prima) {
  const n = row["Unnamed: 0"];
  if (typeof n === 'number' && n >= 2.1 && n <= 2.9) {
    objectives.push({
      id: `${n.toFixed(1)}`,
      text: row["Unnamed: 1"]
    });
  }
}

let currentArea = "";
let qId = 1;
const mainQuestions = [];

for (const row of realta) {
  const n = row["Unnamed: 0"];
  const text = row["Unnamed: 1"];
  
  if (typeof n === 'string' && n.match(/^\d+\.\s/)) {
    // "1. LA TUA VOCE"
    currentArea = text ? `${n} ${text}`.trim() : n.trim();
    // Normalize area names exactly as requested in design spec
    if (n.startsWith("1.")) currentArea = "La tua voce";
    if (n.startsWith("2.")) currentArea = "I tuoi ricavi";
    if (n.startsWith("3.")) currentArea = "I tuoi margini";
    if (n.startsWith("4.")) currentArea = "La tua adattabilità";
    if (n.startsWith("5.")) currentArea = "Il tuo sistema";
    if (n.startsWith("6.")) currentArea = "La tua rete";
    if (n.startsWith("7.")) currentArea = "Il tuo apprendimento";
  } else if (typeof n === 'string' && n.match(/^\d+\.\d+$/)) {
    // Wait, sometimes n is read as string, sometimes as number
    mainQuestions.push({
      id: qId++,
      area: currentArea,
      number: n,
      text: text,
      labels: {
        1: row["Unnamed: 2"].split("\n")[0].replace("1 = ", ""),
        3: row["Unnamed: 2"].split("\n")[1] ? row["Unnamed: 2"].split("\n")[1].replace("3 = ", "") : "",
        5: row["Unnamed: 2"].split("\n")[2] ? row["Unnamed: 2"].split("\n")[2].replace("5 = ", "") : ""
      }
    });
  } else if (typeof n === 'number') {
    // Sometimes pandas reads floats like 3.6
    let numStr = n.toFixed(1);
    mainQuestions.push({
      id: qId++,
      area: currentArea,
      number: numStr,
      text: text,
      labels: {
        1: row["Unnamed: 2"].split("\n")[0].replace("1 = ", ""),
        3: row["Unnamed: 2"].split("\n")[1] ? row["Unnamed: 2"].split("\n")[1].replace("3 = ", "") : "",
        5: row["Unnamed: 2"].split("\n")[2] ? row["Unnamed: 2"].split("\n")[2].replace("5 = ", "") : ""
      }
    });
  }
}

const outStr = `export type PerceptionQuestion = {
  id: string;
  text: string;
  labels: { 1: string; 3: string; 5: string };
};

export type Objective = {
  id: string;
  text: string;
};

export type MainQuestion = {
  id: number;
  area: string;
  number: string;
  text: string;
  labels: { 1: string; 3: string; 5: string };
};

export const perceptionQuestions: PerceptionQuestion[] = ${JSON.stringify(perceptionQuestions, null, 2)};

export const objectives: Objective[] = ${JSON.stringify(objectives, null, 2)};

export const mainQuestions: MainQuestion[] = ${JSON.stringify(mainQuestions, null, 2)};
`;

fs.writeFileSync('src/data/questions.ts', outStr);
console.log("Successfully generated questions.ts");
