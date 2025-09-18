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
      sharedEmail: '',
      autoFillCnicOnLoad: false
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
      sharedEmail: '',
      autoFillCnicOnLoad: false
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
      sharedEmail: '',
      autoFillCnicOnLoad: false
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
      
      // Check for pages that should have bulk open buttons (any page with tables containing verify buttons)
      const isServantInprogressPage = window.location.href.includes('/servant/index/inprogress/') || 
                                     window.location.href.includes('/servant') ||
                                     window.location.href.includes('/ps/servant');
      const isCertificateInprogressPage = window.location.href.includes('/certificate/index/inprogress/') || 
                                         window.location.href.includes('/certificate') ||
                                         window.location.href.includes('/ps/certificate');
      
      console.log('PKM Data Entry Assistant: URL pattern checks:', {
        isVerifiedSecondVersion,
        isCertificatePage,
        isServantPage,
        isServantInprogressPage,
        isCertificateInprogressPage,
        currentUrl: window.location.href
      });
      
      // Always initialize basic functionality on PKM website
      console.log('PKM Data Entry Assistant: On PKM website - initializing basic features');
        
        // Initialize keyboard shortcuts flag
        window.keyboardListenerAdded = false;
      
      // IMMEDIATELY try to add buttons (don't wait for setTimeout) - only on allowed pages
      addBulkOpenButton();
      
      // Add CNIC copy functionality
      addCnicCopyFunctionality();
      
      // Add a simple test button to confirm extension is working
        
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
            
            // Check if this is a numpad key and exclude it
            const isNumpadKey = event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;
            if (isNumpadKey) {
              console.log('PKM Data Entry Assistant: Numpad key detected (direct), ignoring:', {
                key: event.key,
                keyCode: keyCode,
                location: event.location
              });
              return; // Exit early for numpad keys
            }
              
              console.log('PKM Data Entry Assistant: Direct key pressed:', keyPressed, charCode);
              
              // Normalize the configured keys to lowercase for case-insensitive comparison
              const cnicKey = data.cnicFillKey.toLowerCase();
              const otpKey = data.otpFillKey.toLowerCase();
              const emailKey = data.emailFillKey.toLowerCase();
              const combinedKey = data.autoFillKey.toLowerCase();
            const bulkOpenKey = 'b'; // Fixed key for bulk open functionality
            const bulkOpenWithRecordKey = 'w'; // Fixed key for bulk open with record (warning buttons)
            const bulkOpenInfoKey = 'i'; // Fixed key for bulk open info buttons
              
              // Check which key was pressed and trigger the appropriate function
            if (keyPressed === bulkOpenKey || charCode === bulkOpenKey) {
              console.log('PKM Data Entry Assistant: Bulk open key detected (direct)');
              // Trigger bulk open functionality for all verify links
              const tables = document.querySelectorAll('table[id="table"]');
              let allVerifyLinks = [];
              tables.forEach(table => {
                const verifyButtons = table.querySelectorAll('a[href*="/servant/verified/"]');
                verifyButtons.forEach(button => {
                  allVerifyLinks.push(button.href);
                });
              });
              if (allVerifyLinks.length > 0) {
                openAllVerifyLinks(allVerifyLinks);
              }
            } else if (keyPressed === bulkOpenWithRecordKey || charCode === bulkOpenWithRecordKey) {
              console.log('PKM Data Entry Assistant: Bulk open with record key detected (direct)');
              // Trigger bulk open functionality for warning verify buttons
              const tables = document.querySelectorAll('table[id="table"]');
              let warningVerifyLinks = [];
              tables.forEach(table => {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                  const verifyButton = row.querySelector('a[href*="/servant/verified/"]');
                  const mohararButton = row.querySelector('a[href*="/certificate/moharar_detail/"]');
                  if (verifyButton && mohararButton && mohararButton.classList.contains('btn-warning')) {
                    warningVerifyLinks.push(verifyButton.href);
                  }
                });
              });
              if (warningVerifyLinks.length > 0) {
                openAllVerifyLinks(warningVerifyLinks);
              }
            } else if (keyPressed === bulkOpenInfoKey || charCode === bulkOpenInfoKey) {
              console.log('PKM Data Entry Assistant: Bulk open info key detected (direct)');
              // Trigger bulk open functionality for info verify buttons
              const tables = document.querySelectorAll('table[id="table"]');
              let infoVerifyLinks = [];
              tables.forEach(table => {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                  const verifyButton = row.querySelector('a[href*="/servant/verified/"]');
                  const mohararButton = row.querySelector('a[href*="/certificate/moharar_detail/"]');
                  if (verifyButton && mohararButton && mohararButton.classList.contains('btn-info')) {
                    infoVerifyLinks.push(verifyButton.href);
                  }
                });
              });
              if (infoVerifyLinks.length > 0) {
                openAllVerifyLinks(infoVerifyLinks);
              }
            } else if (keyPressed === cnicKey || charCode === cnicKey) {
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
          
          // Always add test button
          addTestButton();
          
          // Add bulk open functionality on any PKM page (will check for tables internally)
          console.log('PKM Data Entry Assistant: Adding bulk open buttons to PKM page');
          addBulkOpenButton();
          
          // Add CNIC copy functionality
          addCnicCopyFunctionality();
          
          // Multiple retry attempts to ensure buttons are created (only on allowed pages)
          setTimeout(() => {
            addBulkOpenButton();
          }, 1000);
          
          setTimeout(() => {
            addBulkOpenButton();
          }, 3000);
          
          setTimeout(() => {
            addBulkOpenButton();
          }, 5000);
          
          setTimeout(() => {
            addBulkOpenButton();
          }, 10000);
          
          // Wait for DataTable to be fully loaded
          setTimeout(() => {
            addBulkOpenButton();
          }, 15000);
          
          // Final retry after a long delay
          setTimeout(() => {
            addBulkOpenButton();
          }, 30000);
          
          // Additional retries for certificate page (DataTable loads data dynamically)
          if (window.location.href.includes('/certificate/index/inprogress/')) {
            setTimeout(() => {
              addBulkOpenButton();
            }, 5000);
            setTimeout(() => {
              addBulkOpenButton();
            }, 10000);
            setTimeout(() => {
              addBulkOpenButton();
            }, 20000);
            setTimeout(() => {
              addBulkOpenButton();
            }, 40000);
          }
          
          // Add auto-fill buttons only on supported pages
          if (isVerifiedSecondVersion || isCertificatePage || isServantPage) {
            console.log('PKM Data Entry Assistant: Detected supported page pattern for auto-fill');
            addAutoFillButton();
            addOtpFillButton();
            addAutoFillCnicCheckbox();
            // Auto-fill fields
            autofillCnicFields();
          }
          
            // Add keyboard listener for auto-fill
            addKeyboardListener();
            
            // Show notification about keyboard shortcuts
            safeStorageAccess(function(data) {
            let notificationText = `Keyboard shortcuts active: ${data.cnicFillKey} for CNIC, ${data.emailFillKey} for Email, ${data.sendOtpKey} for Send OTP, ${data.otpFillKey} for OTP, ${data.verifyOtpKey} for Verify OTP, ${data.criminalRecordKey} for Criminal Record, ${data.autoSelectFileKey} for File Input, ${data.saveRecordKey} for Save Record, ${data.autoFillKey} for All Fields, B for Bulk Open Verify, W for Bulk Open With Record, I for Bulk Open Info`;
            
            showNotification(notificationText);
            });
          } catch (e) {
            console.error('PKM Data Entry Assistant: Error initializing extension features:', e);
          }
        }, 1000); // Slight delay to ensure form is loaded
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
                 console.log('PKM Data Entry Assistant: window.onload - On PKM website, adding buttons');
                 
                 // Add buttons immediately on window.onload (only on allowed pages)
                 addBulkOpenButton();
                 
                 // Add CNIC copy functionality
                 addCnicCopyFunctionality();
      
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
        
        // Check if this is a numpad key and exclude it
        const isNumpadKey = event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;
        if (isNumpadKey) {
          console.log('PKM Data Entry Assistant: Numpad key detected (fallback), ignoring:', {
            key: event.key,
            keyCode: keyCode,
            location: event.location
          });
          return; // Exit early for numpad keys
        }
        
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
          const bulkOpenKey = 'b'; // Fixed key for bulk open functionality
          const bulkOpenWithRecordKey = 'w'; // Fixed key for bulk open with record (warning buttons)
          const bulkOpenInfoKey = 'i'; // Fixed key for bulk open info buttons
          
          // Check which key was pressed and trigger the appropriate function
          if (keyPressed === bulkOpenKey || charCode === bulkOpenKey) {
            console.log('PKM Data Entry Assistant: Bulk open key detected (fallback)');
            // Trigger bulk open functionality for verify links
            const tables = document.querySelectorAll('table[id="table"]');
            let verifyLinks = [];
            tables.forEach(table => {
              const verifyButtons = table.querySelectorAll('a[href*="/servant/verified/"]');
              verifyButtons.forEach(button => {
                verifyLinks.push(button.href);
              });
            });
            if (verifyLinks.length > 0) {
              openAllVerifyLinks(verifyLinks);
            }
          } else if (keyPressed === bulkOpenWithRecordKey || charCode === bulkOpenWithRecordKey) {
            console.log('PKM Data Entry Assistant: Bulk open with record key detected (fallback)');
            // Trigger bulk open functionality for warning verify buttons
            const tables = document.querySelectorAll('table[id="table"]');
            let warningVerifyLinks = [];
            tables.forEach(table => {
              const rows = table.querySelectorAll('tr');
              rows.forEach(row => {
                const verifyButton = row.querySelector('a[href*="/servant/verified/"]');
                const mohararButton = row.querySelector('a[href*="/certificate/moharar_detail/"]');
                if (verifyButton && mohararButton && mohararButton.classList.contains('btn-warning')) {
                  warningVerifyLinks.push(verifyButton.href);
                }
              });
            });
            if (warningVerifyLinks.length > 0) {
              openAllVerifyLinks(warningVerifyLinks);
            }
          } else if (keyPressed === bulkOpenInfoKey || charCode === bulkOpenInfoKey) {
            console.log('PKM Data Entry Assistant: Bulk open info key detected (fallback)');
            // Trigger bulk open functionality for info verify buttons
            const tables = document.querySelectorAll('table[id="table"]');
            let infoVerifyLinks = [];
            tables.forEach(table => {
              const rows = table.querySelectorAll('tr');
              rows.forEach(row => {
                const verifyButton = row.querySelector('a[href*="/servant/verified/"]');
                const mohararButton = row.querySelector('a[href*="/certificate/moharar_detail/"]');
                if (verifyButton && mohararButton && mohararButton.classList.contains('btn-info')) {
                  infoVerifyLinks.push(verifyButton.href);
                }
              });
            });
            if (infoVerifyLinks.length > 0) {
              openAllVerifyLinks(infoVerifyLinks);
            }
          } else if (keyPressed === cnicKey || charCode === cnicKey) {
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
      
      // Check if this is a numpad key and exclude it
      const isNumpadKey = event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;
      if (isNumpadKey) {
        console.log('PKM Data Entry Assistant: Numpad key detected, ignoring:', {
          key: event.key,
          keyCode: keyCode,
          location: event.location
        });
        return; // Exit early for numpad keys
      }
      
      console.log('PKM Data Entry Assistant: Key pressed:', {
        key: event.key,
        keyLower: keyPressed,
        keyCode: keyCode,
        charCode: charCode,
        location: event.location
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
      const bulkOpenKey = 'b'; // Fixed key for bulk open functionality
      const bulkOpenWithRecordKey = 'w'; // Fixed key for bulk open with record (warning buttons)
      const bulkOpenInfoKey = 'i'; // Fixed key for bulk open info buttons
      
      // Check which key was pressed and trigger the appropriate function
      // Try matching both event.key and the character code from keyCode
      if (keyPressed === bulkOpenKey || charCode === bulkOpenKey) {
        console.log('PKM Data Entry Assistant: Bulk open key pressed');
        // Trigger bulk open functionality for verify links
        const tables = document.querySelectorAll('table[id="table"]');
        let verifyLinks = [];
        tables.forEach(table => {
          const verifyButtons = table.querySelectorAll('a[href*="/servant/verified/"]');
          verifyButtons.forEach(button => {
            verifyLinks.push(button.href);
          });
        });
        if (verifyLinks.length > 0) {
          openAllVerifyLinks(verifyLinks);
        }
      } else if (keyPressed === bulkOpenWithRecordKey || charCode === bulkOpenWithRecordKey) {
        console.log('PKM Data Entry Assistant: Bulk open with record key pressed');
        // Trigger bulk open functionality for warning verify buttons
        const tables = document.querySelectorAll('table[id="table"]');
        let warningVerifyLinks = [];
        tables.forEach(table => {
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const verifyButton = row.querySelector('a[href*="/servant/verified/"]');
            const mohararButton = row.querySelector('a[href*="/certificate/moharar_detail/"]');
            if (verifyButton && mohararButton && mohararButton.classList.contains('btn-warning')) {
              warningVerifyLinks.push(verifyButton.href);
            }
          });
        });
        if (warningVerifyLinks.length > 0) {
          openAllVerifyLinks(warningVerifyLinks);
        }
      } else if (keyPressed === bulkOpenInfoKey || charCode === bulkOpenInfoKey) {
        console.log('PKM Data Entry Assistant: Bulk open info key pressed');
        // Trigger bulk open functionality for info verify buttons
        const tables = document.querySelectorAll('table[id="table"]');
        let infoVerifyLinks = [];
        tables.forEach(table => {
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const verifyButton = row.querySelector('a[href*="/servant/verified/"]');
            const mohararButton = row.querySelector('a[href*="/certificate/moharar_detail/"]');
            if (verifyButton && mohararButton && mohararButton.classList.contains('btn-info')) {
              infoVerifyLinks.push(verifyButton.href);
            }
          });
        });
        if (infoVerifyLinks.length > 0) {
          openAllVerifyLinks(infoVerifyLinks);
        }
      } else if (keyPressed === cnicKey || charCode === cnicKey) {
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
    showNotification(`Keyboard shortcuts active: ${data.cnicFillKey} for CNIC, ${data.emailFillKey} for Email, ${data.sendOtpKey} for Send OTP, ${data.otpFillKey} for OTP, ${data.verifyOtpKey} for Verify OTP, ${data.criminalRecordKey} for Criminal Record, ${data.autoSelectFileKey} for File Input, ${data.saveRecordKey} for Save Record, ${data.autoFillKey} for All Fields, B for Bulk Open Verify, W for Bulk Open With Record, I for Bulk Open Info`);
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

// Function to add auto-fill CNIC checkbox
function addAutoFillCnicCheckbox() {
  // Check if we're on a page that has CNIC fields
  const constableCnicField = document.getElementById('constable_cnic_txt');
  const mohararCnicField = document.getElementById('moharar_cnic_txt');
  const frontdeskCnicField = document.getElementById('frontdesk_cnic_txt');
  
  if (!constableCnicField && !mohararCnicField && !frontdeskCnicField) {
    return; // No CNIC fields found, don't add checkbox
  }
  
  // Check if checkbox already exists
  if (document.getElementById('pkm-auto-fill-cnic-checkbox')) {
    return;
  }
  
  // Create checkbox container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.id = 'pkm-auto-fill-cnic-checkbox';
  checkboxContainer.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 10px;
    z-index: 10000;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  // Create checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'pkm-auto-fill-cnic-checkbox-input';
  checkbox.style.marginRight = '8px';
  
  // Create label
  const label = document.createElement('label');
  label.htmlFor = 'pkm-auto-fill-cnic-checkbox-input';
  label.textContent = 'Auto-fill CNIC on page load';
  label.style.cursor = 'pointer';
  label.style.userSelect = 'none';
  
  // Load saved state
  safeStorageAccess(function(data) {
    checkbox.checked = data.autoFillCnicOnLoad || false;
  });
  
  // Add change event listener
  checkbox.addEventListener('change', function() {
    const isChecked = this.checked;
    
    // Save to storage
    if (isExtensionContextValid()) {
      try {
        chrome.storage.local.set({
          autoFillCnicOnLoad: isChecked
        });
      } catch (e) {
        console.error('PKM Data Entry Assistant: Error saving auto-fill CNIC setting:', e);
      }
    }
    
    // Show notification
    showToast(isChecked ? 'Auto-fill CNIC enabled' : 'Auto-fill CNIC disabled', 'success');
  });
  
  // Assemble the checkbox
  checkboxContainer.appendChild(checkbox);
  checkboxContainer.appendChild(label);
  
  // Add to page
  document.body.appendChild(checkboxContainer);
  
  // Auto-fill CNIC if checkbox is checked
  safeStorageAccess(function(data) {
    if (data.autoFillCnicOnLoad) {
      setTimeout(() => {
        autofillCnicFields();
      }, 1000); // Small delay to ensure page is fully loaded
    }
  });
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

// Function to show toast notification
function showToast(message, type = 'success') {
  // Remove existing toast if any
  const existingToast = document.getElementById('pkm-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'pkm-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100);
  
  // Fade out and remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

// Function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Function to add CNIC copy functionality
function addCnicCopyFunctionality() {
  // Check if we're on one of the allowed pages
  const currentUrl = window.location.href;
  const allowedPages = [
    'https://police.pkm.punjab.gov.pk/ps/certificate/index/inprogress/',
    'https://police.pkm.punjab.gov.pk/ps/servant/index/inprogress/'
  ];
  
  const isAllowedPage = allowedPages.some(page => currentUrl.includes(page));
  
  if (!isAllowedPage) {
    return; // Exit early if not on an allowed page
  }
  
  // Function to add click handlers to CNIC cells
  function addCnicClickHandlers() {
    // Look for CNIC cells in the table
    const cnicCells = document.querySelectorAll('td:nth-child(3)'); // CNIC is typically the 3rd column
    
    cnicCells.forEach(cell => {
      // Skip if already has click handler
      if (cell.hasAttribute('data-cnic-copy-added')) {
        return;
      }
      
      const cnicText = cell.textContent.trim();
      
      // Check if it looks like a CNIC (contains numbers and dashes)
      if (cnicText && (cnicText.includes('-') || /^\d{5}-?\d{7}-?\d{1}$/.test(cnicText.replace(/\s/g, '')))) {
        // Add click handler
        cell.style.cursor = 'pointer';
        cell.style.color = '#007bff';
        cell.style.textDecoration = 'underline';
        cell.title = 'Click to copy CNIC';
        cell.setAttribute('data-cnic-copy-added', 'true');
        
        cell.addEventListener('click', async function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const success = await copyToClipboard(cnicText);
          if (success) {
            showToast(`CNIC copied: ${cnicText}`, 'success');
          } else {
            showToast('Failed to copy CNIC', 'error');
          }
        });
      }
    });
  }
  
  // Add click handlers immediately
  addCnicClickHandlers();
  
  // For certificate page, also listen for DataTable draw events to add handlers to new rows
  if (currentUrl.includes('/certificate/index/inprogress/')) {
    setTimeout(() => {
      const table = $('#table').DataTable();
      if (table) {
        table.on('draw.dt', function() {
          setTimeout(() => {
            addCnicClickHandlers();
          }, 100);
        });
      }
    }, 2000);
  }
  
  // Also add handlers periodically in case of dynamic content
  setInterval(() => {
    addCnicClickHandlers();
  }, 2000);
}

// Function to remove existing bulk buttons
function removeExistingBulkButtons() {
  // Remove existing button container
  const existingContainer = document.getElementById('pkm-bulk-buttons-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Remove individual buttons if they exist
  if (window.pkmBulkOpenVerifyButton) {
    window.pkmBulkOpenVerifyButton.remove();
    window.pkmBulkOpenVerifyButton = null;
  }
  if (window.pkmBulkOpenWithRecordButton) {
    window.pkmBulkOpenWithRecordButton.remove();
    window.pkmBulkOpenWithRecordButton = null;
  }
  if (window.pkmBulkOpenInfoButton) {
    window.pkmBulkOpenInfoButton.remove();
    window.pkmBulkOpenInfoButton = null;
  }
}

// Function to detect tables with verify buttons and add bulk open functionality
function addBulkOpenButton() {
  // Check if we're on one of the allowed pages
  const currentUrl = window.location.href;
  const allowedPages = [
    'https://police.pkm.punjab.gov.pk/ps/certificate/index/inprogress/',
    'https://police.pkm.punjab.gov.pk/ps/servant/index/inprogress/'
  ];
  
  const isAllowedPage = allowedPages.some(page => currentUrl.includes(page));
  
  if (!isAllowedPage) {
    return; // Exit early if not on an allowed page
  }
  
  // Remove existing buttons first
  removeExistingBulkButtons();
  
  // Look for tables with verify buttons
  const tables = document.querySelectorAll('table[id="table"]');
  
  // Also try alternative table selectors
  const allTables = document.querySelectorAll('table');
  
  let totalVerifyButtons = 0;
  let allVerifyLinks = [];
  let warningVerifyLinks = [];
  let infoVerifyLinks = [];
  
  // First, let's try a simpler approach - look for all verify buttons on the page
  const allVerifyButtons = document.querySelectorAll('a[href*="/servant/verified/"]');
  
  // Also try alternative selectors for verify buttons
  const altVerifyButtons1 = document.querySelectorAll('a[href*="verified"]');
  const altVerifyButtons2 = document.querySelectorAll('a[title="verify"]');
  const altVerifyButtons3 = document.querySelectorAll('a[data-toggle="tooltip"][title="verify"]');
  
  // For certificate page, also look for certificate-specific verify buttons
  const certVerifyButtons1 = document.querySelectorAll('a[href*="/certificate/verified/"]');
  const certVerifyButtons2 = document.querySelectorAll('a[href*="/certificate/verify/"]');
  
  // Use the most comprehensive search
  const allPossibleVerifyButtons = new Set();
  
  // Add all found verify buttons to the set
  allVerifyButtons.forEach(btn => allPossibleVerifyButtons.add(btn));
  altVerifyButtons1.forEach(btn => allPossibleVerifyButtons.add(btn));
  altVerifyButtons2.forEach(btn => allPossibleVerifyButtons.add(btn));
  altVerifyButtons3.forEach(btn => allPossibleVerifyButtons.add(btn));
  certVerifyButtons1.forEach(btn => allPossibleVerifyButtons.add(btn));
  certVerifyButtons2.forEach(btn => allPossibleVerifyButtons.add(btn));
  
  allPossibleVerifyButtons.forEach((button, index) => {
    allVerifyLinks.push(button.href);
    totalVerifyButtons++;
  });
  
  // Now look for moharar buttons and categorize
  const allMohararButtons = document.querySelectorAll('a[href*="/certificate/moharar_detail/"]');
  
  // Also look for alternative moharar button patterns
  const altMohararButtons1 = document.querySelectorAll('a[href*="moharar"]');
  const altMohararButtons2 = document.querySelectorAll('a[title*="moharar"]');
  
  // Combine all moharar buttons
  const allPossibleMohararButtons = new Set();
  allMohararButtons.forEach(btn => allPossibleMohararButtons.add(btn));
  altMohararButtons1.forEach(btn => allPossibleMohararButtons.add(btn));
  altMohararButtons2.forEach(btn => allPossibleMohararButtons.add(btn));
  
  allPossibleMohararButtons.forEach((button, index) => {
    // Find the corresponding verify button in the same row
    const row = button.closest('tr');
    if (row) {
      // Look for verify button with multiple selectors
      let verifyButton = row.querySelector('a[href*="/servant/verified/"]') || 
                        row.querySelector('a[href*="/certificate/verified/"]') ||
                        row.querySelector('a[href*="/certificate/verify/"]') ||
                        row.querySelector('a[href*="verified"]') ||
                        row.querySelector('a[title="verify"]');
      
      if (verifyButton) {
        if (button.classList.contains('btn-warning')) {
          warningVerifyLinks.push(verifyButton.href);
        } else if (button.classList.contains('btn-info')) {
          infoVerifyLinks.push(verifyButton.href);
        }
      }
    }
  });
  
  
  // Store the counts globally so they can be accessed by buttons
  window.pkmVerifyCounts = {
    total: totalVerifyButtons,
    all: allVerifyLinks,
    warning: warningVerifyLinks,
    info: infoVerifyLinks
  };
  
  // Function to refresh button text
  function refreshButtonTexts() {
    if (window.pkmBulkOpenVerifyButton) {
      const allUniqueVerifyLinks = [...new Set([...warningVerifyLinks, ...infoVerifyLinks])];
      const buttonText = allUniqueVerifyLinks.length > 0 ? `Open All Verify (${allUniqueVerifyLinks.length})` : 'Open All Verify (No Records Found)';
      window.pkmBulkOpenVerifyButton.textContent = buttonText;
    }
    if (window.pkmBulkOpenWithRecordButton) {
      const buttonText = warningVerifyLinks.length > 0 ? `Open All With Record (${warningVerifyLinks.length})` : 'Open All With Record (No Records Found)';
      window.pkmBulkOpenWithRecordButton.textContent = buttonText;
    }
    if (window.pkmBulkOpenInfoButton) {
      const buttonText = infoVerifyLinks.length > 0 ? `Open All Info (${infoVerifyLinks.length})` : 'Open All Info (No Records Found)';
      window.pkmBulkOpenInfoButton.textContent = buttonText;
    }
  }
  
  // Store the refresh function globally
  window.pkmRefreshButtonTexts = refreshButtonTexts;
  
  // Create a function to just refresh counts without recreating buttons
  function refreshCountsOnly() {
    
    // Re-detect verify buttons
    const allVerifyButtons = document.querySelectorAll('a[href*="/servant/verified/"]');
    const altVerifyButtons1 = document.querySelectorAll('a[href*="verified"]');
    const altVerifyButtons2 = document.querySelectorAll('a[title="verify"]');
    const altVerifyButtons3 = document.querySelectorAll('a[data-toggle="tooltip"][title="verify"]');
    const certVerifyButtons1 = document.querySelectorAll('a[href*="/certificate/verified/"]');
    const certVerifyButtons2 = document.querySelectorAll('a[href*="/certificate/verify/"]');
    
    const allPossibleVerifyButtons = new Set();
    allVerifyButtons.forEach(btn => allPossibleVerifyButtons.add(btn));
    altVerifyButtons1.forEach(btn => allPossibleVerifyButtons.add(btn));
    altVerifyButtons2.forEach(btn => allPossibleVerifyButtons.add(btn));
    altVerifyButtons3.forEach(btn => allPossibleVerifyButtons.add(btn));
    certVerifyButtons1.forEach(btn => allPossibleVerifyButtons.add(btn));
    certVerifyButtons2.forEach(btn => allPossibleVerifyButtons.add(btn));
    
    let newAllVerifyLinks = [];
    let newWarningVerifyLinks = [];
    let newInfoVerifyLinks = [];
    
    allPossibleVerifyButtons.forEach((button) => {
      newAllVerifyLinks.push(button.href);
    });
    
    // Re-detect moharar buttons
    const allMohararButtons = document.querySelectorAll('a[href*="/certificate/moharar_detail/"]');
    const altMohararButtons1 = document.querySelectorAll('a[href*="moharar"]');
    const altMohararButtons2 = document.querySelectorAll('a[title*="moharar"]');
    
    const allPossibleMohararButtons = new Set();
    allMohararButtons.forEach(btn => allPossibleMohararButtons.add(btn));
    altMohararButtons1.forEach(btn => allPossibleMohararButtons.add(btn));
    altMohararButtons2.forEach(btn => allPossibleMohararButtons.add(btn));
    
    allPossibleMohararButtons.forEach((button) => {
      const row = button.closest('tr');
      if (row) {
        let verifyButton = row.querySelector('a[href*="/servant/verified/"]') || 
                          row.querySelector('a[href*="/certificate/verified/"]') ||
                          row.querySelector('a[href*="/certificate/verify/"]') ||
                          row.querySelector('a[href*="verified"]') ||
                          row.querySelector('a[title="verify"]');
        if (verifyButton) {
          if (button.classList.contains('btn-warning')) {
            newWarningVerifyLinks.push(verifyButton.href);
          } else if (button.classList.contains('btn-info')) {
            newInfoVerifyLinks.push(verifyButton.href);
          }
        }
      }
    });
    
    
    // Update button texts
    if (window.pkmBulkOpenVerifyButton) {
      const allUniqueVerifyLinks = [...new Set([...newWarningVerifyLinks, ...newInfoVerifyLinks])];
      const buttonText = allUniqueVerifyLinks.length > 0 ? `Open All Verify (${allUniqueVerifyLinks.length})` : 'Open All Verify (No Records Found)';
      window.pkmBulkOpenVerifyButton.textContent = buttonText;
    }
    if (window.pkmBulkOpenWithRecordButton) {
      const buttonText = newWarningVerifyLinks.length > 0 ? `Open All With Record (${newWarningVerifyLinks.length})` : 'Open All With Record (No Records Found)';
      window.pkmBulkOpenWithRecordButton.textContent = buttonText;
    }
    if (window.pkmBulkOpenInfoButton) {
      const buttonText = newInfoVerifyLinks.length > 0 ? `Open All Info (${newInfoVerifyLinks.length})` : 'Open All Info (No Records Found)';
      window.pkmBulkOpenInfoButton.textContent = buttonText;
    }
    
    // Update global counts
    window.pkmVerifyCounts = {
      total: newAllVerifyLinks.length,
      all: newAllVerifyLinks,
      warning: newWarningVerifyLinks,
      info: newInfoVerifyLinks
    };
  }
  
  // Store the refresh counts function globally
  window.pkmRefreshCountsOnly = refreshCountsOnly;
  
  // Auto-refresh counts after 2 seconds (only once)
  if (!window.pkmAutoRefreshTriggered) {
    window.pkmAutoRefreshTriggered = true;
    setTimeout(() => {
      if (window.pkmRefreshCountsOnly) {
        window.pkmRefreshCountsOnly();
      }
    }, 1000);
  }
  
  // For certificate page, also listen for DataTable draw events
  if (currentUrl.includes('/certificate/index/inprogress/')) {
    // Wait for DataTable to be initialized and then listen for draw events
    setTimeout(() => {
      const table = $('#table').DataTable();
      if (table) {
        table.on('draw.dt', function() {
          // DataTable has been redrawn, refresh button counts
          setTimeout(() => {
            if (window.pkmRefreshCountsOnly) {
              window.pkmRefreshCountsOnly();
            }
          }, 500); // Small delay to ensure DOM is updated
        });
      }
    }, 2000);
  }
  
  // Always try to add buttons, even if no verify buttons found
  
  // Try multiple methods to find the right place to put buttons
  let buttonContainer;
  let insertionPoint = null;
  
  // Method 1: Look for table wrapper and length dropdown
  const tableWrapper = document.querySelector('#table_wrapper');
  const tableLength = document.querySelector('#table_length');
  if (tableWrapper && tableLength) {
    insertionPoint = tableLength;
  } else if (tableWrapper) {
    insertionPoint = tableWrapper;
  }
  
  // Method 2: Look for table-responsive div
  if (!insertionPoint) {
    const tableResponsive = document.querySelector('.table-responsive');
    if (tableResponsive) {
      insertionPoint = tableResponsive;
    }
  }
  
  // Method 3: Look for panel-body
  if (!insertionPoint) {
    const panelBody = document.querySelector('.panel-body');
    if (panelBody) {
      insertionPoint = panelBody;
    }
  }
  
  // Method 4: Look for the table itself
  if (!insertionPoint) {
    const table = document.querySelector('table[id="table"]');
    if (table) {
      insertionPoint = table;
    }
  }
  
  // Create button container
  buttonContainer = document.createElement('div');
  buttonContainer.id = 'pkm-bulk-buttons-container';
  buttonContainer.style.cssText = `
    width: 100%;
    margin: 10px 0;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  `;
  
  // Add a header to the container
  const containerHeader = document.createElement('div');
  containerHeader.style.cssText = `
    font-weight: bold;
    font-size: 16px;
    color: #333;
    margin-bottom: 10px;
  `;
    containerHeader.textContent = 'PKM Bulk Actions';
    buttonContainer.appendChild(containerHeader);
    
    // Add a refresh button
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '🔄 Refresh Counts';
    refreshButton.style.cssText = `
      display: inline-block;
      margin: 5px 10px 5px 0;
      padding: 5px 10px;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    refreshButton.onclick = function() {
      if (window.pkmRefreshCountsOnly) {
        window.pkmRefreshCountsOnly();
      } else {
        addBulkOpenButton();
      }
    };
    buttonContainer.appendChild(refreshButton);
  
  // Insert the container
  if (insertionPoint) {
    if (insertionPoint === tableLength) {
      // Insert before the table length dropdown
      insertionPoint.parentNode.insertBefore(buttonContainer, insertionPoint);
    } else {
      // Insert at the beginning of the target element
      insertionPoint.insertBefore(buttonContainer, insertionPoint.firstChild);
    }
  } else {
    // Fallback to fixed positioning
    buttonContainer.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      width: 300px;
      padding: 10px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      z-index: 9999;
    `;
    document.body.appendChild(buttonContainer);
  }
  
  
  let buttonTop = 10;
  const buttonSpacing = 50;
  
  // Create the "Open All Verify" button (for /servant/verified/ links) - ALWAYS CREATE
  if (true) { // Always create buttons for testing
    const openAllVerifyButton = document.createElement('button');
    const allUniqueVerifyLinks = [...new Set([...warningVerifyLinks, ...infoVerifyLinks])];
    const buttonText = allUniqueVerifyLinks.length > 0 ? `Open All Verify (${allUniqueVerifyLinks.length})` : 'Open All Verify (No Records Found)';
    openAllVerifyButton.textContent = buttonText;
    
    // Basic button styling
    openAllVerifyButton.style.cssText = `
      display: inline-block;
      margin: 5px 10px 5px 0;
      padding: 10px 15px;
      background-color: #9b59b6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
    `;
    
    // Add hover effect
    openAllVerifyButton.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#8e44ad';
    });
    openAllVerifyButton.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#9b59b6';
    });
    
    // Add click event listener
    openAllVerifyButton.addEventListener('click', function() {
      // Use global counts to get the current links
      const currentCounts = window.pkmVerifyCounts || { warning: [], info: [] };
      const allUniqueVerifyLinks = [...new Set([...currentCounts.warning, ...currentCounts.info])];
      
      if (allUniqueVerifyLinks.length === 0) {
        alert('No verify records found!');
        return;
      }
      
      openAllVerifyLinks(allUniqueVerifyLinks);
    });
    
    // Add to page
    if (buttonContainer.id === 'pkm-bulk-buttons-container') {
      buttonContainer.appendChild(openAllVerifyButton);
    } else {
      document.body.appendChild(openAllVerifyButton);
    }
    window.pkmBulkOpenVerifyButton = openAllVerifyButton;
    buttonTop += buttonSpacing;
  }
  
  // Create the "Open All With Record" button (for warning verify buttons) - ALWAYS CREATE
  if (true) { // Always create buttons for testing
    const openAllWithRecordButton = document.createElement('button');
    const buttonText = warningVerifyLinks.length > 0 ? `Open All With Record (${warningVerifyLinks.length})` : 'Open All With Record (No Records Found)';
    openAllWithRecordButton.textContent = buttonText;
    
    // Basic button styling
    openAllWithRecordButton.style.cssText = `
      display: inline-block;
      margin: 5px 10px 5px 0;
      padding: 10px 15px;
      background-color: #f39c12;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
    `;
    
    // Add hover effect
    openAllWithRecordButton.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#e67e22';
    });
    openAllWithRecordButton.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#f39c12';
    });
    
    // Add click event listener
    openAllWithRecordButton.addEventListener('click', function() {
      // Use global counts to get the current links
      const currentCounts = window.pkmVerifyCounts || { warning: [] };
      
      if (currentCounts.warning.length === 0) {
        alert('No warning records found!');
        return;
      }
      
      openAllVerifyLinks(currentCounts.warning);
    });
    
    // Add to page
    if (buttonContainer.id === 'pkm-bulk-buttons-container') {
      buttonContainer.appendChild(openAllWithRecordButton);
    } else {
      document.body.appendChild(openAllWithRecordButton);
    }
    window.pkmBulkOpenWithRecordButton = openAllWithRecordButton;
    buttonTop += buttonSpacing;
  }
  
  // Create the "Open All Info" button (for info verify buttons) - ALWAYS CREATE
  if (true) { // Always create buttons for testing
    const openAllInfoButton = document.createElement('button');
    const buttonText = infoVerifyLinks.length > 0 ? `Open All Info (${infoVerifyLinks.length})` : 'Open All Info (No Records Found)';
    openAllInfoButton.textContent = buttonText;
    
    // Basic button styling
    openAllInfoButton.style.cssText = `
      display: inline-block;
      margin: 5px 10px 5px 0;
      padding: 10px 15px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      font-size: 14px;
    `;
    
    // Add hover effect
    openAllInfoButton.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#2980b9';
    });
    openAllInfoButton.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#3498db';
    });
    
    // Add click event listener
    openAllInfoButton.addEventListener('click', function() {
      // Use global counts to get the current links
      const currentCounts = window.pkmVerifyCounts || { info: [] };
      
      if (currentCounts.info.length === 0) {
        alert('No info records found!');
        return;
      }
      
      openAllVerifyLinks(currentCounts.info);
    });
    
    // Add to page
    if (buttonContainer.id === 'pkm-bulk-buttons-container') {
      buttonContainer.appendChild(openAllInfoButton);
    } else {
      document.body.appendChild(openAllInfoButton);
    }
    window.pkmBulkOpenInfoButton = openAllInfoButton;
    buttonTop += buttonSpacing;
  }
  
  // Show notification
  if (totalVerifyButtons > 0) {
    let notificationText = `Found ${totalVerifyButtons} verify records`;
    if (warningVerifyLinks.length > 0) notificationText += `, ${warningVerifyLinks.length} with records`;
    if (infoVerifyLinks.length > 0) notificationText += `, ${infoVerifyLinks.length} info records`;
    showNotification(notificationText + '. Use buttons to open specific types.');
  }
}

