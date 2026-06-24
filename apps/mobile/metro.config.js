// Metro config tuned for the pnpm monorepo: watch the whole workspace and let
// Metro resolve hoisted packages from the repo-root node_modules.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// The @mico/* workspace packages are authored as ESM with explicit ".js"
// import specifiers (required so the Node server can run the compiled output).
// Metro does not rewrite ".js" -> ".ts", so point it at the compiled dist
// entry of each package instead of the TypeScript source.
const micoPackages = {
  "@mico/core": path.resolve(workspaceRoot, "packages/core/dist/index.js"),
  "@mico/net": path.resolve(workspaceRoot, "packages/net/dist/index.js"),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const target = micoPackages[moduleName];
  if (target) {
    return { type: "sourceFile", filePath: target };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = config;
