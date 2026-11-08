"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

type InlineToken =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "bold"; children: InlineToken[] }
  | { type: "italic"; children: InlineToken[] }
  | { type: "bold_italic"; children: InlineToken[] }
  | { type: "link"; text: string; href: string };

type Block =
  | { type: "heading"; level: number; content: string }
  | { type: "bullet_list"; items: string[] }
  | { type: "numbered_list"; items: string[] }
  | { type: "blockquote"; content: string }
  | { type: "code_block"; lang: string; content: string }
  | { type: "hr" }
  | { type: "paragraph"; content: string };

function sanitizeUrl(href: string): string | null {
  if (!href) return null;
  const clean = href.trim();
  // Only allow secure and standard protocols or relative paths
  if (/^(https?:\/\/|mailto:|\/)/i.test(clean)) {
    return clean;
  }
  return null;
}

function parseInline(text: string): InlineToken[] {
  if (!text) return [];

  // Match:
  // 1: inline code `...`
  // 2: bold+italic ***...***
  // 3: bold **...**
  // 4: bold __...__
  // 5: italic *...*
  // 6: italic _..._
  // 7: link [...](...)
  const regex =
    /(`([^`]+?)`)|(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(__([^_]+?)__)|((?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*))|((?<!\w)_(?!_)([^_]+?)(?<!_)_(?!\w))|(\[([^\]]+)\]\(([^)]+)\))/g;

  const result: InlineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      result.push({ type: "code", text: match[2] });
    } else if (match[3]) {
      result.push({ type: "bold_italic", children: parseInline(match[4]) });
    } else if (match[5]) {
      result.push({ type: "bold", children: parseInline(match[6]) });
    } else if (match[7]) {
      result.push({ type: "bold", children: parseInline(match[8]) });
    } else if (match[9]) {
      result.push({ type: "italic", children: parseInline(match[10]) });
    } else if (match[11]) {
      result.push({ type: "italic", children: parseInline(match[12]) });
    } else if (match[13]) {
      const href = sanitizeUrl(match[15]);
      if (href) {
        result.push({ type: "link", text: match[14], href });
      } else {
        result.push({ type: "text", text: match[14] });
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({ type: "text", text: text.slice(lastIndex) });
  }

  return result;
}

function parseBlocks(markdown: string): Block[] {
  if (!markdown) return [];
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block (```lang ... ```)
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++; // skip closing ```
      }
      blocks.push({ type: "code_block", lang, content: codeLines.join("\n") });
      continue;
    }

    // Heading (#, ##, ###, ####)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      i++;
      continue;
    }

    // Horizontal rule (---, ***, ___)
    if (/^(?:---|\*\*\*|___)\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote (> )
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", content: quoteLines.join("\n") });
      continue;
    }

    // Bullet list (- , * , • , + )
    const bulletMatch = line.match(/^(\s*)(?:[-*•]|\+)\s+(.+)$/);
    if (bulletMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^(\s*)(?:[-*•]|\+)\s+(.+)$/);
        if (!itemMatch) break;
        items.push(itemMatch[2]);
        i++;
      }
      blocks.push({ type: "bullet_list", items });
      continue;
    }

    // Numbered list (1. , 2. )
    const numMatch = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/);
    if (numMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^(\s*)(\d+)[.)]\s+(.+)$/);
        if (!itemMatch) break;
        items.push(itemMatch[3]);
        i++;
      }
      blocks.push({ type: "numbered_list", items });
      continue;
    }

    // Paragraph (accumulate lines until blank line or next block type)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !lines[i].match(/^(?:---|\*\*\*|___)\s*$/) &&
      !lines[i].startsWith(">") &&
      !lines[i].match(/^(\s*)(?:[-*•]|\+)\s+/) &&
      !lines[i].match(/^(\s*)(\d+)[.)]\s+/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", content: paraLines.join("\n") });
    }
  }

  return blocks;
}

function renderInlineTokens(tokens: InlineToken[], isUser: boolean, keyPrefix = ""): React.ReactNode {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case "text":
        return <React.Fragment key={key}>{token.text}</React.Fragment>;
      case "code":
        return (
          <code
            key={key}
            className={cn(
              "rounded px-1.5 py-0.5 font-mono text-[0.88em]",
              isUser
                ? "bg-black/30 text-[#E6A52E]"
                : "bg-[#123C32]/10 text-[#123C32] font-semibold"
            )}
          >
            {token.text}
          </code>
        );
      case "bold":
        return (
          <strong
            key={key}
            className={cn("font-bold", isUser ? "text-white" : "text-[#123C32]")}
          >
            {renderInlineTokens(token.children, isUser, `${key}-b`)}
          </strong>
        );
      case "italic":
        return (
          <em
            key={key}
            className={cn("italic", isUser ? "text-[#F4F0E5]/90" : "text-[#252923]/90")}
          >
            {renderInlineTokens(token.children, isUser, `${key}-i`)}
          </em>
        );
      case "bold_italic":
        return (
          <strong
            key={key}
            className={cn("font-bold italic", isUser ? "text-white" : "text-[#123C32]")}
          >
            {renderInlineTokens(token.children, isUser, `${key}-bi`)}
          </strong>
        );
      case "link":
        return (
          <a
            key={key}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline font-semibold transition hover:opacity-80",
              isUser ? "text-[#E6A52E]" : "text-[#2878A5]"
            )}
          >
            {token.text}
          </a>
        );
      default:
        return null;
    }
  });
}

