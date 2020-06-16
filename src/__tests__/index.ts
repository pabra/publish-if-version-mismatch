import { getPackageJson } from '../index';

describe('package.json', () => {
  test('get own', () => {
    const pj = getPackageJson();
    expect(pj.name).toBe('publish-if-version-mismatch');
  });
});
