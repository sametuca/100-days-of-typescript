import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface SDKConfig {
  language: string;
  outputDir: string;
  packageName: string;
}

const sdkConfigs: SDKConfig[] = [
  {
    language: 'typescript-axios',
    outputDir: './sdk/typescript',
    packageName: 'devtracker-client',
  },
  {
    language: 'python',
    outputDir: './sdk/python',
    packageName: 'devtracker_client',
  },
  {
    language: 'java',
    outputDir: './sdk/java',
    packageName: 'com.devtracker.client',
  },
];

async function generateSDK(config: SDKConfig): Promise<void> {
  console.log(`Generating ${config.language} SDK...`);
  
  const command = `
    npx @openapitools/openapi-generator-cli generate
      -i ./docs/api/openapi.json
      -g ${config.language}
      -o ${config.outputDir}
      --additional-properties=packageName=${config.packageName}
  `.replace(/\s+/g, ' ').trim();

  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✓ ${config.language} SDK generated successfully`);
  } catch (error) {
    console.error(`✗ Failed to generate ${config.language} SDK:`, error);
  }
}

async function generateAllSDKs(): Promise<void> {
  console.log('Starting SDK generation...\n');
  
  for (const config of sdkConfigs) {
    await generateSDK(config);
    console.log('');
  }
  
  console.log('SDK generation completed!');
}

// Run if called directly
if (require.main === module) {
  generateAllSDKs().catch(console.error);
}

export { generateAllSDKs, generateSDK };
