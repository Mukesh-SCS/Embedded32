import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { withBasePath } from '@/lib/basePath';
import styles from './markdown.module.css';

type MarkdownProps = {
  content: string;
};

export function Markdown({ content }: MarkdownProps) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
              return (
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {children}
                </a>
              );
            }
            return <a href={withBasePath(href)}>{children}</a>;
          },
          img: ({ src, alt }) => {
            const resolved = typeof src === 'string' ? withBasePath(src) : src;
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={resolved as string} alt={alt ?? ''} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
