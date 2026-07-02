import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { typography } from '@/core/theme/tokens';

interface MarkdownRendererProps {
  text: string;
  baseStyle: {
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  codeBackground: string;
  linkColor: string;
  blockquoteBackground: string;
  blockquoteBorder: string;
}

function parseInline(
  segment: string,
  index: number,
  baseStyle: { fontSize: number; lineHeight: number; color: string },
  codeBackground: string,
  linkColor: string,
): React.ReactNode {
  if (!segment) return null;

  const codeMatch = segment.match(/^`([^`]+)`(.*)$/s);
  if (codeMatch) {
    return (
      <React.Fragment key={index}>
        <Text style={[styles.inlineCode, { backgroundColor: codeBackground, fontSize: baseStyle.fontSize - 2, lineHeight: baseStyle.lineHeight }]}>
          {codeMatch[1]}
        </Text>
        {parseInline(codeMatch[2], index + 0.1, baseStyle, codeBackground, linkColor)}
      </React.Fragment>
    );
  }

  const linkMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)(.*)$/);
  if (linkMatch) {
    return (
      <React.Fragment key={index}>
        <Pressable onPress={() => Linking.openURL(linkMatch[2]).catch(() => {})}>
          <Text style={[styles.link, { color: linkColor, fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight }]}>
            {linkMatch[1]}
          </Text>
        </Pressable>
        {parseInline(linkMatch[3], index + 0.2, baseStyle, codeBackground, linkColor)}
      </React.Fragment>
    );
  }

  const boldMatch = segment.match(/^\*\*([^*]+)\*\*(.*)$/);
  if (boldMatch) {
    return (
      <React.Fragment key={index}>
        <Text style={[styles.bold, { fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }]}>
          {boldMatch[1]}
        </Text>
        {parseInline(boldMatch[2], index + 0.3, baseStyle, codeBackground, linkColor)}
      </React.Fragment>
    );
  }

  const italicMatch = segment.match(/^\*([^*]+)\*(.*)$/);
  if (italicMatch) {
    return (
      <React.Fragment key={index}>
        <Text style={[styles.italic, { fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }]}>
          {italicMatch[1]}
        </Text>
        {parseInline(italicMatch[2], index + 0.4, baseStyle, codeBackground, linkColor)}
      </React.Fragment>
    );
  }

  const textEnd = segment.search(/`|\[|\*\*|\*(?!\*)/);
  if (textEnd === -1) {
    return (
      <Text key={index} style={{ fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }}>
        {segment}
      </Text>
    );
  }

  const before = segment.slice(0, textEnd);
  const rest = segment.slice(textEnd);
  return (
    <React.Fragment key={index}>
      {before ? (
        <Text style={{ fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }}>
          {before}
        </Text>
      ) : null}
      {parseInline(rest, index + 0.5, baseStyle, codeBackground, linkColor)}
    </React.Fragment>
  );
}

