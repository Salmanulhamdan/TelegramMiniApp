
// const API_BASE_URL = "https://ainager.com/ainager/";
// const API_BASE_URL = "http://127.0.0.1:8000/ainager/";
const API_BASE_URL = "https://4a90b6132361.ngrok-free.app/ainager/";
let telegramUserId = null;
let userEmail = null;
let isUserConnected = false;


// Hide all screens
function hideAllScreens() {
  const screens = document.querySelectorAll('.container');
  screens.forEach(screen => screen.style.display = 'none');
}

// Show home screen
function showHomeScreen() {
  hideAllScreens();
  document.getElementById("home-screen").style.display = "block";
  console.log("🏠 Home screen loaded.");
}

// Show a specific screen
function showScreen(screenName) {
  hideAllScreens();
  document.getElementById(`${screenName}-screen`).style.display = "block";
  console.log(`📺 Showing screen: ${screenName}`);

  if (screenName === 'connected') {
    fetchConnectedAinagers();
  }
}

// Show email entry screen
function showEmailScreen() {
  hideAllScreens();
  document.getElementById("email-screen").style.display = "block";
  console.log("📧 Email screen loaded.");
}

// Show OTP verification screen
function showOTPScreen() {
  hideAllScreens();
  document.getElementById("otp-screen").style.display = "block";
  console.log("🔢 OTP screen loaded.");
}


