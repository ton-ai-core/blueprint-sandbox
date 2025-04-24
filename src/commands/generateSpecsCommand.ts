import { Args, UIProvider } from "@ton-ai-core/blueprint";
import { generateSpecs } from "../generate";

export const generateSpecsRunner = async (args: Args, ui: UIProvider) => {
  ui.write("Running spec generator...");

  const options = args as any;
  const scriptsDir = options['scripts-dir'] as string ?? 'scripts';
  const testsDir = options['tests-dir'] as string ?? 'tests';
  const force = typeof options['force'] === 'boolean' ? options['force'] : false;

  try {
    await generateSpecs({
      scriptsDir,
      testsDir,
      force,
    });
    ui.write("Spec generation finished successfully.");
  } catch (error) {
    if (error instanceof Error) {
      ui.write(`Error during spec generation: ${error.message}`);
    } else {
      ui.write(`An unknown error occurred: ${JSON.stringify(error)}`);
    }
    process.exitCode = 1;
  }
};
