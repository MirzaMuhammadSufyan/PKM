// Content script for PKM Data Entry Assistant extension

// Auto-fill CNIC fields when the page loads
console.log('PKM Data Entry Assistant: Content script loaded');

// Add error handling for extension context
function isExtensionContextValid() {
  try {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  } catch (e) {
    console.log('PKM Data Entry Assistant: Extension context invalid');
    return false;
  }
}

// Safe storage access function
function safeStorageAccess(callback) {
  if (!isExtensionContextValid()) {
    console.log('PKM Data Entry Assistant: Extension context invalid, using default values');
    callback({
      cnicFillKey: '1',
      emailFillKey: '2',
      sendOtpKey: '3',
      otpFillKey: '4',
      verifyOtpKey: '5',
      criminalRecordKey: '6',
      autoSelectFileKey: '7',
      saveRecordKey: '8',
      autoFillKey: '0',
      autoSelectFile: true,
      autoFillEnabled: true,
      autoSelectNoRecord: true,
      useRealisticInteraction: true,
      // Add the actual data values
      constableCnic: '',
      mohararCnic: '',
      frontdeskCnic: '',
      constableOtp: '',
      mohararOtp: '',
      frontdeskOtp: '',
      sharedEmail: ''
    });
    return;
  }
  
  try {
    chrome.storage.local.get({
      cnicFillKey: '1',
      emailFillKey: '2',
      sendOtpKey: '3',
      otpFillKey: '4',
      verifyOtpKey: '5',
      criminalRecordKey: '6',
      autoSelectFileKey: '7',
      saveRecordKey: '8',
      autoFillKey: '0',
      autoSelectFile: true,
      autoFillEnabled: true,
      autoSelectNoRecord: true,
      useRealisticInteraction: true,
      // Add the actual data values
      constableCnic: '',
      mohararCnic: '',
      frontdeskCnic: '',
      constableOtp: '',
      mohararOtp: '',
      frontdeskOtp: '',
      sharedEmail: ''
    }, callback);
  } catch (e) {
    console.error('PKM Data Entry Assistant: Storage access error:', e);
    callback({
      cnicFillKey: '1',
      emailFillKey: '2',
      sendOtpKey: '3',
      otpFillKey: '4',
      verifyOtpKey: '5',
      criminalRecordKey: '6',
      autoSelectFileKey: '7',
      saveRecordKey: '8',
      autoFillKey: '0',
      autoSelectFile: true,
      autoFillEnabled: true,
      autoSelectNoRecord: true,
      useRealisticInteraction: true,
      // Add the actual data values
      constableCnic: '',
      mohararCnic: '',
      frontdeskCnic: '',
      constableOtp: '',
      mohararOtp: '',
      frontdeskOtp: '',
      sharedEmail: ''
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('PKM Data Entry Assistant: DOMContentLoaded event fired');
    console.log('PKM Data Entry Assistant: Current URL:', window.location.href);
    
    // Check if we're on the PKM website with any of the supported URL patterns
    if (window.location.href.includes('police.pkm.punjab.gov.pk')) {
      console.log('PKM Data Entry Assistant: On PKM website');
      
      // Check for specific URL patterns mentioned by the user
      const isVerifiedSecondVersion = window.location.href.includes('/verified_second_version/');
      const isCertificatePage = window.location.href.includes('/certificate/');
      const isServantPage = window.location.href.includes('/servant/');
      
      console.log('PKM Data Entry Assistant: URL pattern checks:', {
        isVerifiedSecondVersion,
        isCertificatePage,
        isServantPage
      });
      
      // If we're on a supported page, proceed with auto-fill functionality
      if (isVerifiedSecondVersion || isCertificatePage || isServantPage) {
        console.log('PKM Data Entry Assistant: Detected supported page pattern');
        
        // Initialize keyboard shortcuts flag
        window.keyboardListenerAdded = false;
        
        // Force initialize keyboard shortcuts immediately
        safeStorageAccess(function(data) {
          console.log('PKM Data Entry Assistant: Pre-initializing keyboard shortcuts with:', data);
          
          // Create a direct event listener for keyboard shortcuts
          const directKeydownListener = function(event) {
            try {
              // Get the pressed key in different formats
              const keyPressed = event.key.toLowerCase();
              const keyCode = event.keyCode || event.which;
              const charCode = String.fromCharCode(keyCode).toLowerCase();
              
              console.log('PKM Data Entry Assistant: Direct key pressed:', keyPressed, charCode);
              
              // Normalize the configured keys to lowercase for case-insensitive comparison
              const cnicKey = data.cnicFillKey.toLowerCase();
              const otpKey = data.otpFillKey.toLowerCase();
              const emailKey = data.emailFillKey.toLowerCase();
              const combinedKey = data.autoFillKey.toLowerCase();
              
              // Check which key was pressed and trigger the appropriate function
              if (keyPressed === cnicKey || charCode === cnicKey) {
                console.log('PKM Data Entry Assistant: CNIC auto-fill key detected (direct)');
                autofillCnicFields();
              } else if (keyPressed === otpKey || charCode === otpKey) {
                console.log('PKM Data Entry Assistant: OTP auto-fill key detected (direct)');
                autofillOtpOnly();
              } else if (keyPressed === emailKey || charCode === emailKey) {
                console.log('PKM Data Entry Assistant: Email auto-fill key detected (direct)');
                autofillEmailOnly();
              } else if (keyPressed === combinedKey || charCode === combinedKey) {
                console.log('PKM Data Entry Assistant: Combined auto-fill key detected (direct)');
                autofillCnicFields();
                autofillOtpFields();
                autoselectCriminalRecord();
              }
            } catch (e) {
              console.error('PKM Data Entry Assistant: Error in direct keydown listener:', e);
            }
          };
          
          // Add the direct event listener
          document.addEventListener('keydown', directKeydownListener);
          console.log('PKM Data Entry Assistant: Direct keyboard listener added');
        });
        
        setTimeout(function() {
          try {
            console.log('PKM Data Entry Assistant: Initializing extension features');
            // Add auto-fill buttons to the page
            addAutoFillButton();
            addOtpFillButton();
            // Auto-fill fields
            autofillCnicFields();
            // Add keyboard listener for auto-fill
            addKeyboardListener();
            
            // Show notification about keyboard shortcuts
            safeStorageAccess(function(data) {
              showNotification(`Keyboard shortcuts active: ${data.cnicFillKey} for CNIC, ${data.emailFillKey} for Email, ${data.sendOtpKey} for Send OTP, ${data.otpFillKey} for OTP, ${data.verifyOtpKey} for Verify OTP, ${data.criminalRecordKey} for Criminal Record, ${data.autoSelectFileKey} for File Input, ${data.saveRecordKey} for Save Record, ${data.autoFillKey} for All Fields`);
            });
          } catch (e) {
            console.error('PKM Data Entry Assistant: Error initializing extension features:', e);
          }
        }, 1000); // Slight delay to ensure form is loaded
      } else {
        console.log('PKM Data Entry Assistant: On PKM site but not on a supported page pattern');
      }
    } else {
      console.log('PKM Data Entry Assistant: Not on PKM website');
    }
  } catch (e) {
    console.error('PKM Data Entry Assistant: Error in DOMContentLoaded handler:', e);
  }
});

// Also add a window.onload event handler as a backup
window.onload = function() {
  try {
    console.log('PKM Data Entry Assistant: window.onload event fired');
    
    // Check if we're on the PKM website
    if (window.location.href.includes('police.pkm.punjab.gov.pk')) {
      // If keyboard listener hasn't been added yet, add it now
      if (!window.keyboardListenerAdded) {
        console.log('PKM Data Entry Assistant: Adding keyboard listener from window.onload event');
        addKeyboardListener();
        window.keyboardListenerAdded = true;
      }
    }
  } catch (e) {
    console.error('PKM Data Entry Assistant: Error in window.onload handler:', e);
  }
};

// Add a direct event listener to the document as a fallback
document.addEventListener('keydown', function(event) {
  try {
    // Only handle if we're on the PKM website
    if (window.location.href.includes('police.pkm.punjab.gov.pk')) {
      // If the main keyboard listener hasn't been initialized yet, handle key presses directly
      if (!window.keyboardListenerAdded) {
        console.log('PKM Data Entry Assistant: Direct keydown handler triggered');
        
        // Get the pressed key in different formats
        const keyPressed = event.key.toLowerCase();
        const keyCode = event.keyCode || event.which;
        const charCode = String.fromCharCode(keyCode).toLowerCase();
        
        // Get the configured keys from storage
        safeStorageAccess(function(data) {
          // Normalize the configured keys to lowercase for case-insensitive comparison
          const cnicKey = data.cnicFillKey.toLowerCase();
          const otpKey = data.otpFillKey.toLowerCase();
          const emailKey = data.emailFillKey.toLowerCase();
          const combinedKey = data.autoFillKey.toLowerCase();
          const criminalRecordKey = data.criminalRecordKey.toLowerCase();
          const sendOtpKey = data.sendOtpKey.toLowerCase();
          const verifyOtpKey = data.verifyOtpKey.toLowerCase();
          const saveRecordKey = data.saveRecordKey.toLowerCase();
          const autoSelectFileKey = data.autoSelectFileKey.toLowerCase();
          
          // Check which key was pressed and trigger the appropriate function
          if (keyPressed === cnicKey || charCode === cnicKey) {
            console.log('PKM Data Entry Assistant: CNIC auto-fill key detected (direct)');
            autofillCnicFields();
          } else if (keyPressed === otpKey || charCode === otpKey) {
            console.log('PKM Data Entry Assistant: OTP auto-fill key detected (direct)');
            autofillOtpOnly();
          } else if (keyPressed === emailKey || charCode === emailKey) {
            console.log('PKM Data Entry Assistant: Email auto-fill key detected (direct)');
            autofillEmailOnly();
          } else if (keyPressed === combinedKey || charCode === combinedKey) {
            console.log('PKM Data Entry Assistant: Combined auto-fill key detected (direct)');
            autofillCnicFields();
            autofillOtpFields();
            autoselectCriminalRecord();
          } else if (keyPressed === criminalRecordKey || charCode === criminalRecordKey) {
            console.log('PKM Data Entry Assistant: Criminal Record key detected (direct)');
            selectCriminalRecordNo();
          } else if (keyPressed === sendOtpKey || charCode === sendOtpKey) {
            console.log('PKM Data Entry Assistant: Send OTP key detected (direct)');
            sendAllOTPs();
          } else if (keyPressed === verifyOtpKey || charCode === verifyOtpKey) {
            console.log('PKM Data Entry Assistant: Verify OTP key detected (direct)');
            verifyAllOTPs();
          } else if (keyPressed === saveRecordKey || charCode === saveRecordKey) {
            console.log('PKM Data Entry Assistant: Save Record key detected (direct)');
            pressSaveRecord();
          } else if (keyPressed === autoSelectFileKey || charCode === autoSelectFileKey) {
            console.log('PKM Data Entry Assistant: Auto-select file key detected (direct)');
            scrollToFileInputWithHotkey();
          }
        });
      }
    }
  } catch (e) {
    console.error('PKM Data Entry Assistant: Error in direct keydown handler:', e);
  }
});

// Function to add auto-fill button to the page
function addAutoFillButton() {
  // Create button element
  const button = document.createElement('button');
  button.textContent = 'Auto-fill CNIC';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '10px';
  button.style.backgroundColor = '#3498db';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.zIndex = '9999';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Add click event listener
  button.addEventListener('click', function() {
    autofillCnicFields();
  });
  
  // Add to page
  document.body.appendChild(button);
}

// Function to add OTP auto-fill button to the page
function addOtpFillButton() {
  // Create button element
  const button = document.createElement('button');
  button.textContent = 'Auto-fill OTP & Email';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '120px';
  button.style.backgroundColor = '#27ae60';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.zIndex = '9999';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Add click event listener
  button.addEventListener('click', function() {
    autofillOtpFields();
    autoselectCriminalRecord();
  });
  
  // Add to page
  document.body.appendChild(button);
  
  // Add debug button
  addDebugButton();
}

// Function to add a debug button to help troubleshoot keyboard shortcuts
function addDebugButton() {
  // Create button element
  const button = document.createElement('button');
  button.textContent = 'Debug Shortcuts';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '300px';
  button.style.backgroundColor = '#e74c3c';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.zIndex = '9999';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Add click event listener
  button.addEventListener('click', function() {
    // Get the current keyboard shortcut settings
    safeStorageAccess(function(data) {
      // Show the current settings
      const message = `Current keyboard shortcuts:\n` +
                     `CNIC: ${data.cnicFillKey}\n` +
                     `OTP: ${data.otpFillKey}\n` +
                     `Email: ${data.emailFillKey}\n` +
                     `Combined: ${data.autoFillKey}\n\n` +
                     `Keyboard listener added: ${window.keyboardListenerAdded ? 'Yes' : 'No'}\n` +
                     `URL: ${window.location.href}`;
      
      alert(message);
      
      // Re-add the keyboard listener
      console.log('PKM Data Entry Assistant: Re-adding keyboard listener from debug button');
      addKeyboardListener();
      
      showNotification('Keyboard shortcuts refreshed');
    });
  });
  
  // Add to page
  document.body.appendChild(button);
  
  // Add manual data fetching button
  addManualFetchButton();
}

// Function to add a manual data fetching button
function addManualFetchButton() {
  // Create button element
  const button = document.createElement('button');
  button.textContent = 'Manual Fetch Data';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '450px';
  button.style.backgroundColor = '#f39c12';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.zIndex = '9999';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Add click event listener
  button.addEventListener('click', function() {
    console.log('PKM Data Entry Assistant: Manual data fetching triggered');
    triggerDataFetching();
    showNotification('Manual data fetching triggered');
  });
  
  // Add to page
  document.body.appendChild(button);
  
  // Add test button
  addTestButton();
}

// Function to add a test button
function addTestButton() {
  // Create button element
  const button = document.createElement('button');
  button.textContent = 'Test Data Fetch';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '600px';
  button.style.backgroundColor = '#9b59b6';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.zIndex = '9999';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Add click event listener
  button.addEventListener('click', function() {
    console.log('PKM Data Entry Assistant: Test data fetching triggered');
    testDataFetching();
    showNotification('Test data fetching started');
  });
  
  // Add to page
  document.body.appendChild(button);
  
  // Add OTP action buttons
  addOtpActionButtons();
}

// Function to add OTP action buttons
function addOtpActionButtons() {
  // Send OTP button
  const sendOtpButton = document.createElement('button');
  sendOtpButton.textContent = 'Send OTPs';
  sendOtpButton.style.position = 'fixed';
  sendOtpButton.style.top = '50px';
  sendOtpButton.style.right = '10px';
  sendOtpButton.style.backgroundColor = '#2ecc71';
  sendOtpButton.style.color = 'white';
  sendOtpButton.style.border = 'none';
  sendOtpButton.style.padding = '8px 12px';
  sendOtpButton.style.borderRadius = '4px';
  sendOtpButton.style.zIndex = '9999';
  sendOtpButton.style.cursor = 'pointer';
  sendOtpButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  sendOtpButton.addEventListener('click', function() {
    console.log('PKM Data Entry Assistant: Send OTPs button clicked');
    sendAllOTPs();
  });
  
  document.body.appendChild(sendOtpButton);
  
  // Verify OTP button
  const verifyOtpButton = document.createElement('button');
  verifyOtpButton.textContent = 'Verify OTPs';
  verifyOtpButton.style.position = 'fixed';
  verifyOtpButton.style.top = '50px';
  verifyOtpButton.style.right = '120px';
  verifyOtpButton.style.backgroundColor = '#e67e22';
  verifyOtpButton.style.color = 'white';
  verifyOtpButton.style.border = 'none';
  verifyOtpButton.style.padding = '8px 12px';
  verifyOtpButton.style.borderRadius = '4px';
  verifyOtpButton.style.zIndex = '9999';
  verifyOtpButton.style.cursor = 'pointer';
  verifyOtpButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  verifyOtpButton.addEventListener('click', function() {
    console.log('PKM Data Entry Assistant: Verify OTPs button clicked');
    verifyAllOTPs();
  });
  
  document.body.appendChild(verifyOtpButton);
  
  // Save Record button
  const saveRecordButton = document.createElement('button');
  saveRecordButton.textContent = 'Save Record';
  saveRecordButton.style.position = 'fixed';
  saveRecordButton.style.top = '50px';
  saveRecordButton.style.right = '230px';
  saveRecordButton.style.backgroundColor = '#e74c3c';
  saveRecordButton.style.color = 'white';
  saveRecordButton.style.border = 'none';
  saveRecordButton.style.padding = '8px 12px';
  saveRecordButton.style.borderRadius = '4px';
  saveRecordButton.style.zIndex = '9999';
  saveRecordButton.style.cursor = 'pointer';
  saveRecordButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  saveRecordButton.addEventListener('click', function() {
    console.log('PKM Data Entry Assistant: Save Record button clicked');
    pressSaveRecord();
  });
  
  document.body.appendChild(saveRecordButton);
  
  // Auto-select File button
  const autoSelectFileButton = document.createElement('button');
  autoSelectFileButton.textContent = 'Scroll to File Input';
  autoSelectFileButton.style.position = 'fixed';
  autoSelectFileButton.style.top = '50px';
  autoSelectFileButton.style.right = '340px';
  autoSelectFileButton.style.backgroundColor = '#8e44ad';
  autoSelectFileButton.style.color = 'white';
  autoSelectFileButton.style.border = 'none';
  autoSelectFileButton.style.padding = '8px 12px';
  autoSelectFileButton.style.borderRadius = '4px';
  autoSelectFileButton.style.zIndex = '9999';
  autoSelectFileButton.style.cursor = 'pointer';
  autoSelectFileButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  autoSelectFileButton.addEventListener('click', function() {
    console.log('PKM Data Entry Assistant: Scroll to File Input button clicked');
    scrollToFileInput();
  });
  
  document.body.appendChild(autoSelectFileButton);
}

// Function to add keyboard listener for all auto-fill functions
function addKeyboardListener() {
  console.log('PKM Data Entry Assistant: Adding keyboard listener');
  
  // Remove existing listener if it exists
  if (window.currentKeydownListener) {
    console.log('PKM Data Entry Assistant: Removing existing keyboard listener');
    document.removeEventListener('keydown', window.currentKeydownListener);
  }
  
  // Get the configured keys from storage
  safeStorageAccess(function(data) {
    console.log('PKM Data Entry Assistant: Retrieved keys from storage:', 
      JSON.stringify({
        cnicFillKey: data.cnicFillKey,
        otpFillKey: data.otpFillKey,
        emailFillKey: data.emailFillKey,
        autoFillKey: data.autoFillKey,
        criminalRecordKey: data.criminalRecordKey,
        sendOtpKey: data.sendOtpKey,
        verifyOtpKey: data.verifyOtpKey,
        saveRecordKey: data.saveRecordKey,
        autoSelectFileKey: data.autoSelectFileKey
      }));
    
    // Create the event listener function
    window.currentKeydownListener = function(event) {
      // Get the pressed key in different formats
      const keyPressed = event.key.toLowerCase();
      const keyCode = event.keyCode || event.which;
      const charCode = String.fromCharCode(keyCode).toLowerCase();
      
      console.log('PKM Data Entry Assistant: Key pressed:', {
        key: event.key,
        keyLower: keyPressed,
        keyCode: keyCode,
        charCode: charCode
      });
      
      // Normalize the configured keys to lowercase for case-insensitive comparison
      const cnicKey = data.cnicFillKey.toLowerCase();
      const otpKey = data.otpFillKey.toLowerCase();
      const emailKey = data.emailFillKey.toLowerCase();
      const combinedKey = data.autoFillKey.toLowerCase();
      const criminalRecordKey = data.criminalRecordKey.toLowerCase();
      const sendOtpKey = data.sendOtpKey.toLowerCase();
      const verifyOtpKey = data.verifyOtpKey.toLowerCase();
      const saveRecordKey = data.saveRecordKey.toLowerCase();
      const autoSelectFileKey = data.autoSelectFileKey.toLowerCase();
      
      // Check which key was pressed and trigger the appropriate function
      // Try matching both event.key and the character code from keyCode
      if (keyPressed === cnicKey || charCode === cnicKey) {
        console.log('PKM Data Entry Assistant: CNIC key pressed, auto-filling CNIC fields');
        // CNIC auto-fill only
        autofillCnicFields();
      } else if (keyPressed === otpKey || charCode === otpKey) {
        console.log('PKM Data Entry Assistant: OTP key pressed, auto-filling OTP fields');
        // OTP auto-fill only
        autofillOtpOnly();
      } else if (keyPressed === emailKey || charCode === emailKey) {
        console.log('PKM Data Entry Assistant: Email key pressed, auto-filling Email fields');
        // Email auto-fill only
        autofillEmailOnly();
      } else if (keyPressed === combinedKey || charCode === combinedKey) {
        console.log('PKM Data Entry Assistant: Combined key pressed, auto-filling all fields');
        // Combined auto-fill (all fields)
        autofillCnicFields();
        autofillOtpFields();
        autoselectCriminalRecord();
      } else if (keyPressed === criminalRecordKey || charCode === criminalRecordKey) {
        console.log('PKM Data Entry Assistant: Criminal Record key pressed, selecting "No"');
        // Criminal Record "No" selection only
        selectCriminalRecordNo();
      } else if (keyPressed === sendOtpKey || charCode === sendOtpKey) {
        console.log('PKM Data Entry Assistant: Send OTP key pressed');
        // Send OTPs for all fields
        sendAllOTPs();
      } else if (keyPressed === verifyOtpKey || charCode === verifyOtpKey) {
        console.log('PKM Data Entry Assistant: Verify OTP key pressed');
        // Verify OTPs for all fields
        verifyAllOTPs();
      } else if (keyPressed === saveRecordKey || charCode === saveRecordKey) {
        console.log('PKM Data Entry Assistant: Save Record key pressed');
        // Press Save Record button
        pressSaveRecord();
      } else if (keyPressed === autoSelectFileKey || charCode === autoSelectFileKey) {
        console.log('PKM Data Entry Assistant: Auto-select file key pressed');
        // Scroll to file input field
        scrollToFileInputWithHotkey();
      }
    };
    
    // Add the event listener to the document
    document.addEventListener('keydown', window.currentKeydownListener);
    
    // Set the flag to indicate that the keyboard listener has been added
    window.keyboardListenerAdded = true;
    console.log('PKM Data Entry Assistant: Keyboard listener added successfully, flag set');
    
    // Show notification to indicate keyboard shortcuts are active
    showNotification(`Keyboard shortcuts active: ${data.cnicFillKey} for CNIC, ${data.emailFillKey} for Email, ${data.sendOtpKey} for Send OTP, ${data.otpFillKey} for OTP, ${data.verifyOtpKey} for Verify OTP, ${data.criminalRecordKey} for Criminal Record, ${data.autoSelectFileKey} for File Input, ${data.saveRecordKey} for Save Record, ${data.autoFillKey} for All Fields`);
  });
}

// Function to send OTPs for all fields
function sendAllOTPs() {
  console.log('PKM Data Entry Assistant: Sending OTPs for all fields');
  
  const sendOTPButtons = [
    document.getElementById('constable_sendOTP'),
    document.getElementById('moharar_sendOTP'),
    document.getElementById('frontdesk_sendOTP')
  ];
  
  let buttonsClicked = 0;
  
  sendOTPButtons.forEach((button, index) => {
    if (button && button.style.display !== 'none') {
      console.log(`PKM Data Entry Assistant: Clicking send OTP button ${index + 1}`);
      button.click();
      buttonsClicked++;
    }
  });
  
  if (buttonsClicked > 0) {
    showNotification(`${buttonsClicked} OTP send buttons clicked`);
  } else {
    showNotification('No OTP send buttons found or all are hidden');
  }
}

// Function to verify OTPs for all fields
function verifyAllOTPs() {
  console.log('PKM Data Entry Assistant: Verifying OTPs for all fields');
  
  const verifyOTPButtons = [
    document.getElementById('constable_savebutton'),
    document.getElementById('moharar_savebutton'),
    document.getElementById('frontdesk_savebutton')
  ];
  
  let buttonsClicked = 0;
  
  verifyOTPButtons.forEach((button, index) => {
    if (button && button.style.display !== 'none') {
      console.log(`PKM Data Entry Assistant: Clicking verify OTP button ${index + 1}`);
      button.click();
      buttonsClicked++;
    }
  });
  
  if (buttonsClicked > 0) {
    showNotification(`${buttonsClicked} OTP verify buttons clicked`);
  } else {
    showNotification('No OTP verify buttons found or all are hidden');
  }
}

// Function to press the Save Record button
function pressSaveRecord() {
  console.log('PKM Data Entry Assistant: Pressing Save Record button');
  
  const saveButton = document.getElementById('save_button');
  
  if (saveButton) {
    if (!saveButton.disabled) {
      console.log('PKM Data Entry Assistant: Clicking Save Record button');
      saveButton.click();
      showNotification('Save Record button clicked');
    } else {
      console.log('PKM Data Entry Assistant: Save Record button is disabled');
      showNotification('Save Record button is disabled');
    }
  } else {
    console.log('PKM Data Entry Assistant: Save Record button not found');
    showNotification('Save Record button not found');
  }
}

// No longer needed - removed selection-related functionality

// Listen for messages from background script and popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  try {
    console.log('PKM Data Entry Assistant: Message received:', request);
    
    if (request.action === 'enableOtpKeyListener' || request.action === 'enableKeyboardShortcuts') {
      console.log('PKM Data Entry Assistant: Enabling keyboard shortcuts');
      
      // Check if keys were provided in the message
      const cnicKey = request.cnicKey || request.cnicFillKey || '0';
      const otpKey = request.otpKey || request.otpFillKey || '1';
      const emailKey = request.emailKey || request.emailFillKey || '2';
      const combinedKey = request.combinedKey || request.autoFillKey || '3';
      const criminalRecordKey = request.criminalRecordKey || '4';
      const sendOtpKey = request.sendOtpKey || '5';
      const verifyOtpKey = request.verifyOtpKey || '6';
      const saveRecordKey = request.saveRecordKey || '7';
      const autoSelectFileKey = request.autoSelectFileKey || '8';
      
      console.log('PKM Data Entry Assistant: Received keys from settings:', {
        cnicKey,
        otpKey,
        emailKey,
        combinedKey,
        criminalRecordKey,
        sendOtpKey,
        verifyOtpKey,
        saveRecordKey,
        autoSelectFileKey
      });
      
      // Save the keys to storage for future use
      if (isExtensionContextValid()) {
        try {
          chrome.storage.local.set({
            cnicFillKey: cnicKey,
            otpFillKey: otpKey,
            emailFillKey: emailKey,
            autoFillKey: combinedKey,
            criminalRecordKey: criminalRecordKey,
            sendOtpKey: sendOtpKey,
            verifyOtpKey: verifyOtpKey,
            saveRecordKey: saveRecordKey,
            autoSelectFileKey: autoSelectFileKey
          }, function() {
            console.log('PKM Data Entry Assistant: Saved keys to storage');
            
            // Remove any existing listener
            if (window.currentKeydownListener) {
              console.log('PKM Data Entry Assistant: Removing existing keyboard listener from message handler');
              document.removeEventListener('keydown', window.currentKeydownListener);
              window.keyboardListenerAdded = false;
            }
            
            // Add or update the keyboard listener
            console.log('PKM Data Entry Assistant: Adding/updating keyboard listener from message handler');
            addKeyboardListener();
            
            showNotification(`Press: ${cnicKey} for CNIC, ${emailKey} for Email, ${sendOtpKey} for Send OTP, ${otpKey} for OTP, ${verifyOtpKey} for Verify OTP, ${criminalRecordKey} for Criminal Record, ${autoSelectFileKey} for File Input, ${saveRecordKey} for Save Record, ${combinedKey} for All Fields`);
            
            // Send response back to confirm listener was enabled
            if (sendResponse) {
              sendResponse({success: true, message: 'Keyboard shortcuts enabled'});
            }
          });
        } catch (e) {
          console.error('PKM Data Entry Assistant: Error saving to storage:', e);
          if (sendResponse) {
            sendResponse({success: false, message: 'Error saving settings'});
          }
        }
      } else {
        console.log('PKM Data Entry Assistant: Extension context invalid, cannot save settings');
        if (sendResponse) {
          sendResponse({success: false, message: 'Extension context invalid'});
        }
      }
    }
    
    // Return true for all messages to keep the message channel open
    return true;
  } catch (e) {
    console.error('PKM Data Entry Assistant: Error in message listener:', e);
    if (sendResponse) {
      sendResponse({success: false, message: 'Error processing message'});
    }
    return true;
  }
});

