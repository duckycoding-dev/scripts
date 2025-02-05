/** @type {import("prettier").Config} */
const config = {
  printWidth: 10000, // as this project relies on on long strings in code, we don't want to limit the line width
  useTabs: false,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  quoteProps: 'as-needed',
  trailingComma: 'all',
  singleAttributePerLine: false,
  bracketSameLine: false,
};

export default config;
