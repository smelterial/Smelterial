import fs from "node:fs";
import path from "node:path";
import packageJson from "../package.json" assert { type: "json" };

const PROJECT_ROOT = path.resolve(process.cwd(), "..", "..");
const workspacePackageJsons = findPackageJsons();
main();

/**
 * @typedef {keyof typeof packageJson.dependencies} ResolvablePackageName
 */

/**
 * @template {string} T
 * @param {T} colloquialPackageName
 * @returns {{
    default: `./dist/${T}.js`,
    svelte: `./dist/${T}.js`,
    types: `./dist/${T}.d.ts`,
  }}
 */
function generatePackageJsonExportsForPackage(colloquialPackageName) {
  return {
    default: `./dist/${colloquialPackageName}.js`,
    svelte: `./dist/${colloquialPackageName}.js`,
    types: `./dist/${colloquialPackageName}.d.ts`,
  };
}

/**
 *
 * @param {string} currentPath
 * @returns {[packageJsonName: string, packageJsonDirname: string][]}
 */
function findPackageJsons(currentPath = path.resolve(PROJECT_ROOT, "packages")) {
  const dirs = fs.readdirSync(currentPath, { withFileTypes: true });

  if (dirs.some((dir) => dir.name === "package.json"))
    return [
      [
        JSON.parse(fs.readFileSync(path.resolve(currentPath, "package.json"), "utf-8")).name,
        path.relative(PROJECT_ROOT, currentPath),
      ],
    ];

  const foundPackageJsons = [];

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    foundPackageJsons.push(...findPackageJsons(path.resolve(currentPath, dir.name)));
  }

  return foundPackageJsons;
}

/**
 * @param {ResolvablePackageName} resolvablePackageName
 */
function findWorkspacePathForPackage(resolvablePackageName) {
  return workspacePackageJsons.find(([packageName]) => packageName === resolvablePackageName)[1];
}

/**
 * @param {ResolvablePackageName} resolvablePackageName
 */
function generateColloquialNameForPackage(resolvablePackageName) {
  const projectPath = findWorkspacePathForPackage(resolvablePackageName);

  if (typeof projectPath !== "string")
    throw new Error(
      "[generateColloquialNameForPackage] Could not find project path\n\tprojectPath:" +
        projectPath +
        "\n\tresolvablePackageName:" +
        resolvablePackageName,
    );

  if (projectPath.startsWith("packages/components/material-you"))
    return resolvablePackageName.replace("@smelterial/you-", "");

  return resolvablePackageName;
}

/**
 * @param {ResolvablePackageName} resolvablePackageName
 * @param {string} colloquialPackageName
 */
function writeSrcFileForPackage(resolvablePackageName, colloquialPackageName) {
  fs.writeFileSync(
    path.resolve(process.cwd(), "src", `${colloquialPackageName}.ts`),
    `export * from "${resolvablePackageName}";`,
  );
}

/**
 * @param {(string|null)[]} bumps
 */
function highestBumpOf(bumps) {
  if (bumps.includes("major")) return "major";
  if (bumps.includes("minor")) return "minor";
  if (bumps.includes("patch")) return "patch";
  return null;
}

/**
 * @param {fs.Dirent} file
 */
function isValidChangesetFile(file) {
  if (!file.isFile()) return false;
  if (!file.name.endsWith(".md")) return false;
  if (file.name === "README.md") return false;
  return true;
}

/**
 * @param {string} file
 * @returns {{
 *  frontmatter: {
 *    [packageName: string]: "major" | "minor" | "patch"
 *  },
 *  description: string
 * }}
 */
