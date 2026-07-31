
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initAPOD();
  initLaunches();
  initPlanets();
});

/* ==========================================================================
   2. TODAY IN SPACE (APOD)
   ========================================================================== */

const NASA_API_KEY = "7LOnEfQgPx2VYcdF3UluWYiwPJs7DbY2flYvf37w";

function getLocalDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split("T")[0];
}

function formatDateShort(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return dateString;
  return `${months[monthIndex]} ${parseInt(day, 10)}, ${year}`;
}

function formatDateLong(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return dateString;
  return `${months[monthIndex]} ${parseInt(day, 10)}, ${year}`;
}

function initAPOD() {
  const dateInput = document.getElementById("apod-date-input");
  const dateWrapper = dateInput ? dateInput.closest(".date-input-wrapper") : null;
  const dateSpan = dateWrapper ? dateWrapper.querySelector("span") : null;
  const loadDateBtn = document.getElementById("load-date-btn");
  const todayApodBtn = document.getElementById("today-apod-btn");

  const todayStr = getLocalDateString();

  if (dateInput) {
   
    dateInput.max = todayStr;
  
    dateInput.value = todayStr;
    
    
    updateDateInputWrapper(todayStr);

    
    fetchAPOD(todayStr);

  
    dateInput.addEventListener("change", () => {
      const selectedDate = dateInput.value;
      if (validateDate(selectedDate)) {
        updateDateInputWrapper(selectedDate);
        fetchAPOD(selectedDate);
      }
    });
  }

  if (loadDateBtn && dateInput) {
    loadDateBtn.addEventListener("click", () => {
      const selectedDate = dateInput.value;
      if (validateDate(selectedDate)) {
        updateDateInputWrapper(selectedDate);
        fetchAPOD(selectedDate);
      }
    });
  }

  if (todayApodBtn && dateInput) {
    todayApodBtn.addEventListener("click", () => {
      dateInput.value = todayStr;
      updateDateInputWrapper(todayStr);
      fetchAPOD(todayStr);
    });
  }

  function updateDateInputWrapper(dateVal) {
    if (dateWrapper) {
      dateWrapper.setAttribute("data-date", formatDateShort(dateVal));
    }
    if (dateSpan) {
      dateSpan.textContent = ""; 
    }
  }

  function validateDate(dateVal) {
    if (!dateVal) {
      showAPODError("Please select a valid date.");
      return false;
    }
    const selected = new Date(dateVal);
    const today = new Date(todayStr);
    const minDate = new Date("1995-06-16"); 

    if (selected > today) {
      showAPODError("Future dates are not allowed. Please select today or an earlier date.");
      return false;
    }
    if (selected < minDate) {
      showAPODError("APOD started on June 16, 1995. Please select a date after that.");
      return false;
    }
    return true;
  }
}

async function fetchAPOD(dateString) {
  const loadingDiv = document.getElementById("apod-loading");
  const imgContainer = document.getElementById("apod-image-container");
  const apodImg = document.getElementById("apod-image");

  
  if (loadingDiv) loadingDiv.classList.remove("hidden");
  
  
  removeAPODCustomMedia();
  if (apodImg) {
    apodImg.classList.add("hidden");
    apodImg.src = "";
  }

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${dateString}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("NASA API rate limit exceeded. Please try again later.");
      }
      throw new Error(`Failed to fetch image of the day (Status: ${res.status}).`);
    }

    const data = await res.json();
    renderAPOD(data);
  } catch (err) {
    showAPODError(err.message || "An error occurred while connecting to the NASA server.");
  } finally {
    if (loadingDiv) loadingDiv.classList.add("hidden");
  }
}

function renderAPOD(data) {
  const container = document.getElementById("apod-image-container");
  const apodImg = document.getElementById("apod-image");
  const titleEl = document.getElementById("apod-title");
  const dateHeaderEl = document.getElementById("apod-date");
  const dateDetailEl = document.getElementById("apod-date-detail");
  const explanationEl = document.getElementById("apod-explanation");
  const copyrightEl = document.getElementById("apod-copyright");
  const dateInfoEl = document.getElementById("apod-date-info");
  const mediaTypeEl = document.getElementById("apod-media-type");

  
  if (titleEl) titleEl.textContent = data.title || "Untitled Cosmic Mystery";
  if (dateHeaderEl) dateHeaderEl.textContent = `Astronomy Picture of the Day - ${formatDateLong(data.date)}`;
  if (dateDetailEl) dateDetailEl.innerHTML = `<i class="far fa-calendar mr-2"></i>${data.date}`;
  if (dateInfoEl) dateInfoEl.textContent = data.date;
  if (explanationEl) explanationEl.textContent = data.explanation || "No description provided for this astronomical picture.";

  
  if (copyrightEl) {
    if (data.copyright) {
      copyrightEl.textContent = `© ${data.copyright.trim().replace(/\n/g, " ")}`;
      copyrightEl.classList.remove("hidden");
    } else {
      copyrightEl.textContent = "";
      copyrightEl.classList.add("hidden");
    }
  }


  const mediaType = data.media_type || "image";
  if (mediaTypeEl) {
    mediaTypeEl.textContent = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
  }

 
  if (mediaType === "video") {
    if (apodImg) apodImg.classList.add("hidden");
    
    
    const iframe = document.createElement("iframe");
    iframe.id = "apod-video";
    iframe.className = "w-full h-full border-0 rounded-2xl absolute inset-0";
    iframe.src = data.url;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    container.appendChild(iframe);
    
    
    toggleFullResButton(false);
  } else {
   
    if (apodImg) {
      apodImg.src = data.url || "./assets/images/placeholder.webp";
      apodImg.alt = data.title || "Astronomy Picture of the Day";
      apodImg.classList.remove("hidden");

     
      apodImg.onerror = () => {
        apodImg.src = "./assets/images/placeholder.webp";
      };
    }

    
    const hdUrl = data.hdurl || data.url;
    setupFullResButton(hdUrl);
    toggleFullResButton(true);
  }
}

