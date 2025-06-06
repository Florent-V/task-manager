# starter-vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Nightwatch](https://nightwatchjs.org/)

```sh
# When using CI, the project must be built first.
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chrome
npm run test:e2e -- --env chrome
# Runs the tests of a specific file
npm run test:e2e -- tests/e2e/example.js
# Runs the tests in debug mode
npm run test:e2e -- --debug
```
    
### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

#### WebStorm ESLint Configuration

To integrate ESLint with WebStorm for real-time feedback and auto-fixing:

1.  **Enable ESLint**:
    *   Go to `Settings/Preferences` > `Languages & Frameworks` > `JavaScript` > `Code Quality Tools` > `ESLint`.
    *   Check the `Enable` box.

2.  **Configuration**:
    *   Select `Automatic ESLint configuration`. WebStorm should automatically detect the ESLint package (`eslint`) and configuration file (`.eslintrc.cjs`) in the `client` project.
    *   If not, you can manually specify:
        *   **Node interpreter**: Set this to your project's Node.js interpreter.
        *   **ESLint package**: Select the `eslint` package located in `node_modules/eslint` within the `client` directory.
        *   **Configuration file**: Select the `.eslintrc.cjs` file in the `client` directory.

3.  **Run ESLint on Save (Optional but Recommended)**:
    *   Still in the ESLint settings, you might find an option like `Run eslint --fix on save`. If available, enabling this will automatically format your code according to ESLint rules when you save a file. The existing `lint` script (`eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore`) already includes `--fix`.

4.  **Show ESLint Errors in Editor**:
    *   Ensure that WebStorm is set to show errors from ESLint directly in the editor. This is usually enabled by default.

By following these steps, WebStorm will highlight ESLint errors and warnings as you code, and you can often use quick-fixes (Alt+Enter or Option+Enter) to resolve them.

### Generate Assets

```sh
pwa-assets-generator --preset 2023 public/favicon.svg
```


### Test deploy
    
```sh
npm install -g serve
npm run build
serve -s dist -l 4000
```
