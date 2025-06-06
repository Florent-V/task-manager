# Backend Server (Node.js/Express)

This directory contains the backend server code for the application.

## Prerequisites

Ensure you have Node.js and npm installed on your system.

## Installation

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

## Code Linting with ESLint

This project uses ESLint to enforce code quality and consistency.

### Running the Linter

To check your code against the ESLint rules and automatically fix issues where possible, run:

```bash
npm run lint
```

### WebStorm ESLint Configuration

To integrate ESLint with WebStorm for real-time feedback and auto-fixing:

1.  **Enable ESLint**:
    *   Go to `Settings/Preferences` > `Languages & Frameworks` > `JavaScript` > `Code Quality Tools` > `ESLint`.
    *   Check the `Enable` box.

2.  **Configuration**:
    *   Select `Automatic ESLint configuration`. WebStorm should automatically detect the ESLint package and configuration file (`.eslintrc.js`) in the project.
    *   If not, you can manually specify:
        *   **Node interpreter**: Set this to your project's Node.js interpreter.
        *   **ESLint package**: Select the `eslint` package located in `node_modules/eslint` within the `server` directory.
        *   **Configuration file**: Select the `.eslintrc.js` file in the `server` directory.

3.  **Run ESLint on Save (Optional but Recommended)**:
    *   Still in the ESLint settings, you might find an option like `Run eslint --fix on save`. If available, enabling this will automatically format your code according to ESLint rules when you save a file. Alternatively, you can set up a File Watcher for this.

4.  **Show ESLint Errors in Editor**:
    *   Ensure that WebStorm is set to show errors from ESLint directly in the editor. This is usually enabled by default.

By following these steps, WebStorm will highlight ESLint errors and warnings as you code, and you can often use quick-fixes (Alt+Enter or Option+Enter) to resolve them.
