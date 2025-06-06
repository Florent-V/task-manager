module.exports = {
  env: {
    browser: false, // Not a browser environment
    es2021: true,   // Or a later version like es2022, es2023
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest', // Use the latest ECMAScript features
    sourceType: 'module',  // Enable ES modules
  },
  rules: {
    // Airbnb can be strict, override or add rules as needed
    // For example, if you prefer different import/order or other rules:
    'import/extensions': ['error', 'ignorePackages', {
      js: 'always', // or 'never' if you don't use .js extensions in imports
    }],
    'node/no-unsupported-features/es-syntax': ['error', {
      'version': '>=14.0.0', // Specify your Node.js version support
      'ignores': ['modules']
    }],
    'no-console': 'warn', // Example: warn about console.log
    // You might need to adjust rules based on project specifics or preferences
  },
  settings: {
    node: {
      // Define the Node.js version you are using if not automatically detected
      // version: ">=14.0.0"
    }
  }
};
