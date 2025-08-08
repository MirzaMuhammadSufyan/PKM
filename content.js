// Content script for PKM Data Entry Assistant extension

// Auto-fill CNIC fields when the page loads
console.log('PKM Data Entry Assistant: Content script loaded');

document.addEventListener('DOMContentLoaded', function() {
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
      chrome.storage.local.get({
        cnicFillKey: 'c',
        otpFillKey: '1',
        emailFillKey: 'e',
        autoFillKey: '1'
      }, function(data) {
        console.log('PKM Data Entry Assistant: Pre-initializing keyboard shortcuts with:', data);
        
        // Create a direct event listener for keyboard shortcuts
        const directKeydownListener = function(event) {
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
        };
        
        // Add the direct event listener
        document.addEventListener('keydown', directKeydownListener);
        console.log('PKM Data Entry Assistant: Direct keyboard listener added');
      });
      
      setTimeout(function() {
        console.log('PKM Data Entry Assistant: Initializing extension features');
        // Add auto-fill buttons to the page
        addAutoFillButton();
        addOtpFillButton();
        // Auto-fill fields
        autofillCnicFields();
        // Add keyboard listener for auto-fill
        addKeyboardListener();
        
        // Show notification about keyboard shortcuts
        chrome.storage.local.get({
          cnicFillKey: 'c',
          otpFillKey: '1',
          emailFillKey: 'e',
          autoFillKey: '1'
        }, function(data) {
          showNotification(`Keyboard shortcuts active: ${data.cnicFillKey} for CNIC, ${data.otpFillKey} for OTP, ${data.emailFillKey} for Email, ${data.autoFillKey} for all fields`);
        });
      }, 1000); // Slight delay to ensure form is loaded
    } else {
      console.log('PKM Data Entry Assistant: On PKM site but not on a supported page pattern');
    }
  } else {
    console.log('PKM Data Entry Assistant: Not on PKM website');
  }
});

// Also add a window.onload event handler as a backup
window.onload = function() {
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
};

