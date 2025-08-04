(function(global) {
  let Html5QrcodeScanner;
  if (typeof window === 'undefined') {
    Html5QrcodeScanner = require('html5-qrcode').Html5QrcodeScanner;
  } else {
    Html5QrcodeScanner = global.Html5QrcodeScanner;
  }

  function onScanSuccess(decodedText, decodedResult, scanner) {
    document.getElementById('barcode').value = decodedText;
    document.getElementById('result').innerText = `Scanned: ${decodedText}`;
    return scanner.clear().then(() => {
      console.log('Scanner stopped.');
    });
  }

  function onScanFailure(error) {
    // Optional: console.warn(`Scan error: ${error}`);
  }

  function requestCameraPermission(navigatorRef = navigator) {
    return navigatorRef.mediaDevices.getUserMedia({ video: true })
      .then(stream => stream.getTracks().forEach(track => track.stop()))
      .catch(err => console.error('Camera permission denied', err));
  }

  function startScanner() {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanner.SCAN_TYPE_CAMERA, Html5QrcodeScanner.SCAN_TYPE_FILE]
    }, false);
    scanner.render((text, result) => onScanSuccess(text, result, scanner), onScanFailure);
    return scanner;
  }

  const api = { startScanner, onScanSuccess, onScanFailure, requestCameraPermission };
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = api;
  } else {
    global.scanner = api;
  }
})(typeof window !== 'undefined' ? window : global);

