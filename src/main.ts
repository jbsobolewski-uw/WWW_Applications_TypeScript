// A helper to display results in the page instead of the console.
function show(label: string, value: unknown): void {
  const output = document.getElementById('output')!;
  const line = document.createElement('p');
  line.textContent = `${label}: ${String(value)}`;
  output.appendChild(line);
}

// Write a function greet(name: string, times: number): string
// that returns "Hello, <name>! ".repeat(times).trim()
// Try calling it with greet("Alice", "3") — TypeScript should error.

function greet(_name: string, times: number): string {
  return `Hello, ${_name}! ` .repeat(times).trim();
}

// Write a function clamp(value: number, min: number, max: number): number
// that returns value clamped to [min, max].
function clamp(value: number, min: number, max: number): number{
  return Math.max(Math.max(value, min), Math.min(value, max));
}


show('greet', greet('World', 2));
show('clamp(15, 0, 10)', clamp(15, 0, 10)); // → 10
show('clamp(-5, 0, 10)', clamp(-5, 0, 10)); // → 0


// Write a function formatDuration(totalSeconds: number): string
// that converts seconds to a human-readable string.
// Examples:
//   formatDuration(0)     → "0s"
//   formatDuration(62)    → "1m 2s"
//   formatDuration(3661)  → "1h 1m 1s"
//   formatDuration(86400) → "24h 0m 0s"
// Do not show hours if totalSeconds < 3600.
// Do not show minutes if totalSeconds < 60.
function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) {
    throw new Error("Time can't be negative");
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// Render a table of test cases in the page:
const testCases: Array<[number, string]> = [
  [0, "0s"], [5, "5s"], [62, "1m 2s"],
  [3661, "1h 1m 1s"], [86400, "24h 0m 0s"],
];

const table = document.createElement("table");
table.innerHTML = "<tr><th>Input</th><th>Expected</th><th>Got</th><th>✓</th></tr>";
for (const [input, expected] of testCases) {
  const got = formatDuration(input);
  const pass = got === expected;
  const row = document.createElement("tr");
  row.innerHTML = `<td>${input}</td><td>${expected}</td><td>${got}</td>
                     <td>${pass ? "✅" : "❌"}</td>`;
  if (!pass) row.classList.add("error");
  table.appendChild(row);
}
document.getElementById("output")!.appendChild(table);