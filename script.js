// ================= PAGE MOVE =================
const loader = document.getElementById("loader");

document.body.classList.add("loading");

function goPage(url) {
    window.location.href = url;
}

// ================= SCROLL MOVE =================
function scrollToSection(id) {
    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================= CONTACT =================
function sendMsg() {
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const msg = document.getElementById("msg");
    const sendButton = document.getElementById("sendButton");
    const formStatus = document.getElementById("formStatus");
    const nameValue = name.value.trim();
    const phoneValue = phone.value.trim();
    const msgValue = msg.value.trim();

    if (!nameValue || !phoneValue || !msgValue) {
        formStatus.textContent = "All fields are required.";
        formStatus.className = "form-status error";
        (!nameValue ? name : !phoneValue ? phone : msg).focus();
        return;
    }

    if (msgValue.length < 10) {
        formStatus.textContent = "Please add a little more detail to the message.";
        formStatus.className = "form-status error";
        msg.focus();
        return;
    }

    sendButton.disabled = true;
    formStatus.textContent = "Sending your message...";
    formStatus.className = "form-status";

    window.setTimeout(() => {
        formStatus.textContent = "Message sent. We will get back to you soon.";
        formStatus.className = "form-status success";
        sendButton.disabled = false;
        name.value = "";
        phone.value = "";
        msg.value = "";
    }, 700);
}

// ================= FADE ANIMATION =================
const fades = document.querySelectorAll(".fade");
const header = document.querySelector(".header");
const topBtn = document.getElementById("topBtn");
const navButtons = document.querySelectorAll(".nav-button[data-section]");
const counters = document.querySelectorAll(".count");
const autoPauseVideos = document.querySelectorAll("#portfolio video");
const portfolioLinks = document.querySelectorAll(".portfolio-link[data-video-id]");
const videoModal = document.getElementById("videoModal");
const videoModalFrame = document.getElementById("videoModalFrame");
const videoModalClose = document.getElementById("videoModalClose");
const flightStatus = document.getElementById("flightStatus");
const weatherLocation = document.getElementById("weatherLocation");
const windSpeed = document.getElementById("windSpeed");
const precipitation = document.getElementById("precipitation");
const temperature = document.getElementById("temperature");
const trackedSections = [...navButtons]
    .map((button) => document.getElementById(button.dataset.section))
    .filter(Boolean);

function updateWeatherStatus(status, locationText, values) {
    if (!flightStatus || !weatherLocation || !windSpeed || !precipitation || !temperature) {
        return;
    }

    flightStatus.className = `flight-status ${status.className}`;
    flightStatus.textContent = status.label;
    weatherLocation.textContent = locationText;
    windSpeed.textContent = values.wind.toFixed(1);
    precipitation.textContent = values.rain.toFixed(1);
    temperature.textContent = values.temp.toFixed(1);
}

function getFlightCondition(values) {
    if (values.wind <= 20 && values.rain < 0.5) {
        return { label: "GOOD", className: "good" };
    }

    if (values.wind <= 30 && values.rain < 2) {
        return { label: "CAUTION", className: "caution" };
    }

    return { label: "NO FLY", className: "no-fly" };
}

async function fetchFlightWeather(latitude, longitude, locationLabel) {
    if (!flightStatus) {
        return;
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();
        const current = data.current || {};
        const values = {
            wind: Number(current.wind_speed_10m ?? 0),
            rain: Number(current.precipitation ?? 0),
            temp: Number(current.temperature_2m ?? 0)
        };
        const status = getFlightCondition(values);

        updateWeatherStatus(status, locationLabel, values);
    } catch (error) {
        flightStatus.className = "flight-status caution";
        flightStatus.textContent = "UNAVAILABLE";
        weatherLocation.textContent = "Weather data is temporarily unavailable.";
    }
}

function initFlightWeather() {
    const fallback = { latitude: 37.5665, longitude: 126.9780, label: "Seoul fallback weather" };

    if (!navigator.geolocation) {
        fetchFlightWeather(fallback.latitude, fallback.longitude, fallback.label);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            fetchFlightWeather(
                position.coords.latitude,
                position.coords.longitude,
                "Current local weather"
            );
        },
        () => {
            fetchFlightWeather(fallback.latitude, fallback.longitude, fallback.label);
        },
        {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 300000
        }
    );
}

function initVideoPlaybackObserver() {
    if (!autoPauseVideos.length) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const video = entry.target;

                if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        },
        {
            threshold: [0, 0.35, 0.6]
        }
    );

    autoPauseVideos.forEach((video) => observer.observe(video));
}

function buildEmbedUrl(videoId) {
    const params = new URLSearchParams({
        autoplay: "1",
        playsinline: "1",
        rel: "0",
        modestbranding: "1"
    });

    if (window.location.protocol.startsWith("http")) {
        params.set("origin", window.location.origin);
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function openVideoModal(videoId) {
    if (!videoModal || !videoModalFrame) {
        return;
    }

    videoModalFrame.src = buildEmbedUrl(videoId);
    videoModal.classList.add("open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("loading");
}

function closeVideoModal() {
    if (!videoModal || !videoModalFrame) {
        return;
    }

    videoModal.classList.remove("open");
    videoModal.setAttribute("aria-hidden", "true");
    videoModalFrame.src = "";
    document.body.classList.remove("loading");
}

function initVideoModal() {
    if (!portfolioLinks.length || !videoModal) {
        return;
    }

    portfolioLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            openVideoModal(link.dataset.videoId);
        });
    });

    videoModal.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
            closeVideoModal();
        }
    });

    if (videoModalClose) {
        videoModalClose.addEventListener("click", closeVideoModal);
    }

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && videoModal.classList.contains("open")) {
            closeVideoModal();
        }
    });
}

function animateCounter(counter) {
    const target = Number(counter.dataset.target || 0);
    const duration = 1400;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(target * eased).toLocaleString();

        if (progress < 1) {
            window.requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = target.toLocaleString();
        }
    }

    window.requestAnimationFrame(updateCounter);
}

function revealOnScroll() {
    fades.forEach((el) => {
        const top = el.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {
            el.classList.add("show");
        }
    });

    counters.forEach((counter) => {
        const rect = counter.getBoundingClientRect();

        if (rect.top < window.innerHeight - 40 && !counter.dataset.animated) {
            counter.dataset.animated = "true";
            animateCounter(counter);
        }
    });
}

function updateHeaderOnScroll() {
    if (!header) {
        return;
    }

    header.classList.toggle("scrolled", window.scrollY > 40);
}

function updateTopButton() {
    if (!topBtn) {
        return;
    }

    topBtn.classList.toggle("show", window.scrollY > 320);
}

function updateActiveNav() {
    if (!navButtons.length || !trackedSections.length) {
        return;
    }

    let activeSectionId = "";
    const checkpoint = window.innerHeight * 0.35;

    trackedSections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        if (rect.top <= checkpoint && rect.bottom >= checkpoint) {
            activeSectionId = section.id;
        }
    });

    navButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.section === activeSectionId);
    });
}

function handleScroll() {
    revealOnScroll();
    updateHeaderOnScroll();
    updateActiveNav();
    updateTopButton();
}

window.addEventListener("load", () => {
    window.setTimeout(() => {
        if (loader) {
            loader.classList.add("hide");
        }

        document.body.classList.remove("loading");
        handleScroll();
        initFlightWeather();
        initVideoPlaybackObserver();
        initVideoModal();
    }, 900);
});

window.addEventListener("scroll", handleScroll);