function removeAPODCustomMedia() {
  const existingVideo = document.getElementById("apod-video");
  if (existingVideo) existingVideo.remove();

  const existingError = document.getElementById("apod-error-block");
  if (existingError) existingError.remove();
}

function toggleFullResButton(show) {
  const container = document.getElementById("apod-image-container");
  if (!container) return;
  const overlayGroup = container.querySelector(".group-hover\\:opacity-100");
  if (overlayGroup) {
    if (show) {
      overlayGroup.classList.remove("hidden");
    } else {
      overlayGroup.classList.add("hidden");
    }
  }
}

function setupFullResButton(hdUrl) {
  const container = document.getElementById("apod-image-container");
  if (!container) return;
  const fullResBtn = container.querySelector("button");
  if (fullResBtn && hdUrl) {
    
    const newBtn = fullResBtn.cloneNode(true);
    fullResBtn.parentNode.replaceChild(newBtn, fullResBtn);

    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(hdUrl, "_blank");
    });
  }
}

function showAPODError(message) {
  const container = document.getElementById("apod-image-container");
  const apodImg = document.getElementById("apod-image");
  
  removeAPODCustomMedia();
  if (apodImg) apodImg.classList.add("hidden");
  toggleFullResButton(false);

  const errorBlock = document.createElement("div");
  errorBlock.id = "apod-error-block";
  errorBlock.className = "absolute inset-0 flex items-center justify-center p-6 bg-slate-900/90 z-20";
  errorBlock.innerHTML = `
    <div class="text-center p-6 bg-slate-800/80 rounded-2xl border border-slate-700 max-w-md mx-auto shadow-2xl">
      <i class="fas fa-exclamation-triangle text-red-400 text-5xl mb-4"></i>
      <h4 class="text-lg font-bold text-white mb-2">Unable to Load APOD</h4>
      <p class="text-slate-400 text-sm mb-5">${message}</p>
      <button id="apod-retry-btn" class="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors font-semibold text-sm inline-flex items-center gap-2">
        <i class="fas fa-redo"></i>
        Retry Load
      </button>
    </div>
  `;
  container.appendChild(errorBlock);

 
  const retryBtn = errorBlock.querySelector("#apod-retry-btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      const dateInput = document.getElementById("apod-date-input");
      const dateVal = dateInput ? dateInput.value : getLocalDateString();
      fetchAPOD(dateVal);
    });
  }
}


/* ==========================================================================
   1. NAVIGATION & LAYOUT
   ========================================================================== */

function initNavigation() {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".app-section");


  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay hidden";
  document.body.appendChild(overlay);


  function openSidebar() {
    sidebar.classList.add("sidebar-open");
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden"; 
  }

  function closeSidebar() {
    sidebar.classList.remove("sidebar-open");
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains("sidebar-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }


  overlay.addEventListener("click", closeSidebar);

 
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSectionId = link.getAttribute("data-section");

      
      navLinks.forEach((l) => {
        if (l.getAttribute("data-section") === targetSectionId) {
          l.className = "nav-link flex items-center space-x-3 px-3 py-2.5 bg-blue-500/10 text-blue-400 rounded-lg font-medium transition-colors";
        } else {
          l.className = "nav-link flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition-colors";
        }
      });

      
      sections.forEach((section) => {
        const sectionId = section.getAttribute("data-section");
        if (sectionId === targetSectionId) {
          section.classList.remove("hidden");
        } else {
          section.classList.add("hidden");
        }
      });

    
      closeSidebar();
    });
  });
}

/* ==========================================================================
   3. UPCOMING LAUNCHES
   ========================================================================== */

function getCountdownDays(netString) {
  const net = new Date(netString);
  const now = new Date();
  const diff = net - now;
  
  if (diff <= 0) {
    return { count: "T-0", label: "Launch Window Open" };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return { count: `${hours}`, label: hours === 1 ? "Hour Until Launch" : "Hours Until Launch" };
  }
  return { count: `${days}`, label: days === 1 ? "Day Until Launch" : "Days Until Launch" };
}

function getStatusBadgeClass(abbrev) {
  const lower = (abbrev || "").toLowerCase();
  if (lower === "go") return "bg-green-500/20 text-green-400";
  if (lower === "tbc") return "bg-yellow-500/20 text-yellow-400";
  if (lower === "tbd") return "bg-blue-500/20 text-blue-400";
  return "bg-red-500/20 text-red-400";
}

