import {
  countdown,
  fetchWithTimeout,
  runFetchTests,
  FetchTestResult,
} from './async';

function show(label: string, value: unknown): void {
  const output = document.getElementById('output')!;
  const line = document.createElement('p');
  line.textContent = `${label}: ${String(value)}`;
  output.appendChild(line);
}

function renderTable(
  headers: string[],
  rows: Array<Array<string | number | boolean>>,
): HTMLTableElement {
  const table = document.createElement('table');

  const headerRow = document.createElement('tr');
  for (const h of headers) {
    const th = document.createElement('th');
    th.textContent = String(h);
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  for (const rowData of rows) {
    const row = document.createElement('tr');

    for (const cell of rowData) {
      const td = document.createElement('td');
      td.textContent =
        typeof cell === 'boolean' ? (cell ? '✅' : '❌') : String(cell);
      row.appendChild(td);
    }

    if (rowData[rowData.length - 1] === false) {
      row.classList.add('error');
    }

    table.appendChild(row);
  }

  return table;
}

/* ---------- PURE LOGIC (kept local but non-DOM) ---------- */

function greet(name: string, times: number): string {
  return `Hello, ${name}! `.repeat(times).trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) throw new Error("Time can't be negative");

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/* ---------- RENDER ---------- */

const output = document.getElementById('output')!;

/* basic outputs */
show('greet', greet('World', 2));
show('clamp(15, 0, 10)', clamp(15, 0, 10));
show('clamp(-5, 0, 10)', clamp(-5, 0, 10));

/* formatDuration tests */
const formatTestCases: Array<[number, string]> = [
  [0, '0s'],
  [5, '5s'],
  [62, '1m 2s'],
  [3661, '1h 1m 1s'],
  [86400, '24h 0m 0s'],
];

const formatRows = formatTestCases.map(([input, expected]) => {
  const got = formatDuration(input);
  return [input, expected, got, got === expected];
});

output.appendChild(renderTable(['Input', 'Expected', 'Got', '✓'], formatRows));

/* countdown */
const counter = document.createElement('h2');
output.appendChild(counter);
countdown(counter);

/* fetch comparison */

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

function makeTodoRow(todo: Todo): HTMLLIElement {
  const item = document.createElement('li');
  item.textContent = `${todo.completed ? '✅' : '⬜'} ${todo.title}`;
  return item;
}

async function renderTodoComparison(): Promise<void> {
  const timeout = 5000;
  const ids = Array.from({ length: 10 }, (_, i) => i + 1);

  const parallelStart = performance.now();
  const parallelResults = await Promise.all(
    ids.map((id) =>
      fetchWithTimeout<Todo>(
        `https://jsonplaceholder.typicode.com/todos/${id}`,
        timeout,
      ),
    ),
  );
  const parallelElapsed = performance.now() - parallelStart;

  const sequentialStart = performance.now();
  const sequentialResults: Todo[] = [];
  for (const id of ids) {
    sequentialResults.push(
      await fetchWithTimeout<Todo>(
        `https://jsonplaceholder.typicode.com/todos/${id}`,
        timeout,
      ),
    );
  }
  const sequentialElapsed = performance.now() - sequentialStart;

  const parallelSection = document.createElement('section');
  parallelSection.innerHTML = `<h3>Parallel (${parallelElapsed.toFixed(2)} ms)</h3>`;
  const parallelList = document.createElement('ul');
  parallelResults.forEach((t) => parallelList.appendChild(makeTodoRow(t)));
  parallelSection.appendChild(parallelList);

  const sequentialSection = document.createElement('section');
  sequentialSection.innerHTML = `<h3>Sequential (${sequentialElapsed.toFixed(2)} ms)</h3>`;
  const sequentialList = document.createElement('ul');
  sequentialResults.forEach((t) => sequentialList.appendChild(makeTodoRow(t)));
  sequentialSection.appendChild(sequentialList);

  output.appendChild(parallelSection);
  output.appendChild(sequentialSection);
}

/* fetchWithTimeout tests (table) */

async function renderFetchTests(): Promise<void> {
  const results: FetchTestResult[] = await runFetchTests();

  const rows = results.map((r) => [r.label, r.expected, r.got, r.pass]);

  output.appendChild(renderTable(['Case', 'Expected', 'Got', 'Result'], rows));
}

/* execute */
void renderTodoComparison();
void renderFetchTests();

import { Post, summarise, filterByCategory, sortPosts } from './blog';

const posts: Post[] = [
  {
    id: 1,
    title: 'Hello TypeScript',
    slug: 'hello-ts',
    body: 'TypeScript is JavaScript with types. It compiles to plain JS.',
    pubDate: '2025-01-01',
    category: { id: 1, name: 'Tech', slug: 'tech' },
  },
  {
    id: 2,
    title: 'CSS Grid',
    slug: 'css-grid',
    body: 'CSS Grid is a two-dimensional layout system for the web.',
    pubDate: '2025-01-15',
    category: { id: 2, name: 'Frontend', slug: 'frontend' },
  },
  {
    id: 3,
    title: 'Django REST',
    slug: 'django-rest',
    body: 'Build a REST API with Django and serve JSON to any client.',
    pubDate: '2025-02-01',
    category: { id: 1, name: 'Tech', slug: 'tech' },
  },
];

function renderPostCard(post: Post): HTMLElement {
  const card = document.createElement('article');
  card.innerHTML = `<h3>${post.title}</h3><p>${summarise(post)}</p>`;
  return card;
}

const postOutput = document.getElementById('output')!;

/* ---------- SORT SELECTOR ---------- */

const select = document.createElement('select');

select.innerHTML = `
  <option value="title">Sort by title</option>
  <option value="date">Sort by date</option>
  <option value="category">Sort by category</option>
`;

postOutput.appendChild(select);

/* ---------- RENDER PIPELINE ---------- */

const listContainer = document.createElement('div');
postOutput.appendChild(listContainer);

function renderPosts(list: Post[]): void {
  listContainer.innerHTML = '';
  for (const post of list) {
    listContainer.appendChild(renderPostCard(post));
  }
}

/* initial render */
let currentSort: 'title' | 'date' | 'category' = 'title';
renderPosts(sortPosts(posts, currentSort));

/* reactive update */
select.addEventListener('change', () => {
  currentSort = select.value as typeof currentSort;
  const sorted = sortPosts(posts, currentSort);
  renderPosts(sorted);
});

/* ---------- FILTER DEMO (unchanged) ---------- */

const techPosts = filterByCategory(posts, 'tech');
const filteredSection = document.createElement('div');
filteredSection.innerHTML = `<h3>Tech posts: ${techPosts.map((p) => p.title).join(', ')}</h3>`;
postOutput.appendChild(filteredSection);



import { Shape, area, renderShape, validatePost } from './status';

/* ---------- SVG GALLERY ---------- */

const shapes: Shape[] = [
  { kind: 'circle', radius: 40 },
  { kind: 'rectangle', width: 80, height: 50 },
  { kind: 'triangle', base: 80, height: 60 },
];

const gallery = document.createElement('div');

for (const s of shapes) {
  const wrapper = document.createElement('div');

  const svg = renderShape(s);
  const label = document.createElement('p');
  label.textContent = `Area: ${area(s).toFixed(2)}`;

  wrapper.appendChild(svg);
  wrapper.appendChild(label);
  gallery.appendChild(wrapper);
}

output.appendChild(gallery);

/* ---------- VALIDATION UI ---------- */

const textarea = document.createElement('textarea');
textarea.rows = 10;
textarea.cols = 50;

const button = document.createElement('button');
button.textContent = 'Validate';

const resultBox = document.createElement('div');

output.appendChild(textarea);
output.appendChild(button);
output.appendChild(resultBox);

button.addEventListener('click', () => {
  resultBox.innerHTML = '';

  let parsed: unknown;

  try {
    parsed = JSON.parse(textarea.value);
  } catch {
    resultBox.textContent = '❌ Invalid JSON';
    return;
  }

  const result = validatePost(parsed);

  if (result.ok) {
    resultBox.textContent = '✅ Valid Post';
    resultBox.appendChild(renderPostCard(result.post));
  } else {
    resultBox.textContent = `❌ Invalid: ${result.reason}`;
  }
});
