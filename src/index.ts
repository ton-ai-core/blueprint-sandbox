import { Plugin, PluginRunner } from "@ton-ai-core/blueprint";
import { generateSpecsRunner } from "./commands/generateSpecsCommand";

// Re-export SandboxNetworkProvider so it can be imported from the package root
export { SandboxNetworkProvider } from "./helpers/SandboxNetworkProvider";

export class SandboxPlugin implements Plugin {
  runners(): PluginRunner[] {
    return [
      {
        name: "generate-specs",
        runner: generateSpecsRunner,
        help: `Usage: blueprint generate-specs [options]\n\nGenerates boilerplate .spec.ts files for scripts using SandboxNetworkProvider.\n\nOptions:\n  --scripts-dir <dir>    Directory containing the scripts (default: "scripts")\n  --tests-dir <dir>      Directory to generate spec files in (default: "tests")\n  --force                Overwrite existing spec files (default: false)`,
      },
    ];
  }
}
