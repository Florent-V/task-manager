import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dev-dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      'tests/',
      'vendor/',
      'public/',
      'assets/vendor/',
    ],
  },
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      js,
      vue: pluginVue,
      import: pluginImport,
      prettier: pluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginImport.configs.recommended.rules,

      // Personnalisations utiles
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        },
      },
    },
  },
  prettierConfig,
]);
