module.exports = {
  root: true, //Indicates that the current directory is the root directory, and ESLint rules will be restricted to this directory.
  env: { browser: true, es2020: true, node: true },
  /*parser */
  parser: '@typescript-eslint/parser', //Specify the ESLint parser
  parserOptions: {
    project: './tsconfig.json', //The path of tsconfig.json
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, //enable JSX
    },
    extraFileExtensions: ['.json'],
  },
  settings: {
    //Identify @ # alias
    'import/resolver': {
      alias: {
map: [
          ['@', './src'],
          ['#', './types'],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
  /*Configurations that need to be inherited from the basic configuration in ESLint */
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended', //Use the rules recommended by @typescript-eslint/eslint-plugin
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier', //Add prettier related verification rules
'plugin:prettier/recommended', //Enable the rules recommended by the Prettier plug-in
  ],
  /*Plugins that ESLint files depend on */
  plugins: [
    '@typescript-eslint',
    'prettier',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'unused-imports',
  ],
  /**
   *Define rules
   *"off" or 0 -turn off the rule
   *"warn" or 1 -Turn on the rule and use warning level errors: warn (will not cause the program to exit)
   *"error" or 2 -turns on the rule, using error level error: error (when triggered, the program will exit)
   */
  rules: {
    'import/no-unresolved': [
        "error",
        {
'ignore': ['^msw/browser$']
        }
      ],
   'no-console': 'off',
    'no-unused-vars': 'off',
    'no-case-declarations': 'off',
    'no-use-before-define': 'off',
    'no-param-reassign': 'off',
    'space-before-function-paren': 'off',
    'class-methods-use-this': 'off',

    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/interactive-supports-focus': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
'jsx-a11y/no-static-element-interactions': 'off',

    //不用手动引入react
    'react/react-in-jsx-scope': 'off',
    'react/button-has-type': 'off',
    'react/require-default-props': 'off',
    'react/no-array-index-key': 'off',
    'react/jsx-props-no-spreading': 'off',

    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-duplicates': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
'import/order': [
      'warn',
      {
        groups: [
          'builtin', //Node.js built-in module
          'external', //Third-party module
          'internal', //Modules inside the application
          'parent', //Modules imported in the parent directory
          ['sibling', 'index'], //Sibling modules with the same or higher directory
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
          {
            pattern: '#/**',
            group: 'type',
},
          {
            pattern: '*.{scss,css,less,styl,stylus}',
            group: 'parent',
          },
          {
            pattern: '*.{js,jsx,ts,tsx}',
            group: 'sibling',
          },
        ],
        'newlines-between': 'always', //Insert empty lines between groups
        pathGroupsExcludedImportTypes: ['sibling', 'index'],
        warnOnUnassignedImports: true,
        alphabetize: { order: 'asc', caseInsensitive: true }, //For each group, sort alphabetically.
      },
    ],
'unused-imports/no-unused-imports-ts': 'warn',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],

    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
'@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-shadow': 'off',
'@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};