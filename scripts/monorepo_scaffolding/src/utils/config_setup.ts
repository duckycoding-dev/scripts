import { $ } from 'bun';
import { createFile } from '@scripts/utils/fs';
import { appendFileSync } from 'node:fs';

export type Workspace = {
  name: string;
  packages: string[];
}

export async function setupNPMWorkspacesMonorepo(workspaces: Workspace[], appName?: string) {
  const name = appName ?? process.cwd().split('/').pop();
  // 📦 Initialize NPM Workspaces
  const isWindows = process.platform === "win32";
  const silentCommand = isWindows
    ? "> NUL 2>&1"
    : "> /dev/null 2>&1";
  if (!await Bun.file('package.json').exists()) {
    console.log('📦 Initializing NPM...');
    await $`npm init -y`.quiet();
    const packageJsonPath = `package.json`;
    const packageJson = await Bun.file(packageJsonPath).json();
    packageJson.name = `@${name}/root`;
    await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  if(workspaces.length > 0) {
    console.log('📦 Initializing NPM workspaces...');
    for(const workspace of workspaces) {
      if(workspace.packages.length === 0) {
        // root level: the workspace is single package
        await $`npm init -yw "${workspace.name}"`.quiet();
      } else {
        for(const pkh of workspace.packages) {
          await $`npm init -yw "${workspace.name}/${pkh}"`.quiet();
        }
      }
    }
  
    for(const workspace of workspaces) {
      if(workspace.packages.length === 0) {
        // root level: the workspace is single package
        const packageJsonPath = `${workspace.name}/package.json`;
        const packageJson = await Bun.file(packageJsonPath).json();
        packageJson.name = `@${name}/${workspace.name}`;
        await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
      } else {
        for(const pkg of workspace.packages) {
          const packageJsonPath = `${workspace.name}/${pkg}/package.json`;
          const packageJson = await Bun.file(packageJsonPath).json();
          packageJson.name = `@${name}/${pkg}`;
          await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
      }
    }
  }
}

export async function setupPrettier() {
  // 📦 Install Prettier
  console.log('📦 Installing Prettier...');
  await $`npm i --save-dev --save-exact prettier`;

  createFile('prettier.config.js',
`/** @type {import("prettier").Config} */
const config = {
  printWidth: 10000, // as this project relies on on long strings in code, we don't want to limit the line width
  useTabs: false,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  quoteProps: 'as-needed',
  trailingComma: 'all',
  singleAttributePerLine: false,
  bracketSameLine: false,
};

export default config;
`

  )
}

export async function setupTypescript() {
  // 📦 Install TypeScript
  console.log('📦 Installing TypeScript...');
  await $`npm i --save-dev typescript`;
  createFile(
    'tsconfig.json',
`{
  "compilerOptions": {
    // Enable latest features
    "lib": ["ESNext", "DOM"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    // "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    // "noEmit": true,

    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noFallthroughCasesInSwitch": true,

    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false,

    // custom
    "noImplicitAny": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    },
    "declarationDir": "./dist",
    "declaration": true,
    "sourceMap": true,
    "stripInternal": true
  },
  "include": ["./**/src/**/*"],
  "exclude": ["./**/dist/**/*", "./**/node_modules"]
}
`,
  );
}

/**
 * Setup ESLint
 * @param opts - { useTypescript: boolean, usePrettier: boolean }
 * @argument opts.useTypescript - Use TypeScript
 * @argument opts.usePrettier - Use Prettier
 * @returns Promise<void>
 * @default opts - { usePrettier: false }
 * @example
 * await setupEslint({ usePrettier: true });
 * @example
 * await setupEslint({})
 * @example
 * await setupEslint()
*/
export async function setupEslint(opts: {
  usePrettier?: boolean;
} = {
  usePrettier: false,
}) {
  // 📦 Install ESLint
  console.log('📦 Installing ESLint...');
  await $`npm init @eslint/config@latest`;
  if(opts.usePrettier) {
    await $`npm i --save-dev eslint-config-prettier`;
    // Add eslint-config-prettier to the ESLint config
    console.log('Adding eslint-config-prettier to ESLint config...');
    const eslintConfigPath = 'eslint.config.mjs';
    const eslintConfigFile = Bun.file(eslintConfigPath);
    let updatedEslintConfigContent = await eslintConfigFile.text();
    updatedEslintConfigContent = `import eslintConfigPrettier from "eslint-config-prettier";\n${updatedEslintConfigContent}`;
    updatedEslintConfigContent = updatedEslintConfigContent.replace(
      '];',
      `  eslintConfigPrettier,\n];`
    );
    console.log
    await Bun.write(eslintConfigFile, updatedEslintConfigContent);
  }
}

export async function setupLintStagedWithHusky() {
  // 📦 Install Husky and Lint-Staged
  console.log('📦 Installing Husky and Lint-Staged...');
  await $`npm i --save-dev husky lint-staged`;
  await $`npx husky init`;
  console.log('');
  appendFileSync('.husky/pre-commit',
    `echo "🤭 Running lint-staged before commmitting..."
echo "🤗 Checking code with eslint and prettier before committing..."
npx lint-staged
`);

  createFile('lint-staged.config.js',
    `/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
const configs = {
  '*.{js,jsx,ts,tsx}': (stagedFiles) => [
    'eslint .',
    \`prettier --ignore-unknown --write \${stagedFiles.join(' ')}\`,
  ],
};

// this configuration runs eslint and prettier (in order) on all staged files
// that are JavaScript or TypeScript files
// the \`--ignore-unknown\` flag tells prettier to ignore files that are not supported to avoid errors

export default configs;
`
  );
}

export async function setupGit(mainBranchName: string, remoteRepoUrl?: string){
  // 📦 Initialize Git
  console.log('📦 Initializing Git...');
  await $`git init`.quiet();
  await $`git branch -m ${mainBranchName}`.quiet();
  if(remoteRepoUrl) {
    await $`git remote add origin ${remoteRepoUrl}`.quiet();
  }
  // createFile('.gitignore',
}

export default {
  setupNPMWorkspacesMonorepo,
  setupPrettier,
  setupTypescript,
  setupEslint,
  setupLintStagedWithHusky,
  setupGit
};