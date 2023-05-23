import fs from "node:fs";
import path from "node:path";

const LICENSE_PATH = "LICENSE.md";
const PACKAGES_PATH = "packages";
const IGNORES = [/packages\/.*?\/?TEMPLATE/g];

ensureLicense();

async function ensureLicense() {
  if (!fs.existsSync(LICENSE_PATH)) throw new Error(`Missing ${LICENSE_PATH}`);
  const projects = findProjects(PACKAGES_PATH, IGNORES);

  if (!projects.length) {
    console.error("No projects found");
    process.exit(1);
  }

  const license = fs.readFileSync(LICENSE_PATH, "utf-8");

  for (const project of projects) {
    const projectLicensePath = path.join(project, "LICENSE.md");
    try {
      fs.writeFileSync(projectLicensePath, license, "utf-8");
    } catch (e) {
      console.log(e);
      console.log({
        projectLicensePath,
        dir: path.dirname(projectLicensePath),
        direxists: fs.existsSync(path.dirname(projectLicensePath)),
      });
      process.exit(1);
    }
  }
}

/**
 * @param {string} fromDir
 * @param {(string | RegExp)[]} ignores
 * @returns {string[]} Array of paths to directories with package.json files
 */
function findProjects(fromDir, ignores) {
  const listing = fs.readdirSync(fromDir, { withFileTypes: true });
  const directories = listing.filter(
    (dir) => dir.isDirectory() && !isIgnored(path.join(fromDir, dir.name), ignores),
  );
  const projects = directories.flatMap((dir) => {
    const packageJsonPath = path.join(fromDir, dir.name, "package.json");
    if (fs.existsSync(packageJsonPath)) return path.join(fromDir, dir.name);
    return findProjects(path.join(fromDir, dir.name), ignores);
  });
  return projects;
}

/**
 *
 * @param {string} path
 * @param {(string | RegExp)[]} ignores
 * @returns {boolean}
 */
function isIgnored(path, ignores) {
  for (const ignore of ignores) {
    if (typeof ignore === "string" && path === ignore) return true;
    if (ignore instanceof RegExp && ignore.test(path)) return true;
  }
  return false;
}