// Function to auto-select "No" in the Criminal Record dropdown
function autoselectCriminalRecord() {
  // Get the Criminal Record dropdown
  const criminalRecordDropdown = document.getElementById('criminal_record');
  
  // Check if the dropdown exists on the page
  if (criminalRecordDropdown) {
    // Get setting from storage
    safeStorageAccess(function(data) {
      // Only proceed if auto-select is enabled
      if (data.autoSelectNoRecord) {
        // Select "No" option
        criminalRecordDropdown.value = 'no';
        // Trigger change event to ensure any listeners on the dropdown are notified
        const event = new Event('change', { bubbles: true });
        criminalRecordDropdown.dispatchEvent(event);
        
        showNotification('Criminal Record set to "No"');
      }
    });
  }
}

// Function to manually select "No" in Criminal Record dropdown (for hotkey)
function selectCriminalRecordNo() {
  // Get the Criminal Record dropdown
  const criminalRecordDropdown = document.getElementById('criminal_record');
  
  // Check if the dropdown exists on the page
  if (criminalRecordDropdown) {
    // Select "No" option
    criminalRecordDropdown.value = 'no';
    // Trigger change event to ensure any listeners on the dropdown are notified
    const event = new Event('change', { bubbles: true });
    criminalRecordDropdown.dispatchEvent(event);
    
    showNotification('Criminal Record manually set to "No"');
  } else {
    showNotification('Criminal Record dropdown not found on this page');
  }
}

