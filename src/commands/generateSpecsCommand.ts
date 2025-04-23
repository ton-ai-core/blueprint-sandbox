import { Args, UIProvider } from "@ton-ai-core/blueprint";
import { generateSpecs } from "../generate";
import * as path from 'path';

export const generateSpecsRunner = async (args: Args, ui: UIProvider) => {
    ui.write('Running spec generator...');

    // Determine default values and extract options from args
    const options = args as any; // Use 'as any' to access specific options
    const scriptsDir = options['scripts-dir'] as string ?? 'scripts';
    const testsDir = options['tests-dir'] as string ?? 'tests';
    // Default value for providerPath, calculated relative to testsDir
    const defaultProviderPath = path.relative(testsDir, 'src/helpers/SandboxNetworkProvider').replace(/\\/g, '/').replace(/\.ts$/, '');
    const providerPathInput = options['provider-path'] as string ?? defaultProviderPath;
    // Remove .ts extension if present, as TS/JS imports don't require it
    const providerPath = providerPathInput.endsWith('.ts') ? providerPathInput.slice(0, -3) : providerPathInput;
    // Flags without value are passed as true
    const force = typeof options['force'] === 'boolean' ? options['force'] : false; 

    try {
        await generateSpecs({
            scriptsDir,
            testsDir,
            providerPath,
            force,
        });
        ui.write('Spec generation finished successfully.');
    } catch (error) {
        if (error instanceof Error) {
            ui.write(`Error during spec generation: ${error.message}`);
        } else {
            ui.write(`An unknown error occurred: ${JSON.stringify(error)}`);
        }
        // Set process.exitCode = 1 to signal an error if needed
        process.exitCode = 1;
    }
}; 