// Application state
let currentCharacter = 'harvey';
let currentMode = 'chat';
let debateHistory = [];

// User information
let userInfo = {
  name: localStorage.getItem('userName') || '',
};

let themeSettings = {
    darkMode: localStorage.getItem('darkMode') === 'true' || false,
  };
  

// Character descriptions for API prompts
const characterDescriptions = {
  harvey: "You are Harvey Specter from the TV show Suits. You're confident, witty, and the best closer in New York City. You value loyalty above all else, use intimidation tactics when necessary, and always find a way to win. You speak confidently and often use clever metaphors. You never show weakness and always maintain an aura of control.",
  walter: "You are Walter White from Breaking Bad. You're calculating, prideful, and extremely intelligent. You were once a mild-mannered chemistry teacher who transformed into a ruthless drug kingpin. You justify your actions as being for your family, but deep down you do it because you're good at it and it makes you feel alive. You speak precisely and often use chemistry metaphors.",
  tony: "You are Tony Stark from the Marvel films. You're a genius, billionaire, playboy, philanthropist. You're extremely confident, sarcastic, and quick-witted. You use humor to deflect emotional vulnerability. You speak rapidly, use modern slang, and make pop culture references. You're always the smartest person in the room and never hesitate to remind people of that fact.",
  tyrion: "You are Tyrion Lannister from Game of Thrones. You're witty, cynical, and highly intelligent despite being underestimated due to your stature. You use your wit as both a shield and a weapon. You enjoy wine and carnal pleasures. You speak eloquently, often using clever wordplay, and you frequently offer profound insights about human nature and power.",
  lucifer: "You are Lucifer Morningstar from the TV show Lucifer. You're charming, hedonistic, and the literal devil who left Hell to run a nightclub in Los Angeles. You have the power to draw out people's deepest desires. You speak with a British accent, are obsessed with your own pleasure, and often make sexual innuendos. You're witty, self-centered, and have daddy issues with God. You're brutally honest and pride yourself on never lying.",
  professor: "You are The Professor from Money Heist (La Casa de Papel). You're meticulous, brilliant, and always several steps ahead of everyone else. You're the mastermind behind the greatest heists in history. You speak calmly and precisely, often explaining complex plans in simple terms. You're socially awkward but charismatic when needed. You believe in your cause and have a strong moral code despite being a criminal. You prefer to avoid violence and improvise when plans go awry."
};
const characterImages = {
    harvey: "assets/images/harvey.jpg",
    walter: "assets/images/walter.jpg",
    tony: "assets/images/tony.jpg",
    tyrion: "assets/images/tyrion.jpg",
    lucifer: "assets/images/lucifer.jpg",
    professor: "assets/images/professor.jpg"
  };
// Character background images (for enhanced UI)
const characterBackgrounds = {
    harvey: "assets/images/harvey-bg.jpg",  // NYC skyline
    walter: "assets/images/walter-bg.jpeg",  // Desert landscape
    tony: "assets/images/tony-bg.jpg",      // Tech/futuristic
    tyrion: "assets/images/tyrion-bg.jpg",  // Medieval castle
    lucifer: "assets/images/lucifer-bg.jpg", // Nightclub/LA
    professor: "assets/images/professor-bg.jpg" // Bank/heist scene
  };
// Additional character info for enhanced profiles
const characterInfo = {
    harvey: {
      fullName: "Harvey Specter",
      title: "Senior Partner at Pearson Hardman",
      quote: "I don't have dreams, I have goals."
    },
    walter: {
      fullName: "Walter White",
      title: "Chemistry Teacher / Entrepreneur",
      quote: "I am the one who knocks."
    },
    tony: {
      fullName: "Tony Stark",
      title: "Genius, Billionaire, Philanthropist",
      quote: "Part of the journey is the end."
    },
    tyrion: {
      fullName: "Tyrion Lannister",
      title: "Hand of the Queen",
      quote: "I drink and I know things."
    },
    lucifer: {
      fullName: "Lucifer Morningstar",
      title: "Owner of Lux, Former Lord of Hell",
      quote: "What is it you truly desire?"
    },
    professor: {
      fullName: "Sergio Marquina",
      title: "The Professor, Mastermind",
      quote: "In this world, everything is governed by balance."
    }
  };
  
  
