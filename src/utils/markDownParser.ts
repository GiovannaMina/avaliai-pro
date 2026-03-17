import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function parseMarkdown(markdown: string): string {
  if (!markdown) return '';
  if (markdown.trim().startsWith('<')) return markdown;
  return md.render(markdown);
}