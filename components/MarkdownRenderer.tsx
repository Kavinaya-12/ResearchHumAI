"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}


export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" = "ul";

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (listType === "ul") {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-200">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="my-2 space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-200">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`([\s\S]*)$/);
      const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*([\s\S]*)$/);
      const italicMatch = remaining.match(/^(.*?)\*([^*]+)\*([\s\S]*)$/);

      if (codeMatch && (!boldMatch || codeMatch[1].length <= boldMatch[1].length)) {
        if (codeMatch[1]) parts.push(codeMatch[1]);
        parts.push(
          <code
            key={`code-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-mono text-xs font-semibold"
          >
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
      } else if (boldMatch) {
        if (boldMatch[1]) parts.push(boldMatch[1]);
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-semibold text-slate-900 dark:text-white">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
      } else if (italicMatch) {
        if (italicMatch[1]) parts.push(italicMatch[1]);
        parts.push(
          <em key={`italic-${keyIdx++}`} className="italic text-slate-800 dark:text-slate-200">
            {italicMatch[2]}
          </em>
        );
        remaining = italicMatch[3];
      } else {
        parts.push(remaining);
        break;
      }
    }

    return parts;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushList();
        elements.push(
          <pre
            key={`code-block-${index}`}
            className="my-3 p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800"
          >
            <code>{codeBlockContent.join("\n")}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={`h3-${index}`} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={`h2-${index}`} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={`h1-${index}`} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="my-2 border-l-4 border-brand-500 pl-3 py-1 italic text-slate-600 dark:text-slate-300 bg-brand-50/50 dark:bg-brand-950/20 rounded-r text-sm"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        flushList();
        inList = true;
        listType = "ul";
      }
      listItems.push(
        <li key={`li-${index}`} className="text-sm leading-relaxed">
          {parseInline(trimmed.slice(2))}
        </li>
      );
      return;
    }
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!inList || listType !== "ol") {
        flushList();
        inList = true;
        listType = "ol";
      }
      listItems.push(
        <li key={`li-ol-${index}`} className="text-sm leading-relaxed">
          {parseInline(orderedMatch[2])}
        </li>
      );
      return;
    }
    if (!trimmed) {
      flushList();
      return;
    }
    flushList();
    elements.push(
      <p key={`p-${index}`} className="my-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {parseInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
