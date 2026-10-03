let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  return notes.filter(note =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}

function longestNote() {
  if (notes.length === 0) return null;
  let longest = notes[0];
  for (let note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

function countByCategory() {
  const counts = {};
  for (let note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }
  return counts;
}

function getSummary() {
  const total = notes.length;
  const counts = countByCategory();
  const label = total === 1? "note" : "notes";
  if (total === 0) {
    return `0 notes`;
  }
  const parts = Object.entries(counts).map(([cat, num]) => `${num} ${cat}`);
  return `${total} ${label}: ${parts.join(", ")}.`;
}

function isDuplicate(text) {
  return notes.some(note =>
    note.text.trim().toLowerCase() === text.trim().toLowerCase()
  );
}

function addNote(text, category) {
  const allowed = ["personal", "work", "study"];
  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    console.log(`Rejected: text must be 1-200 characters (got ${trimmed.length})`);
    return false;
  }
  if (!allowed.includes(category)) {
    console.log(`Rejected: category must be one of ${allowed.join(", ")}`);
    return false;
  }
  if (isDuplicate(text)) {
    console.log(`Rejected: duplicate note "${trimmed}"`);
    return false;
  }
  const newId = notes.length > 0? Math.max(...notes.map(n => n.id)) + 1 : 1;
  notes.push({ id: newId, text: trimmed, category });
  return true;
}

console.log("--- searchNotes ---");
console.log(searchNotes("javascript")); // Expected: [{ id: 4, text: "Revise JavaScript arrays",... }]
console.log(searchNotes("BUY")); // Expected: [{ id: 1, text: "Buy milk and bread",... }]
console.log(searchNotes("xyz")); // Expected: []

console.log("--- longestNote ---");
console.log(longestNote()); // Expected: { id: 3, text: "Email the project report to Grace",... }
let backup = notes; notes = []; console.log(longestNote()); // Expected: null
notes = backup;

console.log("--- countByCategory ---");
console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }
notes = []; console.log(countByCategory()); // Expected: {}
notes = backup;

console.log("--- getSummary ---");
console.log(getSummary()); // Expected: "5 notes: 2 personal, 2 study, 1 work."
notes = [{ id: 1, text: "One", category: "personal" }];
console.log(getSummary()); // Expected: "1 note: 1 personal."
notes = backup;

console.log("--- isDuplicate ---");
console.log(isDuplicate("buy milk and bread")); // Expected: true
console.log(isDuplicate(" Buy milk and bread ")); // Expected: true
console.log(isDuplicate("Go jogging")); // Expected: false

console.log("--- addNote ---");
console.log(addNote("Buy milk and bread", "personal")); // Expected: false
console.log(addNote("", "personal")); // Expected: false
console.log(addNote("New valid note", "random")); // Expected: false
console.log(addNote("Plan weekend trip", "personal")); // Expected: true
console.log(getSummary()); // Expected: "6 notes: 3 personal, 2 study, 1 work."