function readChangesetFile(file) {
  const fileContents = fs.readFileSync(file, "utf-8");
  const frontmatterMatch = /---\n((.|\n)*)\n---/;
  const frontmatter = fileContents.match(frontmatterMatch)[1];
  const description = fileContents.replace(frontmatterMatch, "");

  const frontmatterLines = frontmatter.split("\n");
  /**@type {{[packageName: string]: "major" | "minor" | "patch"}}*/
  const bumpInfoMap = {};

  for (const bumpInfo of frontmatterLines) {
    const bumpInfoTrimmed = bumpInfo.trim();
    if (bumpInfoTrimmed === "") continue;

    const [packageName, bumpType] = bumpInfoTrimmed.split(":");
    const packageNameTrimmed = packageName.replace(/"/g, "").trim();
    const bumpTypeTrimmed = bumpType.trim();

    bumpInfoMap[packageNameTrimmed] = /**@type {"major" | "minor" | "patch"}*/ (bumpTypeTrimmed);
  }

  return {
    frontmatter: bumpInfoMap,
    description,
  };
}

/**
 * @param {{
 *  frontmatter: {
 *    [packageName: string]: "major" | "minor" | "patch"
 *  },
 *  description: string
 * }} data
 * @param {string} file
 */
function rebuildChangesetFile(data, file) {
  const frontmatter = Object.entries(data.frontmatter).map(([packageName, bumpType]) => {
    return `"${packageName}": ${bumpType}`;
  });

  const newFileContents = `---\n${frontmatter.join("\n")}\n---${data.description}`;

  fs.writeFileSync(file, newFileContents, "utf-8");
}

/**
 *
 * @param {ResolvablePackageName[]} workspaceDependencies
 */
function ensureChangesetConfigLinks(workspaceDependencies) {
  const changesetConfig = JSON.parse(
    fs.readFileSync(path.resolve(PROJECT_ROOT, ".changeset", "config.json"), "utf-8"),
  );

  const notLinkedToHere = /**@type {[string, string][]}*/ (changesetConfig.linked).filter(
    ([k]) => k !== "@smelterial/smelterial",
  );

  const linksFromWorkspaceDependencies = workspaceDependencies.map((workspaceDependency) => [
    "@smelterial/smelterial",
    workspaceDependency,
  ]);

  changesetConfig.linked = [...notLinkedToHere, ...linksFromWorkspaceDependencies];

  fs.writeFileSync(
    path.resolve(PROJECT_ROOT, ".changeset", "config.json"),
    JSON.stringify(changesetConfig, null, 2),
    "utf-8",
  );
}

/**
 *
 * @param {ResolvablePackageName[]} workspaceDependencies
 */
function spikeChangesets(workspaceDependencies) {
  const changesetDir = path.resolve(PROJECT_ROOT, ".changeset");

  const changesetDirListings = fs.readdirSync(changesetDir, { withFileTypes: true });

  for (const changesetDirListing of changesetDirListings) {
    if (!isValidChangesetFile(changesetDirListing)) continue;

    const changesetFilePath = path.resolve(changesetDir, changesetDirListing.name);

    const changesetData = readChangesetFile(changesetFilePath);

    const highestBump = highestBumpOf(Object.values(changesetData.frontmatter));

    if (highestBump === null) continue;

    const hasWorkspaceDependency = workspaceDependencies.some((workspaceDependency) =>
      Object.keys(changesetData.frontmatter).includes(workspaceDependency),
    );

    if (!hasWorkspaceDependency) continue;

    changesetData.frontmatter["@smelterial/smelterial"] = highestBump;

    rebuildChangesetFile(changesetData, changesetFilePath);
  }
}

/**
 * @param {string[]} colloquialPackageNames
 */
function writeIndexFile(colloquialPackageNames) {
  const indexFileContents = colloquialPackageNames
    .map((colloquialPackageName) => `export * from "./${colloquialPackageName}.js";`)
    .join("\n");

  fs.writeFileSync(path.resolve(process.cwd(), "src", "index.ts"), indexFileContents);
}

function main() {
  if (!fs.existsSync(path.resolve(process.cwd(), "src")))
    fs.mkdirSync(path.resolve(process.cwd(), "src"));

  const dependencies = packageJson.dependencies;

  const workspaceDependencies = /**@type {[ResolvablePackageName, string][]}*/ (
    Object.entries(dependencies)
  )
    .filter(([, value]) => value.startsWith("workspace:"))
    .map(([key]) => key);

  const packageExports = packageJson.exports;

  for (const resolvablePackageName of workspaceDependencies) {
    const colloquialPackageName = generateColloquialNameForPackage(resolvablePackageName);

    packageExports[`./${colloquialPackageName}`] =
      generatePackageJsonExportsForPackage(colloquialPackageName);

    writeSrcFileForPackage(resolvablePackageName, colloquialPackageName);
  }

  spikeChangesets(workspaceDependencies);
  ensureChangesetConfigLinks(workspaceDependencies);

  packageJson.exports = packageExports;

  fs.writeFileSync(
    path.resolve(process.cwd(), "package.json"),
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8",
  );

  writeIndexFile(
    Object.keys(packageExports)
      .filter((key) => key !== ".")
      .map((key) => key.slice(2)),
  );
}
