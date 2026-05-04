export function parseBookTitle(bookTitle: string): { title: string; author: string } {
  const [title = bookTitle, ...authorParts] = bookTitle.split(" - ");
  return { title, author: authorParts.join(" - ") };
}