// Function to open all verify links in new tabs
function openAllVerifyLinks(verifyLinks) {
  
  if (verifyLinks.length === 0) {
    showNotification('No verify links found to open');
    return;
  }
  
  // Show progress notification
  showNotification(`Opening ${verifyLinks.length} records in new tabs...`);
  
  // Open each link in a new tab with a small delay to avoid overwhelming the browser
  verifyLinks.forEach((link, index) => {
    setTimeout(() => {
      try {
        console.log(`PKM Data Entry Assistant: Opening tab ${index + 1}/${verifyLinks.length}:`, link);
        window.open(link, '_blank');
      } catch (e) {
        console.error('PKM Data Entry Assistant: Error opening link:', e);
      }
    }, index * 200); // 200ms delay between each tab opening
  });
  
  // Show completion notification after all tabs are opened
  setTimeout(() => {
    showNotification(`Successfully opened ${verifyLinks.length} records in new tabs!`);
  }, verifyLinks.length * 200 + 500);
}

// Function to refresh bulk open button (useful when table content changes)
function refreshBulkOpenButton() {
  console.log('PKM Data Entry Assistant: Refreshing bulk open buttons');
  
  // Remove existing button container if it exists
  const existingContainer = document.getElementById('pkm-bulk-buttons-container');
  if (existingContainer) {
    console.log('PKM Data Entry Assistant: Removing existing button container');
    existingContainer.parentNode.removeChild(existingContainer);
  }
  
  // Remove existing buttons if they exist (fallback for fixed positioning)
  if (window.pkmBulkOpenVerifyButton && window.pkmBulkOpenVerifyButton.parentNode) {
    window.pkmBulkOpenVerifyButton.parentNode.removeChild(window.pkmBulkOpenVerifyButton);
    window.pkmBulkOpenVerifyButton = null;
  }
  
  if (window.pkmBulkOpenWithRecordButton && window.pkmBulkOpenWithRecordButton.parentNode) {
    window.pkmBulkOpenWithRecordButton.parentNode.removeChild(window.pkmBulkOpenWithRecordButton);
    window.pkmBulkOpenWithRecordButton = null;
  }
  
  if (window.pkmBulkOpenInfoButton && window.pkmBulkOpenInfoButton.parentNode) {
    window.pkmBulkOpenInfoButton.parentNode.removeChild(window.pkmBulkOpenInfoButton);
    window.pkmBulkOpenInfoButton = null;
  }
  
  // Add new buttons
  addBulkOpenButton();
}

