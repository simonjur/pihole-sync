import * as globals from 'globals';
import * as tseslint from 'typescript-eslint';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import * as importPlugin from 'eslint-plugin-import';
import * as js from '@eslint/js';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.node },
    },
    tseslint.configs.recommended,
    {
        files: ['**/*.json'],
        plugins: { json },
        language: 'json/json5',
        extends: ['json/recommended'],
    },
    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/gfm',
        extends: ['markdown/recommended'],
    },
    { ignores: ['package-lock.json'] },
    importPlugin.flatConfigs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        rules: {
            'import/order': 'error',
            'import/no-unresolved': 'off',
        },
    },
]);
