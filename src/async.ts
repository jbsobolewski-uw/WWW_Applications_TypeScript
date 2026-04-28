// src/async.ts

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// async/await makes Promise code read top-to-bottom:
export async function countdown(element: HTMLElement): Promise<void> {
  for (let i = 5; i >= 0; i--) {
    element.textContent = `${i}…`;
    await delay(1000);
  }
  element.textContent = 'Go!';
}

// Write a function fetchWithTimeout<T>(url: string, ms: number): Promise<T>
// that rejects if the request takes longer than `ms` milliseconds.
// Hint: use Promise.race() with delay() that throws after the timeout.
//
// Test it:
//   fetchWithTimeout<Todo>("https://jsonplaceholder.typicode.com/todos/1", 5000)
//     → should succeed
//   fetchWithTimeout<Todo>("https://jsonplaceholder.typicode.com/todos/1", 1)
//     → should reject with a timeout error
//
// Display "✅ Succeeded" or "❌ Timed out" in the page for each test.
export async function fetchWithTimeout<T>(url: string, ms: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timed out')), ms),
  );

  const response = await Promise.race([fetch(url), timeoutPromise]);

  if (!(response instanceof Response)) {
    throw new Error('Unexpected result');
  }

  return (await response.json()) as T;
}

/* ---------- TEST LOGIC ---------- */

export type FetchTestResult = {
  label: string;
  expected: string;
  got: string;
  pass: boolean;
};

export async function runFetchTests(): Promise<FetchTestResult[]> {
  const url = 'https://jsonplaceholder.typicode.com/todos/1';

  const cases: Array<[string, number, string]> = [
    ['timeout=5000', 5000, 'success'],
    ['timeout=1', 1, 'timeout'],
  ];

  const results: FetchTestResult[] = [];

  for (const [label, ms, expected] of cases) {
    try {
      await fetchWithTimeout(url, ms);
      const got = 'success';
      results.push({
        label,
        expected,
        got,
        pass: got === expected,
      });
    } catch {
      const got = 'timeout';
      results.push({
        label,
        expected,
        got,
        pass: got === expected,
      });
    }
  }

  return results;
}
