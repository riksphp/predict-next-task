/* eslint-env node */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: { jsx: true },
	},
	env: { browser: true, es2022: true, node: true },
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:jsx-a11y/recommended',
		'prettier'
	],
	plugins: ['react', 'react-hooks', '@typescript-eslint', 'jsx-a11y'],
	settings: {
		react: { version: 'detect' }
	},
	rules: {
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/ban-types': ['error', { extendDefaults: true, types: { unknown: 'Avoid unknown; use specific types.' } }]
	}
};



