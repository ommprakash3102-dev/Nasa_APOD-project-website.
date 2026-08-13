const API_KEY = import.meta.env.VITE_NASA_API_KEY;

// Set today's date as default in the date input
function setDefaultDate() {
  const datePicker = document.querySelector("#datepicker");
  if (datePicker) {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    datePicker.value = dateString;
    console.log("Date picker set to:", dateString);
  } else {
    console.log("Date picker element not found");
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setDefaultDate);
} else {
  setDefaultDate();
}

// 1. Create a reusable function to fetch APOD
function getAPOD(date = null) {
  document.querySelector("#app").innerHTML = `
  <link rel="stylesheet" href="src/styles.css">
    <div class="cosmic-loader">
      <div class="loader-container">:D</div>
      <div 
        <p class="loading-text">
        <span>G</span>
        <span>E</span>
        <span>T</span>
        <span>T</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
        <span>-</span>
        <span>A</span>
        <span>P</span>
        <span>O</span>
        <span>D</span>
        <span>.</span>
        <span>.</span>
        <span>.</span>
        

        </p>
      </div>
    </div>
  `;

  let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
  
  // If a date is provided, add it to the URL
  if (date) {
    url += `&date=${date}`;
  }
  
  console.log("Final URL:", url);
  
  console.log("Fetching from:", url); // Debug: see the full URL being called

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("Full API Response:", data);
      
      // Check if API returned an error
      if (data.error) {
        document.querySelector("#app").innerHTML = `
          <p class="error">NASA hasn't published today's APOD yet. ${data.error.message}</p>
          <p>Try selecting a previous date.</p>
        `;
        return;
      }
      
      // Check if required fields exist
      if (!data.title || !data.url) {
        document.querySelector("#app").innerHTML = `
          <p>Unable to load today's APOD. NASA may still be processing it.</p>
          <p>Try again later or select a previous date.</p>
        `;
        return;
      }
      let media;
      if (data.media_type === "image") {
        media = `<img src="${data.url}"/>`;
      } else {
        media = `<video src="${data.url}" controls></video>`;
      }

      document.querySelector("#app").innerHTML = `
        <h1>${data.title}</h1>
        ${media}
        <p>${data.explanation}</p>
      `;
    })
    .catch(err => {
      document.querySelector("#app").innerHTML = `<p>Looks like you're having trouble loading the APOD: ${err.message}</p>`;
    });
}

// 2. Load today's image when the page loads
getAPOD();

// 3. Listen for refresh button clicks
const refreshBtn = document.querySelector("#refresh-btn");
console.log("Refresh button found:", refreshBtn); // Debug: check if button exists

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    console.log("Button clicked!"); // Debug: button click detected
    let date = document.querySelector("#datepicker")?.value;
    
    // If no date selected, use today's date
    if (!date) {
      const today = new Date();
      date = today.toISOString().split('T')[0];
    }
    
    console.log("Date selected:", date); // Debug: see what date value is being sent
    getAPOD(date);
  });

  // Track mouse movement on button for cursor-following stars
  refreshBtn.addEventListener("mousemove", (e) => {
    const rect = refreshBtn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate cursor position relative to center (0 to 1)
    const xPercent = ((x - centerX) / (rect.width / 2)) * 50 + 50;
    const yPercent = ((y - centerY) / (rect.height / 2)) * 50 + 50;

    refreshBtn.style.setProperty("--cursor-x", xPercent + "%");
    refreshBtn.style.setProperty("--cursor-y", yPercent + "%");
  });

  // Reset on mouse leave
  refreshBtn.addEventListener("mouseleave", () => {
    refreshBtn.style.setProperty("--cursor-x", "50%");
    refreshBtn.style.setProperty("--cursor-y", "50%");
  });
} else {
  console.log("ERROR: Refresh button not found in HTML");
}

// 4. Hamburger menu toggle for date selector
const menuToggle = document.querySelector("#menu-toggle");
const controlsContainer = document.querySelector("#controlsContainer");

if (menuToggle && controlsContainer) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("active");
    controlsContainer.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !controlsContainer.contains(e.target)) {
      menuToggle.classList.remove("active");
      controlsContainer.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