function formatLaunchDate(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "TBD";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function formatLaunchTime(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "TBD";
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes} UTC`;
}

function toggleFavoriteLaunch(launchId, btnElement) {
  let favorites = JSON.parse(localStorage.getItem("cosmos_favorite_launches") || "[]");
  const icon = btnElement.querySelector("i");
  
  if (favorites.includes(launchId)) {
    favorites = favorites.filter(id => id !== launchId);
    if (icon) {
      icon.className = "far fa-heart";
      icon.classList.remove("text-red-500");
    }
  } else {
    favorites.push(launchId);
    if (icon) {
      icon.className = "fas fa-heart text-red-500 animate-pulse";
      setTimeout(() => icon.classList.remove("animate-pulse"), 1000);
    }
  }
  localStorage.setItem("cosmos_favorite_launches", JSON.stringify(favorites));
}

function isFavoriteLaunch(launchId) {
  const favorites = JSON.parse(localStorage.getItem("cosmos_favorite_launches") || "[]");
  return favorites.includes(launchId);
}

function initLaunches() {
  fetchLaunches();
}

async function fetchLaunches() {
  const launchesGrid = document.getElementById("launches-grid");
  const featuredContainer = document.getElementById("featured-launch");

  
  if (launchesGrid) {
    launchesGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-16">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
        <p class="text-slate-400">Fetching upcoming space missions...</p>
      </div>
    `;
  }

  try {
    const res = await fetch("https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10");
    if (!res.ok) {
      throw new Error(`Failed to fetch upcoming launches (Status: ${res.status}).`);
    }

    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) {
      renderLaunchesEmpty();
      return;
    }

    
    const countText = `${results.length} Launches`;
    const countEl = document.getElementById("launches-count");
    const countMobileEl = document.getElementById("launches-count-mobile");
    if (countEl) countEl.textContent = countText;
    if (countMobileEl) countMobileEl.textContent = results.length;

   
    if (featuredContainer && results.length > 0) {
      renderFeaturedLaunch(results[0]);
    }

   
    if (launchesGrid && results.length > 1) {
      renderLaunchesGrid(results.slice(1));
    } else if (launchesGrid) {
      launchesGrid.innerHTML = `
        <div class="col-span-full text-center py-8 text-slate-500">
          No other upcoming launches scheduled.
        </div>
      `;
    }

  } catch (err) {
    showLaunchesError(err.message || "Could not retrieve launch data.");
  }
}

function renderFeaturedLaunch(launch) {
  const container = document.getElementById("featured-launch");
  if (!container) return;

  const countdown = getCountdownDays(launch.net);
  const statusBadgeColor = getStatusBadgeClass(launch.status?.abbrev);
  const formattedDate = formatLaunchDate(launch.net);
  const formattedTime = formatLaunchTime(launch.net);
  
 
  const locationName = launch.pad?.location?.name || "Unknown Location";
  const countryCode = launch.pad?.country?.alpha_3_code || launch.pad?.location?.country?.alpha_3_code || "TBD";
  
  
  const imageSrc = launch.image?.image_url || launch.pad?.image?.image_url || "./assets/images/launch-placeholder.png";

  const isFav = isFavoriteLaunch(launch.id);

  container.innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star text-xs"></i>
                Featured Launch
              </span>
              <span class="px-4 py-1.5 ${statusBadgeColor} rounded-full text-sm font-semibold">
                ${launch.status?.abbrev || "TBD"}
              </span>
            </div>
            
            <h3 class="text-3xl font-bold mb-3 leading-tight text-white group-hover:text-blue-400 transition-colors">${launch.mission?.name || launch.name}</h3>
            
            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2">
                <i class="fas fa-building text-slate-500"></i>
                <span>${launch.launch_service_provider?.name || "Unknown Provider"}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-rocket text-slate-500"></i>
                <span>${launch.rocket?.configuration?.full_name || launch.rocket?.configuration?.name || "Unknown Rocket"}</span>
              </div>
            </div>
            
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6 border border-slate-700/30">
              <i class="fas fa-clock text-2xl text-blue-400"></i>
              <div>
                <p class="text-2xl font-bold text-blue-400" id="featured-countdown-count">${countdown.count}</p>
                <p class="text-xs text-slate-400">${countdown.label}</p>
              </div>
            </div>
            
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 border border-slate-800/30 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-calendar text-slate-500 text-xs"></i>
                  Launch Date
                </p>
                <p class="font-semibold text-slate-200">${formattedDate}</p>
              </div>
              <div class="bg-slate-900/50 border border-slate-800/30 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-clock text-slate-500 text-xs"></i>
                  Launch Time
                </p>
                <p class="font-semibold text-slate-200">${formattedTime}</p>
              </div>
              <div class="bg-slate-900/50 border border-slate-800/30 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-map-marker-alt text-slate-500 text-xs"></i>
                  Location
                </p>
                <p class="font-semibold text-slate-200 text-sm line-clamp-1">${launch.pad?.name || "Unknown Pad"}</p>
              </div>
              <div class="bg-slate-900/50 border border-slate-800/30 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-globe text-slate-500 text-xs"></i>
                  Country
                </p>
                <p class="font-semibold text-slate-200">${countryCode}</p>
              </div>
            </div>
            
            <p class="text-slate-300 leading-relaxed mb-6 text-sm line-clamp-3">${launch.mission?.description || "Description is not available for this mission."}</p>
          </div>
          
          <div class="flex flex-col md:flex-row gap-3">
            <button id="featured-details-btn" class="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 text-white">
              <i class="fas fa-info-circle"></i>
              View Full Details
            </button>
            <div class="flex gap-2">
              <button id="featured-fav-btn" class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors">
                <i class="${isFav ? "fas fa-heart text-red-500" : "far fa-heart"}"></i>
              </button>
              ${launch.pad?.map_url ? `
                <a href="${launch.pad.map_url}" target="_blank" class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors flex items-center justify-center">
                  <i class="fas fa-map-marked-alt"></i>
                </a>
              ` : ""}
            </div>
          </div>
        </div>
        
        <div class="relative hidden lg:block h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-700/50">
          <img src="${imageSrc}" class="w-full h-full object-cover" onerror="this.src='./assets/images/launch-placeholder.png';" />
          <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
      </div>
    </div>
  `;


  const detailsBtn = container.querySelector("#featured-details-btn");
  if (detailsBtn) {
    detailsBtn.addEventListener("click", () => showLaunchDetailsModal(launch));
  }

  const favBtn = container.querySelector("#featured-fav-btn");
  if (favBtn) {
    favBtn.addEventListener("click", () => toggleFavoriteLaunch(launch.id, favBtn));
  }
}

function renderLaunchesGrid(launches) {
  const grid = document.getElementById("launches-grid");
  if (!grid) return;
  
  grid.innerHTML = "";

  launches.forEach((launch) => {
    const statusBadgeColor = getStatusBadgeClass(launch.status?.abbrev);
    const formattedDate = formatLaunchDate(launch.net);
    const formattedTime = formatLaunchTime(launch.net);
    const imageSrc = launch.image?.image_url || launch.pad?.image?.image_url || "./assets/images/launch-placeholder.png";
    const isFav = isFavoriteLaunch(launch.id);

    const card = document.createElement("div");
    card.className = "bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group cursor-pointer flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="relative h-48 bg-slate-900/50 flex items-center justify-center overflow-hidden border-b border-slate-700/30">
          <img src="${imageSrc}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='./assets/images/launch-placeholder.png';" />
          <div class="absolute top-3 right-3">
            <span class="px-3 py-1 ${statusBadgeColor} backdrop-blur-sm rounded-full text-xs font-semibold">
              ${launch.status?.abbrev || "TBD"}
            </span>
          </div>
        </div>
        
        <div class="p-5">
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2 text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
              ${launch.mission?.name || launch.name}
            </h4>
            <p class="text-xs text-slate-400 flex items-center gap-2 font-medium">
              <i class="fas fa-building text-slate-500 text-xs"></i>
              ${launch.launch_service_provider?.name || "Unknown Provider"}
            </p>
          </div>
          
          <div class="space-y-2 mb-4 text-xs text-slate-300">
            <div class="flex items-center gap-2">
              <i class="fas fa-calendar text-slate-500 w-4 text-center"></i>
              <span>${formattedDate}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-clock text-slate-500 w-4 text-center"></i>
              <span>${formattedTime}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-rocket text-slate-500 w-4 text-center"></i>
              <span>${launch.rocket?.configuration?.name || "Unknown Rocket"}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-map-marker-alt text-slate-500 w-4 text-center"></i>
              <span class="line-clamp-1">${launch.pad?.name || "Unknown Pad"}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="px-5 pb-5 pt-0">
        <div class="flex items-center gap-2 pt-4 border-t border-slate-700/50">
          <button class="grid-details-btn flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs font-semibold text-white">
            Details
          </button>
          <button class="grid-fav-btn px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors">
            <i class="${isFav ? "fas fa-heart text-red-500" : "far fa-heart"}"></i>
          </button>
        </div>
      </div>
    `;

    
    card.addEventListener("click", (e) => {
      const isFavClick = e.target.closest(".grid-fav-btn");
      const isDetailsClick = e.target.closest(".grid-details-btn");
      
      if (isFavClick) {
        e.stopPropagation();
        toggleFavoriteLaunch(launch.id, isFavClick);
      } else {
        showLaunchDetailsModal(launch);
      }
    });

    grid.appendChild(card);
  });
}

