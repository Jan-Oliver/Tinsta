document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const languageSelect = document.getElementById('language');
    const notifyCreatorBtn = document.getElementById('notifyCreator');
    const notifyInfluencerBtn = document.getElementById('notifyInfluencer');
    const statusElement = document.getElementById('status');
  
    // Load saved data if any
    chrome.storage.local.get(['lastNameUsed', 'lastEmailUsed', 'lastLanguageUsed'], function(result) {
      if (result.lastNameUsed) nameInput.value = result.lastNameUsed;
      if (result.lastEmailUsed) emailInput.value = result.lastEmailUsed;
      if (result.lastLanguageUsed) languageSelect.value = result.lastLanguageUsed;
      updateUILanguage(result.lastLanguageUsed || 'en');
    });

    // Handle language change
    languageSelect.addEventListener('change', function() {
      const selectedLanguage = this.value;
      updateUILanguage(selectedLanguage);
      saveInputData(nameInput.value.trim(), emailInput.value.trim(), selectedLanguage);
    });
  
    // Create and open influencer email
    notifyInfluencerBtn.addEventListener('click', function() {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const language = languageSelect.value;
      
      if (!name || !email) {
        showStatus(getTranslation('fillFields', language), 'error');
        return;
      }
  
      if (!isValidEmail(email)) {
        showStatus(getTranslation('validEmail', language), 'error');
        return;
      }
  
      // Save the data for next time
      saveInputData(name, email, language);
  
      // Get email template based on language
      const { subject, body } = getEmailTemplate('influencer', name, language);
  
      // Open Gmail compose with the email info
      openGmailCompose(email, subject, body);
      
      showStatus(getTranslation('openingGmail', language), 'success');
    });
  
    // Create and open creator email
    notifyCreatorBtn.addEventListener('click', function() {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const language = languageSelect.value;
      
      if (!name || !email) {
        showStatus(getTranslation('fillFields', language), 'error');
        return;
      }
  
      if (!isValidEmail(email)) {
        showStatus(getTranslation('validEmail', language), 'error');
        return;
      }
  
      // Save the data for next time
      saveInputData(name, email, language);
  
      // Get email template based on language
      const { subject, body } = getEmailTemplate('creator', name, language);
  
      // Open Gmail compose with the email info
      openGmailCompose(email, subject, body);
      
      showStatus(getTranslation('openingGmail', language), 'success');
    });
  
    // Function to open Gmail compose
    function openGmailCompose(to, subject, body) {
      const bodyWithBreaks = body.replace(/\n/g, '%0A');
      const gmailUrl = `https://mail.google.com/mail/?view=cm&ui=2&tf=0&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${bodyWithBreaks}`;
      chrome.tabs.create({ url: gmailUrl });
    }
  
    // Function to save input data to Chrome storage
    function saveInputData(name, email, language) {
      chrome.storage.local.set({
        'lastNameUsed': name,
        'lastEmailUsed': email,
        'lastLanguageUsed': language
      });
    }
  
    // Function to validate email format
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    // Function to show status messages
    function showStatus(message, type) {
      statusElement.textContent = message;
      statusElement.className = 'status ' + type;
      
      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'status';
      }, 3000);
    }

    // Function to update UI language
    function updateUILanguage(language) {
      document.querySelectorAll('[data-en]').forEach(element => {
        element.textContent = element.getAttribute(`data-${language}`);
      });
    }

    // Function to get translations
    function getTranslation(key, language) {
      const translations = {
        fillFields: {
          en: 'Please fill in both name and email fields.',
          de: 'Bitte füllen Sie beide Felder aus.'
        },
        validEmail: {
          en: 'Please enter a valid email address.',
          de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
        },
        openingGmail: {
          en: 'Opening Gmail with email...',
          de: 'Öffne Gmail mit E-Mail...'
        }
      };
      return translations[key][language] || translations[key]['en'];
    }

    // Function to get email templates
    function getEmailTemplate(type, name, language) {
      if (type === 'influencer') {
        if (language === 'de') {
          return {
            subject: "Bezahlte Promotion?",
            body: [
              `Hallo ${name},`,
              "",
              "unsere App verwandelt 10 Selfies in professionelle Bewerbungsfotos mit KI (ganz ohne Fotograf).",
              "",
              "Wir finden, es könnte sehr gut zu deiner Zielgruppe passen und würden uns sehr über eine Kooperation freuen.",
              "",
              "Falls du Interesse hast, lass uns doch gerne einen kurzen Call vereinbaren?",
              "",
              "Beste Grüße,",
              "Olli"
            ].join("\n")
          };
        } else {
          return {
            subject: "Paid Promotion?",
            body: [
              `Hey ${name},`,
              "",
              "Our app turns 10 selfies into professional headshots with AI (no photographer required and 90% cheaper).",
              "",
              "We think it would fit your audience and would love to work with you.",
              "",
              "If you're interested, we'd be happy to schedule a quick call!",
              "",
              "Best,",
              "Olli"
            ].join("\n")
          };
        }
      } else {
        if (language === 'de') {
          return {
            subject: "Bezahlter Creator Job? (bis zu 4.000 €/Monat)",
            body: [
              `Hi ${name},`,
              "",
              "wir suchen gerade nach Verstärkung beim Erstellen von Videos wie auf diesen TikTok Accounts @mona.realfakephoto, @nessi.realfakephotos.",
              "",
              "Unsere App verwandelt 10 Selfies in professionelle Bewerbungsfotos mit KI (ganz ohne Fotograf).",
              "",
              "Hast du Interesse? Teile gerne mehr Details. Denken du wärst ein perfekter Fit!",
              "",
              "Olli :)"
            ].join("\n")
          };
        } else {
          return {
            subject: "Paid Creator Job? (up to $4,000 / month)",
            body: [
              `Hi ${name},`,
              "",
              "Our app turns 10 selfies into professional headshots with AI (no photographer required and 90% cheaper).",
              "",
              "We're looking for support in the US with creating videos like the ones you can see on these TT accounts @mona.realfakephoto, @nessi.realfakephotos.",
              "",
              "We think you'd be a perfect fit and would love to work with you! Let me know if you're interested and I'll share more details!",
              "",
              "Best,",
              "Olli"
            ].join("\n")
          };
        }
      }
    }
});