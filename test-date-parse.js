const date1 = "2026-02-01T12:00:00:000Z";
const parsed1 = Date.parse(date1);
console.log(`"${date1}" parsed to: ${parsed1} (${new Date(parsed1)})`);

const date2 = "2026-02-01T12:00:00.000Z";
const parsed2 = Date.parse(date2);
console.log(`"${date2}" parsed to: ${parsed2} (${new Date(parsed2)})`);

console.log(`Is NaN for "${date1}"? ${isNaN(parsed1)}`);
