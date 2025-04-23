import { Plugin, PluginRunner } from "@ton-ai-core/blueprint";
import { generateSpecsRunner } from "./commands/generateSpecsCommand";

export class SandboxSpecsPlugin implements Plugin {
  runners(): PluginRunner[] {
    return [
      {
        name: "generate-specs",
        runner: generateSpecsRunner,
        help: `Usage: blueprint generate-specs [options]\n\nGenerates boilerplate .spec.ts files for scripts using SandboxNetworkProvider.\n\nOptions:\n  --scripts-dir <dir>    Directory containing the scripts (default: "scripts")\n  --tests-dir <dir>      Directory to generate spec files in (default: "tests")\n  --provider-path <path> Relative path from tests directory to SandboxNetworkProvider (default: calculated relative path to src/helpers/SandboxNetworkProvider)\n  --force                Overwrite existing spec files (default: false)`,
      },
    ];
  }
}