// Function to auto-fill CNIC fields on the PKM website
function autofillCnicFields() {
  console.log('PKM Data Entry Assistant: autofillCnicFields called');
  
  // Get the CNIC input fields from the page
  const constableCnicField = document.getElementById('constable_cnic_txt');
  const mohararCnicField = document.getElementById('moharar_cnic_txt');
  const frontdeskCnicField = document.getElementById('frontdesk_cnic_txt');
  
  console.log('PKM Data Entry Assistant: Found CNIC fields:', {
    constableCnicField: !!constableCnicField,
    mohararCnicField: !!mohararCnicField,
    frontdeskCnicField: !!frontdeskCnicField
  });
  
  // Check if any of the fields exist on the page
  if (constableCnicField || mohararCnicField || frontdeskCnicField) {
    console.log('PKM Data Entry Assistant: CNIC fields found, proceeding with auto-fill');
    
    // Get saved CNIC values from storage
    safeStorageAccess(function(data) {
      console.log('PKM Data Entry Assistant: Retrieved data from storage:', {
        autoFillEnabled: data.autoFillEnabled,
        constableCnic: data.constableCnic,
        mohararCnic: data.mohararCnic,
        frontdeskCnic: data.frontdeskCnic,
        useRealisticInteraction: data.useRealisticInteraction
      });
      
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Function to fill a CNIC field and trigger events
        function fillCnicField(field, cnicValue) {
          if (field && cnicValue) {
            console.log('PKM Data Entry Assistant: Filling field with value:', cnicValue);
            
            if (data.useRealisticInteraction) {
              // Use realistic user interaction simulation
              console.log('PKM Data Entry Assistant: Using realistic interaction');
              simulateUserInteraction(field, cnicValue);
            } else {
              // Use the original method
              console.log('PKM Data Entry Assistant: Using direct method');
              
              // Focus on the field first
              field.focus();
              
              // Set the value
              field.value = cnicValue;
              
              // Trigger input event
              const inputEvent = new Event('input', { bubbles: true });
              field.dispatchEvent(inputEvent);
              
              // Trigger change event
              const changeEvent = new Event('change', { bubbles: true });
              field.dispatchEvent(changeEvent);
              
              // Trigger blur event (when user moves away from field)
              const blurEvent = new Event('blur', { bubbles: true });
              field.dispatchEvent(blurEvent);
              
              // Also trigger keyup event in case the website listens for it
              const keyupEvent = new Event('keyup', { bubbles: true });
              field.dispatchEvent(keyupEvent);
            }
            
            fieldsFilledCount++;
            console.log('PKM Data Entry Assistant: Filled CNIC field with value:', cnicValue);
          } else {
            console.log('PKM Data Entry Assistant: Field or value missing:', {
              field: !!field,
              cnicValue: cnicValue
            });
          }
        }
        
        // Fill in the fields if they exist and we have values for them
        fillCnicField(constableCnicField, data.constableCnic);
        fillCnicField(mohararCnicField, data.mohararCnic);
        fillCnicField(frontdeskCnicField, data.frontdeskCnic);
        
        // Show notification if any field was filled
        if (fieldsFilledCount > 0) {
          showNotification(`${fieldsFilledCount} CNIC fields auto-filled and data fetching triggered`);
          
          // Add a small delay to ensure the events are processed
          setTimeout(() => {
            console.log('PKM Data Entry Assistant: CNIC auto-fill completed, data should be fetched from server');
          }, 500);
        } else {
          console.log('PKM Data Entry Assistant: No CNIC fields were filled');
          showNotification('No CNIC values found in settings. Please configure CNIC values first.');
        }
      } else {
        console.log('PKM Data Entry Assistant: Auto-fill is disabled');
        showNotification('Auto-fill is disabled in settings');
      }
    });
  } else {
    console.log('PKM Data Entry Assistant: No CNIC fields found on this page');
    showNotification('No CNIC fields found on this page');
  }
}

