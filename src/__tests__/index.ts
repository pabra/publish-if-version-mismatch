import { join } from 'path';
import {
  getPackageJson,
  getVersionInRegistry,
  publish,
  shouldPublish,
} from '../index';

describe('package.json', () => {
  test('get own by cwd', () =>
    expect(getPackageJson(process.cwd()).name).toBe(
      'publish-if-version-mismatch',
    ));

  test('get own two up', () =>
    expect(getPackageJson(join(__dirname, '..', '..')).name).toBe(
      'publish-if-version-mismatch',
    ));

  test('nonexistent dir', () =>
    expect(() => getPackageJson('/nonexistentDir')).toThrowError('ENOENT'));
});

describe('version in registry', () => {
  test('initial version', () =>
    expect(getVersionInRegistry('publish-if-version-mismatch', '0.1.0')).toBe(
      '0.1.0',
    ));

  test('empty tag', () => {
    const latest = getVersionInRegistry(
      'publish-if-version-mismatch',
      'latest',
    );
    const empty = getVersionInRegistry('publish-if-version-mismatch', '');
    expect(empty).toBe(latest);
  });

  test('number tag', () =>
    expect(() =>
      getVersionInRegistry('publish-if-version-mismatch', 0.1 as any),
    ).toThrowError());

  test('no tag', () =>
    expect(() =>
      getVersionInRegistry('publish-if-version-mismatch', undefined as any),
    ).toThrowError());

  test('@ tag', () =>
    expect(() =>
      getVersionInRegistry('publish-if-version-mismatch', '@'),
    ).toThrowError());

  test('latest tag', () => {
    const latest = getVersionInRegistry(
      'publish-if-version-mismatch',
      'latest',
    );
    expect(typeof latest).toBe('string');
    expect(latest).not.toBe('');
    expect(latest).not.toBe('0.1.0');
  });

  test('nonexistent tag', () =>
    expect(
      getVersionInRegistry(
        'publish-if-version-mismatch',
        'thisTagDoesNotExist',
      ),
    ).toBe(''));

  test('nonexistent package', () =>
    expect(
      getVersionInRegistry('@pabra/thisPackageDoesNotExist', 'latest'),
    ).toBe(404));

  test('number package', () =>
    expect(() => getVersionInRegistry(5 as any, 'latest')).toThrowError());

  test('empty package', () =>
    expect(() => getVersionInRegistry('', 'latest')).toThrowError());

  test('space package', () =>
    expect(() =>
      getVersionInRegistry('some package', 'latest'),
    ).toThrowError());

  test('no package', () =>
    expect(() =>
      getVersionInRegistry(undefined as any, 'latest'),
    ).toThrowError());

  test('multiple version', () =>
    expect(() =>
      getVersionInRegistry('publish-if-version-mismatch', '0.1'),
    ).toThrowError());
});

describe('should publish', () => {
  test('new package', () => expect(shouldPublish('1.0.0', 404)).toBe(true));
  test('404 new package', () => expect(shouldPublish('404', 404)).toBe(true));
  test('new tag', () => expect(shouldPublish('1.0.0', '')).toBe(true));
  test('new version', () => expect(shouldPublish('1.0.0', '0.9.8')).toBe(true));
  test('same version', () =>
    expect(shouldPublish('1.0.0', '1.0.0')).toBe(false));

  test('number registry version', () =>
    expect(() => shouldPublish('1.0.0', 1 as any)).toThrowError());
  test('undefined registry version', () =>
    expect(() => shouldPublish('1.0.0', undefined as any)).toThrowError());
  test('empty local version', () =>
    expect(() => shouldPublish('', '1.0.0')).toThrowError());
  test('number local version', () =>
    expect(() => shouldPublish(1 as any, '1.0.0')).toThrowError());
  test('undefined local version', () =>
    expect(() => shouldPublish(undefined as any, '1.0.0')).toThrowError());
});

describe('publish', () => {
  test('dry run', () => expect(publish('unitTest', true)).resolves.toBe(0));

  test('number tag', () =>
    expect(publish(1 as any, true)).rejects.toThrowError());
  test('undefined tag', () =>
    expect(publish(undefined as any, true)).rejects.toThrowError());
  test('empty tag', () => expect(publish('', true)).rejects.toThrowError());

  test('number readOnly', () =>
    expect(publish('unitTest', 1 as any)).rejects.toThrowError());
});