function parseInlineLine(
  line: string,
  baseStyle: { fontSize: number; lineHeight: number; color: string },
  codeBackground: string,
  linkColor: string,
): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let remaining = line;

  while (remaining) {
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      elements.push(
        <Text key={`code-${elements.length}`} style={[styles.inlineCode, { backgroundColor: codeBackground, fontSize: baseStyle.fontSize - 2, lineHeight: baseStyle.lineHeight }]}>
          {codeMatch[1]}
        </Text>,
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      elements.push(
        <Pressable key={`link-${elements.length}`} onPress={() => Linking.openURL(linkMatch[2]).catch(() => {})}>
          <Text style={[styles.link, { color: linkColor, fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight }]}>
            {linkMatch[1]}
          </Text>
        </Pressable>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      elements.push(
        <Text key={`bold-${elements.length}`} style={[styles.bold, { fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }]}>
          {boldMatch[1]}
        </Text>,
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      elements.push(
        <Text key={`italic-${elements.length}`} style={[styles.italic, { fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }]}>
          {italicMatch[1]}
        </Text>,
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/`|\[|\*\*/);
    if (nextSpecial === -1) {
      elements.push(
        <Text key={`text-${elements.length}`} style={{ fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }}>
          {remaining}
        </Text>,
      );
      break;
    }

    if (nextSpecial > 0) {
      elements.push(
        <Text key={`text-${elements.length}`} style={{ fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }}>
          {remaining.slice(0, nextSpecial)}
        </Text>,
      );
    }
    remaining = remaining.slice(nextSpecial);
  }

  return elements.length > 0 ? elements : null;
}

function countLeadingSpaces(line: string): number {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}

function renderUnorderedList(
  lines: string[],
  startIndex: number,
  baseStyle: { fontSize: number; lineHeight: number; color: string },
  codeBackground: string,
  linkColor: string,
): { rendered: React.ReactNode; consumed: number } {
  const items: { level: number; content: string; index: number }[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const listMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (!listMatch) break;

    const level = Math.floor(countLeadingSpaces(lines[i]) / 2);
    items.push({ level, content: listMatch[1], index: i });
    i++;
  }

  const rendered = items.map((item, idx) => (
    <View key={`ul-${startIndex}-${idx}`} style={[styles.listItem, { paddingLeft: 8 + item.level * 16 }]}>
      <Text style={[styles.bullet, { color: baseStyle.color, fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight }]}>
        {'\u2022'}
      </Text>
      <View style={styles.listItemContent}>
        <InlineContent
          line={item.content}
          baseStyle={baseStyle}
          codeBackground={codeBackground}
          linkColor={linkColor}
        />
      </View>
    </View>
  ));

  return { rendered, consumed: i - startIndex };
}

function renderOrderedList(
  lines: string[],
  startIndex: number,
  baseStyle: { fontSize: number; lineHeight: number; color: string },
  codeBackground: string,
  linkColor: string,
): { rendered: React.ReactNode; consumed: number } {
  const items: { level: number; content: string; index: number }[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const listMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (!listMatch) break;

    const level = Math.floor(countLeadingSpaces(lines[i]) / 2);
    const number = parseInt(trimmed.match(/^\d+/)?.[0] || '1', 10);
    items.push({ level, content: listMatch[1], index: number });
    i++;
  }

  const rendered = items.map((item, idx) => (
    <View key={`ol-${startIndex}-${idx}`} style={[styles.listItem, { paddingLeft: 8 + item.level * 16 }]}>
      <Text style={[styles.bullet, { color: baseStyle.color, fontSize: baseStyle.fontSize - 2, lineHeight: baseStyle.lineHeight }]}>
        {(item.index as number)}.
      </Text>
      <View style={styles.listItemContent}>
        <InlineContent
          line={item.content}
          baseStyle={baseStyle}
          codeBackground={codeBackground}
          linkColor={linkColor}
        />
      </View>
    </View>
  ));

  return { rendered, consumed: i - startIndex };
}

function InlineContent({
  line,
  baseStyle,
  codeBackground,
  linkColor,
}: {
  line: string;
  baseStyle: { fontSize: number; lineHeight: number; color: string };
  codeBackground: string;
  linkColor: string;
}) {
  return <Text style={{ fontSize: baseStyle.fontSize, lineHeight: baseStyle.lineHeight, color: baseStyle.color }}>{parseInlineLine(line, baseStyle, codeBackground, linkColor)}</Text>;
}

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: 8,
  },
  inlineCode: {
    fontFamily: typography.fontFamily.mono,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    width: 20,
  },
  listItemContent: {
    flex: 1,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
    marginBottom: 8,
    borderRadius: 2,
  },
});

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
  text,
  baseStyle,
  codeBackground,
  linkColor,
  blockquoteBackground,
  blockquoteBorder,
}: MarkdownRendererProps) {
  const blocks = text.split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  blocks.forEach((block, blockIndex) => {
    const lines = block.split('\n');
    const trimmedFirstLine = lines[0]?.trim() || '';

    if (trimmedFirstLine.startsWith('>')) {
      const quoteText = lines
        .map((l) => l.replace(/^>\s?/, ''))
        .join('\n');
      elements.push(
        <View
          key={`bq-${blockIndex}`}
          style={[styles.blockquote, { backgroundColor: blockquoteBackground, borderLeftColor: blockquoteBorder }]}
        >
          <InlineContent
            line={quoteText}
            baseStyle={{ ...baseStyle, color: baseStyle.color }}
            codeBackground={codeBackground}
            linkColor={linkColor}
          />
        </View>,
      );
      return;
    }

    if (lines.some((l) => l.trim().match(/^[-*]\s/))) {
      const { rendered } = renderUnorderedList(lines, 0, baseStyle, codeBackground, linkColor);
      elements.push(<View key={`ul-${blockIndex}`}>{rendered}</View>);
      return;
    }

    if (lines.some((l) => l.trim().match(/^\d+\.\s/))) {
      const { rendered } = renderOrderedList(lines, 0, baseStyle, codeBackground, linkColor);
      elements.push(<View key={`ol-${blockIndex}`}>{rendered}</View>);
      return;
    }

    const paragraphText = lines.join(' ').replace(/\s+/g, ' ').trim();
    if (!paragraphText) return;

    elements.push(
      <View key={`p-${blockIndex}`} style={styles.paragraph}>
        <InlineContent
          line={paragraphText}
          baseStyle={baseStyle}
          codeBackground={codeBackground}
          linkColor={linkColor}
        />
      </View>,
    );
  });

  return <>{elements}</>;
});

export default MarkdownRenderer;
