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
    lucifer: "assets/images/Lucifer.jpg",
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
          <div id="welcomeStatus" class="welcome-status"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(welcomeScreen);
    
    // Add event listener to the start button
    document.getElementById('startAppBtn').addEventListener('click', async () => {
      const name = document.getElementById('userName').value.trim();
      const startBtn = document.getElementById('startAppBtn');
      const statusDiv = document.getElementById('welcomeStatus');
      
      if (name) {
        // Show loading state
        startBtn.textContent = 'Registering...';
        startBtn.disabled = true;
        statusDiv.textContent = 'Setting up your profile...';
        statusDiv.className = 'welcome-status loading';
        
        try {
          // Register user in database
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Save to localStorage
            userInfo.name = name;
            localStorage.setItem('userName', name);
            
            // Show success message briefly
            statusDiv.textContent = 'Welcome aboard! 🎉';
            statusDiv.className = 'welcome-status success';
            
            // Remove welcome screen after a short delay
            setTimeout(() => {
              document.body.removeChild(welcomeScreen);
            }, 1000);
          } else {
            throw new Error(data.error || 'Registration failed');
          }
          
        } catch (error) {
          console.error('Registration error:', error);
          
          // Still allow user to continue even if DB fails
          userInfo.name = name;
          localStorage.setItem('userName', name);
          
          statusDiv.textContent = 'Welcome! (Offline mode)';
          statusDiv.className = 'welcome-status warning';
          
          setTimeout(() => {
            document.body.removeChild(welcomeScreen);
          }, 1500);
        }
      } else {
        // Shake the input to indicate it's required
        const input = document.getElementById('userName');
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
    });
    
    // Add styles for the welcome screen (updated with status styles)
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
      
      .welcome-button:hover:not(:disabled) {
        background-color: #2a78f0;
      }
      
      .welcome-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .welcome-status {
        font-size: 0.9rem;
        padding: 0.5rem;
        border-radius: 4px;
        margin-top: 0.5rem;
        transition: all 0.3s ease;
      }
      
      .welcome-status.loading {
        background-color: #e3f2fd;
        color: #1976d2;
      }
      
      .welcome-status.success {
        background-color: #e8f5e8;
        color: #2e7d32;
      }
      
      .welcome-status.warning {
        background-color: #fff3e0;
        color: #f57c00;
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


// Admin Panel Functions - Add these to your main.js
// Replace your admin functions in main.js with these secure versions
// COMPLETE SECURE ADMIN SYSTEM
// Replace ALL your admin-related code with this entire block

// =========================
// ADMIN CONFIGURATION
// =========================
const ADMIN_CONFIG = {
  adminNames: ['admin', 'Mike', 'owner'], // ADD YOUR ACTUAL NAME HERE
  adminPassword: 'whatsnew', // CHANGE THIS TO YOUR PASSWORD
  secretCode: 'chatracter2025' // CHANGE THIS TO YOUR SECRET CODE
};

// =========================
// ADMIN SESSION MANAGEMENT
// =========================
let adminSession = {
  isAuthenticated: false,
  authenticatedAt: null,
  method: null,
  sessionTimeout: 30 * 60 * 1000 // 30 minutes
};

// =========================
// AUTHENTICATION FUNCTIONS
// =========================
function isCurrentUserAdmin() {
  const currentName = userInfo.name;
  if (!currentName) return false;
  
  return ADMIN_CONFIG.adminNames.some(adminName => 
    adminName.toLowerCase() === currentName.toLowerCase()
  );
}

function authenticateAdmin(method, credential = null) {
  let isValid = false;
  
  switch (method) {
    case 'name':
      isValid = isCurrentUserAdmin();
      break;
    case 'password':
      isValid = credential === ADMIN_CONFIG.adminPassword;
      break;
    case 'code':
      isValid = credential === ADMIN_CONFIG.secretCode;
      break;
  }
  
  if (isValid) {
    adminSession.isAuthenticated = true;
    adminSession.authenticatedAt = Date.now();
    adminSession.method = method;
    console.log('Admin authenticated via:', method);
    return true;
  }
  
  return false;
}

function isAdminSessionValid() {
  if (!adminSession.isAuthenticated) return false;
  
  const now = Date.now();
  const sessionAge = now - adminSession.authenticatedAt;
  
  if (sessionAge > adminSession.sessionTimeout) {
    logoutAdmin();
    return false;
  }
  
  return true;
}

function logoutAdmin() {
  adminSession.isAuthenticated = false;
  adminSession.authenticatedAt = null;
  adminSession.method = null;
  console.log('Admin session ended');
}

// =========================
// ADMIN LOGIN INTERFACE
// =========================
function showAdminLogin() {
  console.log('Showing admin login...');
  
  const loginModal = document.createElement('div');
  loginModal.className = 'admin-login-modal';
  loginModal.innerHTML = `
    <div class="admin-login-content">
      <h2>🔐 Admin Access Required</h2>
      <p>Choose your authentication method:</p>
      
      <div class="admin-auth-methods">
        <div class="auth-method">
          <h3>Method 1: Admin Name</h3>
          <p>Current user: <strong>${userInfo.name || 'Not set'}</strong></p>
          ${isCurrentUserAdmin() ? 
            '<p class="success">✅ You are authorized as admin!</p>' :
            '<p class="error">❌ Your name is not in the admin list</p>'
          }
          <button id="nameAuthBtn" ${isCurrentUserAdmin() ? '' : 'disabled'}>
            ${isCurrentUserAdmin() ? 'Access Admin Panel' : 'Not Authorized'}
          </button>
        </div>
        
        <div class="auth-method">
          <h3>Method 2: Admin Password</h3>
          <input type="password" id="adminPasswordInput" placeholder="Enter admin password">
          <button id="passwordAuthBtn">Login with Password</button>
        </div>
        
        <div class="auth-method">
          <h3>Method 3: Secret Code</h3>
          <input type="text" id="secretCodeInput" placeholder="Enter secret code">
          <button id="codeAuthBtn">Login with Code</button>
        </div>
      </div>
      
      <div class="login-actions">
        <button id="cancelLoginBtn" class="cancel-btn">Cancel</button>
      </div>
      
      <div class="admin-help">
        <details>
          <summary>Help for Admin</summary>
          <p><strong>For the app owner:</strong></p>
          <ul>
            <li>Add your name to <code>adminNames</code> in the code</li>
            <li>Change the <code>adminPassword</code> to something secure</li>
            <li>Update the <code>secretCode</code> to your preference</li>
          </ul>
        </details>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginModal);
  
  // Event listeners
  document.getElementById('nameAuthBtn').addEventListener('click', () => {
    if (authenticateAdmin('name')) {
      document.body.removeChild(loginModal);
      showAdminStats();
    } else {
      showAuthError('Authentication failed');
    }
  });
  
  document.getElementById('passwordAuthBtn').addEventListener('click', () => {
    const password = document.getElementById('adminPasswordInput').value;
    if (authenticateAdmin('password', password)) {
      document.body.removeChild(loginModal);
      showAdminStats();
    } else {
      showAuthError('Invalid password');
    }
  });
  
  document.getElementById('codeAuthBtn').addEventListener('click', () => {
    const code = document.getElementById('secretCodeInput').value;
    if (authenticateAdmin('code', code)) {
      document.body.removeChild(loginModal);
      showAdminStats();
    } else {
      showAuthError('Invalid secret code');
    }
  });
  
  document.getElementById('cancelLoginBtn').addEventListener('click', () => {
    document.body.removeChild(loginModal);
  });
  
  // Close on background click
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      document.body.removeChild(loginModal);
    }
  });
  
  // Add enter key support for inputs
  document.getElementById('adminPasswordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('passwordAuthBtn').click();
    }
  });
  
  document.getElementById('secretCodeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('codeAuthBtn').click();
    }
  });
  
  // Add login styles
  addLoginStyles();
}

function showAuthError(message) {
  const existingError = document.querySelector('.auth-error');
  if (existingError) {
    existingError.remove();
  }
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'auth-error';
  errorDiv.textContent = message;
  
  const loginContent = document.querySelector('.admin-login-content');
  if (loginContent) {
    loginContent.insertBefore(errorDiv, loginContent.querySelector('.login-actions'));
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 3000);
  }
}

// =========================
// ADMIN STATS PANEL (SECURED)
// =========================
function showAdminStats() {
  console.log('showAdminStats called');
  
  // CRITICAL: Authentication check - blocks access if not authenticated
  if (!isAdminSessionValid()) {
    console.log('Access denied - showing login instead');
    showAdminLogin();
    return;
  }
  
  console.log('Authentication verified - showing stats');
  
  // Create admin panel
  const adminPanel = document.createElement('div');
  adminPanel.className = 'admin-panel';
  adminPanel.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h2>📊 Chatracter App Statistics</h2>
        <div class="admin-user-info">
          Logged in as: <strong>${userInfo.name || 'Admin'}</strong> 
          (via ${adminSession.method})
        </div>
        <button id="closeAdminBtn" class="close-btn">×</button>
      </div>
      <div id="statsContainer" class="stats-container">
        <div class="loading">Loading statistics...</div>
      </div>
      <div class="admin-actions">
        <button id="refreshStatsBtn" class="action-btn">🔄 Refresh</button>
        <button id="exportDataBtn" class="action-btn">📁 Export Data</button>
        <button id="logoutAdminBtn" class="action-btn logout-btn">🚪 Logout</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(adminPanel);
  
  // Load stats
  loadAdminStats();
  
  // Event listeners with authentication checks
  document.getElementById('refreshStatsBtn').addEventListener('click', () => {
    if (!isAdminSessionValid()) {
      document.body.removeChild(adminPanel);
      showAdminLogin();
      return;
    }
    document.getElementById('statsContainer').innerHTML = '<div class="loading">Refreshing...</div>';
    loadAdminStats();
  });
  
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    if (!isAdminSessionValid()) {
      document.body.removeChild(adminPanel);
      showAdminLogin();
      return;
    }
    exportUserData();
  });
  
  document.getElementById('logoutAdminBtn').addEventListener('click', () => {
    logoutAdmin();
    document.body.removeChild(adminPanel);
    alert('Logged out of admin panel');
  });
  
  document.getElementById('closeAdminBtn').addEventListener('click', () => {
    document.body.removeChild(adminPanel);
  });
  
  // Close on background click
  adminPanel.addEventListener('click', (e) => {
    if (e.target === adminPanel) {
      document.body.removeChild(adminPanel);
    }
  });
  
  // Add admin styles
  addAdminStyles();
}

// =========================
// DATA FUNCTIONS
// =========================
async function loadAdminStats() {
  try {
    const response = await fetch('/api/stats');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${data.total || 0}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${data.today || 0}</div>
          <div class="stat-label">Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${data.thisWeek || 0}</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>
      
      <div class="recent-users">
        <h3>👥 Recent Users</h3>
        <div class="user-list">
          ${(data.recentUsers || []).length > 0 
            ? data.recentUsers.map(user => `
              <div class="user-item">
                <span class="user-name">${user.name}</span>
                <span class="user-date">${new Date(user.created_at).toLocaleDateString()} at ${new Date(user.created_at).toLocaleTimeString()}</span>
              </div>
            `).join('')
            : '<div class="no-data">No users registered yet</div>'
          }
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load stats:', error);
    
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
      <div class="error-message">
        <h4>❌ Failed to load statistics</h4>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Try refreshing or check the browser console for more details.</p>
      </div>
    `;
  }
}

