// src/status.ts

import { Post } from './blog';

// An enum compiles to a real JavaScript object.
enum PostStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

// A union type: the value must be one of these strings.
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequest {
  method: HttpMethod;
  path: string;
  body?: unknown; // ? makes the field optional
}

// A type guard narrows a wide type to a specific one.
function isPost(value: unknown): value is Post {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    'slug' in value
  );
}

// TODO: Write a function describeRequest(req: ApiRequest): string
// that returns e.g. "GET /api/posts/" or "POST /api/posts/ (has body)"
function describeRequest(req: ApiRequest): string {
  return req.body !== undefined
    ? `${req.method} ${req.path} (has body)`
    : `${req.method} ${req.path}`;
}

/* ---------- DISCRIMINATED UNION ---------- */

interface Circle {
  kind: 'circle';
  radius: number;
}
interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}
interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius;

    case 'rectangle':
      return shape.width * shape.height;

    case 'triangle':
      return 0.5 * shape.base * shape.height;

    default: {
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}

/* SVG helper */
function svgEl(
  tag: string,
  attrs: Record<string, string | number>,
): SVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el as SVGElement;
}

function renderShape(shape: Shape): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '120');
  svg.setAttribute('viewBox', '0 0 120 120');

  switch (shape.kind) {
    case 'circle':
      svg.appendChild(
        svgEl('circle', {
          cx: 60,
          cy: 60,
          r: shape.radius,
          fill: 'steelblue',
        }),
      );
      break;

    case 'rectangle':
      svg.appendChild(
        svgEl('rect', {
          x: 10,
          y: 10,
          width: shape.width,
          height: shape.height,
          fill: 'coral',
        }),
      );
      break;

    case 'triangle':
      svg.appendChild(
        svgEl('polygon', {
          points: `10,110 ${10 + shape.base},110 10,${110 - shape.height}`,
          fill: 'seagreen',
        }),
      );
      break;
  }

  return svg;
}

/* ---------- ROBUST VALIDATOR ---------- */

function validatePost(
  data: unknown,
): { ok: true; post: Post } | { ok: false; reason: string } {
  if (typeof data !== 'object' || data === null) {
    return { ok: false, reason: 'Not an object' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== 'number') {
    return { ok: false, reason: 'Invalid id' };
  }

  if (typeof obj.title !== 'string') {
    return { ok: false, reason: 'Invalid title' };
  }

  if (typeof obj.slug !== 'string') {
    return { ok: false, reason: 'Invalid slug' };
  }

  if (typeof obj.body !== 'string') {
    return { ok: false, reason: 'Invalid body' };
  }

  if (typeof obj.pubDate !== 'string') {
    return { ok: false, reason: 'Invalid pubDate' };
  }

  const category = obj.category;

  if (category !== null) {
    if (typeof category !== 'object') {
      return { ok: false, reason: 'Invalid category' };
    }

    const c = category as Record<string, unknown>;

    if (typeof c.id !== 'number') {
      return { ok: false, reason: 'Invalid category.id' };
    }

    if (typeof c.name !== 'string') {
      return { ok: false, reason: 'Invalid category.name' };
    }

    if (typeof c.slug !== 'string') {
      return { ok: false, reason: 'Invalid category.slug' };
    }
  }

  return { ok: true, post: data as Post };
}

export { PostStatus, isPost, describeRequest, area, renderShape, validatePost };
export type { HttpMethod, ApiRequest, Shape };

