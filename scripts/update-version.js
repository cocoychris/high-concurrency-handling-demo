/**
 * 版本更新工具 v2025.01
 * 會自動更新 package.json, build-image.bat, docker-compose.yml 等檔案中的版本號
 *
 * Created by: 楊以宏
 *
 * 使用方式範例：
 * node update-version.js 1.2.3
 *
 * 若加上 `+c` 參數，會自動建立新的 git commit 並標記版本號：
 * node update-version.js 1.2.3 +c
 *
 * ※ 當指定的新版本號小於當前版本號時，會拋出錯誤，除非使用 `+force` 強制更新。
 * 用法如下：
 * node update-version.js 1.2.3 +force
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const VERSION_REGEXP = /^\d+\.\d+\.\d+$/;
const FORCE_OPTION = '+force';
const COMMIT_OPTION = '+c';
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const PACKAGE_LOCK_JSON_PATH = path.join(process.cwd(), 'package-lock.json');

// ======================== Main ========================
const packageJson = require(PACKAGE_JSON_PATH);
const packageLockJson = require(PACKAGE_LOCK_JSON_PATH);
colorizeConsole();

console.info('## Version Updator ##');
const currentVersion = getCurrentVersion();
console.info('- Current version:', currentVersion);
const { newVersion, isForce, autoCommit } = getArgs();
console.info('- New version:', newVersion);
if (!isForce) {
  validateVersionParts(currentVersion, newVersion);
} else {
  console.info('- Force mode enabled');
}
updatePackageJson();
updateTextFile('./deployment/version.env', /^APP_VERSION="(\d\.\d\.\d)"$/m);
if (autoCommit) {
  gitCommit(newVersion);
}
console.info('## Version updated successfully ##');

// ======================== Functions ========================
function updateTextFile(filePath, regex, encoding = 'utf8') {
  console.log(`Updating ${filePath}`);
  const file = String(fs.readFileSync(filePath, encoding));
  const result = file.match(regex);
  if (!result || result.length < 2) {
    console.error('Version number not found in file:', filePath);
    process.exit(1);
  }
  let replacement = result[0].replace(result[1], newVersion);
  const newFile = file.replace(regex, replacement);
  fs.writeFileSync(filePath, newFile);
}

function updatePackageJson() {
  console.log(`Updating package.json & package-lock.json`);
  packageJson.version = newVersion;
  packageLockJson.version = newVersion;
  packageLockJson.packages[''].version = newVersion;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
  fs.writeFileSync(
    PACKAGE_LOCK_JSON_PATH,
    JSON.stringify(packageLockJson, null, 2),
  );
}

function getCurrentVersion() {
  if (!VERSION_REGEXP.test(packageJson.version)) {
    console.error('Invalid version number in package.json');
    process.exit(1);
  }
  return packageJson.version;
}

function getArgs() {
  const args = process.argv.slice(2);
  let newVersion = undefined;
  let isForce = false;
  let autoCommit = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i].trim();
    if (VERSION_REGEXP.test(arg)) {
      newVersion = arg;
    } else if (arg === FORCE_OPTION) {
      isForce = true;
    } else if (arg === COMMIT_OPTION) {
      autoCommit = true;
    } else {
      console.error('Invalid argument: ' + arg);
      process.exit(1);
    }
  }
  if (!newVersion) {
    console.error('Please provide valid new version number');
    process.exit(1);
  }
  return {
    newVersion,
    isForce,
    autoCommit,
  };
}

function validateVersionParts(currentVersion, newVersion) {
  const currentVersionParts = currentVersion.split('.').map(Number);
  const newVersionParts = newVersion.split('.').map(Number);
  const currentMajor = currentVersionParts[0];
  const currentMinor = currentVersionParts[1];
  const currentPatch = currentVersionParts[2];
  const newMajor = newVersionParts[0];
  const newMinor = newVersionParts[1];
  const newPatch = newVersionParts[2];
  const useForceMessage = ' Use --force to override';
  if (newMajor < currentMajor) {
    console.error(
      'Major version number should be greater than or equal to current version.' +
        useForceMessage,
    );
    process.exit(1);
  }
  if (newMajor > currentMajor) {
    return;
  }
  if (newMinor < currentMinor) {
    console.error(
      'Minor version number should be greater than or equal to current version.' +
        useForceMessage,
    );
    process.exit(1);
  }
  if (newMinor > currentMinor) {
    return;
  }
  if (newPatch < currentPatch) {
    console.error(
      'Patch version number should be greater than current version.' +
        useForceMessage,
    );
    process.exit(1);
  }
}
function gitCommit(newVersion) {
  try {
    console.log('Creating new git commit...');
    execSync('git add -A', { stdio: 'inherit' });
    execSync(`git commit -m "Update version to ${newVersion}"`, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Error running Git commands:', error);
  }
}

// Example usage
function colorizeConsole() {
  // Info
  const infoFunc = console.info;
  const blueInfoFunc = (message, ...rest) =>
    infoFunc('\x1b[34m%s\x1b[0m', message, ...rest);
  console.info = blueInfoFunc;
  // Error
  const errorFunc = console.error;
  const redErrorFunc = (message, ...rest) =>
    errorFunc('\x1b[31m%s\x1b[0m', message, ...rest);
  console.error = redErrorFunc;
}
