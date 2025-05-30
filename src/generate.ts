import * as fs from "fs/promises";
import * as path from "path";

export interface GenerateOptions {
  scriptsDir: string;
  testsDir: string;
  force: boolean;
}

const specTemplate = (
  scriptName: string,
  scriptImportPath: string,
  takesArgs: boolean,
) => {
  const scriptCall = takesArgs
    ? `// Provide an empty array for args by default.
       // TODO: If your script requires arguments, provide them here.
       await ${scriptName}Script(mockProvider, []);`
    : `await ${scriptName}Script(mockProvider);`;

  return `import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
// TODO: Specify the path to the required contract types or make it configurable
// import { SomeContract } from '../wrappers/SomeContract'; 
import { run as ${scriptName}Script } from '${scriptImportPath}'; 
import '@ton/test-utils';
import { randomBytes } from 'crypto';
// Use package root import for the provider
import { SandboxNetworkProvider } from '@ton-ai-core/blueprint-sandbox'; 

describe('${scriptName} script', () => {
   let blockchain: Blockchain;
   let deployer: SandboxContract<TreasuryContract>;
   let mockProvider: SandboxNetworkProvider;
   // For test predictability, a deterministic ID can be used
   const DETERMINISTIC_ID = BigInt('0x' + randomBytes(4).toString('hex')); 

   beforeEach(async () => {
       blockchain = await Blockchain.create();
       deployer = await blockchain.treasury('deployer');
       mockProvider = new SandboxNetworkProvider(blockchain, deployer);
       // Optionally: configure blockchain verbosity for tests
       // blockchain.verbosity = { ...blockchain.verbosity, printSteps: false }; 
   });

   it('should run script successfully', async () => {
       // --- Initial conditions (if needed) ---
       // const originalMathRandom = Math.random;
       // Math.random = (): number => Number(DETERMINISTIC_ID % 10000n) / 10000; 
       
       // --- Script execution ---
       ${scriptCall}
       
       // --- Assertions ---
       // Verify that the script performed the expected actions
       // For example, check contract deployment:
       /*
       const expectedAddress = //... calculate the expected address
       const isDeployed = await mockProvider.isContractDeployed(expectedAddress);
       expect(isDeployed).toBe(true);

       const contract = blockchain.openContract(await SomeContract.fromAddress(expectedAddress));
       // Check contract state
       expect(await contract.getSomething()).toEqual();
       */

       // --- Cleanup (if needed) ---
       // Math.random = originalMathRandom;
   });
}); 
`;
};

async function findScripts(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return findScripts(fullPath);
      } else if (
        entry.isFile() &&
        fullPath.endsWith(".ts") &&
        !fullPath.endsWith(".spec.ts")
      ) {
        return [fullPath];
      }
      return [];
    }),
  );
  return files.flat();
}

export async function generateSpecs(options: GenerateOptions): Promise<void> {
  console.log("Starting spec generation with options:", options);

  const scriptsDirAbs = path.resolve(options.scriptsDir);
  const testsDirAbs = path.resolve(options.testsDir);

  try {
    await fs.access(scriptsDirAbs);
  } catch (error) {
    console.error(`Error: Scripts directory not found: ${scriptsDirAbs}`);
    process.exit(1);
  }

  await fs.mkdir(testsDirAbs, { recursive: true });

  const scriptFiles = await findScripts(scriptsDirAbs);
  console.log(`Found ${scriptFiles.length} script(s) to process.`);

  for (const scriptPath of scriptFiles) {
    const scriptName = path.basename(scriptPath, ".ts");
    const specFileName = `${scriptName}.spec.ts`;
    const specFilePath = path.join(testsDirAbs, specFileName);

    console.log(`Processing script: ${scriptPath}`);
    console.log(`Target spec file: ${specFilePath}`);

    let scriptContent = '';
    try {
      scriptContent = await fs.readFile(scriptPath, 'utf-8');
    } catch (readError) {
      console.error(`Failed to read script file: ${scriptPath}`, readError);
      continue; // Skip this script if reading fails
    }

    // Check if the run function signature includes 'args'
    // This is a basic check; could be improved with regex or AST parsing for robustness
    const runFunctionRegex = /export\s+async\s+function\s+run\s*\(([^)]*)\)/;
    const match = scriptContent.match(runFunctionRegex);
    let takesArgs = false;
    if (match && match[1]) {
      // Check if 'args:' or 'args :' exists within the parameters list
      takesArgs = /\bargs\s*:[^,]*/.test(match[1]);
    }
    console.log(`Script ${scriptName} takes args: ${takesArgs}`);

    try {
      await fs.access(specFilePath);
      if (!options.force) {
        console.warn(
          `Skipping: Spec file already exists: ${specFilePath}. Use --force to overwrite.`,
        );
        continue;
      }
      console.log(`Overwriting existing spec file: ${specFilePath}`);
    } catch (error) {
      // File doesn't exist, proceed
    }

    // Calculate relative path for script import
    const scriptImportPath = path.relative(
      testsDirAbs,
      scriptPath.replace(/\.ts$/, ""),
    );

    // Pass the takesArgs flag to the template function
    const templateContent = specTemplate(scriptName, scriptImportPath, takesArgs);

    try {
      await fs.writeFile(specFilePath, templateContent);
      console.log(`Successfully generated spec file: ${specFilePath}`);
    } catch (error) {
      console.error(`Failed to write spec file: ${specFilePath}`, error);
    }
  }

  console.log("Spec generation finished.");
}
