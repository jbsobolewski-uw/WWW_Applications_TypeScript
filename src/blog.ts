interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  body: string;
  pubDate: string;
  category: Category | null; // a field that is either a Category or nothing — union types are introduced in Phase 4
}

interface Comment {
  id: number;
  author: string;
  body: string;
  created: string;
}

// Write a function summarise(post: Post): string that returns
// "<title> (<category name or 'Uncategorised'>) — <first 50 chars of body>..."

function summarise(post: Post): string {
  const categoryName = post.category?.name ?? 'Uncategorised';
  const preview = post.body.slice(0, 50);
  return `${post.title} (${categoryName}) — ${preview}...`;
}

// Write a function filterByCategory(posts: Post[], categoryName: string): Post[]
// that returns only posts whose category.name matches (case-insensitive).

function filterByCategory(posts: Post[], categoryName: string): Post[] {
  const target = categoryName.toLowerCase();

  return posts.filter((post) => {
    if (!post.category) return false;
    return post.category.name.toLowerCase() === target;
  });
}

export { summarise, filterByCategory };
export type { Post, Comment, Category };

//  Write a function sortPosts(posts: Post[], by: "title" | "date" | "category"): Post[]
// that returns a new sorted array. Sort by:
//   "title"    → alphabetically by title
//   "date"     → by pubDate (newest first)
//   "category" → alphabetically by category name (null last)

function sortPosts(
  posts: Post[],
  by: "title" | "date" | "category",
): Post[] {
  const copy = [...posts];

  switch (by) {
    case "title":
      return copy.sort((a, b) =>
        a.title.localeCompare(b.title),
      );

    case "date":
      return copy.sort(
        (a, b) =>
          new Date(b.pubDate).getTime() -
          new Date(a.pubDate).getTime(),
      );

    case "category":
      return copy.sort((a, b) => {
        if (!a.category && !b.category) return 0;
        if (!a.category) return 1;   // null last
        if (!b.category) return -1;

        return a.category.name.localeCompare(
          b.category.name,
        );
      });
  }
}

export { sortPosts };

