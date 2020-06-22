#!/usr/bin/env node

import arg from 'arg';
import { basename, join } from 'path';
import {
  getPackageJson,
  getVersionInRegistry,
  publish,
  shouldPublish,
} from './index';

const args = arg({
  // Types
  '--help': Boolean,
  '--version': Boolean,
  '--tag': String,
  '--dry-run': Boolean,

  // Aliases
  '-h': '--help',
  '-v': '--version',
  '-t': '--tag',
});

const getOwnPackageJson = () => {
  try {
    // while development, __filename is in src/ -> package.json must be one dir up
    return getPackageJson(join(__dirname, '..'));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  try {
    // after build, __filename is in dist/cjs/ -> package.json must be two dirs up
    return getPackageJson(join(__dirname, '..', '..'));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  return {};
};

const getOwnVersionString = (): string => {
  const { name, version } = getOwnPackageJson();
  return `${name} version: ${version}`;
};

const showHelp = (stderr = false): void => {
  const { description } = getOwnPackageJson();
  const help = [
    getOwnVersionString(),
    description,
    '',
    'USAGE:',
    `    ${basename(process.argv[1])} [OPTIONS]`,
    '',
    'OPTIONS:',
    '    -h, --help',
    '        show this help',
    '',
    '    -v, --version',
    '        show version',
    '',
    '    -t, --tag=<TAG_NAME>',
    '        tag of the package to look for (default: latest)',
    '',
    '    --dry-run',
    '        does not actually publish - reports details of what would have been published',
  ].join('\n');

  process[stderr ? 'stderr' : 'stdout'].write(`${help}\n`);
};

const showVersion = (): void => {
  process.stdout.write(`${getOwnVersionString()}\n`);
};

const main = async () => {
  if (args['--help']) {
    showHelp();
  } else if (args['--version']) {
    showVersion();
  } else {
    const dryRun = args['--dry-run'] ?? false;
    const tag = args['--tag'] ?? 'latest';
    const { name, version } = getPackageJson(process.cwd());

    if (!name) {
      throw new Error('could not get name from package.json');
    }

    if (!version) {
      throw new Error('could not get version from package.json');
    }

    const registryVersion = getVersionInRegistry(name, tag);
    const doPublish = shouldPublish(version, registryVersion);

    if (doPublish) {
      process.exitCode = await publish(tag, dryRun);
    } else {
      process.stdout.write(
        `Will not try to publish local version '${version}' over version '${registryVersion}' in registry.\n`,
      );
    }
  }
};

main();