// Function to trigger data fetching after CNIC is filled
function triggerDataFetching() {
  console.log('PKM Data Entry Assistant: Attempting to trigger data fetching');
  
  // Method 1: Try to find and click any "Search" or "Fetch" buttons
  const searchButtons = document.querySelectorAll('button[type="submit"], input[type="submit"], .search-btn, .fetch-btn');
  if (searchButtons.length > 0) {
    console.log('PKM Data Entry Assistant: Found search buttons, clicking first one');
    searchButtons[0].click();
  }
  
  // Method 2: Try to trigger form submission
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    if (form.querySelector('input[id*="cnic"]')) {
      console.log('PKM Data Entry Assistant: Found form with CNIC field, triggering submit');
      const submitEvent = new Event('submit', { bubbles: true });
      form.dispatchEvent(submitEvent);
    }
  });
  
  // Method 3: Simulate pressing Enter key on CNIC fields
  const cnicFields = [
    document.getElementById('constable_cnic_txt'),
    document.getElementById('moharar_cnic_txt'),
    document.getElementById('frontdesk_cnic_txt')
  ];
  
  cnicFields.forEach(field => {
    if (field && field.value) {
      console.log('PKM Data Entry Assistant: Simulating Enter key press on CNIC field');
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      field.dispatchEvent(enterEvent);
      
      const enterUpEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      field.dispatchEvent(enterUpEvent);
    }
  });
}

