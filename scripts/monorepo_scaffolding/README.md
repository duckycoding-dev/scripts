# @scripts/monorepo_scaffolding

This script sets up and configures a monorepo structure using various tools and configurations.
It creates the necessary directory structure and configuration files for the monorepo. This includes setting up Git, NPM workspaces, TypeScript, Prettier, ESLint, and Husky for lint-staged.

The process can be fully automatized using CLI arguments, allowing customization of the final result of the monorepo setup (e.g., specifying the name, enabling Prettier, Git, ESLint, TypeScript, etc.).
Arguments are checked for and validated and custom error messages are displayed to help the user provide valid values.
