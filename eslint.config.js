import js from '@eslint/js'
import tsPlugin from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import perfectionist from 'eslint-plugin-perfectionist'

const tsFiles = ['src/**/*.{ts,tsx}']

export default tsPlugin.config(
  js.configs.recommended,
  ...tsPlugin.configs.strictTypeChecked.map((cfg) => ({
    ...cfg,
    files: tsFiles,
  })),
  perfectionist.configs['recommended-alphabetical'],
  {
    files: tsFiles,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'zod',
              message: 'Use zod only in src/store/schema.ts for save validation.',
            },
          ],
        },
      ],

      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': ['warn', { allowNumber: true }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',

      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      ],

      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],
      complexity: ['warn', 15],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts', 'src/game/__tests__/**/*.ts', 'eslint.config.js'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-restricted-imports': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      'max-depth': 'off',
      complexity: 'off',
    },
  },
  {
    files: ['src/store/schema.ts'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  {
    files: ['src/game/pixi/GeneralPortrait.ts'],
    rules: {
      complexity: 'off',
    },
  },
  {
    files: ['src/store/gameStore.ts'],
    rules: {
      complexity: ['warn', 30],
    },
  },
  {
    files: ['src/components/GeneralDetail.tsx'],
    rules: {
      complexity: ['warn', 20],
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
)
