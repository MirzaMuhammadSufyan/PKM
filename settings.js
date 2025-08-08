document.addEventListener('DOMContentLoaded', function() {
  // CNIC input elements
  const constableCnicInput = document.getElementById('constableCnic');
  const mohararCnicInput = document.getElementById('mohararCnic');
  const frontdeskCnicInput = document.getElementById('frontdeskCnic');
  const cnicFillKeySelect = document.getElementById('cnicFillKey');
  
  // OTP input elements
  const constableOtpInput = document.getElementById('constableOtp');
  const mohararOtpInput = document.getElementById('mohararOtp');
  const frontdeskOtpInput = document.getElementById('frontdeskOtp');
  const otpFillKeySelect = document.getElementById('otpFillKey');
  
  // Email input element (shared for all)
  const sharedEmailInput = document.getElementById('sharedEmail');
  const emailFillKeySelect = document.getElementById('emailFillKey');
  
  // Other controls
  const autoFillEnabledCheckbox = document.getElementById('autoFillEnabled');
  const autoFillKeySelect = document.getElementById('autoFillKey');
  const autoSelectNoRecordCheckbox = document.getElementById('autoSelectNoRecord');
  const criminalRecordKeySelect = document.getElementById('criminalRecordKey');
  const sendOtpKeySelect = document.getElementById('sendOtpKey');
  const verifyOtpKeySelect = document.getElementById('verifyOtpKey');
  const saveRecordKeySelect = document.getElementById('saveRecordKey');
  const autoSelectFileCheckbox = document.getElementById('autoSelectFile');
  const autoSelectFileKeySelect = document.getElementById('autoSelectFileKey');
  
  // Buttons
  const saveCnicSettingsBtn = document.getElementById('saveCnicSettings');
  const saveOtpSettingsBtn = document.getElementById('saveOtpSettings');
  const saveEmailSettingsBtn = document.getElementById('saveEmailSettings');
  const saveCombinedSettingsBtn = document.getElementById('saveCombinedSettings');
  const saveCriminalRecordSettingsBtn = document.getElementById('saveCriminalRecordSettings');
  const saveSendOtpSettingsBtn = document.getElementById('saveSendOtpSettings');
  const saveVerifyOtpSettingsBtn = document.getElementById('saveVerifyOtpSettings');
  const saveRecordSettingsBtn = document.getElementById('saveRecordSettings');
  const saveDataFetchingSettingsBtn = document.getElementById('saveDataFetchingSettings');
  const saveFileSelectionSettingsBtn = document.getElementById('saveFileSelectionSettings');
  const applyOtpBtn = document.getElementById('applyOtp');
  const resetHotkeysBtn = document.getElementById('resetHotkeys');

  // Load saved settings when the page opens
  loadSettings();

  // Event listeners for save buttons
  saveCnicSettingsBtn.addEventListener('click', saveCnicSettings);
  saveOtpSettingsBtn.addEventListener('click', saveOtpSettings);
  saveEmailSettingsBtn.addEventListener('click', saveEmailSettings);
  saveCombinedSettingsBtn.addEventListener('click', saveCombinedSettings);
  saveCriminalRecordSettingsBtn.addEventListener('click', saveCriminalRecordSettings);
  saveSendOtpSettingsBtn.addEventListener('click', saveSendOtpSettings);
  saveVerifyOtpSettingsBtn.addEventListener('click', saveVerifyOtpSettings);
  saveRecordSettingsBtn.addEventListener('click', saveRecordSettings);
  saveDataFetchingSettingsBtn.addEventListener('click', saveDataFetchingSettings);
  saveFileSelectionSettingsBtn.addEventListener('click', saveFileSelectionSettings);
  
  // Event listener for reset hotkeys button
  resetHotkeysBtn.addEventListener('click', function() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to reset all hotkeys to their default values?\n\nThis will change:\n1 - CNIC fields\n2 - Email fields\n3 - Send OTPs\n4 - OTP fields\n5 - Verify OTPs\n6 - Criminal Record\n7 - File Input\n8 - Save Record\n0 - All fields combined')) {
      resetHotkeys();
    }
  });
  
  // Event listener for apply button
  applyOtpBtn.addEventListener('click', function() {
    // Save all settings first
    saveCnicSettings();
    saveEmailSettings();
    saveSendOtpSettings();
    saveOtpSettings();
    saveVerifyOtpSettings();
    saveCriminalRecordSettings();
    saveFileSelectionSettings();
    saveRecordSettings();
    saveCombinedSettings();
    saveDataFetchingSettings();
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        // Send message to content script with all key information
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "enableOtpKeyListener",
          cnicKey: cnicFillKeySelect.value,
          emailKey: emailFillKeySelect.value,
          sendOtpKey: sendOtpKeySelect.value,
          otpKey: otpFillKeySelect.value,
          verifyOtpKey: verifyOtpKeySelect.value,
          criminalRecordKey: criminalRecordKeySelect.value,
          autoSelectFileKey: autoSelectFileKeySelect.value,
          saveRecordKey: saveRecordKeySelect.value,
          combinedKey: autoFillKeySelect.value,
          autoSelectNoRecord: autoSelectNoRecordCheckbox.checked
        });
      }
    });
    
    // Show a more comprehensive message about all keyboard shortcuts
    showMessage(`Keyboard shortcuts enabled: Press ${cnicFillKeySelect.value} for CNIC, ${emailFillKeySelect.value} for Email, ${sendOtpKeySelect.value} for Send OTP, ${otpFillKeySelect.value} for OTP, ${verifyOtpKeySelect.value} for Verify OTP, ${criminalRecordKeySelect.value} for Criminal Record, ${autoSelectFileKeySelect.value} for File Input, ${saveRecordKeySelect.value} for Save Record, ${autoFillKeySelect.value} for All Fields`);
  });

  // Functions
  function loadSettings() {
    chrome.storage.local.get({
      // CNIC defaults
      constableCnic: '',
      mohararCnic: '',
      frontdeskCnic: '',
      cnicFillKey: '1',
      // Email default (shared for all)
      sharedEmail: '',
      emailFillKey: '2',
      // Send OTP defaults
      sendOtpKey: '3',
      // OTP defaults
      constableOtp: '',
      mohararOtp: '',
      frontdeskOtp: '',
      otpFillKey: '4',
      // Verify OTP defaults
      verifyOtpKey: '5',
      // Criminal Record defaults
      autoSelectNoRecord: true,
      criminalRecordKey: '6',
      // File Selection defaults
      autoSelectFile: true,
      autoSelectFileKey: '7',
      // Save Record defaults
      saveRecordKey: '8',
      // Combined defaults
      autoFillEnabled: true,
      autoFillKey: '0',
      // Data Fetching defaults
      useRealisticInteraction: true
    }, function(data) {
      // Set CNIC values
      constableCnicInput.value = data.constableCnic;
      mohararCnicInput.value = data.mohararCnic;
      frontdeskCnicInput.value = data.frontdeskCnic;
      cnicFillKeySelect.value = data.cnicFillKey;
      
      // Set Email value (shared for all)
      sharedEmailInput.value = data.sharedEmail;
      emailFillKeySelect.value = data.emailFillKey;
      
      // Set OTP values
      constableOtpInput.value = data.constableOtp;
      mohararOtpInput.value = data.mohararOtp;
      frontdeskOtpInput.value = data.frontdeskOtp;
      otpFillKeySelect.value = data.otpFillKey;
      
      // Set other settings
      autoFillEnabledCheckbox.checked = data.autoFillEnabled;
      autoFillKeySelect.value = data.autoFillKey;
      autoSelectNoRecordCheckbox.checked = data.autoSelectNoRecord;
      
      // Set realistic interaction setting if the checkbox exists
      const realisticInteractionCheckbox = document.getElementById('useRealisticInteraction');
      if (realisticInteractionCheckbox) {
        realisticInteractionCheckbox.checked = data.useRealisticInteraction;
      }

      // Set criminal record key if the select element exists
      const criminalRecordSelect = document.getElementById('criminalRecordKey');
      if (criminalRecordSelect) {
        criminalRecordSelect.value = data.criminalRecordKey;
      }
      
      // Set new hotkey values if the select elements exist
      if (sendOtpKeySelect) {
        sendOtpKeySelect.value = data.sendOtpKey;
      }
      if (verifyOtpKeySelect) {
        verifyOtpKeySelect.value = data.verifyOtpKey;
      }
      if (saveRecordKeySelect) {
        saveRecordKeySelect.value = data.saveRecordKey;
      }
      
      // Set file selection settings if the elements exist
      if (autoSelectFileCheckbox) {
        autoSelectFileCheckbox.checked = data.autoSelectFile;
      }
      if (autoSelectFileKeySelect) {
        autoSelectFileKeySelect.value = data.autoSelectFileKey;
      }
    });
  }

  function saveCnicSettings() {
    // Validate CNIC format (optional)
    if (!validateCnicFormat(constableCnicInput.value) && constableCnicInput.value !== '') {
      showMessage('Invalid Constable CNIC format. Please use format: 12345-1234567-1');
      return;
    }
    if (!validateCnicFormat(mohararCnicInput.value) && mohararCnicInput.value !== '') {
      showMessage('Invalid Moharar CNIC format. Please use format: 12345-1234567-1');
      return;
    }
    if (!validateCnicFormat(frontdeskCnicInput.value) && frontdeskCnicInput.value !== '') {
      showMessage('Invalid Front Desk CNIC format. Please use format: 12345-1234567-1');
      return;
    }

    // Save to storage
    chrome.storage.local.set({
      // Save CNIC values
      constableCnic: constableCnicInput.value,
      mohararCnic: mohararCnicInput.value,
      frontdeskCnic: frontdeskCnicInput.value,
      cnicFillKey: cnicFillKeySelect.value
    }, function() {
      showMessage('CNIC settings saved successfully!');
    });
  }
  
  function saveOtpSettings() {
    // Validate OTP format
    if (!validateOtpFormat(constableOtpInput.value) && constableOtpInput.value !== '') {
      showMessage('Invalid Constable OTP format. OTP should be 4 digits.');
      return;
    }
    if (!validateOtpFormat(mohararOtpInput.value) && mohararOtpInput.value !== '') {
      showMessage('Invalid Moharar OTP format. OTP should be 4 digits.');
      return;
    }
    if (!validateOtpFormat(frontdeskOtpInput.value) && frontdeskOtpInput.value !== '') {
      showMessage('Invalid Front Desk OTP format. OTP should be 4 digits.');
      return;
    }
    
    // Save to storage
    chrome.storage.local.set({
      // Save OTP values
      constableOtp: constableOtpInput.value,
      mohararOtp: mohararOtpInput.value,
      frontdeskOtp: frontdeskOtpInput.value,
      otpFillKey: otpFillKeySelect.value
    }, function() {
      showMessage('OTP settings saved successfully!');
    });
  }
  
  function saveSendOtpSettings() {
    // Save to storage
    chrome.storage.local.set({
      // Save Send OTP settings
      sendOtpKey: sendOtpKeySelect.value
    }, function() {
      showMessage('Send OTP settings saved successfully!');
    });
  }
  
  function saveVerifyOtpSettings() {
    // Save to storage
    chrome.storage.local.set({
      // Save Verify OTP settings
      verifyOtpKey: verifyOtpKeySelect.value
    }, function() {
      showMessage('Verify OTP settings saved successfully!');
    });
  }
  
  function saveEmailSettings() {
    // Validate Email format
    if (!validateEmailFormat(sharedEmailInput.value) && sharedEmailInput.value !== '') {
      showMessage('Invalid Email format.');
      return;
    }

    // Save to storage
    chrome.storage.local.set({
      // Save Email value (shared for all)
      sharedEmail: sharedEmailInput.value,
      emailFillKey: emailFillKeySelect.value
    }, function() {
      showMessage('Email settings saved successfully!');
    });
  }
  
  function saveCombinedSettings() {
    // Save to storage
    chrome.storage.local.set({
      // Save combined settings
      autoFillEnabled: autoFillEnabledCheckbox.checked,
      autoFillKey: autoFillKeySelect.value
    }, function() {
      showMessage('Combined settings saved successfully!');
    });
  }
  
  function saveCriminalRecordSettings() {
    // Save to storage
    chrome.storage.local.set({
      // Save criminal record settings
      autoSelectNoRecord: autoSelectNoRecordCheckbox.checked,
      criminalRecordKey: criminalRecordKeySelect.value
    }, function() {
      showMessage('Criminal Record settings saved successfully!');
    });
  }
  
  function saveOtpActionSettings() {
    // Save to storage
    chrome.storage.local.set({
      // Save OTP action settings
      sendOtpKey: sendOtpKeySelect.value,
      verifyOtpKey: verifyOtpKeySelect.value
    }, function() {
      showMessage('OTP Action settings saved successfully!');
    });
  }
  
  function saveRecordSettings() {
    // Save to storage
    chrome.storage.local.set({
      // Save record settings
      saveRecordKey: saveRecordKeySelect.value
    }, function() {
      showMessage('Save Record settings saved successfully!');
    });
  }
  
  function saveDataFetchingSettings() {
    // Get the realistic interaction checkbox
    const realisticInteractionCheckbox = document.getElementById('useRealisticInteraction');
    
    // Save to storage
    chrome.storage.local.set({
      // Save data fetching settings
      useRealisticInteraction: realisticInteractionCheckbox ? realisticInteractionCheckbox.checked : true
    }, function() {
      showMessage('Data Fetching settings saved successfully!');
    });
  }
  
  function saveFileSelectionSettings() {
    // Save to storage
    chrome.storage.local.set({
      // Save file selection settings
      autoSelectFile: autoSelectFileCheckbox.checked,
      autoSelectFileKey: autoSelectFileKeySelect.value
    }, function() {
      showMessage('File Selection settings saved successfully!');
    });
  }
  
  function resetHotkeys() {
    // Set all hotkeys to default values
    cnicFillKeySelect.value = '1';
    emailFillKeySelect.value = '2';
    sendOtpKeySelect.value = '3';
    otpFillKeySelect.value = '4';
    verifyOtpKeySelect.value = '5';
    criminalRecordKeySelect.value = '6';
    autoSelectFileKeySelect.value = '7';
    saveRecordKeySelect.value = '8';
    autoFillKeySelect.value = '0';
    
    // Save the reset values to storage
    chrome.storage.local.set({
      cnicFillKey: '1',
      emailFillKey: '2',
      sendOtpKey: '3',
      otpFillKey: '4',
      verifyOtpKey: '5',
      criminalRecordKey: '6',
      autoSelectFileKey: '7',
      saveRecordKey: '8',
      autoFillKey: '0'
    }, function() {
      // Show success message with the new default values
      const message = `Hotkeys reset to defaults:\n` +
                     `1 - CNIC fields\n` +
                     `2 - Email fields\n` +
                     `3 - Send OTPs\n` +
                     `4 - OTP fields\n` +
                     `5 - Verify OTPs\n` +
                     `6 - Criminal Record\n` +
                     `7 - File Input\n` +
                     `8 - Save Record\n` +
                     `0 - All fields combined`;
      
      showMessage(message);
      
      // Apply the reset settings immediately
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          // Send message to content script with reset key information
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "enableOtpKeyListener",
            cnicKey: '1',
            emailKey: '2',
            sendOtpKey: '3',
            otpKey: '4',
            verifyOtpKey: '5',
            criminalRecordKey: '6',
            autoSelectFileKey: '7',
            saveRecordKey: '8',
            combinedKey: '0',
            autoSelectNoRecord: autoSelectNoRecordCheckbox.checked
          });
        }
      });
    });
  }

  function validateCnicFormat(cnic) {
    // Accept both with and without dashes: 12345-1234567-1 or 1234512345671
    // This is a basic validation, you might want to enhance it
    const withDashes = /^\d{5}-\d{7}-\d{1}$/;
    const withoutDashes = /^\d{13}$/;
    return withDashes.test(cnic) || withoutDashes.test(cnic);
  }
  
  function validateOtpFormat(otp) {
    // OTP should be a 4-digit number
    const otpRegex = /^\d{4}$/;
    return otpRegex.test(otp);
  }
  
  function validateEmailFormat(email) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showMessage(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
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
});