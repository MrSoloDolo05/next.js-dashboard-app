import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Chapter 13: Next.js ships eslint-config-next, which bundles the
// eslint-plugin-jsx-a11y accessibility rules. `next/core-web-vitals` escalates
// the important a11y/performance rules from warnings to errors, which is what
// keeps the forms in this project (labels, aria-describedby, alt text...)
// honest.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
  ]),
]);

export default eslintConfig;