function renderLaunchesEmpty() {
  const container = document.getElementById("featured-launch");
  const grid = document.getElementById("launches-grid");

  if (container) container.innerHTML = "";
  if (grid) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
        <i class="fas fa-folder-open text-slate-600 text-5xl mb-4"></i>
        <h4 class="text-lg font-bold text-white mb-2">No Launches Found</h4>
        <p class="text-slate-400 text-sm">There are no upcoming space launches currently scheduled in the network.</p>
      </div>
    `;
  }
}

function showLaunchesError(message) {
  const container = document.getElementById("featured-launch");
  const grid = document.getElementById("launches-grid");

  if (container) container.innerHTML = "";
  if (grid) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-slate-800/30 border border-red-500/20 rounded-2xl p-8 max-w-xl mx-auto shadow-2xl">
        <i class="fas fa-exclamation-triangle text-red-400 text-5xl mb-4"></i>
        <h4 class="text-lg font-bold text-white mb-2">Failed to Fetch Launches</h4>
        <p class="text-slate-400 text-sm mb-5">${message}</p>
        <button id="launches-retry-btn" class="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors font-semibold text-sm inline-flex items-center gap-2 text-white">
          <i class="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    `;
    
    const retryBtn = grid.querySelector("#launches-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        fetchLaunches();
      });
    }
  }
}

/* ==========================================================================
   4. PLANETS SECTION
   ========================================================================== */

let planetsList = [];

function getSuperscript(num) {
  const superscripts = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻"
  };
  return String(num).split("").map(c => superscripts[c] || c).join("");
}

function getPlanetColor(englishName) {
  const colors = {
    mercury: "#eab308",
    venus: "#f97316",
    earth: "#3b82f6",
    mars: "#ef4444",
    jupiter: "#fb923c",
    saturn: "#facc15",
    uranus: "#06b6d4",
    neptune: "#2563eb"
  };
  return colors[englishName.toLowerCase()] || "#3b82f6";
}

function getPlanetTypeBadgeClass(type) {
  const lower = (type || "").toLowerCase();
  if (lower.includes("terrestrial")) {
    return "px-2 py-1 rounded text-xs bg-orange-500/50 text-orange-200";
  }
  if (lower.includes("gas")) {
    return "px-2 py-1 rounded text-xs bg-purple-500/50 text-purple-200";
  }
  if (lower.includes("ice")) {
    return "px-2 py-1 rounded text-xs bg-cyan-500/50 text-cyan-200";
  }
  return "px-2 py-1 rounded text-xs bg-slate-700 text-slate-300";
}

function initPlanets() {
  const cards = document.querySelectorAll(".planet-card");
  

  cards.forEach(card => {
   
    card.onmouseover = null;
    card.onmouseout = null;
    
    const planetColor = card.style.getPropertyValue("--planet-color") || "#3b82f6";
    
    card.addEventListener("mouseenter", () => {
      if (!card.classList.contains("active-planet")) {
        card.style.borderColor = `${planetColor}80`;
      }
    });
    
    card.addEventListener("mouseleave", () => {
      if (!card.classList.contains("active-planet")) {
        card.style.borderColor = "#334155";
      }
    });

    card.addEventListener("click", () => {
      const planetId = card.getAttribute("data-planet-id");
      if (planetId) {
        selectPlanet(planetId);
      }
    });
  });

  fetchPlanets();
}