function renderParagraphContent(content: string, isUser: boolean, blockKey: string): React.ReactNode {
  // Support internal line breaks within paragraphs
  const subLines = content.split("\n");
  return subLines.map((line, lIdx) => {
    const inlineTokens = parseInline(line);
    return (
      <React.Fragment key={`${blockKey}-l-${lIdx}`}>
        {lIdx > 0 && <br />}
        {renderInlineTokens(inlineTokens, isUser, `${blockKey}-l-${lIdx}`)}
      </React.Fragment>
    );
  });
}

export function MarkdownRenderer({ content, isUser = false, className }: MarkdownRendererProps) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  if (!content || !content.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        "space-y-2.5 font-sans leading-relaxed text-inherit",
        className
      )}
    >
      {blocks.map((block, bIdx) => {
        const key = `block-${bIdx}`;
        switch (block.type) {
          case "heading": {
            const inlineTokens = parseInline(block.content);
            if (block.level === 1) {
              return (
                <h3
                  key={key}
                  className={cn(
                    "font-display font-extrabold text-base sm:text-lg mt-3 mb-1.5",
                    isUser ? "text-white" : "text-[#123C32]"
                  )}
                >
                  {renderInlineTokens(inlineTokens, isUser, key)}
                </h3>
              );
            }
            if (block.level === 2) {
              return (
                <h4
                  key={key}
                  className={cn(
                    "font-display font-bold text-sm sm:text-base mt-2.5 mb-1",
                    isUser ? "text-white" : "text-[#123C32]"
                  )}
                >
                  {renderInlineTokens(inlineTokens, isUser, key)}
                </h4>
              );
            }
            return (
              <h5
                key={key}
                className={cn(
                  "font-display font-bold text-xs sm:text-sm mt-2 mb-1",
                  isUser ? "text-white" : "text-[#123C32]"
                )}
              >
                {renderInlineTokens(inlineTokens, isUser, key)}
              </h5>
            );
          }
          case "bullet_list":
            return (
              <ul key={key} className="space-y-1.5 my-2 pl-0.5">
                {block.items.map((item, itemIdx) => {
                  const inlineTokens = parseInline(item);
                  return (
                    <li key={`${key}-item-${itemIdx}`} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                          isUser ? "bg-[#E6A52E]" : "bg-[#123C32]"
                        )}
                        aria-hidden="true"
                      />
                      <span className="flex-1 min-w-0">
                        {renderInlineTokens(inlineTokens, isUser, `${key}-item-${itemIdx}`)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            );
          case "numbered_list":
            return (
              <ol key={key} className="space-y-1.5 my-2 pl-0.5">
                {block.items.map((item, itemIdx) => {
                  const inlineTokens = parseInline(item);
                  return (
                    <li key={`${key}-num-${itemIdx}`} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "font-mono text-xs font-bold shrink-0 mt-0.5",
                          isUser ? "text-[#E6A52E]" : "text-[#123C32]"
                        )}
                        aria-hidden="true"
                      >
                        {itemIdx + 1}.
                      </span>
                      <span className="flex-1 min-w-0">
                        {renderInlineTokens(inlineTokens, isUser, `${key}-num-${itemIdx}`)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            );
          case "blockquote":
            return (
              <blockquote
                key={key}
                className={cn(
                  "border-l-3 pl-3 py-1 my-2 italic",
                  isUser
                    ? "border-[#E6A52E] text-[#F4F0E5]/90"
                    : "border-[#123C32] text-[#252923]/90"
                )}
              >
                {renderParagraphContent(block.content, isUser, key)}
              </blockquote>
            );
          case "code_block":
            return (
              <pre
                key={key}
                className={cn(
                  "rounded-lg p-3 my-2 font-mono text-xs overflow-x-auto",
                  isUser
                    ? "bg-black/30 text-[#F4F0E5]"
                    : "bg-black/5 text-[#252923] border border-[#123C32]/20"
                )}
              >
                <code>{block.content}</code>
              </pre>
            );
          case "hr":
            return (
              <hr
                key={key}
                className={cn(
                  "my-3 border-t",
                  isUser ? "border-white/20" : "border-[#123C32]/20"
                )}
              />
            );
          case "paragraph":
            return (
              <div key={key} className="leading-relaxed">
                {renderParagraphContent(block.content, isUser, key)}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default MarkdownRenderer;