// DOM elements
document.addEventListener('DOMContentLoaded', () => {
  const characterItems = document.querySelectorAll('.character-item');
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const exampleQuestions = document.querySelectorAll('.example-question');
  const chatMode = document.getElementById('chatMode');
  const battleMode = document.getElementById('battleMode');
  const voiceMode = document.getElementById('voiceMode');
  const settingsButton = document.getElementById('settingsButton');
  const battleContainer = document.getElementById('battleContainer');

  // Check if user info is set
  checkUserInfo();
  
  // Check if API key is set when the app loads
  checkApiKey();

  // Initialize the app
  initializeApp();

  updateCharacterItems();
  
  // Function to check if user info is set
  function checkUserInfo() {
    if (!userInfo.name) {
      showWelcomeScreen();
    }
  }
  
  function showWelcomeScreen() {
    // Create the welcome screen
    const welcomeScreen = document.createElement('div');
    welcomeScreen.className = 'welcome-screen';
    welcomeScreen.innerHTML = `
      <div class="welcome-content">
        <h1>Welcome to Chatracter</h1>
        <p>Chat with your favorite characters from TV shows and movies!</p>
        
        <div class="welcome-form">
          <div class="form-group">
            <label for="userName">What's your name?</label>
            <input type="text" id="userName" placeholder="Enter your name" autofocus>
          </div>
          
          <button id="startAppBtn" class="welcome-button">Start Chatting</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(welcomeScreen);
    
    // Add event listener to the start button
    document.getElementById('startAppBtn').addEventListener('click', () => {
      const name = document.getElementById('userName').value.trim();
      if (name) {
        userInfo.name = name;
        localStorage.setItem('userName', name);
        document.body.removeChild(welcomeScreen);
      } else {
        // Shake the input to indicate it's required
        const input = document.getElementById('userName');
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
    });
    
    // Add styles for the welcome screen
    const style = document.createElement('style');
    style.textContent = `
      .welcome-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--background);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }
      
      .welcome-content {
        background-color: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
        width: 90%;
      }
      
      .welcome-content h1 {
        color: var(--accent);
        margin-bottom: 0.5rem;
      }
      
      .welcome-content p {
        color: #666;
        margin-bottom: 2rem;
      }
      
      .welcome-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        text-align: left;
        gap: 0.5rem;
      }
      
      .form-group label {
        font-weight: 500;
      }
      
      .form-group input {
        padding: 0.75rem;
        border: 1px solid var(--secondary);
        border-radius: 8px;
        font-size: 1rem;
      }
      
      .welcome-button {
        background-color: var(--accent);
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 500;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .welcome-button:hover {
        background-color: #2a78f0;
      }
      
      .shake {
        animation: shake 0.5s;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }

  function checkApiKey() {
    const apiKey = localStorage.getItem('openaiApiKey');
    if (!apiKey) {
      return false;
    }
    return true;
  }
  // Add this function to your JavaScript to enhance the character header
function enhanceCharacterHeader() {
    // Find all character header elements
    const characterHeaders = document.querySelectorAll('.character-header');
    
    // Update each header with the enhanced HTML structure
    characterHeaders.forEach(header => {
      // Get the current text
      const currentText = header.textContent;
      
      // Wrap the text in a span for additional styling
      header.innerHTML = `<span>${currentText}</span>`;
    });
  }
  
  function initializeApp() {
    // Set event listeners
    characterItems.forEach(item => {
      const character = item.dataset.character;
      // Update HTML to use real images
      item.innerHTML = `
        <div class="character-avatar">
          <img src="${characterImages[character]}" alt="${characterInfo[character].fullName}">
        </div>
        <div class="character-info">
          <div class="character-name">${characterInfo[character].fullName}</div>
          <div class="character-title">${characterInfo[character].title}</div>
        </div>
      `;
      item.addEventListener('click', () => selectCharacter(character));
    });
  

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', handleKeyPress);

    exampleQuestions.forEach(question => {
      question.addEventListener('click', () => askQuestion(question.textContent));
    });

    chatMode.addEventListener('click', () => switchMode('chat'));
    battleMode.addEventListener('click', () => switchMode('battle'));
    //voiceMode.addEventListener('click', () => switchMode('voice'));
    settingsButton.addEventListener('click', openSettings);
    
    // Add Dark Mode Toggle to the features row
    addDarkModeToggle();

    // Enhance the character header
    enhanceCharacterHeader();
    
    // Apply dark mode if it was enabled previously
    if (themeSettings.darkMode) {
        document.documentElement.classList.add('dark-mode');
    }

    // Set initial character
    selectCharacter('harvey');

    // Update character items with profile buttons
  updateCharacterItems();
  }

  function selectCharacter(character) {
    currentCharacter = character;
    
    // Update UI
    characterItems.forEach(item => {
      if (item.dataset.character === character) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Clear chat messages and reset to intro
    chatMessages.innerHTML = '';
    showIntro();
    
    // Update the theme
    updateTheme(character);

      // Enhance text appearance
    enhanceTextAppearance();
  }
  // Add this new function to create the dark mode toggle
function addDarkModeToggle() {
    // Create the dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'feature-button dark-mode-toggle';
    darkModeToggle.id = 'darkModeToggle';
    darkModeToggle.innerHTML = themeSettings.darkMode 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 1V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 21V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' 
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0794 20.7461C8.41079 20.3741 6.88282 19.5345 5.67419 18.3258C4.46555 17.1172 3.62596 15.5892 3.25399 13.9206C2.88202 12.252 2.9927 10.5121 3.57346 8.9043C4.15423 7.29651 5.18085 5.88737 6.53324 4.84175C7.88562 3.79614 9.50782 3.15731 11.21 3C9.36006 5.34317 8.65909 8.39309 9.27145 11.3177C9.8838 14.2423 11.7368 16.7388 14.35 18.17C15.3767 18.6682 16.4885 18.9822 17.63 19.1C18.4498 19.1822 19.2724 19.1647 20.09 19.05C20.5793 18.9814 21.0607 18.8628 21.53 18.7C21.3335 18.4204 21.1513 18.1325 20.98 17.84C19.9815 16.1621 19.5921 14.1428 19.8864 12.1685C20.1807 10.1943 21.1459 8.38933 22.62 7.07C22.42 8.97 21.83 10.83 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  
    // Add tooltip text
    darkModeToggle.title = themeSettings.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
  
    // Add click event listener
    darkModeToggle.addEventListener('click', toggleDarkMode);
  
    // Add it to the features row
    const featuresRow = document.querySelector('.features-row');
    // Insert before the settings button
    featuresRow.insertBefore(darkModeToggle, settingsButton);
  
    // Add some CSS for the dark mode toggle
    const style = document.createElement('style');
    style.textContent = `
      .dark-mode-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .dark-mode-toggle svg {
        margin-right: 0.25rem;
      }
      
      /* Dark Mode Transition */
      body, header, .character-select, .chat-container, .message-content, .character-item,
      .chat-input-wrapper, .features-row, .battle-container, .debate-interface,
      .character-profile-content, .welcome-content, .settings-content {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }
  // Add this new function to toggle dark mode
function toggleDarkMode() {
    // Toggle dark mode state
    themeSettings.darkMode = !themeSettings.darkMode;
    
    // Save to localStorage
    localStorage.setItem('darkMode', themeSettings.darkMode);
    
    // Update the root class
    if (themeSettings.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Update the toggle button appearance
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.innerHTML = themeSettings.darkMode 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 1V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 21V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' 
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0794 20.7461C8.41079 20.3741 6.88282 19.5345 5.67419 18.3258C4.46555 17.1172 3.62596 15.5892 3.25399 13.9206C2.88202 12.252 2.9927 10.5121 3.57346 8.9043C4.15423 7.29651 5.18085 5.88737 6.53324 4.84175C7.88562 3.79614 9.50782 3.15731 11.21 3C9.36006 5.34317 8.65909 8.39309 9.27145 11.3177C9.8838 14.2423 11.7368 16.7388 14.35 18.17C15.3767 18.6682 16.4885 18.9822 17.63 19.1C18.4498 19.1822 19.2724 19.1647 20.09 19.05C20.5793 18.9814 21.0607 18.8628 21.53 18.7C21.3335 18.4204 21.1513 18.1325 20.98 17.84C19.9815 16.1621 19.5921 14.1428 19.8864 12.1685C20.1807 10.1943 21.1459 8.38933 22.62 7.07C22.42 8.97 21.83 10.83 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      
      darkModeToggle.title = themeSettings.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
    }
    
    // Also update the theme based on current character
    updateTheme(currentCharacter);

    // Enhance text appearance
    enhanceTextAppearance();

  }
  function updateTheme(character) {
    // Set the theme attribute on the body element
    document.body.setAttribute('data-theme', character);
    
    // Update the header colors
    const header = document.querySelector('header');
    const appTitle = document.querySelector('.app-title');
    const appSubtitle = document.querySelector('.app-subtitle');
    
    // Add subtle animations
    header.style.transition = 'all 0.5s ease';
    appTitle.style.transition = 'all 0.5s ease';
    appSubtitle.style.transition = 'all 0.5s ease';
    
    // Character-specific animations or effects
    switch (character) {
      case 'harvey':
        // Subtle scale animation on header
        header.animate([
          { transform: 'scale(0.98)' },
          { transform: 'scale(1)' }
        ], {
          duration: 400,
          easing: 'ease-out'
        });
        
        // Update app subtitle
        appSubtitle.textContent = "Master the art of closing";
        break;
        
      case 'walter':
        // Chemistry-inspired header animation
        header.animate([
          { filter: 'brightness(0.95)' },
          { filter: 'brightness(1.05)' },
          { filter: 'brightness(1)' }
        ], {
          duration: 600,
          easing: 'ease-in-out'
        });
        
        // Update app subtitle
        appSubtitle.textContent = "The one who knocks";
        break;
        
      case 'tony':
        // Tech-inspired glow effect
        header.animate([
          { boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)' },
          { boxShadow: '0 0 25px rgba(244, 67, 54, 0.5)' },
          { boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)' }
        ], {
          duration: 800,
          easing: 'ease-in-out'
        });
        
        // Update app subtitle
        appSubtitle.textContent = "Genius. Billionaire. Philanthropist.";
        break;
        
      case 'tyrion':
        // Subtle royal animation
        header.animate([
          { backgroundPosition: '0% 0%' },
          { backgroundPosition: '100% 0%' }
        ], {
          duration: 800,
          easing: 'ease-in-out'
        });
        
        // Update app subtitle
        appSubtitle.textContent = "I drink and I know things";
        break;
        
      case 'lucifer':
        // Devilish animation
        header.animate([
          { filter: 'contrast(1)' },
          { filter: 'contrast(1.1)' },
          { filter: 'contrast(1)' }
        ], {
          duration: 700,
          easing: 'ease-in-out'
        });
        
        // Update app subtitle
        appSubtitle.textContent = "What do you truly desire?";
        break;
        
      case 'professor':
        // Calculated precision animation
        header.animate([
          { backgroundSize: '400% 100%' },
          { backgroundSize: '100% 100%' }
        ], {
          duration: 500,
          easing: 'ease-out'
        });
        
        // Update app subtitle
        appSubtitle.textContent = "Everything according to plan";
        break;
        
      default:
        // Default subtitle
        appSubtitle.textContent = "Chat with your favorite characters";
    }
  }
  function enhanceTextAppearance() {
    // Get current character and mode
    const character = currentCharacter;
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    
    // Apply character-specific text enhancements
    const messages = document.querySelectorAll('.message.character .message-content');
    messages.forEach(message => {
      // Add a subtle gradient to character messages
      if (isDarkMode) {
        message.style.background = `linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(0,0,0,0.3) 100%)`;
      } else {
        message.style.background = `linear-gradient(135deg, rgba(var(--accent-rgb), 0.1) 0%, var(--chat-bubble) 100%)`;
      }
      
      // Add a subtle border highlight
      message.style.borderLeft = `3px solid var(--accent)`;
    });
    
    // Add character name to user messages when appropriate
    const userMessages = document.querySelectorAll('.message.user .message-content');
    userMessages.forEach(message => {
      // Only process messages that don't already have a character reference
      if (!message.dataset.processed) {
        // Get character name based on current character
        const characterName = getCharacterName(character);
        
        // Parse the message text
        let messageText = message.textContent;
        
        // If the message doesn't start with the character's name, add it
        if (!messageText.startsWith(characterName) && !messageText.includes(`${characterName},`)) {
          message.innerHTML = `<span class="message-recipient" style="color: var(--text-character-primary); font-weight: 500;">${characterName}, </span>${messageText}`;
        }
        
        // Mark as processed
        message.dataset.processed = 'true';
      }
    });
    
    // Enhance the chat intro text with dynamic effects
    const chatIntro = document.querySelector('.chat-intro-text');
    if (chatIntro) {
      // Add text shadow based on theme
      if (isDarkMode) {
        chatIntro.style.textShadow = `0 2px 10px rgba(var(--accent-rgb), 0.4)`;
      } else {
        chatIntro.style.textShadow = `0 1px 5px rgba(var(--accent-rgb), 0.2)`;
      }
      
      // Add gradient text effect for character name in the intro
      const characterName = getCharacterName(character);
      if (chatIntro.textContent.includes(characterName)) {
        const newText = chatIntro.textContent.replace(
          characterName, 
          `<span class="character-highlight">${characterName}</span>`
        );
        chatIntro.innerHTML = newText;
        
        // Add styles for the highlighted character name
        const style = document.createElement('style');
        style.textContent = `
          .character-highlight {
            background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: 700;
            padding: 0 2px;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
  

  function showIntro() {
    const introText = getIntroText(currentCharacter);
    chatMessages.innerHTML = `
      <div class="chat-intro">
        <p class="chat-intro-text">${introText}</p>
        <div class="example-questions">
          <span class="example-question">How would you negotiate a salary?</span>
          <span class="example-question">What's your secret to success?</span>
          <span class="example-question">How do I deal with difficult people?</span>
        </div>
      </div>
    `;

    // Reattach event listeners to new example questions
    document.querySelectorAll('.example-question').forEach(question => {
      question.addEventListener('click', () => askQuestion(question.textContent));
    });
  }

  function getIntroText(character) {
    // If we have a user name, personalize the intro
    const userName = userInfo.name ? `, ${userInfo.name}` : '';
    
    const introTexts = {
      harvey: `Need legal advice? Life advice${userName}? Or just want to learn how to be the best closer in the city? I'm all ears.`,
      walter: `I am the one who knocks${userName}. What do you want to know?`,
      tony: `Genius, billionaire, playboy, philanthropist at your service${userName}. What can I do for you?`,
      tyrion: `I drink and I know things${userName}. What would you like to know?`,
      lucifer: `Hello darling${userName}. Tell me, what is it you truly desire?`,
      professor: `Before we begin${userName}, I need to know if you're ready to be part of something extraordinary.`
    };
    return introTexts[character] || `How can I help you today${userName}?`;
  }

  async function askQuestion(question) {
    addMessage(question, 'user');
    showTypingIndicator();
    
    try {
      const response = await getOpenAIResponse(question);
      hideTypingIndicator();
      addMessage(response, 'character');
    } catch (error) {
      console.error("Error getting response:", error);
      hideTypingIndicator();
      addMessage("I'm sorry, I couldn't process that request right now. Please try again later.", 'character');
    }
    
    scrollToBottom();
  }

  async function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      addMessage(message, 'user');
      messageInput.value = '';
      showTypingIndicator();
      
      try {
        const response = await getOpenAIResponse(message);
        hideTypingIndicator();
        addMessage(response, 'character');
      } catch (error) {
        console.error("Error getting response:", error);
        hideTypingIndicator();
        addMessage("I'm sorry, I couldn't process that request right now. Please try again later.", 'character');
      }
      
      scrollToBottom();
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    // Add special styling for character messages in dark mode
  if (sender === 'character' && document.documentElement.classList.contains('dark-mode')) {
    messageDiv.innerHTML = `
      <div class="message-content" style="background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(0,0,0,0.3) 100%); border-left: 3px solid var(--accent);">
        ${text}
      </div>
    `;
  } else if (sender === 'user') {
    // For user messages, prepend character name if not present
    const characterName = getCharacterName(currentCharacter);
    if (!text.startsWith(characterName) && !text.includes(`${characterName},`)) {
      messageDiv.innerHTML = `
        <div class="message-content" data-processed="true">
          <span class="message-recipient" style="color: var(--text-character-primary); font-weight: 500;">${characterName}, </span>${text}
        </div>
      `;
    } else {
      messageDiv.innerHTML = `<div class="message-content" data-processed="true">${text}</div>`;
    }
  } else {
    messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
  }
    
    // Remove intro if it exists
    const intro = document.querySelector('.chat-intro');
    if (intro) {
      chatMessages.removeChild(intro);
    }

    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      chatMessages.removeChild(indicator);
    }
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Implementation for OpenAI API
  async function getOpenAIResponse(message) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          character: currentCharacter,
          userName: userInfo.name || '',
          mode: currentMode
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        
        if (response.status === 500 && errorData.error === 'API key not configured') {
          return "The API key hasn't been configured on the server. Please contact the administrator.";
        } else if (response.status === 429) {
          return "I've hit my rate limit. Please try again in a moment.";
        } else {
          return "I encountered an error. Please try again later.";
        }
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("API call failed:", error);
      return "I couldn't connect to my brain right now. Please check your internet connection and try again.";
    }
  }
  
  function getFallbackResponse(message) {
    // This is a fallback when not using the actual API
    const fallbackResponses = {
      harvey: `Look ${userInfo.name ? userInfo.name : ''}, I don't have time for hypotheticals. If you want results, you come to me with something real. That's how this works.`,
      walter: `I'm not sure I understand what you're asking. Chemistry is about precision, and your question lacks it. Perhaps you could be more specific?`,
      tony: `Interesting question${userInfo.name ? ', ' + userInfo.name : ''}. I'd build an AI to figure that out for me while I'm out saving the world. Or having a drink. Probably both.`,
      tyrion: `That's a curious question. I'd need more wine to properly answer it. Perhaps we could discuss this further over a flagon or three?`,
      lucifer: `Oh darling${userInfo.name ? ' ' + userInfo.name : ''}, that's quite the question. Tell me, what do you truly desire from my answer? The truth might surprise you.`,
      professor: `Interesting question. I would need to analyze all variables before providing a definitive answer. Everything must be calculated precisely.`
    };
    
    return fallbackResponses[currentCharacter] || `I'm not sure how to respond to that${userInfo.name ? ', ' + userInfo.name : ''}.`;
  }

  async function switchMode(mode) {
    currentMode = mode;
    
    // Update UI
    chatMode.classList.remove('active');
    battleMode.classList.remove('active');
    voiceMode.classList.remove('active');
    
    if (mode === 'chat') {
      chatMode.classList.add('active');
      document.querySelector('.chat-container').style.display = 'flex';
      battleContainer.style.display = 'none';
    } else if (mode === 'battle') {
      battleMode.classList.add('active');
      document.querySelector('.chat-container').style.display = 'none';
      battleContainer.style.display = 'block'; // Changed from 'grid' to 'block'
      initBattleMode();
    } 
    /*else if (mode === 'voice') {
      voiceMode.classList.add('active');
      alert('Voice mode is coming soon!');
      // Reset to chat mode for now
      switchMode('chat');
    }
    */
  }

  function initBattleMode() {
    // Clear previous battle content
    battleContainer.innerHTML = '';
    
    // Create the debate interface
    const debateInterface = document.createElement('div');
    debateInterface.className = 'debate-interface';
    debateInterface.innerHTML = `
      <div class="debate-setup">
        <h2>Interactive Character Debate</h2>
        <div class="debate-topic-container">
          <label for="debateTopic">Debate Topic:</label>
          <input type="text" id="debateTopic" placeholder="What should the characters debate about?">
          <button id="startDebateBtn" class="primary-button">Start Debate</button>
        </div>
      </div>
      
      <div class="debate-area" style="display: none;">
        <div class="debate-header">
          <h3 id="currentTopic"></h3>
          <button id="resetDebateBtn" class="secondary-button">Reset Debate</button>
        </div>
        
        <div class="debate-messages" id="debateMessages"></div>
        
        <div class="character-response-selector">
          <p>Who should respond next?</p>
          <div class="response-characters">
            <div class="char-select-row">
              <button class="char-select-btn" data-character="harvey">Harvey Specter</button>
              <button class="char-select-btn" data-character="walter">Walter White</button>
              <button class="char-select-btn" data-character="tony">Tony Stark</button>
            </div>
            <div class="char-select-row">
              <button class="char-select-btn" data-character="tyrion">Tyrion Lannister</button>
              <button class="char-select-btn" data-character="lucifer">Lucifer Morningstar</button>
              <button class="char-select-btn" data-character="professor">The Professor</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    battleContainer.appendChild(debateInterface);
    
    // Add event listeners
    document.getElementById('startDebateBtn').addEventListener('click', startDebate);
    document.getElementById('resetDebateBtn').addEventListener('click', resetDebate);
    
    // Add event listeners to character buttons
    document.querySelectorAll('.char-select-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const character = e.target.dataset.character;
        getNextResponse(character);
      });
    });
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .debate-interface {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }
      
      .debate-topic-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      
      .debate-topic-container input {
        padding: 0.75rem;
        border: 1px solid var(--secondary);
        border-radius: 8px;
        font-size: 1rem;
      }
      
      .primary-button, .secondary-button {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .primary-button {
        background-color: var(--accent);
        color: white;
      }
      
      .primary-button:hover {
        background-color: #2a78f0;
      }
      
      .secondary-button {
        background-color: var(--secondary);
        color: var(--text);
      }
      
      .secondary-button:hover {
        background-color: #d5d5d5;
      }
      
      .debate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--secondary);
      }
      
      .debate-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 0;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .character-response-selector {
        background-color: var(--character-panel);
        padding: 1rem;
        border-radius: 8px;
      }
      
      .character-response-selector p {
        margin-bottom: 0.75rem;
        font-weight: 500;
      }
      
      .response-characters {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .char-select-row {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .char-select-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--secondary);
        background-color: white;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .char-select-btn:hover {
        background-color: var(--hover);
      }
      
      .debate-message {
        display: flex;
        margin-bottom: 1rem;
      }
      
      .debate-message .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 0.75rem;
        flex-shrink: 0;
      }
      
      .debate-message .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .debate-message .content {
        flex: 1;
        background-color: var(--chat-bubble);
        padding: 0.75rem 1rem;
        border-radius: 12px;
        position: relative;
      }
      
      .debate-message .content::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 12px;
        width: 12px;
        height: 12px;
        background-color: var(--chat-bubble);
        transform: rotate(45deg);
      }
      
      .debate-message .character-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .debate-message .message-text {
        line-height: 1.4;
      }
      
      @media (max-width: 768px) {
        .char-select-row {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Reset debate history
    debateHistory = [];
  }

  async function startDebate() {
    const topic = document.getElementById('debateTopic').value.trim();
    if (!topic) {
      alert('Please enter a debate topic');
      return;
    }
    
    // Show loading state
    const startBtn = document.getElementById('startDebateBtn');
    const originalText = startBtn.textContent;
    startBtn.textContent = 'Starting...';
    startBtn.disabled = true;
    
    // Display the debate area
    document.querySelector('.debate-setup').style.display = 'none';
    document.querySelector('.debate-area').style.display = 'block';
    document.getElementById('currentTopic').textContent = `Topic: ${topic}`;
    
    // Reset debate history
    debateHistory = [];
    document.getElementById('debateMessages').innerHTML = '';
    
    // Let Harvey start the debate
    await getNextResponse('harvey', true);
    
    // Reset button state
    startBtn.textContent = originalText;
    startBtn.disabled = false;
  }

  function resetDebate() {
    // Hide debate area and show setup
    document.querySelector('.debate-area').style.display = 'none';
    document.querySelector('.debate-setup').style.display = 'block';
    
    // Clear the topic input
    document.getElementById('debateTopic').value = '';
    
    // Reset debate history
    debateHistory = [];
    document.getElementById('debateMessages').innerHTML = '';
  }

  async function getNextResponse(character, isFirst = false) {
    // Disable all character buttons
    document.querySelectorAll('.char-select-btn').forEach(btn => {
      btn.disabled = true;
    });
    
    const debateMessages = document.getElementById('debateMessages');
    const topic = document.getElementById('currentTopic').textContent.replace('Topic: ', '');
    
    // Create loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'debate-message';
    loadingMessage.innerHTML = `
      <div class="avatar">
        <img src="${characterImages[character]}" alt="${getCharacterName(character)}">
      </div>
      <div class="content">
        <div class="character-name">${getCharacterName(character)}</div>
        <div class="message-text typing-indicator"><span></span><span></span><span></span></div>
      </div>
    `;
    debateMessages.appendChild(loadingMessage);
    debateMessages.scrollTop = debateMessages.scrollHeight;
    
    try {
      // Call the serverless function instead of OpenAI directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'battle',
          character: character,
          topic: topic,
          debateHistory: debateHistory,
          userName: userInfo.name || ''
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      
      // Remove loading message
      debateMessages.removeChild(loadingMessage);
      
      // Add the actual message
      const messageElement = document.createElement('div');
      messageElement.className = 'debate-message';
      messageElement.innerHTML = `
        <div class="avatar">
          <img src="${characterImages[character]}" alt="${getCharacterName(character)}">
        </div>
        <div class="content">
          <div class="character-name">${getCharacterName(character)}</div>
          <div class="message-text">${data.response}</div>
        </div>
      `;
      debateMessages.appendChild(messageElement);
      
      // Add to debate history
      debateHistory.push({
        character: character,
        response: data.response
      });
      
      // Scroll to the bottom
      debateMessages.scrollTop = debateMessages.scrollHeight;
    } catch (error) {
      console.error('Failed to get response:', error);
      // Remove loading message
      debateMessages.removeChild(loadingMessage);
      
      // Add error message
      const errorElement = document.createElement('div');
      errorElement.className = 'debate-message error';
      errorElement.innerHTML = `
        <div class="avatar">
          <img src="${characterImages[character]}" alt="${getCharacterName(character)}">
        </div>
        <div class="content">
          <div class="character-name">${getCharacterName(character)}</div>
          <div class="message-text">Error: Could not get response. Please try again.</div>
        </div>
      `;
      debateMessages.appendChild(errorElement);
    }
    
    // Re-enable all character buttons
    document.querySelectorAll('.char-select-btn').forEach(btn => {
      btn.disabled = false;
    });
  }

  function getCharacterName(character) {
    const names = {
      harvey: "Harvey Specter",
      walter: "Walter White",
      tony: "Tony Stark",
      tyrion: "Tyrion Lannister",
      lucifer: "Lucifer Morningstar",
      professor: "The Professor"
    };
    return names[character] || character;
  }

// Update the getCharacterColor function to use a fallback if needed
function getCharacterColor(character) {
    const colors = {
      harvey: "1a73e8",
      walter: "388e3c",
      tony: "f44336",
      tyrion: "7b1fa2",
      lucifer: "c62828",
      professor: "0277bd"
    };
    return colors[character] || "666666";
  }
  // Update the create battle card function to use real images
function createDebateCard(data, question) {
    const { character, initialResponse, debateResponse, respondingTo } = data;
    
    const respondingToName = getCharacterName(respondingTo);
    
    const card = document.createElement('div');
    card.className = 'battle-card';
    card.innerHTML = `
      <div class="battle-header">
        <div class="battle-avatar">
          <img src="${characterImages[character]}" alt="${getCharacterName(character)}">
        </div>
        <div class="battle-name">${getCharacterName(character)}</div>
      </div>
      <div class="battle-response"><strong>Initial take:</strong> ${initialResponse}</div>
      <div class="battle-debate">
        <div class="debate-target">Responding to ${respondingToName}:</div>
        <div class="debate-response">${debateResponse}</div>
      </div>
      <div class="battle-actions">
        <button class="vote-button" data-character="${character}">Vote (0)</button>
        <button class="share-button">Share</button>
      </div>
    `;
    
    battleContainer.appendChild(card);
    
    // Add event listener to vote button
    card.querySelector('.vote-button').addEventListener('click', handleVote);
    card.querySelector('.share-button').addEventListener('click', () => shareResponse(character, question, initialResponse + "\n\nResponding to " + respondingToName + ": " + debateResponse));
  }
  
  function openSettings() {
    // Create a modal for API key settings
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
      <div class="settings-content">
        <h2>Settings</h2>
        <div class="settings-form">
          <label for="apiKey">OpenAI API Key:</label>
          <input type="password" id="apiKey" placeholder="Enter your OpenAI API key" value="${localStorage.getItem('openaiApiKey') || ''}">
          <p class="settings-help">Your API key is stored locally in your browser and never sent to our servers.</p>
          
          <div class="form-group">
            <label for="updateName">Your Name:</label>
            <input type="text" id="updateName" placeholder="Update your name" value="${userInfo.name || ''}">
          </div>
          
          <div class="settings-actions">
            <button id="saveSettings">Save</button>
            <button id="cancelSettings">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('saveSettings').addEventListener('click', () => {
      const apiKey = document.getElementById('apiKey').value.trim();
      if (apiKey) {
        localStorage.setItem('openaiApiKey', apiKey);
        
        // Remove notification if it exists
        const notification = document.querySelector('.api-key-notification');
        if (notification) {
          document.body.removeChild(notification);
        }
      }
      
      // Update user name if changed
      const newName = document.getElementById('updateName').value.trim();
      if (newName && newName !== userInfo.name) {
        userInfo.name = newName;
        localStorage.setItem('userName', newName);
        
        // Refresh intro if in chat mode
        if (currentMode === 'chat') {
          showIntro();
        }
      }
      
      alert('Settings saved successfully!');
      document.body.removeChild(modal);
    });
    
    document.getElementById('cancelSettings').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
      .settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .settings-content {
        background-color: white;
        padding: 2rem;
        border-radius: 12px;
        width: 450px;
        max-width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }
      
      .settings-content h2 {
        color: var(--accent);
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }
      
      .settings-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      
      .settings-form label {
        font-weight: 500;
        margin-bottom: 0.25rem;
        display: block;
      }
      
      .settings-form input {
        padding: 0.75rem;
        border: 1px solid var(--secondary);
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s ease;
      }
      
      .settings-form input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
        outline: none;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
      }
      
      .settings-help {
        font-size: 0.85rem;
        color: #666;
        margin-top: 0.25rem;
      }
      
      .settings-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      
      .settings-actions button {
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .settings-actions button:first-child {
        background-color: var(--accent);
        color: white;
      }
      
      .settings-actions button:first-child:hover {
        background-color: #2a78f0;
      }
      
      .settings-actions button:last-child {
        background-color: var(--secondary);
      }
      
      .settings-actions button:last-child:hover {
        background-color: #d5d5d5;
      }
      
      .battle-loading {
        grid-column: 1 / -1;
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: #666;
      }
      
      .battle-error {
        grid-column: 1 / -1;
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: #ff0000;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Create a new function to show character profile
// Replace your current showCharacterProfile function with this updated version
function showCharacterProfile(character) {
    // Create a modal for the character profile
    const modal = document.createElement('div');
    modal.className = 'character-profile-modal';
    
    // Build the HTML for the profile content
    const headerBg = characterBackgrounds[character] || `https://placehold.co/1200x600/${getCharacterColor(character)}/ffffff?text=Background`;
    
    modal.innerHTML = `
      <div class="character-profile-content">
        <div class="profile-header" style="background-image: url(${headerBg});">
          <div class="profile-avatar">
            <img src="${characterImages[character]}" alt="${characterInfo[character].fullName}">
          </div>
        </div>
        <div class="profile-info">
          <h2>${characterInfo[character].fullName}</h2>
          <p class="profile-title">${characterInfo[character].title}</p>
          
          <div class="profile-quote">
            <blockquote>"${characterInfo[character].quote}"</blockquote>
          </div>
          
          <div class="profile-description">
            ${getCharacterDescription(character)}
          </div>
        </div>
        <button class="close-profile-btn">Close</button>
      </div>
    `;
    
    // Add animation for the modal
    modal.style.opacity = '0';
    document.body.appendChild(modal);
    
    // Use a delay to trigger animation
    setTimeout(() => {
      modal.style.opacity = '1';
      modal.style.transition = 'opacity 0.3s ease';
    }, 50);
    
    // Add event listener to close button
    modal.querySelector('.close-profile-btn').addEventListener('click', () => {
      // Animate the closing
      modal.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      }
    });
    
    // Add escape key listener
    document.addEventListener('keydown', function escapeClose(e) {
      if (e.key === 'Escape') {
        modal.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(modal);
          document.removeEventListener('keydown', escapeClose);
        }, 300);
      }
    });
  
    // Add styles for the profile modal
    const style = document.createElement('style');
    style.textContent = `
      .character-profile-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }
      
      .character-profile-content {
        background-color: white;
        border-radius: 12px;
        overflow: hidden;
        width: 500px;
        max-width: 90%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: zoomIn 0.3s ease;
      }
      
      .profile-header {
        height: 200px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      
      .profile-avatar {
        position: absolute;
        bottom: -50px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .profile-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .profile-info {
        padding: 60px 2rem 2rem;
        text-align: center;
        overflow-y: auto;
      }
      
      .profile-info h2 {
        color: var(--accent);
        margin-bottom: 0.5rem;
      }
      
      .profile-title {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
      }
      
      .profile-quote {
        margin: 1.5rem 0;
        font-style: italic;
        color: #444;
      }
      
      .profile-description {
        text-align: left;
        line-height: 1.6;
        color: #333;
      }
      
      .close-profile-btn {
        margin: 1rem auto;
        padding: 0.75rem 1.5rem;
        background-color: var(--accent);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .close-profile-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  function getCharacterDescription(character) {
    const descriptions = {
      harvey: `Harvey Specter is New York City's best closer and senior partner at Pearson Hardman (later Pearson Specter Litt). Known for his razor-sharp suits and even sharper wit, Harvey wins cases through a combination of legal brilliance, psychological manipulation, and unmatched confidence. He has a photographic memory and an encyclopedic knowledge of the law. Despite his tough exterior, Harvey is deeply loyal to those he cares about.`,
      walter: `Walter White is a brilliant chemist who became a high school chemistry teacher in Albuquerque, New Mexico. After being diagnosed with lung cancer, he turned to manufacturing methamphetamine to secure his family's financial future. Under the alias "Heisenberg," Walter transformed from a mild-mannered teacher into a ruthless drug kingpin. His journey shows how pride and power can corrupt even the most ordinary person.`,
      tony: `Tony Stark is a genius inventor, billionaire industrialist, and the armored superhero known as Iron Man. After being captured by terrorists, he built the first Iron Man suit to escape and later refined his technology to protect the world. Tony is known for his sarcastic humor, playboy lifestyle, and constant technological innovation. Despite his arrogance, he's willing to sacrifice everything to save others.`,
      tyrion: `Tyrion Lannister is the youngest son of Tywin Lannister and one of the most intelligent characters in Westeros. Despite facing discrimination for his dwarfism, Tyrion uses his wit, education, and understanding of human nature to navigate the dangerous political landscape. He served as Hand of the King and later Hand of the Queen, using his strategic mind to advise rulers. Tyrion is an avid reader with a weakness for wine and women.`,
      lucifer: `Lucifer Morningstar is the Devil who abandoned Hell to run a nightclub called Lux in Los Angeles. Charming and hedonistic, he has the power to draw out people's deepest desires. Lucifer works as a civilian consultant with the LAPD, finding justice for victims and punishing wrongdoers. Despite his devilish origins, he struggles with human emotions and his complex relationship with his father, God.`,
      professor: `Sergio Marquina, known as The Professor, is the mastermind behind the Royal Mint of Spain heist and the Bank of Spain heist. A brilliant strategist with an IQ of 152, he plans for every contingency and stays several steps ahead of the authorities. Despite his criminal activities, he adheres to a moral code that includes avoiding violence whenever possible. The Professor is socially awkward but capable of transforming himself to fit any role needed for his plans.`
    };
    
    return descriptions[character] || "No description available.";
  }
  
  // Update your character item creation to add profile button
  function updateCharacterItems() {
    characterItems.forEach(item => {
      const character = item.dataset.character;
      
      // Add a "View Profile" button
      const profileButton = document.createElement('button');
      profileButton.className = 'view-profile-btn';
      profileButton.textContent = 'View Profile';
      profileButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering character selection
        showCharacterProfile(character);
      });
      
      item.appendChild(profileButton);
    });
  }

  function loadApiKey() {
    // In a real environment setup, you would use something like:
    // const apiKey = process.env.OPENAI_API_KEY;
    
    // For development with pure HTML/JS, you can use a config.js file:
    // 1. Create a config.js file with your API key:
    //    const config = { 
    //      OPENAI_API_KEY: "your-api-key-here"
    //    };
    
    // 2. Include it in your HTML before harvey.js:
    //    <script src="config.js"></script>
    //    <script src="harvey.js"></script>
    
    // 3. Then access it here:
    if (typeof config !== 'undefined' && config.OPENAI_API_KEY) {
      // Store in localStorage for the session
      localStorage.setItem('openaiApiKey', config.OPENAI_API_KEY);
      console.log("API key loaded from config");
      return true;
    }
    
    // Fallback to checking localStorage if config doesn't exist
    const storedKey = localStorage.getItem('openaiApiKey');
    if (storedKey) {
      return true;
    }
    
    // If no key is found anywhere, still show settings
    console.warn("No API key found in config or localStorage");
    openSettings();
    return false;
  }
});