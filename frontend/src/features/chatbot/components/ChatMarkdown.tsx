import type { ReactNode } from 'react';

function cleanCourseMetadata(value: string) {
  return value
    .replace(/```(?:markdown|json)?\s*\[COURSE_DATA:[\s\S]*?\]\s*```/gi, '')
    .replace(/\[COURSE_DATA:\s*\{[\s\S]*?\}\s*\]/gi, '')
    .trim();
}

function inlineMarkdown(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*)/g);
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('__') && token.endsWith('__')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em]" key={index}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return token;
  });
}

function isTableSeparator(line: string) {
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(line.trim());
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

export function ChatMarkdown({ content }: { content: string }) {
  const lines = cleanCourseMetadata(content).split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push(
        <div className="my-3 overflow-x-auto" key={`table-${index}`}>
          <table className="min-w-full border-collapse text-left text-xs sm:text-sm">
            <thead><tr>{headers.map((header) => <th className="border-b border-slate-300 bg-slate-50 px-2 py-2 font-bold" key={header}>{inlineMarkdown(header)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td className="border-b border-slate-200 px-2 py-2 align-top" key={cellIndex}>{inlineMarkdown(row[cellIndex] || '')}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push(<h3 className="mt-3 font-black text-slate-900" key={`heading-${index}`}>{inlineMarkdown(heading[2])}</h3>);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(<blockquote className="my-3 border-l-4 border-suwon/30 pl-3 text-slate-600" key={`quote-${index}`}>{quoteLines.map((quote) => <p key={quote}>{inlineMarkdown(quote)}</p>)}</blockquote>);
      continue;
    }

    const listMatch = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
        if (!match || (/^\s*\d+\./.test(lines[index]) !== ordered)) break;
        items.push(match[1]);
        index += 1;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(<List className={`${ordered ? 'list-decimal' : 'list-disc'} my-2 space-y-1 pl-5`} key={`list-${index}`}>{items.map((item) => <li key={item}>{inlineMarkdown(item)}</li>)}</List>);
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,3}\s+/.test(lines[index]) && !/^>\s?/.test(lines[index]) && !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p className="my-2" key={`paragraph-${index}`}>{paragraph.map((part, partIndex) => <span key={partIndex}>{partIndex > 0 && ' '}{inlineMarkdown(part)}</span>)}</p>);
  }

  return <div className="chat-markdown">{blocks}</div>;
}
