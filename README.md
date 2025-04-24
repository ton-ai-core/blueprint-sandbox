# blueprint-plugin-sandbox-specs

A plugin for the [Blueprint Framework](https://github.com/ton-org/blueprint/) that generates boilerplate `.spec.ts` test files for your scripts.

This plugin is designed for scripts that use the `SandboxNetworkProvider` (or a similar mock provider) for testing smart contract interactions within the TON Sandbox environment.

## Installation

Add this plugin as a development dependency to your Blueprint project:

```bash
yarn add -D blueprint-plugin-sandbox-specs
# or
npm install -D blueprint-plugin-sandbox-specs
```

## Configuration

Import the plugin and add it to the `plugins` array in your `blueprint.config.ts` file:

```typescript
import { Config } from '@ton-ai-core/blueprint';
import { SandboxPlugin } from 'blueprint-plugin-sandbox-specs'; // Adjust path if needed

export const config: Config = {
  project: {
    // ... other blueprint configurations
    plugins: [
      // ... other plugins
      new SandboxPlugin(),
    ],
  };
```

## Usage

Run the following command to generate spec files:

```bash
yarn blueprint generate-specs [options]
```

The command will scan the specified scripts directory (default: `scripts/`) for `.ts` files (excluding `.spec.ts`) and generate a corresponding `.spec.ts` file in the tests directory (default: `tests/`) using a predefined template.

The template imports `SandboxNetworkProvider` from `@ton-ai-core/blueprint-sandbox/dist/helpers/SandboxNetworkProvider`.

**Options:**

*   `--scripts-dir <dir>`: Directory containing the scripts (default: `scripts`).
*   `--tests-dir <dir>`: Directory where spec files will be generated (default: `tests`).
*   `--force`: Overwrite existing `.spec.ts` files (default: `false`).

**Example:**

```bash
# Generate tests for scripts in 'src/scripts' and output to 'src/tests'
yarn blueprint generate-specs --scripts-dir src/scripts --tests-dir src/tests

# Force overwrite existing tests
yarn blueprint generate-specs --force
```