async function fetchPlanets() {
  const tableBody = document.getElementById("planet-comparison-tbody");
  
  
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-400">
          <i class="fas fa-spinner fa-spin mr-2 text-blue-400"></i>Loading comparison data...
        </td>
      </tr>
    `;
  }

  try {
    const res = await fetch("https://solar-system-opendata-proxy.vercel.app/api/planets");
    if (!res.ok) {
      throw new Error(`Failed to load planets list (Status: ${res.status}).`);
    }

    const data = await res.json();
    const bodies = data.bodies || [];
    
   
    planetsList = bodies.sort((a, b) => a.semimajorAxis - b.semimajorAxis);

    if (planetsList.length === 0) {
      throw new Error("No planets returned by the service.");
    }

  
    updatePlanetSelectorDistances();

   
    renderPlanetComparisonTable();

    
    const defaultPlanetId = planetsList.find(p => p.englishName.toLowerCase() === "earth") ? "earth" : planetsList[0].englishName.toLowerCase();
    selectPlanet(defaultPlanetId);

  } catch (err) {
    showPlanetsError(err.message || "Could not retrieve solar system metrics.");
  }
}

function updatePlanetSelectorDistances() {
  const cards = document.querySelectorAll(".planet-card");
  
  cards.forEach(card => {
    const planetId = card.getAttribute("data-planet-id");
    const planet = planetsList.find(p => p.englishName.toLowerCase() === planetId || p.id === planetId);
    
    if (planet) {
      const distanceLabel = card.querySelector("p");
      if (distanceLabel) {
       
        const auVal = planet.semimajorAxis / 149597870.7;
        distanceLabel.textContent = `${auVal.toFixed(2)} AU`;
      }
    }
  });
}

function selectPlanet(planetId) {
  const cards = document.querySelectorAll(".planet-card");
  
  cards.forEach(card => {
    const cId = card.getAttribute("data-planet-id");
    const planetColor = card.style.getPropertyValue("--planet-color") || "#3b82f6";
    
    if (cId === planetId) {
      card.classList.add("active-planet");
      card.style.borderColor = planetColor;
      card.style.backgroundColor = `${planetColor}15`; 
      card.style.boxShadow = `0 0 20px ${planetColor}25`;
    } else {
      card.classList.remove("active-planet");
      card.style.borderColor = "#334155";
      card.style.backgroundColor = "";
      card.style.boxShadow = "";
    }
  });

  const planetData = planetsList.find(p => p.englishName.toLowerCase() === planetId || p.id === planetId);
  if (planetData) {
    renderPlanetDetails(planetData);
  }
}

function renderPlanetDetails(planet) {

  const nameEl = document.getElementById("planet-detail-name");
  const descEl = document.getElementById("planet-detail-description");
  const imgEl = document.getElementById("planet-detail-image");
  
  const distanceEl = document.getElementById("planet-distance");
  const radiusEl = document.getElementById("planet-radius");
  const massEl = document.getElementById("planet-mass");
  const densityEl = document.getElementById("planet-density");
  const periodEl = document.getElementById("planet-orbital-period");
  const rotationEl = document.getElementById("planet-rotation");
  const moonsEl = document.getElementById("planet-moons");
  const gravityEl = document.getElementById("planet-gravity");
  
  const discovererEl = document.getElementById("planet-discoverer");
  const discoveryDateEl = document.getElementById("planet-discovery-date");
  const bodyTypeEl = document.getElementById("planet-body-type");
  const volumeEl = document.getElementById("planet-volume");
  
  const perihelionEl = document.getElementById("planet-perihelion");
  const aphelionEl = document.getElementById("planet-aphelion");
  const eccentricityEl = document.getElementById("planet-eccentricity");
  const inclinationEl = document.getElementById("planet-inclination");
  const axialTiltEl = document.getElementById("planet-axial-tilt");
  const tempEl = document.getElementById("planet-temp");
  const escapeEl = document.getElementById("planet-escape");
  
  const factsContainer = document.getElementById("planet-facts");


  if (nameEl) nameEl.textContent = planet.englishName;
  if (descEl) descEl.textContent = planet.description || `Explore detailed planetary attributes and orbital physics for ${planet.englishName}.`;
  

  if (imgEl) {
    const localFallback = `./assets/images/${planet.englishName.toLowerCase()}.png`;
    imgEl.src = planet.image || localFallback;
    imgEl.alt = `${planet.englishName} planetary render`;
    imgEl.onerror = () => {
      imgEl.src = localFallback;
    };
  }

 
  if (distanceEl) {
    const milKm = planet.semimajorAxis / 1000000;
    distanceEl.textContent = `${milKm.toFixed(1)}M km`;
  }
  if (radiusEl) {
    radiusEl.textContent = `${Math.round(planet.meanRadius).toLocaleString()} km`;
  }
  if (massEl) {
    if (planet.mass) {
      massEl.textContent = `${planet.mass.massValue.toFixed(2)} × 10${getSuperscript(planet.mass.massExponent)} kg`;
    } else {
      massEl.textContent = "N/A";
    }
  }
  if (densityEl) {
    densityEl.textContent = `${planet.density.toFixed(2)} g/cm³`;
  }
  if (periodEl) {
    periodEl.textContent = `${Math.round(planet.sideralOrbit).toLocaleString()} days`;
  }
  if (rotationEl) {
    const absRot = Math.abs(planet.sideralRotation);
    if (absRot > 48) {
      const rotDays = absRot / 24;
      rotationEl.textContent = `${rotDays.toFixed(1)} days${planet.sideralRotation < 0 ? " (R)" : ""}`;
    } else {
      rotationEl.textContent = `${absRot.toFixed(1)} hours${planet.sideralRotation < 0 ? " (R)" : ""}`;
    }
  }
  if (moonsEl) {
    moonsEl.textContent = planet.moons ? planet.moons.length : 0;
  }
  if (gravityEl) {
    gravityEl.textContent = `${planet.gravity.toFixed(2)} m/s²`;
  }

 
  if (discovererEl) discovererEl.textContent = planet.discoveredBy || "Known since antiquity";
  if (discoveryDateEl) discoveryDateEl.textContent = planet.discoveryDate || "Ancient";
  if (bodyTypeEl) bodyTypeEl.textContent = planet.bodyType || "Planet";
  if (volumeEl) {
    if (planet.vol) {
      volumeEl.textContent = `${planet.vol.volValue.toFixed(2)} × 10${getSuperscript(planet.vol.volExponent)} km³`;
    } else {
      volumeEl.textContent = "N/A";
    }
  }

  
  if (perihelionEl) perihelionEl.textContent = `${(planet.perihelion / 1000000).toFixed(1)}M km`;
  if (aphelionEl) aphelionEl.textContent = `${(planet.aphelion / 1000000).toFixed(1)}M km`;
  if (eccentricityEl) eccentricityEl.textContent = planet.eccentricity.toFixed(4);
  if (inclinationEl) inclinationEl.textContent = `${planet.inclination.toFixed(2)}°`;
  if (axialTiltEl) axialTiltEl.textContent = `${planet.axialTilt.toFixed(2)}°`;
  if (tempEl) {
    if (planet.avgTemp) {
      const tempCelsius = Math.round(planet.avgTemp - 273.15);
      tempEl.textContent = `${tempCelsius}°C`;
    } else {
      tempEl.textContent = "N/A";
    }
  }
  if (escapeEl) {
    
    const escapeKmS = planet.escape / 1000;
    escapeEl.textContent = `${escapeKmS.toFixed(1)} km/s`;
  }

  
  if (factsContainer) {
    factsContainer.innerHTML = "";
    const facts = generatePlanetFacts(planet);
    facts.forEach(fact => {
      const li = document.createElement("li");
      li.className = "flex items-start";
      li.innerHTML = `
        <i class="fas fa-check text-green-400 mt-1 mr-2 flex-shrink-0"></i>
        <span class="text-slate-300 text-sm leading-relaxed">${fact}</span>
      `;
      factsContainer.appendChild(li);
    });
  }


  const learnMoreBtn = document.querySelector("#planets .xl\\:col-span-2 button.w-full");
  if (learnMoreBtn) {
   
    const newBtn = learnMoreBtn.cloneNode(true);
    learnMoreBtn.parentNode.replaceChild(newBtn, learnMoreBtn);

    newBtn.addEventListener("click", () => {
      const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(planet.englishName)}`;
      window.open(wikiUrl, "_blank");
    });
  }
}