// Function to simulate realistic user interaction with CNIC fields
function simulateUserInteraction(field, value) {
  if (!field || !value) return;
  
  console.log('PKM Data Entry Assistant: Simulating realistic user interaction');
  
  // Focus on the field
  field.focus();
  
  // Clear the field first
  field.value = '';
  field.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Simulate typing the CNIC character by character
  const delay = 50; // 50ms delay between characters
  let currentIndex = 0;
  
  function typeNextCharacter() {
    if (currentIndex < value.length) {
      field.value += value[currentIndex];
      field.dispatchEvent(new Event('input', { bubbles: true }));
      currentIndex++;
      setTimeout(typeNextCharacter, delay);
    } else {
      // After typing is complete, trigger change and blur events
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
      
      // Wait a bit then try to trigger data fetching
      setTimeout(() => {
        triggerDataFetching();
      }, 200);
    }
  }
  
  typeNextCharacter();
}

// Function to auto-fill OTP fields only
function autofillOtpOnly() {
  console.log('PKM Data Entry Assistant: autofillOtpOnly called');
  
  // Get the OTP input fields from the page
  const constableOtpField = document.getElementById('constable_otp_txt');
  const mohararOtpField = document.getElementById('moharar_otp_txt');
  const frontdeskOtpField = document.getElementById('frontdesk_otp_txt');
  
  console.log('PKM Data Entry Assistant: Found OTP fields:', {
    constableOtpField: !!constableOtpField,
    mohararOtpField: !!mohararOtpField,
    frontdeskOtpField: !!frontdeskOtpField
  });
  
  // Check if any of the fields exist on the page
  if (constableOtpField || mohararOtpField || frontdeskOtpField) {
    console.log('PKM Data Entry Assistant: OTP fields found, proceeding with auto-fill');
    
    // Get saved values from storage
    safeStorageAccess(function(data) {
      console.log('PKM Data Entry Assistant: Retrieved OTP data from storage:', {
        autoFillEnabled: data.autoFillEnabled,
        constableOtp: data.constableOtp,
        mohararOtp: data.mohararOtp,
        frontdeskOtp: data.frontdeskOtp
      });
      
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Fill in the OTP fields if they exist and we have values for them
        if (constableOtpField && data.constableOtp) {
          console.log('PKM Data Entry Assistant: Filling constable OTP field');
          constableOtpField.value = data.constableOtp;
          constableOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          constableOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (mohararOtpField && data.mohararOtp) {
          console.log('PKM Data Entry Assistant: Filling moharar OTP field');
          mohararOtpField.value = data.mohararOtp;
          mohararOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          mohararOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (frontdeskOtpField && data.frontdeskOtp) {
          console.log('PKM Data Entry Assistant: Filling frontdesk OTP field');
          frontdeskOtpField.value = data.frontdeskOtp;
          frontdeskOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          frontdeskOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        // Show notification if any field was filled
        if (fieldsFilledCount > 0) {
          showNotification(`${fieldsFilledCount} OTP fields auto-filled`);
        } else {
          console.log('PKM Data Entry Assistant: No OTP fields were filled');
          showNotification('No OTP values found in settings. Please configure OTP values first.');
        }
      } else {
        console.log('PKM Data Entry Assistant: Auto-fill is disabled');
        showNotification('Auto-fill is disabled in settings');
      }
    });
  } else {
    console.log('PKM Data Entry Assistant: No OTP fields found on this page');
    showNotification('No OTP fields found on this page');
  }
}

// Function to auto-fill Email fields only
function autofillEmailOnly() {
  console.log('PKM Data Entry Assistant: autofillEmailOnly called');
  
  // Get the email input fields from the page - check both by id and name
  const constableEmailField = document.getElementById('constable_email_txt');
  const mohararEmailField = document.getElementById('moharar_email_txt') || document.querySelector('input[name="moharar_email_txt"]');
  const frontdeskEmailField = document.getElementById('frontdesk_email_txt') || document.querySelector('input[name="frontdesk_email_txt"]');
  
  console.log('PKM Data Entry Assistant: Found Email fields:', {
    constableEmailField: !!constableEmailField,
    mohararEmailField: !!mohararEmailField,
    frontdeskEmailField: !!frontdeskEmailField
  });
  
  // Check if any of the fields exist on the page
  if (constableEmailField || mohararEmailField || frontdeskEmailField) {
    console.log('PKM Data Entry Assistant: Email fields found, proceeding with auto-fill');
    
    // Get saved values from storage
    safeStorageAccess(function(data) {
      console.log('PKM Data Entry Assistant: Retrieved email data from storage:', {
        autoFillEnabled: data.autoFillEnabled,
        sharedEmail: data.sharedEmail
      });
      
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Fill in the email fields with the shared email if they exist
        if (constableEmailField && data.sharedEmail) {
          console.log('PKM Data Entry Assistant: Filling constable email field');
          constableEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          constableEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          constableEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (mohararEmailField && data.sharedEmail) {
          console.log('PKM Data Entry Assistant: Filling moharar email field');
          mohararEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          mohararEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          mohararEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (frontdeskEmailField && data.sharedEmail) {
          console.log('PKM Data Entry Assistant: Filling frontdesk email field');
          frontdeskEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          frontdeskEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          frontdeskEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        // Show notification if any field was filled
        if (fieldsFilledCount > 0) {
          showNotification(`${fieldsFilledCount} Email fields auto-filled`);
        } else {
          console.log('PKM Data Entry Assistant: No email fields were filled');
          showNotification('No email value found in settings. Please configure email value first.');
        }
      } else {
        console.log('PKM Data Entry Assistant: Auto-fill is disabled');
        showNotification('Auto-fill is disabled in settings');
      }
    });
  } else {
    console.log('PKM Data Entry Assistant: No email fields found on this page');
    showNotification('No email fields found on this page');
  }
}

// Function to auto-fill OTP and Email fields
function autofillOtpFields() {
  console.log('PKM Data Entry Assistant: autofillOtpFields called');
  
  // Get the OTP input fields from the page
  const constableOtpField = document.getElementById('constable_otp_txt');
  const mohararOtpField = document.getElementById('moharar_otp_txt');
  const frontdeskOtpField = document.getElementById('frontdesk_otp_txt');
  
  // Get the email input fields from the page - check both by id and name
  const constableEmailField = document.getElementById('constable_email_txt');
  const mohararEmailField = document.getElementById('moharar_email_txt') || document.querySelector('input[name="moharar_email_txt"]');
  const frontdeskEmailField = document.getElementById('frontdesk_email_txt') || document.querySelector('input[name="frontdesk_email_txt"]');
  
  console.log('PKM Data Entry Assistant: Found fields:', {
    constableOtpField: !!constableOtpField,
    mohararOtpField: !!mohararOtpField,
    frontdeskOtpField: !!frontdeskOtpField,
    constableEmailField: !!constableEmailField,
    mohararEmailField: !!mohararEmailField,
    frontdeskEmailField: !!frontdeskEmailField
  });
  
  // Check if any of the fields exist on the page
  if (constableOtpField || mohararOtpField || frontdeskOtpField || 
      constableEmailField || mohararEmailField || frontdeskEmailField) {
    console.log('PKM Data Entry Assistant: Fields found, proceeding with auto-fill');
    
    // Get saved values from storage
    safeStorageAccess(function(data) {
      console.log('PKM Data Entry Assistant: Retrieved data from storage:', {
        autoFillEnabled: data.autoFillEnabled,
        constableOtp: data.constableOtp,
        mohararOtp: data.mohararOtp,
        frontdeskOtp: data.frontdeskOtp,
        sharedEmail: data.sharedEmail
      });
      
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Fill in the OTP fields if they exist and we have values for them
        if (constableOtpField && data.constableOtp) {
          console.log('PKM Data Entry Assistant: Filling constable OTP field');
          constableOtpField.value = data.constableOtp;
          constableOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          constableOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (mohararOtpField && data.mohararOtp) {
          console.log('PKM Data Entry Assistant: Filling moharar OTP field');
          mohararOtpField.value = data.mohararOtp;
          mohararOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          mohararOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (frontdeskOtpField && data.frontdeskOtp) {
          console.log('PKM Data Entry Assistant: Filling frontdesk OTP field');
          frontdeskOtpField.value = data.frontdeskOtp;
          frontdeskOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          frontdeskOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        // Fill in the email fields with the shared email if they exist
        if (constableEmailField && data.sharedEmail) {
          console.log('PKM Data Entry Assistant: Filling constable email field');
          constableEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          constableEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          constableEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (mohararEmailField && data.sharedEmail) {
          console.log('PKM Data Entry Assistant: Filling moharar email field');
          mohararEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          mohararEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          mohararEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (frontdeskEmailField && data.sharedEmail) {
          console.log('PKM Data Entry Assistant: Filling frontdesk email field');
          frontdeskEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          frontdeskEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          frontdeskEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        // Show notification if any field was filled
        if (fieldsFilledCount > 0) {
          showNotification(`${fieldsFilledCount} OTP and Email fields auto-filled`);
        } else {
          console.log('PKM Data Entry Assistant: No fields were filled');
          showNotification('No OTP or Email values found in settings. Please configure values first.');
        }
      } else {
        console.log('PKM Data Entry Assistant: Auto-fill is disabled');
        showNotification('Auto-fill is disabled in settings');
      }
    });
  } else {
    console.log('PKM Data Entry Assistant: No OTP or Email fields found on this page');
    showNotification('No OTP or Email fields found on this page');
  }
}

// Function to show a notification on the page
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#3498db';
  notification.style.color = 'white';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.transition = 'opacity 0.3s';
  notification.style.opacity = '0';
  
  // Add to page
  document.body.appendChild(notification);
  
  // Fade in
  setTimeout(function() {
    notification.style.opacity = '1';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(function() {
    notification.style.opacity = '0';
    setTimeout(function() {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Function to test data fetching mechanism
function testDataFetching() {
  console.log('PKM Data Entry Assistant: Testing data fetching mechanism');
  
  // Check if we're on a PKM page
  if (!window.location.href.includes('police.pkm.punjab.gov.pk')) {
    console.log('PKM Data Entry Assistant: Not on PKM website, cannot test data fetching');
    return;
  }
  
  // Find all CNIC fields
  const cnicFields = [
    document.getElementById('constable_cnic_txt'),
    document.getElementById('moharar_cnic_txt'),
    document.getElementById('frontdesk_cnic_txt')
  ].filter(field => field !== null);
  
  if (cnicFields.length === 0) {
    console.log('PKM Data Entry Assistant: No CNIC fields found on page');
    showNotification('No CNIC fields found on this page');
    return;
  }
  
  console.log('PKM Data Entry Assistant: Found CNIC fields:', cnicFields.length);
  
  // Test with a sample CNIC
  const testCnic = '12345-1234567-1';
  
  cnicFields.forEach((field, index) => {
    console.log(`PKM Data Entry Assistant: Testing field ${index + 1}:`, field.id);
    
    // Focus on the field
    field.focus();
    
    // Clear and set test value
    field.value = '';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Simulate typing
    let currentIndex = 0;
    function typeTestCnic() {
      if (currentIndex < testCnic.length) {
        field.value += testCnic[currentIndex];
        field.dispatchEvent(new Event('input', { bubbles: true }));
        currentIndex++;
        setTimeout(typeTestCnic, 100);
      } else {
        // After typing is complete
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('blur', { bubbles: true }));
        
        // Try to trigger data fetching
        setTimeout(() => {
          triggerDataFetching();
          showNotification(`Test completed for ${field.id}`);
        }, 500);
      }
    }
    
    typeTestCnic();
  });
}

// Function to scroll to file input field
function scrollToFileInput() {
  console.log('PKM Data Entry Assistant: Scrolling to file input field');
  
  // Get the file input field
  const fileInput = document.getElementById('document1');
  
  if (fileInput) {
    console.log('PKM Data Entry Assistant: Found file input field, scrolling to it');
    
    // Get setting from storage
    safeStorageAccess(function(data) {
      // Only proceed if auto-select file is enabled
      if (data.autoSelectFile) {
        // Scroll to the file input field
        fileInput.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Focus on the field
        fileInput.focus();
        
        // Add a highlight effect
        const originalBorder = fileInput.style.border;
        fileInput.style.border = '3px solid #3498db';
        fileInput.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.5)';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          fileInput.style.border = originalBorder;
          fileInput.style.boxShadow = '';
        }, 3000);
        
        console.log('PKM Data Entry Assistant: Scrolled to file input field successfully');
        showNotification('Scrolled to file input field - please select KHIDMATMARKAZ.jpeg manually');
      }
    });
  } else {
    console.log('PKM Data Entry Assistant: File input field not found');
    showNotification('File input field not found on this page');
  }
}

// Function to scroll to file input with hotkey
function scrollToFileInputWithHotkey() {
  console.log('PKM Data Entry Assistant: Scroll to file input hotkey pressed');
  scrollToFileInput();
}