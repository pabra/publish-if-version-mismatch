import spawn from 'cross-spawn';
import { readFileSync } from 'fs';
import { join } from 'path';

const getVersionInRegistry = (
  packageName: string,
  tag: string,
): string | 404 => {
  if (typeof packageName !== 'string') {
    throw new Error(`packageName must be 'string' not '${typeof packageName}'`);
  }

  if (typeof tag !== 'string') {
    throw new Error(`tag must be 'string' not '${typeof tag}'`);
  }

  const child = spawn.sync(
    'npm',
    ['--json', 'view', `${packageName}@${tag}`, 'version'],
    {
      encoding: 'utf-8',
    },
  );

  if (child.error) {
    throw child.error;
  }

  const stdout: string | Record<string, any> =
    child.stdout && JSON.parse(child.stdout);

  if (child.status !== 0) {
    if (
      child.status === 1 &&
      typeof stdout !== 'string' &&
      stdout?.error?.code === 'E404'
    ) {
      return 404;
    }

    throw new Error(child.stderr);
  }

  if (typeof stdout !== 'string') {
    throw new Error(`unexpected stdout: ${child.stdout}`);
  }

  return stdout;
};

const publish = (tag: string, dryRun = false): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (typeof tag !== 'string') {
      // throw new Error(`tag must be 'string' not '${typeof tag}'`);
      return reject(new Error(`tag must be 'string' not '${typeof tag}'`));
    }

    if (tag === '') {
      return reject(new Error('tag must not be empty'));
    }

    if (typeof dryRun !== 'boolean') {
      return reject(
        new Error(`dryRun must be 'boolean' not '${typeof dryRun}'`),
      );
    }

    spawn('npm', ['publish', '--tag', tag, ...(dryRun ? ['--dry-run'] : [])], {
      stdio: ['ignore', 'inherit', 'inherit'],
    }).on('exit', resolve);
  });
};

const getPackageJson = (dir: string): Record<string, any> => {
  const path = join(dir, 'package.json');

  return JSON.parse(readFileSync(path, 'utf-8'));
};

const shouldPublish = (
  localVersion: string,
  registryVersion: string | 404,
): boolean => {
  if (typeof localVersion !== 'string') {
    throw new Error(
      `localVersion must be 'string' not '${typeof localVersion}'`,
    );
  }

  if (localVersion === '') {
    throw new Error('localVersion cannot be empty');
  }

  if (typeof registryVersion !== 'string' && registryVersion !== 404) {
    throw new Error(
      `unexpected value for registryVersion: '${registryVersion}'`,
    );
  }

  return localVersion !== registryVersion;
};

export { getPackageJson, getVersionInRegistry, publish, shouldPublish };