// Add a direct event listener to the document as a fallback
document.addEventListener('keydown', function(event) {
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
      chrome.storage.local.get({
        cnicFillKey: 'c',
        otpFillKey: '1',
        emailFillKey: 'e',
        autoFillKey: '1'
      }, function(data) {
        // Normalize the configured keys to lowercase for case-insensitive comparison
        const cnicKey = data.cnicFillKey.toLowerCase();
        const otpKey = data.otpFillKey.toLowerCase();
        const emailKey = data.emailFillKey.toLowerCase();
        const combinedKey = data.autoFillKey.toLowerCase();
        
        // Check which key was pressed and trigger the appropriate function
        if (keyPressed === cnicKey || charCode === cnicKey) {
          autofillCnicFields();
        } else if (keyPressed === otpKey || charCode === otpKey) {
          autofillOtpOnly();
        } else if (keyPressed === emailKey || charCode === emailKey) {
          autofillEmailOnly();
        } else if (keyPressed === combinedKey || charCode === combinedKey) {
          autofillCnicFields();
          autofillOtpFields();
          autoselectCriminalRecord();
        }
      });
    }
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
    chrome.storage.local.get({
      cnicFillKey: 'c',
      otpFillKey: '1',
      emailFillKey: 'e',
      autoFillKey: '1'
    }, function(data) {
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
  chrome.storage.local.get({
    cnicFillKey: 'c', // Default to 'c' if not set
    otpFillKey: '1',  // Default to '1' if not set
    emailFillKey: 'e', // Default to 'e' if not set
    autoFillKey: '1'   // Default to '1' if not set (combined key)
  }, function(data) {
    console.log('PKM Data Entry Assistant: Retrieved keys from storage:', 
      JSON.stringify({
        cnicFillKey: data.cnicFillKey,
        otpFillKey: data.otpFillKey,
        emailFillKey: data.emailFillKey,
        autoFillKey: data.autoFillKey
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
      }
    };
    
    // Add the event listener to the document
    document.addEventListener('keydown', window.currentKeydownListener);
    
    // Set the flag to indicate that the keyboard listener has been added
    window.keyboardListenerAdded = true;
    console.log('PKM Data Entry Assistant: Keyboard listener added successfully, flag set');
    
    // Show notification to indicate keyboard shortcuts are active
    showNotification(`Keyboard shortcuts active: ${data.cnicFillKey} for CNIC, ${data.otpFillKey} for OTP, ${data.emailFillKey} for Email, ${data.autoFillKey} for all fields`);
  });
}

// No longer needed - removed selection-related functionality

// Listen for messages from background script and popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('PKM Data Entry Assistant: Message received:', request);
  
  if (request.action === 'enableOtpKeyListener' || request.action === 'enableKeyboardShortcuts') {
    console.log('PKM Data Entry Assistant: Enabling keyboard shortcuts');
    
    // Check if keys were provided in the message
    const cnicKey = request.cnicKey || request.cnicFillKey || 'c';
    const otpKey = request.otpKey || request.otpFillKey || '1';
    const emailKey = request.emailKey || request.emailFillKey || 'e';
    const combinedKey = request.combinedKey || request.autoFillKey || '1';
    
    console.log('PKM Data Entry Assistant: Received keys from settings:', {
      cnicKey,
      otpKey,
      emailKey,
      combinedKey
    });
    
    // Save the keys to storage for future use
    chrome.storage.local.set({
      cnicFillKey: cnicKey,
      otpFillKey: otpKey,
      emailFillKey: emailKey,
      autoFillKey: combinedKey
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
      
      showNotification(`Press: ${cnicKey} for CNIC, ${otpKey} for OTP, ${emailKey} for Email, or ${combinedKey} for all fields`);
      
      // Send response back to confirm listener was enabled
      sendResponse({success: true, message: 'Keyboard shortcuts enabled'});
    });
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
  
  // Return true for all messages to keep the message channel open
  return true;
});

// Function to auto-select "No" in the Criminal Record dropdown
function autoselectCriminalRecord() {
  // Get the Criminal Record dropdown
  const criminalRecordDropdown = document.getElementById('criminal_record');
  
  // Check if the dropdown exists on the page
  if (criminalRecordDropdown) {
    // Get setting from storage
    chrome.storage.local.get({
      autoSelectNoRecord: true // Default to true if not set
    }, function(data) {
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

// Function to auto-fill CNIC fields on the PKM website
function autofillCnicFields() {
  // Get the CNIC input fields from the page
  const constableCnicField = document.getElementById('constable_cnic_txt');
  const mohararCnicField = document.getElementById('moharar_cnic_txt');
  const frontdeskCnicField = document.getElementById('frontdesk_cnic_txt');
  
  // Check if any of the fields exist on the page
  if (constableCnicField || mohararCnicField || frontdeskCnicField) {
    // Get saved CNIC values from storage
    chrome.storage.local.get({
      constableCnic: '',
      mohararCnic: '',
      frontdeskCnic: '',
      autoFillEnabled: true,
      useRealisticInteraction: true // New setting for realistic interaction
    }, function(data) {
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Function to fill a CNIC field and trigger events
        function fillCnicField(field, cnicValue) {
          if (field && cnicValue) {
            if (data.useRealisticInteraction) {
              // Use realistic user interaction simulation
              simulateUserInteraction(field, cnicValue);
            } else {
              // Use the original method
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
        }
      }
    });
  }
}

// Function to trigger data fetching after CNIC is filled
function triggerDataFetching() {
  console.log('PKM Data Entry Assistant: Attempting to trigger data fetching');
  
  // Method 1: Try to find and click any "Search" or "Fetch" buttons
  const searchButtons = document.querySelectorAll('button[type="submit"], input[type="submit"], .search-btn, .fetch-btn, button:contains("Search"), button:contains("Fetch")');
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
  // Get the OTP input fields from the page
  const constableOtpField = document.getElementById('constable_otp_txt');
  const mohararOtpField = document.getElementById('moharar_otp_txt');
  const frontdeskOtpField = document.getElementById('frontdesk_otp_txt');
  
  // Check if any of the fields exist on the page
  if (constableOtpField || mohararOtpField || frontdeskOtpField) {
    // Get saved values from storage
    chrome.storage.local.get({
      constableOtp: '',
      mohararOtp: '',
      frontdeskOtp: '',
      autoFillEnabled: true
    }, function(data) {
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Fill in the OTP fields if they exist and we have values for them
        if (constableOtpField && data.constableOtp) {
          constableOtpField.value = data.constableOtp;
          fieldsFilledCount++;
        }
        
        if (mohararOtpField && data.mohararOtp) {
          mohararOtpField.value = data.mohararOtp;
          fieldsFilledCount++;
        }
        
        if (frontdeskOtpField && data.frontdeskOtp) {
          frontdeskOtpField.value = data.frontdeskOtp;
          fieldsFilledCount++;
        }
        
        // Show notification if any field was filled
        if (fieldsFilledCount > 0) {
          showNotification(`${fieldsFilledCount} OTP fields auto-filled`);
        }
      }
    });
  }
}

// Function to auto-fill Email fields only
function autofillEmailOnly() {
  // Get the email input fields from the page - check both by id and name
  const constableEmailField = document.getElementById('constable_email_txt');
  const mohararEmailField = document.getElementById('moharar_email_txt') || document.querySelector('input[name="moharar_email_txt"]');
  const frontdeskEmailField = document.getElementById('frontdesk_email_txt') || document.querySelector('input[name="frontdesk_email_txt"]');
  
  // Check if any of the fields exist on the page
  if (constableEmailField || mohararEmailField || frontdeskEmailField) {
    // Get saved values from storage
    chrome.storage.local.get({
      sharedEmail: '',
      autoFillEnabled: true
    }, function(data) {
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Fill in the email fields with the shared email if they exist
        if (constableEmailField && data.sharedEmail) {
          constableEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          constableEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          constableEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (mohararEmailField && data.sharedEmail) {
          mohararEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          mohararEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          mohararEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (frontdeskEmailField && data.sharedEmail) {
          frontdeskEmailField.value = data.sharedEmail;
          // Trigger events to ensure the website recognizes the change
          frontdeskEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          frontdeskEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        // Show notification if any field was filled
        if (fieldsFilledCount > 0) {
          showNotification(`${fieldsFilledCount} Email fields auto-filled`);
        }
      }
    });
  }
}

// Function to auto-fill both OTP and Email fields (combined)
function autofillOtpFields() {
  // Get the OTP input fields from the page
  const constableOtpField = document.getElementById('constable_otp_txt');
  const mohararOtpField = document.getElementById('moharar_otp_txt');
  const frontdeskOtpField = document.getElementById('frontdesk_otp_txt');
  
  // Get the email input fields from the page - check both by id and name
  const constableEmailField = document.getElementById('constable_email_txt');
  const mohararEmailField = document.getElementById('moharar_email_txt') || document.querySelector('input[name="moharar_email_txt"]');
  const frontdeskEmailField = document.getElementById('frontdesk_email_txt') || document.querySelector('input[name="frontdesk_email_txt"]');
  
  // Check if any of the fields exist on the page
  if ((constableOtpField || mohararOtpField || frontdeskOtpField) ||
      (constableEmailField || mohararEmailField || frontdeskEmailField)) {
    // Get saved values from storage
    chrome.storage.local.get({
      constableOtp: '',
      mohararOtp: '',
      frontdeskOtp: '',
      sharedEmail: '',
      autoFillEnabled: true
    }, function(data) {
      // Only proceed if auto-fill is enabled
      if (data.autoFillEnabled) {
        let fieldsFilledCount = 0;
        
        // Fill in the OTP fields if they exist and we have values for them
        if (constableOtpField && data.constableOtp) {
          constableOtpField.value = data.constableOtp;
          constableOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          constableOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (mohararOtpField && data.mohararOtp) {
          mohararOtpField.value = data.mohararOtp;
          mohararOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          mohararOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (frontdeskOtpField && data.frontdeskOtp) {
          frontdeskOtpField.value = data.frontdeskOtp;
          frontdeskOtpField.dispatchEvent(new Event('input', { bubbles: true }));
          frontdeskOtpField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        // Fill in the email fields with the shared email if they exist
        if (constableEmailField && data.sharedEmail) {
          constableEmailField.value = data.sharedEmail;
          constableEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          constableEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (mohararEmailField && data.sharedEmail) {
          mohararEmailField.value = data.sharedEmail;
          mohararEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          mohararEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        if (frontdeskEmailField && data.sharedEmail) {
          frontdeskEmailField.value = data.sharedEmail;
          frontdeskEmailField.dispatchEvent(new Event('input', { bubbles: true }));
          frontdeskEmailField.dispatchEvent(new Event('change', { bubbles: true }));
          fieldsFilledCount++;
        }
        
        // Show notification if any field was filled
        if (fieldsFilledCount > 0) {
          showNotification(`${fieldsFilledCount} fields auto-filled`);
        }
      }
    });
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