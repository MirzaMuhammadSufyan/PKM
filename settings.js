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
  
  // Buttons
  const saveCnicSettingsBtn = document.getElementById('saveCnicSettings');
  const saveOtpSettingsBtn = document.getElementById('saveOtpSettings');
  const saveEmailSettingsBtn = document.getElementById('saveEmailSettings');
  const applyOtpBtn = document.getElementById('applyOtp');

  // Load saved settings when the page opens
  loadSettings();

  // Event listeners for save buttons
  saveCnicSettingsBtn.addEventListener('click', saveCnicSettings);
  saveOtpSettingsBtn.addEventListener('click', saveOtpSettings);
  saveEmailSettingsBtn.addEventListener('click', saveEmailSettings);
  
  // Event listener for apply button
  applyOtpBtn.addEventListener('click', function() {
    // Save all settings first
    saveAllSettings();
    saveCnicSettings();
    saveOtpSettings();
    saveEmailSettings();
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        // Send message to content script with all key information
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "enableOtpKeyListener",
          cnicKey: cnicFillKeySelect.value,
          otpKey: otpFillKeySelect.value,
          emailKey: emailFillKeySelect.value,
          combinedKey: autoFillKeySelect.value,
          autoSelectNoRecord: autoSelectNoRecordCheckbox.checked
        });
      }
    });
    
    // Show a more comprehensive message about all keyboard shortcuts
    showMessage(`Keyboard shortcuts enabled: Press ${cnicFillKeySelect.value} for CNIC, ${otpFillKeySelect.value} for OTP, ${emailFillKeySelect.value} for Email, or ${autoFillKeySelect.value} for all fields`);
  });

  // Functions
  function loadSettings() {
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
      // Email default (shared for all)
      sharedEmail: '',
      emailFillKey: 'e',
      // Other settings
      autoFillEnabled: true,
      autoFillKey: '1',
      autoSelectNoRecord: true,
      useRealisticInteraction: true, // New setting for realistic interaction
      criminalRecordKey: 'r' // New setting for criminal record key
    }, function(data) {
      // Set CNIC values
      constableCnicInput.value = data.constableCnic;
      mohararCnicInput.value = data.mohararCnic;
      frontdeskCnicInput.value = data.frontdeskCnic;
      cnicFillKeySelect.value = data.cnicFillKey;
      
      // Set OTP values
      constableOtpInput.value = data.constableOtp;
      mohararOtpInput.value = data.mohararOtp;
      frontdeskOtpInput.value = data.frontdeskOtp;
      otpFillKeySelect.value = data.otpFillKey;
      
      // Set Email value (shared for all)
      sharedEmailInput.value = data.sharedEmail;
      emailFillKeySelect.value = data.emailFillKey;
      
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
      showMessage('Invalid Constable OTP format. Please enter a 4-digit number.');
      return;
    }
    if (!validateOtpFormat(mohararOtpInput.value) && mohararOtpInput.value !== '') {
      showMessage('Invalid Moharar OTP format. Please enter a 4-digit number.');
      return;
    }
    if (!validateOtpFormat(frontdeskOtpInput.value) && frontdeskOtpInput.value !== '') {
      showMessage('Invalid Front Desk OTP format. Please enter a 4-digit number.');
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
  
  // Function to save all settings at once (used by Apply button)
  function saveAllSettings() {
    // Get the realistic interaction checkbox
    const realisticInteractionCheckbox = document.getElementById('useRealisticInteraction');
    
    // Save to storage
    chrome.storage.local.set({
      // Save other settings
      autoFillEnabled: autoFillEnabledCheckbox.checked,
      autoFillKey: autoFillKeySelect.value,
      autoSelectNoRecord: autoSelectNoRecordCheckbox.checked,
      useRealisticInteraction: realisticInteractionCheckbox ? realisticInteractionCheckbox.checked : true,
      criminalRecordKey: criminalRecordKeySelect.value // Save criminal record key
    }, function() {
      showMessage('Auto-fill settings applied successfully!');
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