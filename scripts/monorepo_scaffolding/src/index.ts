import { parseArgs } from 'node:util';
import type { Workspace } from './utils/config_setup';
import configs from './utils/config_setup';
import { verifyAndFormatWorkspaces } from './utils/cli_args';

const { values: cliArgs } = parseArgs({
  args: Bun.argv,
  options: {
    name: {
      type: 'string',
      short: 'n',
    },
    prettier: {
      type: 'boolean',
      short: 'p',
    },
    git: {
      type: 'boolean',
      short: 'g',
    },
    'git-remote-repo': {
      type: 'string',
    },
    'git-default-branch': {
      type: 'string',
      default: 'main',
    },
    eslint: {
      type: 'boolean',
      short: 'e',
    },
    typescript: {
      type: 'boolean',
      short: 't',
    },
    monorepo: {
      type: 'string',
      default: 'npm',
      short: 'm',
    },
    workspaces: {
      type: 'string',
      short: 'w',
      multiple: true,
      default: ['packages/utils'],
    },
  },
  strict: true,
  allowPositionals: true,
});

// 🏗️ Create Monorepo Structure
const scaffoldNPMWorkspacesMonorepo = async () => {
  console.time('davidetest');
  console.log('🚀 Scaffolding Monorepo...');
  const mapWorkspaceAndPackages = verifyAndFormatWorkspaces(cliArgs.workspaces);
  const workspaces: Workspace[] = Array.from(mapWorkspaceAndPackages).map(([name, packages]) => ({ name, packages }));
  console.log('Workspaces:', workspaces);
  throw 'stop';
  if (cliArgs.git) await configs.setupGit(cliArgs['git-default-branch'] || 'main', cliArgs['git-remote-repo']);
  if (cliArgs.monorepo === 'npm' || !cliArgs.monorepo) await configs.setupNPMWorkspacesMonorepo(workspaces, cliArgs.name);
  if (cliArgs.typescript) await configs.setupTypescript();

  if (cliArgs.prettier) {
    await configs.setupPrettier();
  }
  if (cliArgs.eslint) await configs.setupEslint({ usePrettier: cliArgs.prettier });
  await configs.setupLintStagedWithHusky();
  console.timeEnd('davidetest');

  // Backend
  // createDir(`${backendPath}/src/features/user`);
  // createDir(`${backendPath}/src/config`);
  // createDir(`${backendPath}/src/middlewares`);
  // createDir(`${backendPath}/src/utils`);

  // createFile(`${backendPath}/src/index.ts`, `import { Hono } from "hono";\nconst app = new Hono();\nexport default app;`);
  // createFile(`${backendPath}/src/config/env.ts`, `export const ENV = { PORT: 3000 };`);
  // createFile(`${backendPath}/src/utils/logger.ts`, `export const logger = { log: console.log };`);

  // // Example User Feature
  // createFile(`${backendPath}/src/features/user/user.controller.ts`, `export class UserController { /* Methods */ }`);
  // createFile(`${backendPath}/src/features/user/user.service.ts`, `export class UserService { /* Methods */ }`);
  // createFile(`${backendPath}/src/features/user/user.repository.ts`, `export class UserRepository { /* Methods */ }`);
  // createFile(`${backendPath}/src/features/user/user.routes.ts`, `import { Hono } from "hono";\nconst app = new Hono();\nexport default app;`);

  // // Frontend
  // createDir(`${frontendPath}/src/components`);
  // createDir(`${frontendPath}/src/pages`);
  // createDir(`${frontendPath}/src/hooks`);
  // createDir(`${frontendPath}/src/lib/api`);

  // createFile(`${frontendPath}/src/main.tsx`, `import React from "react";\nimport { createRoot } from "react-dom/client";\ncreateRoot(document.getElementById("root")!).render(<App />);`);
  // createFile(`${frontendPath}/src/lib/api/api.ts`, `export const fetcher = (url: string) => fetch(url).then(res => res.json());`);
  // createFile(`${frontendPath}/src/hooks/useUser.ts`, `export const useUser = () => { /* TanStack Query hook */ };`);

  // // Shared Types Package
  // createDir(`${sharedPath}/src`);
  // createFile(`${sharedPath}/src/types.ts`, `export type User = { id: string; name: string; email: string; };`);
  // createFile(`${sharedPath}/index.ts`, `export * from "./src/types";`);

  // // Configuration Files
  // createFile('.gitignore', 'node_modules/\ndist/\n.env');
  // createFile('tsconfig.json', `{\n  "compilerOptions": { "strict": true }\n}`);
  // createFile('.eslintrc.json', `{\n  "extends": ["eslint:recommended"],\n  "parserOptions": { "ecmaVersion": 2020 }\n}`);

  console.log('✅ Monorepo scaffolded successfully!');
};

// Run the script
try {
  await scaffoldNPMWorkspacesMonorepo();
} catch (error) {
  if (error instanceof Error) {
    console.error(`❌ Error scaffolding Monorepo:\n${(error as Error).message}`);
  } else {
    console.error(`❌ Error scaffolding Monorepo:\n${error}`);
  }
}
