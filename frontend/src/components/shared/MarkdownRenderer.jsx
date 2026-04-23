import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownRenderer = ({ content, colorTheme = 'primary' }) => {
  // Determine color palette based on theme (primary, blue, red, orange)
  const getThemeVars = () => {
    switch (colorTheme) {
      case 'blue':
        return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', strong: 'text-blue-700' };
      case 'red':
        return { text: 'text-error', bg: 'bg-red-50', border: 'border-red-100', strong: 'text-red-700' };
      case 'orange':
        return { text: 'text-warning', bg: 'bg-orange-50', border: 'border-orange-100', strong: 'text-orange-700' };
      default:
        return { text: 'text-primary', bg: 'bg-primary-50', border: 'border-primary-100', strong: 'text-primary-700' };
    }
  };

  const theme = getThemeVars();

  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className={`text-3xl font-bold ${theme.text} mb-6 mt-4 pb-2 border-b-2 ${theme.border}`} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-semibold text-text-primary mt-8 mb-4 flex items-center gap-2" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-medium text-text-primary mt-6 mb-3" {...props} />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-6 rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className={`${theme.bg} ${theme.text}`} {...props} />,
        th: ({ node, ...props }) => (
          <th className="p-4 font-semibold text-sm uppercase tracking-wider border-b border-gray-200" {...props} />
        ),
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-100" {...props} />,
        td: ({ node, ...props }) => <td className="p-4 text-sm text-text-secondary" {...props} />,
        ul: ({ node, ...props }) => <ul className="space-y-3 my-4 ml-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal space-y-3 my-4 ml-6 text-text-secondary" {...props} />,
        li: ({ node, ...props }) => (
          <li className="text-text-secondary text-sm leading-relaxed" {...props} />
        ),
        p: ({ node, ...props }) => <p className="text-text-secondary text-sm leading-relaxed my-3" {...props} />,
        strong: ({ node, ...props }) => <strong className={`font-semibold ${theme.strong}`} {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className={`border-l-4 ${theme.border} ${theme.bg} p-4 rounded-r-xl my-6 text-sm text-text-primary italic`} {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
