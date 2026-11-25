// --- SAMPLE INITIAL DATA ---
const INITIAL_PLAYERS = [
  // Men
  { id: "m1", name: "Alex Mercer", gender: "M", grade: "A2", rating: 845, minTeam: 1, available: true },
  { id: "m2", name: "Liam Vance", gender: "M", grade: "B1", rating: 810, minTeam: 1, available: true },
  { id: "m3", name: "Noah Patel", gender: "M", grade: "B1", rating: 798, minTeam: 2, available: true },
  { id: "m4", name: "Ethan Brooks", gender: "M", grade: "B2", rating: 775, minTeam: 2, available: true },
  { id: "m5", name: "Callum Reid", gender: "M", grade: "B2", rating: 762, minTeam: 2, available: true },
  { id: "m6", name: "Marcus Sterling", gender: "M", grade: "C1", rating: 740, minTeam: 3, available: true },
  { id: "m7", name: " Toby Jenkins", gender: "M", grade: "C1", rating: 731, minTeam: 3, available: true },
  { id: "m8", name: "Samir Khan", gender: "M", grade: "C2", rating: 710, minTeam: 4, available: true },
  { id: "m9", name: "Owen Gallagher", gender: "M", grade: "C2", rating: 695, minTeam: 4, available: true },
  { id: "m10", name: "Harry Fletcher", gender: "M", grade: "D1", rating: 670, minTeam: 5, available: true },
  { id: "m11", name: "Daniel Wu", gender: "M", grade: "D1", rating: 660, minTeam: 5, available: true },
  { id: "m12", name: "Jack Thornton", gender: "M", grade: "D2", rating: 635, minTeam: 6, available: true },
  { id: "m13", name: "Leo Bennett", gender: "M", grade: "E1", rating: 590, minTeam: 7, available: true },
  { id: "m14", name: "Ryan Cooper", gender: "M", grade: "C1", rating: 728, minTeam: 3, available: false }, // Injured/Unavail

  // Women
  { id: "w1", name: "Chloe Lin", gender: "F", grade: "A2", rating: 830, minTeam: 1, available: true },
  { id: "w2", name: "Maya Sharma", gender: "F", grade: "B1", rating: 805, minTeam: 1, available: true },
  { id: "w3", name: "Hannah Abbott", gender: "F", grade: "B2", rating: 780, minTeam: 2, available: true },
  { id: "w4", name: "Sophie Clarke", gender: "F", grade: "B2", rating: 768, minTeam: 2, available: true },
  { id: "w5", name: "Grace O'Connor", gender: "F", grade: "C1", rating: 745, minTeam: 3, available: true },
  { id: "w6", name: "Amelia Foster", gender: "F", grade: "C1", rating: 732, minTeam: 3, available: true },
  { id: "w7", name: "Freya Lindqvist", gender: "F", grade: "C2", rating: 715, minTeam: 4, available: true },
  { id: "w8", name: "Zara Ahmed", gender: "F", grade: "C2", rating: 702, minTeam: 4, available: true },
  { id: "w9", name: "Emily Dawson", gender: "F", grade: "D1", rating: 680, minTeam: 5, available: true },
  { id: "w10", name: "Niamh Walsh", gender: "F", grade: "D1", rating: 665, minTeam: 5, available: true },
  { id: "w11", name: "Ruby Henderson", gender: "F", grade: "D2", rating: 640, minTeam: 6, available: true },
  { id: "w12", name: "Isla MacLeod", gender: "F", grade: "E1", rating: 600, minTeam: 7, available: true },
];

const INITIAL_TEAMS = [
  { id: "t1", rank: 1, name: "County 1st Team", date: "Sat 14 Nov", venue: "Milton Keynes", men: ["m1", "m2"], women: ["w1", "w2"], sandbox: {} },
  { id: "t2", rank: 2, name: "County 2nd Team", date: "Sat 14 Nov", venue: "Redbridge", men: ["m3", "m4"], women: ["w3", "w4"], sandbox: {} },
  { id: "t3", rank: 3, name: "County 3rd Team", date: "Sun 15 Nov", venue: "Derby Arena", men: ["m6"], women: ["w5"], sandbox: {} },
  { id: "t4", rank: 4, name: "County 4th Team", date: "Sun 15 Nov", venue: "Derby Arena", men: [], women: [], sandbox: {} },
  { id: "t5", rank: 5, name: "County 5th Team", date: "Sat 14 Nov", venue: "Loughborough", men: [], women: [], sandbox: {} },
  { id: "t6", rank: 6, name: "County 6th Team", date: "Sun 15 Nov", venue: "Birmingham", men: [], women: [], sandbox: {} },
  { id: "t7", rank: 7, name: "County 7th Team", date: "Sun 15 Nov", venue: "Birmingham", men: [], women: [], sandbox: {} },
];

const MATCH_SLOTS = [
  { key: "MS1", label: "MS 1", type: "M" },
  { key: "MS2", label: "MS 2", type: "M" },
  { key: "WS1", label: "WS 1", type: "F" },
  { key: "WS2", label: "WS 2", type: "F" },
  { key: "MD1", label: "MD 1", type: "MM" },
  { key: "MD2", label: "MD 2", type: "MM" },
  { key: "WD1", label: "WD 1", type: "FF" },
  { key: "WD2", label: "WD 2", type: "FF" },
  { key: "XD1", label: "XD 1", type: "MF" },
  { key: "XD2", label: "XD 2", type: "MF" },
  { key: "XD3", label: "XD 3", type: "MF" },
];