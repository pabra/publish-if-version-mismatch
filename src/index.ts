import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const getVersionInRegistry = (
  packageName: string,
  tag: string,
): string | 404 => {
  const child = spawnSync(
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
    console.log('typeof: %o', typeof stdout);
    throw new Error(`unexpected stdout: ${child.stdout}`);
  }

  return stdout;
};

const getPackageJson = (): Record<string, any> => {
  const path = join(process.cwd(), 'package.json');

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
// const ret = getVersionInRegistry('@pabra/tongue-common2', 'latest');
// const ret = getVersionInRegistry('publish-if-version-mismatch', 'latest');
// console.log('ret: %o', ret);

export { getPackageJson, getVersionInRegistry, shouldPublish };