async function exportUserData() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Registration Date,Registration Time\n"
      + data.users.map(user => 
          `"${user.name}","${new Date(user.created_at).toLocaleDateString()}","${new Date(user.created_at).toLocaleTimeString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chatracter-users-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    alert('Failed to export data: ' + error.message);
  }
}

// =========================
// UI COMPONENTS
// =========================
function addFloatingAdminButton() {
  const adminButton = document.createElement('button');
  adminButton.innerHTML = '📊';
  adminButton.className = 'floating-admin-btn';
  adminButton.title = 'Admin Login';
  
  adminButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 24px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    z-index: 1000;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // SECURE: Always go through login
  adminButton.addEventListener('click', () => {
    console.log('Admin button clicked');
    showAdminLogin();
  });
  
  adminButton.addEventListener('mouseenter', () => {
    adminButton.style.transform = 'scale(1.1)';
    adminButton.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
  });
  
  adminButton.addEventListener('mouseleave', () => {
    adminButton.style.transform = 'scale(1)';
    adminButton.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
  });
  
  document.body.appendChild(adminButton);
}

// =========================
// ACCESS METHODS (ALL SECURED)
// =========================
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    console.log('Ctrl+Shift+A pressed');
    showAdminLogin();
  }
});

// URL parameter access
if (window.location.search.includes('admin=true')) {
  setTimeout(() => {
    console.log('Admin URL parameter detected');
    showAdminLogin();
  }, 1000);
}

// Console access - secured
window.showAdminLogin = showAdminLogin;
window.showStats = () => {
  console.log('showStats called via console - redirecting to login');
  showAdminLogin();
};

// =========================
// STYLES
// =========================
function addLoginStyles() {
  if (document.getElementById('admin-login-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'admin-login-styles';
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    
    .admin-login-modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center;
      z-index: 11000; animation: fadeIn 0.3s ease;
    }
    
    .admin-login-content {
      background-color: white; border-radius: 16px; max-width: 500px; width: 90%;
      max-height: 90vh; overflow-y: auto; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
    }
    
    .admin-login-content h2 { color: #2d3748; margin-bottom: 1rem; text-align: center; }
    .admin-login-content p { text-align: center; color: #666; margin-bottom: 2rem; }
    
    .admin-auth-methods { display: flex; flex-direction: column; gap: 1.5rem; margin: 2rem 0; }
    
    .auth-method {
      border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; background: #f8f9fa;
    }
    
    .auth-method h3 { color: #4a5568; margin-bottom: 0.5rem; font-size: 1.1rem; }
    .auth-method p { margin: 0.5rem 0; font-size: 0.9rem; }
    
    .auth-method input {
      width: 100%; padding: 0.75rem; border: 1px solid #cbd5e0; border-radius: 8px;
      margin: 0.5rem 0; font-size: 1rem; box-sizing: border-box;
    }
    
    .auth-method button {
      width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;
      transition: all 0.2s; margin-top: 0.5rem;
    }
    
    .auth-method button:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .auth-method button:disabled {
      background: #cbd5e0; cursor: not-allowed; transform: none; box-shadow: none;
    }
    
    .success { color: #38a169; font-weight: 500; }
    .error { color: #e53e3e; font-weight: 500; }
    
    .login-actions {
      text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;
    }
    
    .cancel-btn {
      padding: 0.75rem 2rem; background: #718096; color: white; border: none;
      border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s;
    }
    
    .cancel-btn:hover { background: #4a5568; }
    
    .admin-help {
      margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;
    }
    
    .admin-help details { font-size: 0.85rem; color: #718096; }
    .admin-help summary { cursor: pointer; font-weight: 500; margin-bottom: 0.5rem; }
    .admin-help ul { margin: 0.5rem 0; padding-left: 1.5rem; }
    .admin-help code {
      background: #edf2f7; padding: 2px 4px; border-radius: 4px; font-family: monospace;
    }
    
    .auth-error {
      background: #fed7d7; color: #c53030; padding: 0.75rem; border-radius: 8px;
      margin: 0.5rem 0; border-left: 4px solid #e53e3e; animation: shake 0.5s ease;
    }
  `;
  document.head.appendChild(style);
}

