// Background script for PKM Data Entry Assistant extension

// Initialize when the extension is installed or updated
chrome.runtime.onInstalled.addListener(function() {
  console.log('PKM Data Entry Assistant extension installed');
  
  // Initialize default settings if they don't exist
  chrome.storage.local.get({
    // CNIC defaults
    constableCnic: '',
    mohararCnic: '',
    frontdeskCnic: '',
    cnicFillKey: 'c',
    // OTP defaults
    constableOtp: '',
    mohararOtp: '',
    frontdeskOtp: '',
    otpFillKey: '1',
    // Email default
    sharedEmail: '',
    emailFillKey: 'e',
    // Other settings
    autoFillEnabled: true,
    autoFillKey: '1',
    autoSelectNoRecord: true
  }, function(data) {
    // Save the default settings
    chrome.storage.local.set(data);
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Handle any messages from content scripts or popup
  if (request.action === 'getSettings') {
    // Return the current settings
    chrome.storage.local.get(null, function(data) {
      sendResponse(data);
    });
    return true; // Will respond asynchronously
  }
  
  return false; // No asynchronous response expected
});