function generatePlanetFacts(planet) {
  const facts = [];
  const type = planet.type || "Planet";
  const moonsCount = planet.moons ? planet.moons.length : 0;
  
  facts.push(`Classified as a <strong>${type}</strong> body.`);
  
  if (moonsCount > 0) {
    
    const firstMoon = planet.moons[0]?.moon || "moons";
    facts.push(`Orbited by <strong>${moonsCount}</strong> moon(s) (e.g. ${firstMoon}).`);
  } else {
    facts.push(`No natural satellites orbit this planet.`);
  }
  
  const earthGravity = 9.80665;
  const relGravity = (planet.gravity / earthGravity) * 100;
  facts.push(`Surface gravity is <strong>${planet.gravity.toFixed(2)} m/s²</strong> (${relGravity.toFixed(0)}% of Earth's).`);
  
  if (planet.avgTemp) {
    const tempCelsius = Math.round(planet.avgTemp - 273.15);
    facts.push(`Mean temperature averages <strong>${tempCelsius}°C</strong>.`);
  }

  if (planet.discoveredBy) {
    facts.push(`Discovered by <strong>${planet.discoveredBy}</strong> on ${planet.discoveryDate || "unknown date"}.`);
  } else {
    facts.push(`Known since antiquity, with no official discoverer.`);
  }
  
  return facts;
}

function renderPlanetComparisonTable() {
  const tableBody = document.getElementById("planet-comparison-tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  planetsList.forEach(planet => {
    const planetColor = getPlanetColor(planet.englishName);
    const typeBadge = getPlanetTypeBadgeClass(planet.type || planet.bodyType);
    
   
    const auDistance = planet.semimajorAxis / 149597870.7;
    
   
    const diameter = planet.meanRadius * 2;
    
   
    const earthMass = 5.97237 * Math.pow(10, 24);
    const planetMassVal = planet.mass ? (planet.mass.massValue * Math.pow(10, planet.mass.massExponent)) : 0;
    const relMass = planetMassVal / earthMass;
    
  
    let periodStr = "";
    if (planet.sideralOrbit > 730) {
      periodStr = `${(planet.sideralOrbit / 365.25).toFixed(1)} years`;
    } else {
      periodStr = `${Math.round(planet.sideralOrbit)} days`;
    }
    
 
    const moonsCount = planet.moons ? planet.moons.length : 0;

    const row = document.createElement("tr");
    row.className = "hover:bg-slate-800/30 transition-colors cursor-pointer";
    if (planet.englishName.toLowerCase() === "earth") {
      row.className += " bg-blue-500/5"; 
    }

    row.innerHTML = `
      <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
        <div class="flex items-center space-x-2 md:space-x-3">
          <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color: ${planetColor}"></div>
          <span class="font-semibold text-sm md:text-base text-white whitespace-nowrap">${planet.englishName}</span>
        </div>
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
        ${auDistance.toFixed(2)}
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
        ${Math.round(diameter).toLocaleString()}
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
        ${relMass.toFixed(relMass > 0.01 ? 3 : 4)}
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
        ${periodStr}
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
        ${moonsCount}
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
        <span class="${typeBadge}">${planet.type || planet.bodyType}</span>
      </td>
    `;

    
    row.addEventListener("click", () => {
      
      tableBody.querySelectorAll("tr").forEach(r => r.classList.remove("bg-blue-500/5"));
      row.classList.add("bg-blue-500/5");

      
      selectPlanet(planet.englishName.toLowerCase());
      
      
      const detailsCard = document.querySelector("#planets .grid-cols-1");
      if (detailsCard && window.innerWidth < 1280) {
        detailsCard.scrollIntoView({ behavior: "smooth" });
      }
    });

    tableBody.appendChild(row);
  });
}

