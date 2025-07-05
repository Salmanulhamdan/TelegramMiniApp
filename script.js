const API_BASE_URL = "https://ainager.com/ainager/";
let telegramUserId = null; // This is your global variable

// Hide all screens
function hideAllScreens() {
  const screens = document.querySelectorAll('.container');
  screens.forEach(screen => screen.style.display = 'none');
}

// Show home screen
function showHomeScreen() {
  hideAllScreens();
  document.getElementById("home-screen").style.display = "block";
  // alert("🏠 Home screen loaded."); // Removed alert
  console.log("🏠 Home screen loaded."); // Added console log for internal tracking
}

// Show a specific screen
function showScreen(screenName) {
  hideAllScreens();
  document.getElementById(`${screenName}-screen`).style.display = "block";
  // alert(`📺 Showing screen: ${screenName}`); // Removed alert
  console.log(`📺 Showing screen: ${screenName}`); // Added console log

  if (screenName === 'connected') {
    fetchConnectedAinagers();
  }
}

// Fetch connected Ainagers from API
function fetchConnectedAinagers() {
  const list = document.getElementById("connected-list");
  list.innerHTML = ""; // Clear previous list items

  if (!telegramUserId) {
    list.innerHTML = "<li>User ID not available. Please launch via Telegram.</li>";
    // alert("❌ No Telegram user ID found."); // Removed alert
    console.warn("❌ Attempted to fetch connections without telegramUserId."); // Changed to warn
    return;
  }

  // alert(`🔍 Fetching connections for user: ${telegramUserId}`); // Removed alert
  console.log(`🔍 Fetching connections for user: ${telegramUserId}`); // Added console log

  fetch(`${API_BASE_URL}ainager-connections/?user_id=${telegramUserId}`)
    .then(response => {
      console.log(`API Response Status: ${response.status}`); // Log status
      if (!response.ok) {
        // More specific error message based on status
        throw new Error(`Failed to fetch connections: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // alert("✅ Connection data received from API."); // Removed alert
      console.log("✅ Connection data received from API:", data); // Added console log

      if (!data.connections || data.connections.length === 0) {
        list.innerHTML = "<li>No connected Ainagers found.</li>";
        console.info("No connections found in API response."); // Info log
        return;
      }

      data.connections.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.ainager_name} (ID: ${item.ainager_id})`;
        list.appendChild(li);
      });
      console.log("Ainagers list populated."); // Log success
    })
    .catch(error => {
      console.error("⚠️ Error fetching connections:", error); // Detailed error log
      list.innerHTML = "<li>Error loading connections. Please try again later.</li>";
      // alert("⚠️ Error fetching Ainager connections."); // Removed alert
    });
}

// For now, this function just logs the user ID. It could be expanded for other uses.
function checkTelegramId(userId) {
  console.log("checkTelegramId received:", userId);
}

function initializeApp() {
  console.log("initializeApp started.");

  if (window.Telegram && window.Telegram.WebApp) {
    console.log("Telegram.WebApp object found!");
    window.Telegram.WebApp.ready();
    // alert("✅ Telegram WebApp is ready."); // Removed alert
    console.log("✅ Telegram WebApp is ready."); // Log success

    const initData = window.Telegram.WebApp.initDataUnsafe;
    console.log("initDataUnsafe: ", initData);

    if (initData && initData.user) {
      telegramUserId = initData.user.id;
      // alert(`✅ Telegram User ID retrieved: ${telegramUserId}`); // Removed alert
      console.log(`✅ Telegram User ID retrieved: ${telegramUserId}`); // Log success
      checkTelegramId(telegramUserId);
      console.log("Global telegramUserId set to:", telegramUserId);
    } else {
      // alert("❌ No Telegram user data found — make sure you're opening via Telegram bot button"); // Removed alert
      console.error("❌ No Telegram user data in initDataUnsafe. initData:", initData); // Error log
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
          // alert(`✅ Telegram User ID retrieved (via proxy & URL): ${telegramUserId}`); // Removed alert
          console.log(`✅ Telegram User ID retrieved (via proxy & URL): ${telegramUserId}`); // Log success
          checkTelegramId(telegramUserId);
          console.log("Global telegramUserId set to:", telegramUserId);
        } else {
          // alert("❌ TelegramWebviewProxy found, but no user data in URL initData."); // Removed alert
          console.error("❌ TelegramWebviewProxy found, but no user data in URL initData. Raw data:", decodedInitData); // Error log
        }
      } else {
        // alert("❌ TelegramWebviewProxy found, but no tgWebAppData in URL."); // Removed alert
        console.error("❌ TelegramWebviewProxy found, but no tgWebAppData in URL."); // Error log
      }
    } catch (e) {
      // alert("⚠️ Error parsing initData with TelegramWebviewProxy."); // Removed alert
      console.error("⚠️ Error parsing initData with TelegramWebviewProxy:", e); // Error log
    }
  } else {
    // alert("❌ Telegram WebApp object not available. Are you in Telegram?"); // Removed alert
    console.error("❌ Telegram WebApp object (neither Telegram.WebApp nor TelegramWebviewProxy) not available. Ensure you are in Telegram."); // Final fallback error log
  }

  showHomeScreen();
}

// Call initializeApp when page loads
window.onload = initializeApp;