import fs from "node:fs";
import path from "node:path";
import packageJson from "../package.json" assert { type: "json" };

const PROJECT_ROOT = path.resolve(process.cwd(), "..", "..");
const workspacePackageJsons = findPackageJsons();
main();

/**
 * @typedef {keyof typeof packageJson.dependencies} ResolvablePackageName
 * @typedef {`${ResolvablePackageName}${string}`} ResolvablePackageExport
 */
/**
 * @template {string} [T=string]
 * @typedef {{
 *   default: `./dist/${T}.js`,
 *   svelte: `./dist/${T}.js`,
 *   types: `./dist/${T}.d.ts`,
 * }} PackageJsonExports
 */

/**
 * @template {string} T
 * @param {T|`./${T}`} colloquialPackageName
 * @returns {PackageJsonExports<T>}
 */
function generatePackageJsonExportsForPackage(colloquialPackageName) {
  const normalizedPackageName = /**@type {T}*/ (colloquialPackageName.replace(/^\.\//g, ""));
  return {
    default: `./dist/${normalizedPackageName}.js`,
    svelte: `./dist/${normalizedPackageName}.js`,
    types: `./dist/${normalizedPackageName}.d.ts`,
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
 * @param {ResolvablePackageExport} resolvablePackageName
 * @param {string} colloquialPackageName
 * @returns {string}
 */
function writeSrcFileForPackage(resolvablePackageName, colloquialPackageName) {
  const srcFileExtensionless = path.resolve(process.cwd(), "src", `${colloquialPackageName}`);
  if (!fs.existsSync(path.dirname(srcFileExtensionless)))
    fs.mkdirSync(path.dirname(srcFileExtensionless), { recursive: true });
  fs.writeFileSync(`${srcFileExtensionless}.ts`, `export * from "${resolvablePackageName}";`);
  return `${srcFileExtensionless}.js`;
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
  if (!data.frontmatter["@smelterial/smelterial"]) return;

  fs.writeFileSync(
    file.replace(/\.md$/, "2.md"),
    `---\n"@smelterial/smelterial": ${
      data.frontmatter["@smelterial/smelterial"]
    }\n---\n[AUTOMATED]: ${data.description.trim()}\n`,
    "utf-8",
  );
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

  const smelterialLink = ["@smelterial/smelterial", `(${workspaceDependencies.join("|")})`];

  changesetConfig.linked = [...notLinkedToHere, smelterialLink];

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
    .map((colloquialPackageName) => `export * from "./${colloquialPackageName}";`)
    .join("\n");

  fs.writeFileSync(path.resolve(process.cwd(), "src", "index.ts"), indexFileContents);
}

/**
 * @template {string} T
 * @param {T} colloquialPackageName
 * @returns {{ [key: `./${T}`]: PackageJsonExports<T> }}
 */
function generateStarExportsForPackage(colloquialPackageName) {
  return {
    [`./${colloquialPackageName}`]: generatePackageJsonExportsForPackage(colloquialPackageName),
  };
}

/**
 * @template {string} T
 * @param {ResolvablePackageName} resolvablePackageName
 * @param {T} colloquialPackageName
 * @returns {{ exports: { [key in `./${T}${string}`]: PackageJsonExports }; indexFile: string }}
 */
function generateForwardExportsForPackage(resolvablePackageName, colloquialPackageName) {
  /**@type {{ [key: string]: PackageJsonExports }}*/
  const resolvedPackageExports = JSON.parse(
    fs.readFileSync(
      path.resolve(
        PROJECT_ROOT,
        findWorkspacePathForPackage(resolvablePackageName),
        "package.json",
      ),
      "utf-8",
    ),
  ).exports;

  const packageExports = /**@type {{ [key in `./${T}${string}`]: PackageJsonExports }}*/ ({});
  let indexFile = "";
  for (const key of Object.keys(resolvedPackageExports)) {
    if (!key.startsWith(".")) {
      throw new Error(
        `Unexpected key in exports: ${JSON.stringify({
          package: resolvablePackageName,
          key,
        })}`,
      );
    }

    if (key === ".") {
      const generated = generateStarExportsForPackage(colloquialPackageName);
      Object.assign(packageExports, generated);
      indexFile = writeSrcFileForPackage(resolvablePackageName, colloquialPackageName);
      continue;
    }

    const newKey = `${key.replace(/^\./, `./${colloquialPackageName}`)}`;
    packageExports[newKey] = generatePackageJsonExportsForPackage(newKey);
    writeSrcFileForPackage(
      /**@type {ResolvablePackageExport}*/ (key.replace(/^\./, resolvablePackageName)),
      newKey,
    );
  }

  return { exports: packageExports, indexFile };
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

  const indexFiles = [];

  for (const resolvablePackageName of workspaceDependencies) {
    const exportsForward = generateForwardExportsForPackage(
      resolvablePackageName,
      generateColloquialNameForPackage(resolvablePackageName),
    );
    Object.assign(packageExports, exportsForward.exports);
    indexFiles.push(exportsForward.indexFile);
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
    indexFiles.map((indexFile) => path.relative(path.resolve(process.cwd(), "src"), indexFile)),
  );
}
