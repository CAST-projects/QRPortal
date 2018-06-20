import { it, describe } from 'mocha';
import { assert } from 'chai';
import latestVersion from '../../../server/determinator/latestVersion';

describe('getLatestVersion()', () => {
  it('should return the latest stable version', () => {
    const uid = 'com.castsoftware.angularjs';
    const version = latestVersion( uid );

    assert.equal( version, '1.6.0' );
  });
  it('should return the latest stable version, when it is not the first element', () => {
    const uid = 'com.castsoftware.html5';
    const version = latestVersion( uid );

    assert.equal( version, '1.7.3' );
  });
  it('should return the latest unstable version, when no stable is available', () => {
    const uid = 'com.castsoftware.sapui5';
    const version = latestVersion( uid );

    assert.equal( version, '1.0.0-beta2' );
  });
});