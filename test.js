const assert = require('assert');

class MockHtml5QrcodeScanner {
  constructor(id, options, verbose) {
    this.id = id;
    this.options = options;
    this.verbose = verbose;
    this.renderCalled = false;
    this.clearCalled = false;
  }
  render(success, failure) {
    this.renderCalled = true;
    this.successCallback = success;
    this.failureCallback = failure;
  }
  clear() {
    this.clearCalled = true;
    return Promise.resolve();
  }
}

// Set up global window with stubbed Html5QrcodeScanner
global.window = { Html5QrcodeScanner: MockHtml5QrcodeScanner };
window.Html5QrcodeScanner.SCAN_TYPE_CAMERA = 'camera';
window.Html5QrcodeScanner.SCAN_TYPE_FILE = 'file';

// Minimal DOM implementation
const document = {
  elements: {},
  getElementById(id) {
    return this.elements[id];
  }
};

global.document = document;

document.elements['barcode'] = { value: '' };
// reader element needed but not used directly
document.elements['reader'] = {};

document.elements['result'] = { innerText: '' };

const { startScanner, onScanSuccess, requestCameraPermission } = require('./scanner');

async function testStartScanner() {
  const scanner = startScanner();
  assert.strictEqual(scanner.id, 'reader');
  assert.deepStrictEqual(scanner.options, {
    fps: 10,
    qrbox: 250,
    rememberLastUsedCamera: true,
    supportedScanTypes: ['camera', 'file']
  });
  assert.strictEqual(scanner.verbose, false);
  assert.ok(scanner.renderCalled, 'render should be called');
}

async function testOnScanSuccess() {
  const scanner = new MockHtml5QrcodeScanner();
  await onScanSuccess('12345', {}, scanner);
  assert.strictEqual(document.getElementById('barcode').value, '12345');
  assert.strictEqual(document.getElementById('result').innerText, 'Scanned: 12345');
  assert.ok(scanner.clearCalled, 'clear should be called');
}

async function testRequestCameraPermission() {
  let stopCalled = false;
  const fakeNavigator = {
    mediaDevices: {
      getUserMedia: () => Promise.resolve({
        getTracks: () => [{ stop: () => { stopCalled = true; } }]
      })
    }
  };
  await requestCameraPermission(fakeNavigator);
  assert.ok(stopCalled, 'track.stop should be called');
}

(async function runTests() {
  try {
    await testStartScanner();
    await testOnScanSuccess();
    await testRequestCameraPermission();
    console.log('All tests passed');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