// Function to add a simple test button to verify extension is working
function addTestButton() {
  console.log('PKM Data Entry Assistant: Adding test button');
  
  // Remove existing test button if it exists
  const existingTestButton = document.getElementById('pkm-test-button');
  if (existingTestButton) {
    existingTestButton.remove();
  }
  
  // Create a simple test button
  const testButton = document.createElement('button');
  testButton.id = 'pkm-test-button';
  testButton.textContent = 'PKM Extension Active';
  testButton.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    padding: 8px 12px;
    background-color: #27ae60;
    color: white;
    border: none;
    border-radius: 4px;
    z-index: 99999;
    cursor: pointer;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  
  testButton.addEventListener('click', function() {
    console.log('PKM Data Entry Assistant: Test button clicked');
    
    // Check for tables
    const tables = document.querySelectorAll('table[id="table"]');
    const panelBody = document.querySelector('.panel-body.list-group');
    
    let message = 'PKM Extension is working!\n\n';
    message += 'Tables found: ' + tables.length + '\n';
    message += 'Panel-body found: ' + (panelBody ? 'Yes' : 'No') + '\n';
    message += 'Current URL: ' + window.location.href + '\n\n';
    
    if (tables.length > 0) {
      let verifyCount = 0;
      let warningCount = 0;
      let infoCount = 0;
      
      tables.forEach(table => {
        verifyCount += table.querySelectorAll('a[href*="/servant/verified/"]').length;
        const mohararButtons = table.querySelectorAll('a[href*="/certificate/moharar_detail/"]');
        mohararButtons.forEach(button => {
          if (button.classList.contains('btn-warning')) warningCount++;
          else if (button.classList.contains('btn-info')) infoCount++;
        });
      });
      
      message += 'Verify buttons: ' + verifyCount + '\n';
      message += 'Warning buttons: ' + warningCount + '\n';
      message += 'Info buttons: ' + infoCount + '\n';
    }
    
    alert(message);
  });
  
  document.body.appendChild(testButton);
  console.log('PKM Data Entry Assistant: Test button added');
}