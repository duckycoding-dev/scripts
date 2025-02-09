export function verifyAndFormatWorkspaces(workspaces: string[]) {
  const mapWorkspaceAndPackages: Map<string, string[]> = new Map();
  const splittedWorkspacePackageNames: [string, string | undefined][] = [];
  workspaces.forEach((workspace) => {
    if (workspace.at(-1) === '/') {
      workspace = workspace.slice(0, -1);
    }
    if (workspace[0] === '/') {
      workspace = workspace.slice(1);
    }
    const splittedWorkspacePackageName = workspace.split('/');
    if (splittedWorkspacePackageName.length > 2) {
      throw new Error(`Invalid workspace name: ${workspace}; workspaces names should not contain more than one "/"`);
    }
    
    const [splittedWorkspace, pkg] = splittedWorkspacePackageName as [string, string | undefined];
    splittedWorkspacePackageNames.push([splittedWorkspace, pkg]);
  });

  const workspacesWithoutPackages = new Set<string>();
  const workspacesWithPackages = new Map<string, string[]>();
  const workspacesDefinedAsStandaloneAndWithPackages: string[] = [];
  const workspacesDefinedMultipleTimes: string[] = [];
  splittedWorkspacePackageNames.forEach(([singleWorkspace, pkg]) => {
    if (pkg) {
      if (workspacesWithoutPackages.has(singleWorkspace)) {
        workspacesDefinedAsStandaloneAndWithPackages.push(singleWorkspace);
      }
      const pkgArray = workspacesWithPackages.get(singleWorkspace);
      if (pkgArray?.includes(pkg)) {
        // duplicate package name
        workspacesDefinedMultipleTimes.push(`${singleWorkspace}/${pkg}`);
      }
      workspacesWithPackages.set(singleWorkspace, pkgArray ? pkgArray.concat(pkg) : [pkg]);
    } else {
      if (workspacesWithPackages.has(singleWorkspace)) {
        workspacesDefinedAsStandaloneAndWithPackages.push(singleWorkspace);
      }
      if (!workspacesWithoutPackages.has(singleWorkspace)) {
        workspacesWithoutPackages.add(singleWorkspace);
      } else {
        workspacesDefinedMultipleTimes.push(singleWorkspace);
      }
    }
  });

  let errorMessage = '';
  if (workspacesDefinedMultipleTimes.length > 0) {
    let messageList = '';
    new Set(workspacesDefinedMultipleTimes).forEach((workspace) => {
      messageList += `  - ${workspace}\n`;
    });
    errorMessage += `Invalid workspace names: you defined the following workspaces multiple times:\n
${messageList}\n`;
  }
  if (workspacesDefinedAsStandaloneAndWithPackages.length > 0) {
    let messageList = '';
    new Set(workspacesDefinedAsStandaloneAndWithPackages).forEach((workspace) => {
      messageList += `  - ${workspace}\n`;
      const pkgs = workspacesWithPackages.get(workspace);
      pkgs?.forEach((pkg) => {
        messageList += `  - ${workspace}/${pkg}\n`;
      });
    });
    errorMessage += `Invalid workspace names: you defined some workspaces both with and without a package, please either define multiple workspaces with each a package or only one workspace without any package\nWorkspaces defined both with and without packages:\n
${messageList}\n`;
  }
  if (errorMessage) {
    throw new Error(errorMessage);
  }

  splittedWorkspacePackageNames.forEach(([singleWorkspace, pkg]) => {
    const itemInMap = mapWorkspaceAndPackages.get(singleWorkspace);
    if (itemInMap) {
      if (pkg) itemInMap.push(pkg);
    } else {
      mapWorkspaceAndPackages.set(singleWorkspace, pkg ? [pkg] : []);
    }
  });

  return mapWorkspaceAndPackages;
}