function showPlanetsError(message) {
  const tableBody = document.getElementById("planet-comparison-tbody");
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-slate-400">
          <i class="fas fa-exclamation-triangle text-red-400 text-3xl mb-2"></i>
          <p class="font-semibold text-white mb-2">Failed to load solar system metrics</p>
          <p class="text-xs text-slate-500 mb-4">${message}</p>
          <button id="planets-retry-btn" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors font-semibold text-xs text-white">
            <i class="fas fa-redo mr-2"></i>Retry
          </button>
        </td>
      </tr>
    `;

    const retryBtn = tableBody.querySelector("#planets-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        fetchPlanets();
      });
    }
  }
}

/* ==========================================================================
   5. LAUNCH DETAILS MODAL
   ========================================================================== */

function closeLaunchModal() {
  const modal = document.getElementById("launch-details-modal");
  if (modal) {
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.style.transform = "scale(0.97)";
    setTimeout(() => modal.remove(), 250);
  }
  document.body.style.overflow = "";
}

function showLaunchDetailsModal(launch) {

  const existing = document.getElementById("launch-details-modal");
  if (existing) existing.remove();

  const statusBadgeColor = getStatusBadgeClass(launch.status?.abbrev);
  const formattedDate = formatLaunchDate(launch.net);
  const formattedTime = formatLaunchTime(launch.net);
  const countdown = getCountdownDays(launch.net);
  const imageSrc = launch.image?.image_url || launch.pad?.image?.image_url || "./assets/images/launch-placeholder.png";
  const locationName = launch.pad?.location?.name || "Unknown Location";
  const padName = launch.pad?.name || "Unknown Launch Pad";
  const countryName = launch.pad?.country?.name || launch.pad?.location?.country?.name || "Unknown Country";
  const providerName = launch.launch_service_provider?.name || "Unknown Provider";
  const rocketName = launch.rocket?.configuration?.full_name || launch.rocket?.configuration?.name || "Unknown Rocket";
  const missionName = launch.mission?.name || launch.name;
  const missionDesc = launch.mission?.description || "No mission description available for this launch.";
  const probability = launch.probability != null ? `${launch.probability}%` : "N/A";
  const isFav = isFavoriteLaunch(launch.id);

  const modal = document.createElement("div");
  modal.id = "launch-details-modal";
  modal.style.cssText = "position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);transition:opacity 0.2s,transform 0.2s;";

  modal.innerHTML = `
    <div id="launch-modal-inner" style="
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155;
      border-radius: 1.5rem;
      max-width: 56rem;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 25px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1);
    ">
      <!-- Header Image -->
      <div style="position:relative;height:220px;overflow:hidden;border-radius:1.5rem 1.5rem 0 0;">
        <img src="${imageSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='./assets/images/launch-placeholder.png';" />
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,23,42,1) 0%,rgba(15,23,42,0.4) 60%,transparent 100%);"></div>

        <!-- Close button -->
        <button id="modal-close-btn" style="position:absolute;top:1rem;right:1rem;width:2.5rem;height:2.5rem;background:rgba(15,23,42,0.8);border:1px solid #334155;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:#94a3b8;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.2)';this.style.color='#fff'" onmouseout="this.style.background='rgba(15,23,42,0.8)';this.style.color='#94a3b8'">
          <i class="fas fa-times"></i>
        </button>

        <!-- Status badge overlaid on image -->
        <div style="position:absolute;bottom:1rem;left:1.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
          <span style="padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-weight:600;" class="${statusBadgeColor}">
            ${launch.status?.name || "Unknown Status"}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div style="padding:1.5rem 2rem 2rem;">
        <!-- Title Row -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem;">
          <h2 style="font-size:1.5rem;font-weight:700;color:#f8fafc;line-height:1.3;font-family:'Space Grotesk',sans-serif;">${missionName}</h2>
          <button id="modal-fav-btn" style="flex-shrink:0;width:2.5rem;height:2.5rem;background:#1e293b;border:1px solid #334155;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:${isFav ? "#ef4444" : "#94a3b8"};cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='#475569'" onmouseout="this.style.borderColor='#334155'">
            <i class="${isFav ? "fas fa-heart" : "far fa-heart"}"></i>
          </button>
        </div>

        <!-- Provider & Rocket Row -->
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:1.25rem;color:#94a3b8;font-size:0.875rem;">
          <span style="display:flex;align-items:center;gap:0.5rem;">
            <i class="fas fa-building" style="color:#64748b;"></i> ${providerName}
          </span>
          <span style="display:flex;align-items:center;gap:0.5rem;">
            <i class="fas fa-rocket" style="color:#64748b;"></i> ${rocketName}
          </span>
        </div>

        <!-- Countdown Banner -->
        <div style="display:inline-flex;align-items:center;gap:0.75rem;padding:0.75rem 1.25rem;background:linear-gradient(90deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15));border:1px solid rgba(59,130,246,0.2);border-radius:0.75rem;margin-bottom:1.5rem;">
          <i class="fas fa-clock" style="color:#60a5fa;font-size:1.25rem;"></i>
          <div>
            <p style="font-size:1.25rem;font-weight:700;color:#60a5fa;">${countdown.count}</p>
            <p style="font-size:0.7rem;color:#94a3b8;">${countdown.label}</p>
          </div>
        </div>

        <!-- Info Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin-bottom:1.5rem;">
          <div style="background:rgba(255,255,255,0.03);border:1px solid #1e293b;border-radius:0.75rem;padding:0.875rem;">
            <p style="font-size:0.7rem;color:#64748b;margin-bottom:0.25rem;display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-calendar"></i> Launch Date</p>
            <p style="font-weight:600;color:#e2e8f0;font-size:0.9rem;">${formattedDate}</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid #1e293b;border-radius:0.75rem;padding:0.875rem;">
            <p style="font-size:0.7rem;color:#64748b;margin-bottom:0.25rem;display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-clock"></i> Launch Time</p>
            <p style="font-weight:600;color:#e2e8f0;font-size:0.9rem;">${formattedTime}</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid #1e293b;border-radius:0.75rem;padding:0.875rem;">
            <p style="font-size:0.7rem;color:#64748b;margin-bottom:0.25rem;display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-map-marker-alt"></i> Launch Pad</p>
            <p style="font-weight:600;color:#e2e8f0;font-size:0.9rem;">${padName}</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid #1e293b;border-radius:0.75rem;padding:0.875rem;">
            <p style="font-size:0.7rem;color:#64748b;margin-bottom:0.25rem;display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-globe"></i> Location</p>
            <p style="font-weight:600;color:#e2e8f0;font-size:0.9rem;">${locationName}</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid #1e293b;border-radius:0.75rem;padding:0.875rem;">
            <p style="font-size:0.7rem;color:#64748b;margin-bottom:0.25rem;display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-flag"></i> Country</p>
            <p style="font-weight:600;color:#e2e8f0;font-size:0.9rem;">${countryName}</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid #1e293b;border-radius:0.75rem;padding:0.875rem;">
            <p style="font-size:0.7rem;color:#64748b;margin-bottom:0.25rem;display:flex;align-items:center;gap:0.4rem;"><i class="fas fa-percent"></i> Probability</p>
            <p style="font-weight:600;color:#e2e8f0;font-size:0.9rem;">${probability}</p>
          </div>
        </div>

        <!-- Mission Description -->
        <div style="background:rgba(255,255,255,0.02);border:1px solid #1e293b;border-radius:0.75rem;padding:1.25rem;margin-bottom:1.5rem;">
          <h4 style="font-weight:600;color:#94a3b8;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.625rem;display:flex;align-items:center;gap:0.5rem;">
            <i class="fas fa-satellite" style="color:#818cf8;"></i> Mission Description
          </h4>
          <p style="color:#cbd5e1;line-height:1.7;font-size:0.9rem;">${missionDesc}</p>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
          ${launch.pad?.map_url ? `
            <a href="${launch.pad.map_url}" target="_blank" rel="noopener noreferrer" style="flex:1;min-width:140px;padding:0.75rem 1rem;background:#1e293b;border:1px solid #334155;border-radius:0.75rem;color:#e2e8f0;font-weight:600;font-size:0.875rem;text-align:center;display:flex;align-items:center;justify-content:center;gap:0.5rem;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.borderColor='#475569';this.style.background='#263347'" onmouseout="this.style.borderColor='#334155';this.style.background='#1e293b'">
              <i class="fas fa-map-marked-alt" style="color:#60a5fa;"></i> View Launch Site
            </a>
          ` : ""}
          ${launch.vid_urls && launch.vid_urls.length > 0 ? `
            <a href="${launch.vid_urls[0].url}" target="_blank" rel="noopener noreferrer" style="flex:1;min-width:140px;padding:0.75rem 1rem;background:#1e293b;border:1px solid #334155;border-radius:0.75rem;color:#e2e8f0;font-weight:600;font-size:0.875rem;text-align:center;display:flex;align-items:center;justify-content:center;gap:0.5rem;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.borderColor='#475569';this.style.background='#263347'" onmouseout="this.style.borderColor='#334155';this.style.background='#1e293b'">
              <i class="fas fa-video" style="color:#a78bfa;"></i> Watch Livestream
            </a>
          ` : ""}
          <button id="modal-close-bottom" style="flex:1;min-width:140px;padding:0.75rem 1rem;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:0.75rem;color:#60a5fa;font-weight:600;font-size:0.875rem;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.2)'" onmouseout="this.style.background='rgba(59,130,246,0.1)'">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  
  requestAnimationFrame(() => {
    modal.style.opacity = "1";
    const inner = modal.querySelector("#launch-modal-inner");
    if (inner) inner.style.transition = "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)";
  });

  
  const closeBtn = modal.querySelector("#modal-close-btn");
  const closeBtnBottom = modal.querySelector("#modal-close-bottom");
  if (closeBtn) closeBtn.addEventListener("click", closeLaunchModal);
  if (closeBtnBottom) closeBtnBottom.addEventListener("click", closeLaunchModal);

 
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLaunchModal();
  });

  const favBtn = modal.querySelector("#modal-fav-btn");
  if (favBtn) {
    favBtn.addEventListener("click", () => toggleFavoriteLaunch(launch.id, favBtn));
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLaunchModal();
});