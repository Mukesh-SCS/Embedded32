import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { withBasePath } from '@/lib/basePath';
import { resolveSafeImageSrc, resolveSafeUrl } from '@/lib/security';
import styles from './markdown.module.css';

type MarkdownProps = {
  content: string;
  showToc?: boolean;
};

type TocEntry = { id: string; text: string; level: number };

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(content: string): TocEntry[] {
  const headings: TocEntry[] = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[#*`]/g, '').trim();
    headings.push({ id: slugifyHeading(text), text, level });
  }
  return headings;
}

function TocNav({ headings }: { headings: TocEntry[] }) {
  if (headings.length === 0) return null;
  return (
    <nav className={styles.tocAside} aria-label="Table of contents">
      <div className={styles.toc}>
        <p className={styles.tocTitle}>On this page</p>
        <ul>
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? styles.tocH3 : undefined}>
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function Markdown({ content, showToc = true }: MarkdownProps) {
  const headings = showToc ? extractHeadings(content) : [];

  const md = (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return <h2 id={id}>{children}</h2>;
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return <h3 id={id}>{children}</h3>;
          },
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            const safe = resolveSafeUrl(href, { allowHttp: false });
            if (!safe || safe.kind === 'blocked') {
              return <span>{children}</span>;
            }
            if (safe.kind === 'https' || safe.kind === 'http' || safe.kind === 'mailto') {
              return (
                <a
                  href={safe.href}
                  target={safe.kind === 'https' || safe.kind === 'http' ? '_blank' : undefined}
                  rel="noreferrer"
                >
                  {children}
                </a>
              );
            }
            return <a href={withBasePath(safe.href)}>{children}</a>;
          },
          img: ({ src, alt }) => {
            if (typeof src !== 'string') return null;
            const safeSrc = resolveSafeImageSrc(src, { allowExternalHttps: true });
            if (!safeSrc) return null;
            const resolved = safeSrc.startsWith('http') ? safeSrc : withBasePath(safeSrc);
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={resolved} alt={alt ?? ''} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  if (!showToc || headings.length === 0) return md;

  return (
    <div className={styles.withToc}>
      {md}
      <TocNav headings={headings} />
    </div>
  );
}