function addAdminStyles() {
  if (document.getElementById('admin-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'admin-styles';
  style.textContent = `
    .admin-panel {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center;
      z-index: 10000; animation: fadeIn 0.3s ease;
    }
    
    .admin-content {
      background-color: white; border-radius: 16px; max-width: 700px; width: 90%;
      max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
    }
    
    .admin-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 2rem; border-bottom: 1px solid #eee;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border-radius: 16px 16px 0 0; position: relative;
    }
    
    .admin-user-info {
      position: absolute; left: 50%; transform: translateX(-50%);
      font-size: 0.85rem; background: rgba(255,255,255,0.2);
      padding: 0.5rem 1rem; border-radius: 20px;
    }
    
    .admin-header h2 { margin: 0; font-size: 1.4rem; }
    
    .close-btn {
      background: rgba(255,255,255,0.2); border: none; color: white;
      font-size: 1.5rem; width: 35px; height: 35px; border-radius: 50%;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    
    .close-btn:hover { background: rgba(255,255,255,0.3); }
    
    .stats-container { padding: 2rem; }
    .loading { text-align: center; color: #666; padding: 2rem; font-style: italic; }
    
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem; margin-bottom: 2rem;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 1.5rem; border-radius: 12px; text-align: center;
      border: 1px solid #e0e6ed; transition: transform 0.2s;
    }
    
    .stat-card:hover { transform: translateY(-2px); }
    
    .stat-number {
      font-size: 2.5rem; font-weight: bold; color: #2d3748; margin-bottom: 0.5rem;
    }
    
    .stat-label {
      font-size: 0.9rem; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;
    }
    
    .recent-users { margin-top: 2rem; }
    
    .recent-users h3 {
      color: #2d3748; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;
    }
    
    .user-list {
      background-color: #f8f9fa; border-radius: 12px; max-height: 300px;
      overflow-y: auto; border: 1px solid #e9ecef;
    }
    
    .user-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.5rem; border-bottom: 1px solid #e9ecef; transition: background 0.2s;
    }
    
    .user-item:hover { background-color: #e9ecef; }
    .user-item:last-child { border-bottom: none; }
    
    .user-name { font-weight: 500; color: #2d3748; }
    .user-date { font-size: 0.85rem; color: #718096; }
    
    .admin-actions {
      padding: 1.5rem 2rem; border-top: 1px solid #eee;
      display: flex; gap: 1rem; justify-content: center;
    }
    
    .action-btn {
      padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none; border-radius: 8px; cursor: pointer;
      font-weight: 500; transition: all 0.2s;
    }
    
    .action-btn:hover {
      transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .logout-btn {
      background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
    }
    
    .logout-btn:hover {
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4) !important;
    }
    
    .error-message {
      color: #e53e3e; background: #fed7d7; padding: 1rem; border-radius: 8px;
      margin: 1rem 0; border-left: 4px solid #e53e3e;
    }
    
    .no-data { text-align: center; color: #718096; padding: 2rem; font-style: italic; }
  `;
  document.head.appendChild(style);
}

// =========================
// INITIALIZATION
// =========================
// Add the floating button when page loads
setTimeout(addFloatingAdminButton, 2000);


////////////////////////////////////////////////////////////
// Add a secret key combination to show admin stats
// Add this to your DOMContentLoaded event listener
/*
let keySequence = [];
document.addEventListener('keydown', (e) => {
  keySequence.push(e.key);
  if (keySequence.length > 10) keySequence.shift();
  
  // Secret combination: "admin" + Enter
  if (keySequence.slice(-6).join('').toLowerCase() === 'admin' && e.key === 'Enter') {
    showAdminStats();
    keySequence = [];
  }
});
/////////////////////////////////////////////////////////////////////////
*/


  function checkApiKey() {
    const apiKey = localStorage.getItem('openaiApiKey');
    if (!apiKey) {
      return false;
    }
    return true;
  }

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
        header.animate([
          { transform: 'scale(0.98)' },
          { transform: 'scale(1)' }
        ], {
          duration: 400,
          easing: 'ease-out'
        });
        appSubtitle.textContent = "Master the art of closing";
        break;
        
      case 'walter':
        header.animate([
          { filter: 'brightness(0.95)' },
          { filter: 'brightness(1.05)' },
          { filter: 'brightness(1)' }
        ], {
          duration: 600,
          easing: 'ease-in-out'
        });
        appSubtitle.textContent = "The one who knocks";
        break;
        
      case 'tony':
        header.animate([
          { boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)' },
          { boxShadow: '0 0 25px rgba(244, 67, 54, 0.5)' },
          { boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)' }
        ], {
          duration: 800,
          easing: 'ease-in-out'
        });
        appSubtitle.textContent = "Genius. Billionaire. Philanthropist.";
        break;
        
      case 'tyrion':
        header.animate([
          { backgroundPosition: '0% 0%' },
          { backgroundPosition: '100% 0%' }
        ], {
          duration: 800,
          easing: 'ease-in-out'
        });
        appSubtitle.textContent = "I drink and I know things";
        break;
        
      case 'lucifer':
        header.animate([
          { filter: 'contrast(1)' },
          { filter: 'contrast(1.1)' },
          { filter: 'contrast(1)' }
        ], {
          duration: 700,
          easing: 'ease-in-out'
        });
        appSubtitle.textContent = "What do you truly desire?";
        break;
        
      case 'professor':
        header.animate([
          { backgroundSize: '400% 100%' },
          { backgroundSize: '100% 100%' }
        ], {
          duration: 500,
          easing: 'ease-out'
        });
        appSubtitle.textContent = "Everything according to plan";
        break;
        
      default:
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

  // FIXED: This function no longer adds character name prefixes to user messages
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'character' && document.documentElement.classList.contains('dark-mode')) {
      messageDiv.innerHTML = `
        <div class="message-content" style="background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(0,0,0,0.3) 100%); border-left: 3px solid var(--accent);">
          ${text}
        </div>
      `;
    } else if (sender === 'user') {
      // REMOVED: Character name prefixing - just show the user's message as-is
      messageDiv.innerHTML = `
        <div class="message-content" data-processed="true">
          ${text}
        </div>
      `;
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

  // FIXED: Properly handle mode switching with debugging
  async function switchMode(mode) {
    console.log('=== SWITCHING MODE ===');
    console.log('Current mode:', currentMode);
    console.log('New mode:', mode);
    
    currentMode = mode;
    
    // Update UI
    chatMode.classList.remove('active');
    battleMode.classList.remove('active');
    
    if (mode === 'chat') {
      console.log('Activating chat mode');
      chatMode.classList.add('active');
      document.querySelector('.chat-container').style.display = 'flex';
      if (battleContainer) {
        battleContainer.style.display = 'none';
      }
    } else if (mode === 'battle') {
      console.log('Activating battle mode');
      battleMode.classList.add('active');
      document.querySelector('.chat-container').style.display = 'none';
      if (battleContainer) {
        battleContainer.style.display = 'block';
        console.log('Battle container display set to block');
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          initBattleMode();
        }, 100);
      } else {
        console.error('Battle container not found!');
      }
    }
    console.log('=== MODE SWITCH COMPLETE ===');
  }

  // FIXED: Complete battle mode initialization with extensive debugging
  function initBattleMode() {
    console.log('=== INIT BATTLE MODE STARTED ===');
    
    // Check if battleContainer exists
    if (!battleContainer) {
      console.error('Battle container not found in DOM!');
      return;
    }
    
    console.log('Battle container found:', battleContainer);
    console.log('Battle container display style:', getComputedStyle(battleContainer).display);
    
    // Clear previous battle content
    battleContainer.innerHTML = '';
    console.log('Battle container cleared');
    
    // Create the debate interface with inline styles for debugging
    const debateInterface = document.createElement('div');
    debateInterface.className = 'debate-interface';
    debateInterface.style.cssText = 'pointer-events: auto; position: relative; z-index: 10;';
    
    debateInterface.innerHTML = `
      <div class="debate-setup" style="pointer-events: auto; position: relative; z-index: 10;">
        <h2>Interactive Character Debate</h2>
        <div class="debate-topic-container">
          <label for="debateTopic">Debate Topic:</label>
          <input type="text" id="debateTopic" placeholder="What should the characters debate about?" style="pointer-events: auto; z-index: 10; position: relative;">
          <button id="startDebateBtn" class="primary-button" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative; background-color: red; color: white; padding: 10px;">Start Debate</button>
        </div>
      </div>
      
      <div class="debate-area" style="display: none; pointer-events: auto; position: relative; z-index: 10;">
        <div class="debate-header">
          <h3 id="currentTopic"></h3>
          <button id="resetDebateBtn" class="secondary-button" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative;">Reset Debate</button>
        </div>
        
        <div class="debate-messages" id="debateMessages"></div>
        
        <div class="character-response-selector" style="pointer-events: auto; position: relative; z-index: 10;">
          <p>Who should respond next?</p>
          <div class="response-characters">
            <div class="char-select-row">
              <button class="char-select-btn" data-character="harvey" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative; background-color: blue; color: white; margin: 5px; padding: 10px;">Harvey Specter</button>
              <button class="char-select-btn" data-character="walter" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative; background-color: green; color: white; margin: 5px; padding: 10px;">Walter White</button>
              <button class="char-select-btn" data-character="tony" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative; background-color: orange; color: white; margin: 5px; padding: 10px;">Tony Stark</button>
            </div>
            <div class="char-select-row">
              <button class="char-select-btn" data-character="tyrion" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative; background-color: purple; color: white; margin: 5px; padding: 10px;">Tyrion Lannister</button>
              <button class="char-select-btn" data-character="lucifer" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative; background-color: darkred; color: white; margin: 5px; padding: 10px;">Lucifer Morningstar</button>
              <button class="char-select-btn" data-character="professor" style="pointer-events: auto; cursor: pointer; z-index: 10; position: relative; background-color: navy; color: white; margin: 5px; padding: 10px;">The Professor</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    battleContainer.appendChild(debateInterface);
    console.log('Debate interface added to battle container');
    
    // Add event listeners with extensive debugging
    const startBtn = document.getElementById('startDebateBtn');
    if (startBtn) {
      console.log('Start debate button found:', startBtn);
      console.log('Start button computed style:', getComputedStyle(startBtn).pointerEvents);
      
      startBtn.addEventListener('click', function(e) {
        console.log('START DEBATE BUTTON CLICKED!', e);
        e.preventDefault();
        e.stopPropagation();
        startDebate();
      });
      
      // Add additional event listeners for debugging
      startBtn.addEventListener('mousedown', () => console.log('Start button mousedown'));
      startBtn.addEventListener('mouseup', () => console.log('Start button mouseup'));
      startBtn.addEventListener('mouseover', () => console.log('Start button mouseover'));
      
      console.log('Start debate event listener added');
    } else {
      console.error('Start debate button NOT found after adding to DOM!');
    }
    
    const resetBtn = document.getElementById('resetDebateBtn');
    if (resetBtn) {
      console.log('Reset debate button found:', resetBtn);
      resetBtn.addEventListener('click', function(e) {
        console.log('RESET DEBATE BUTTON CLICKED!', e);
        e.preventDefault();
        e.stopPropagation();
        resetDebate();
      });
      console.log('Reset debate event listener added');
    }
    
    // Add event listeners to character buttons with extensive debugging
    const charButtons = document.querySelectorAll('.char-select-btn');
    console.log('Character buttons found:', charButtons.length);
    
    charButtons.forEach((button, index) => {
      console.log(`Adding listener to character button ${index}:`, button.textContent, button.dataset.character);
      console.log('Button computed style:', getComputedStyle(button).pointerEvents);
      
      button.addEventListener('click', function(e) {
        console.log('CHARACTER BUTTON CLICKED!', button.dataset.character, e);
        e.preventDefault();
        e.stopPropagation();
        const character = button.dataset.character;
        getNextResponse(character);
      });
      
      // Add additional event listeners for debugging
      button.addEventListener('mousedown', () => console.log(`Char button ${button.dataset.character} mousedown`));
      button.addEventListener('mouseup', () => console.log(`Char button ${button.dataset.character} mouseup`));
      button.addEventListener('mouseover', () => console.log(`Char button ${button.dataset.character} mouseover`));
    });
    
    console.log('All event listeners added');
    
    // Reset debate history
    debateHistory = [];
    console.log('=== INIT BATTLE MODE COMPLETED ===');
    
    // Test if elements are actually clickable
    setTimeout(() => {
      console.log('Testing button clickability...');
      const testBtn = document.getElementById('startDebateBtn');
      if (testBtn) {
        console.log('Test button exists, checking if it responds to programmatic click');
        // Don't actually click it, just test if it's accessible
        console.log('Test button tag name:', testBtn.tagName);
        console.log('Test button disabled:', testBtn.disabled);
        console.log('Test button style display:', testBtn.style.display);
      }
    }, 500);
  }

  async function startDebate() {
    console.log('=== START DEBATE FUNCTION CALLED ===');
    
    const topic = document.getElementById('debateTopic').value.trim();
    console.log('Topic entered:', topic);
    
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
    
    console.log('Starting debate with Harvey...');
    
    // Let Harvey start the debate
    await getNextResponse('harvey', true);
    
    // Reset button state
    startBtn.textContent = originalText;
    startBtn.disabled = false;
    
    console.log('=== START DEBATE COMPLETED ===');
  }

  function resetDebate() {
    console.log('=== RESET DEBATE FUNCTION CALLED ===');
    
    // Hide debate area and show setup
    document.querySelector('.debate-area').style.display = 'none';
    document.querySelector('.debate-setup').style.display = 'block';
    
    // Clear the topic input
    document.getElementById('debateTopic').value = '';
    
    // Reset debate history
    debateHistory = [];
    document.getElementById('debateMessages').innerHTML = '';
    
    console.log('=== RESET DEBATE COMPLETED ===');
  }

  async function getNextResponse(character, isFirst = false) {
    console.log('=== GET NEXT RESPONSE ===');
    console.log('Character:', character);
    console.log('Is first:', isFirst);
    
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
      console.log('Making API call for battle mode...');
      
      // Call the serverless function for battle mode
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
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      console.log('API response received:', data);
      
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
      
      console.log('Debate history updated:', debateHistory.length, 'entries');
      
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
    
    console.log('=== GET NEXT RESPONSE COMPLETED ===');
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
  
  function openSettings() {
    // Create a modal for settings
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
      <div class="settings-content">
        <h2>Settings</h2>
        <div class="settings-form">
          <div class="form-group">
            <label for="updateName">Your Name:</label>
            <input type="text" id="updateName" placeholder="Update your name" value="${userInfo.name || ''}">
          </div>
          
          <p class="settings-info">
            This app uses OpenAI's API to generate character responses. Your conversations are not stored on our servers.
          </p>
          
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
  }
  
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

});
