# Hacking Guide

This guide helps to set up the development environment for this project.

## Prerequisites

- Node.js (v18+ recommended)
- Yarn (Classic - v1.x)
- A Blueprint project to test against

## Setup

1.  Clone this repository.
2.  Install dependencies: `yarn install`
3.  Link the plugin locally: `yarn link`
4.  In your target Blueprint project, link the plugin: `yarn link blueprint-plugin-sandbox-specs`
5.  Add the plugin to your Blueprint project's `blueprint.config.ts`:
    ```typescript
    import { SandboxSpecsPlugin } from 'blueprint-plugin-sandbox-specs'; // May need path adjustment

    export const config = {
      plugins: [
        // ... other plugins
        new SandboxSpecsPlugin(),
      ],
    };
    ```

## Running

1.  Build the plugin: `yarn build` (or `yarn build --watch` for continuous compilation)
2.  In your target Blueprint project, run the command:
    ```bash
    yarn blueprint generate-specs --scripts-dir path/to/scripts --tests-dir path/to/tests
    ```

## Testing

Run unit tests: `yarn test`
