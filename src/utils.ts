// src/utils.ts

// A generic identity function — T is inferred from the argument.
function identity<T>(value: T): T {
  return value;
}

// Write a generic function first<T>(arr: T[]): T | undefined
// that returns the first element of an array, or undefined if empty.
function first<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

// Write a generic function groupBy<T>(
//     items: T[],
//     keyFn: (item: T) => string
// ): Record<string, T[]>
// that groups items into an object by the string key returned by keyFn.
function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}

// Write a generic pipeline combinator:
// function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T
function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

//  Write a generic memoization function:
// function memoize<A extends PropertyKey, R>(fn: (arg: A) => Promise<R>): (arg: A) => Promise<R>
function memoize<A extends PropertyKey, R>(
  fn: (arg: A) => Promise<R>,
): (arg: A) => Promise<R> {
  const cache: Record<A, Promise<R>> = {} as Record<A, Promise<R>>;

  return (arg: A): Promise<R> => {
    if (!cache[arg]) {
      cache[arg] = fn(arg);
    }
    return cache[arg];
  };
}

export { identity, first, groupBy, pipe, memoize };