// Send OTP to email
async function sendOTP() {
  const emailInput = document.getElementById("email-input");
  const email = emailInput.value.trim();
  const errorDiv = document.getElementById("email-error");
  const loadingDiv = document.getElementById("email-loading");

  // Clear previous messages
  errorDiv.textContent = "";
  
  if (!email) {
    errorDiv.textContent = "Please enter your email address";
    return;
  }

  if (!isValidEmail(email)) {
    errorDiv.textContent = "Please enter a valid email address";
    return;
  }

  loadingDiv.style.display = "block";
  userEmail = email;

  try {
    const response = await fetch(`${API_BASE_URL}send-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        email: email,
        telegram_id: telegramUserId
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ OTP sent successfully");
      showOTPScreen();
    } else {
      errorDiv.textContent = data.message || "Failed to send OTP. Please try again.";
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    errorDiv.textContent = "Network error. Please check your connection and try again.";
  } finally {
    loadingDiv.style.display = "none";
  }
}

// Verify OTP
async function verifyOTP() {
  const otpInputs = document.querySelectorAll('.otp-input');
  const otp = Array.from(otpInputs).map(input => input.value).join('');
  const errorDiv = document.getElementById("otp-error");
  const loadingDiv = document.getElementById("otp-loading");

  // Clear previous messages
  errorDiv.textContent = "";

  if (otp.length !== 6) {
    errorDiv.textContent = "Please enter all 6 digits";
    return;
  }

  loadingDiv.style.display = "block";

  try {
    const response = await fetch(`${API_BASE_URL}verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        email: userEmail,
        otp: otp,
        telegram_id: telegramUserId
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ OTP verified successfully");
      isUserConnected = true;
      showHomeScreen();
    } else {
      errorDiv.textContent = data.message || "Invalid OTP. Please try again.";
      // Clear OTP inputs
      otpInputs.forEach(input => input.value = "");
      otpInputs[0].focus();
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    errorDiv.textContent = "Network error. Please check your connection and try again.";
  } finally {
    loadingDiv.style.display = "none";
  }
}

// Resend OTP
async function resendOTP() {
  if (!userEmail) {
    showEmailScreen();
    return;
  }

  const errorDiv = document.getElementById("otp-error");
  errorDiv.textContent = "";

  try {
    const response = await fetch(`${API_BASE_URL}send-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        email: userEmail,
        telegram_id: telegramUserId
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ OTP resent successfully");
      // Clear OTP inputs
      const otpInputs = document.querySelectorAll('.otp-input');
      otpInputs.forEach(input => input.value = "");
      otpInputs[0].focus();
    } else {
      errorDiv.textContent = data.message || "Failed to resend OTP. Please try again.";
    }
  } catch (error) {
    console.error("Error resending OTP:", error);
    errorDiv.textContent = "Network error. Please check your connection and try again.";
  }
}

// Move to next OTP input
function moveToNext(current, index) {
  if (current.value.length === 1 && index < 5) {
    const nextInput = document.querySelectorAll('.otp-input')[index + 1];
    nextInput.focus();
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if user is connected
async function checkUserConnection() {
  if (!telegramUserId) {
    console.warn("No telegram user ID available");
    showEmailScreen();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}check-telegram-id/?telegram_id=${telegramUserId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.exists) {
      console.log("✅ User is connected");
      isUserConnected = true;
      showHomeScreen();
    } else {
      console.log("❌ User is not connected");
      isUserConnected = false;
      showEmailScreen();
    }
  } catch (error) {
    console.error("Error checking user connection:", error);
    // Show email screen as fallback
    showEmailScreen();
  }
}

function startAinagerBot(ainagerName) {
  const botUsername = "theainager_bot";
  const url = `https://t.me/${botUsername}?start=connect_${encodeURIComponent(ainagerName)}`;
  window.open(url, "_blank");
  console.log(`📤 Opening bot with parameter: ${ainagerName}`);
}

// Fetch connected Ainagers from API
function fetchConnectedAinagers() {
  const list = document.getElementById("connected-list");
  list.innerHTML = "";

  if (!telegramUserId) {
    list.innerHTML = "<li>User ID not available. Please launch via Telegram.</li>";
    console.warn("❌ Attempted to fetch connections without telegramUserId.");
    return;
  }

  console.log(`🔍 Fetching connections for user: ${telegramUserId}`);

  fetch(`${API_BASE_URL}ainager-connections/?user_id=${telegramUserId}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  })
    .then(response => {
      console.log(`API Response Status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("✅ Connection data received from API:", data);

      if (!data.connections || data.connections.length === 0) {
        list.innerHTML = "<li>No connected Ainagers found.</li>";
        console.info("No connections found in API response.");
        return;
      }

      data.connections.forEach(item => {
        const card = document.createElement("div");
        card.className = "connected-card";
      
        const nameDiv = document.createElement("div");
        nameDiv.className = "ainager-name";
        nameDiv.textContent = item.ainager_name;
      
        card.appendChild(nameDiv);
        card.onclick = () => startAinagerBot(item.ainager_name);
      
        list.appendChild(card);
      });
      console.log("Ainagers list populated.");
    })
    .catch(error => {
      console.error("⚠️ Error fetching connections:", error);
      list.innerHTML = "<li>Error loading connections. Please try again later.</li>";
    });
}

function checkTelegramId(userId) {
  console.log("checkTelegramId received:", userId);
}

function initializeApp() {
  console.log("initializeApp started.");
  
  const urlParams = new URLSearchParams(window.location.search);
  telegramUserId = urlParams.get('user_id');
  console.log("URL user_id:", telegramUserId);

  if (window.Telegram && window.Telegram.WebApp) {
    console.log("Telegram.WebApp object found!");
    window.Telegram.WebApp.ready();
    console.log("✅ Telegram WebApp is ready.");

    const initData = window.Telegram.WebApp.initDataUnsafe;
    console.log("initDataUnsafe: ", initData);

    if (initData && initData.user) {
      telegramUserId = initData.user.id;
      console.log(`✅ Telegram User ID retrieved: ${telegramUserId}`);
      checkTelegramId(telegramUserId);
    } else {
      console.error("❌ No Telegram user data in initDataUnsafe.");
    }
  } else if (window.TelegramWebviewProxy) {
    console.log("TelegramWebviewProxy object found!");

    try {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      let initDataParam = urlParams.get('tgWebAppData');

      if (!initDataParam) {
        const queryStringParams = new URLSearchParams(window.location.search);
        initDataParam = queryStringParams.get('tgWebAppData');
      }

      if (initDataParam) {
        const decodedInitData = decodeURIComponent(initDataParam);
        console.log("Decoded tgWebAppData:", decodedInitData);

        const dataParts = new URLSearchParams(decodedInitData);
        const userString = dataParts.get('user');

        if (userString) {
          const user = JSON.parse(userString);
          telegramUserId = user.id;
          console.log(`✅ Telegram User ID retrieved (via proxy & URL): ${telegramUserId}`);
          checkTelegramId(telegramUserId);
        } else {
          console.error("❌ TelegramWebviewProxy found, but no user data in URL initData.");
        }
      } else {
        console.error("❌ TelegramWebviewProxy found, but no tgWebAppData in URL.");
      }
    } catch (e) {
      console.error("⚠️ Error parsing initData with TelegramWebviewProxy:", e);
    }
  } else {
    console.error("❌ Telegram WebApp object not available.");
  }

  // Check user connection status after getting telegram user ID
  if (telegramUserId) {
    console.log("checking connection")
    checkUserConnection();
  } else {
    // If no telegram user ID, show email screen
    showEmailScreen();
  }
}

// Call initializeApp when page loads
window.onload = initializeApp;
