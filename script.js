// ================= PAGE MOVE =================
const loader = document.getElementById("loader");

document.body.classList.add("loading");

const ADMIN_CODE = "0904";

function goPage(url) {
    window.location.href = url;
}

function requestAdminAccess() {
    const code = prompt("관리자 번호 4자리를 입력해주세요.");
    if (code === null) return;
    const trimmed = code.trim();
    if (!/^\d{4}$/.test(trimmed)) {
        alert("4자리 숫자로 입력해주세요.");
        return;
    }
    if (trimmed === ADMIN_CODE) {
        localStorage.setItem("zeta_admin_auth", "true");
        goPage("admin.html");
        return;
    }
    alert("관리자 번호가 틀렸습니다.");
}

// ================= MOBILE NAV / THEME =================
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");
const themeToggle = document.getElementById("themeToggle");

function toggleMobileNav() {
    if (!mobileNav || !navToggle) return;
    const open = mobileNav.classList.toggle("open");
    mobileNav.setAttribute("aria-hidden", String(!open));
    navToggle.setAttribute("aria-expanded", String(open));
}

if (navToggle) {
    navToggle.addEventListener("click", toggleMobileNav);
}

function applyTheme(theme) {
    // clear previous theme classes and set the requested one explicitly
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme === "dark" ? "dark" : "light");
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    localStorage.setItem("site-theme", theme);
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const next = document.body.classList.contains("dark") ? "light" : "dark";
        applyTheme(next);
    });
}

// initialize theme from storage (default: dark)
applyTheme(localStorage.getItem("site-theme") || "dark");

// ================= SCROLL MOVE =================
function scrollToSection(id) {
    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}

function initDropdownMenus() {
    const menuButtons = document.querySelectorAll('nav .menu > button');
    menuButtons.forEach((button) => {
        const menu = button.closest('.menu');
        if (!menu || !menu.querySelector('.dropdown')) return;

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            menu.classList.toggle('open');
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('nav .menu.open')) {
            document.querySelectorAll('nav .menu.open').forEach((openMenu) => {
                openMenu.classList.remove('open');
            });
        }
    });
}

function initializePage() {
    initDropdownMenus();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage);
} else {
    initializePage();
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================= CONTACT =================
function getFaqQuestions() {
    try {
        return JSON.parse(localStorage.getItem('zeta_faq_questions') || '[]');
    } catch (e) {
        return [];
    }
}

function saveFaqQuestions(questions) {
    localStorage.setItem('zeta_faq_questions', JSON.stringify(questions));
}

function renderFaqQuestions() {
    const wrap = document.getElementById('faqQuestionsList');
    if (!wrap) return;

    const questions = getFaqQuestions().slice().reverse();
    if (!questions.length) {
        wrap.innerHTML = '<p class="faq-empty">아직 등록된 질문이 없습니다.</p>';
        return;
    }

    wrap.innerHTML = questions.map((item) => `
        <article class="faq-public-item ${item.status === 'answered' ? 'answered' : ''}">
            <header>
                <strong>업체명 : ${item.company ? item.company : '업체 미입력'}</strong>
            </header>
            <p class="faq-public-question">${item.question}</p>
            <div class="faq-public-meta">${new Date(item.createdAt).toLocaleString()}</div>
            <div class="faq-public-answer">
                ${item.answer ? `<strong>답변:</strong> ${item.answer}` : '<em>관리자가 답변을 준비 중입니다.</em>'}
            </div>
        </article>
    `).join('');
}

async function sendMsg() {
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const msg = document.getElementById("msg");
    const attachmentInput = document.getElementById("attachment");
    const sendButton = document.getElementById("sendButton");
    const formStatus = document.getElementById("formStatus");
    const nameValue = name.value.trim();
    const phoneValue = phone.value.trim();
    const msgValue = msg.value.trim();

    if (!nameValue || !phoneValue || !msgValue) {
        formStatus.textContent = "모든 항목을 입력해주세요.";
        formStatus.className = "form-status error";
        (!nameValue ? name : !phoneValue ? phone : msg).focus();
        return;
    }

    if (msgValue.length < 10) {
        formStatus.textContent = "문의 내용을 좀 더 자세히 적어주세요.";
        formStatus.className = "form-status error";
        msg.focus();
        return;
    }

    // 간단한 연락처 형식 검사 (이메일 또는 전화번호)
    const isEmail = phoneValue.includes("@");
    if (isEmail) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(phoneValue)) {
            formStatus.textContent = "유효한 이메일 주소를 입력해주세요.";
            formStatus.className = "form-status error";
            phone.focus();
            return;
        }
    } else {
        const phoneRe = /[0-9]{8,15}/;
        if (!phoneRe.test(phoneValue.replace(/[^0-9]/g, ""))) {
            formStatus.textContent = "유효한 전화번호를 입력해주세요.";
            formStatus.className = "form-status error";
            phone.focus();
            return;
        }
    }

    sendButton.disabled = true;
    formStatus.textContent = "메시지를 전송중입니다...";
    formStatus.className = "form-status";

    // handle attachment (optional)
    let attachmentData = null;
    if (attachmentInput && attachmentInput.files && attachmentInput.files.length) {
        const file = attachmentInput.files[0];
        try {
            attachmentData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (e) {
            console.warn('Attachment read failed', e);
        }
    }

    try {
        const messages = JSON.parse(localStorage.getItem('zeta_messages') || '[]');
        messages.push({
            name: nameValue,
            contact: phoneValue,
            message: msgValue,
            attachment: attachmentData,
            receivedAt: new Date().toISOString(),
            status: 'queued'
        });
        localStorage.setItem('zeta_messages', JSON.stringify(messages));

        window.setTimeout(() => {
            formStatus.textContent = "메시지가 전송되었습니다. 빠르게 연락드리겠습니다.";
            formStatus.className = "form-status success";
            sendButton.disabled = false;
            name.value = "";
            phone.value = "";
            msg.value = "";
            if (attachmentInput) {
                attachmentInput.value = "";
                const preview = document.getElementById('attachmentPreview');
                if (preview) { preview.innerHTML = ''; preview.setAttribute('aria-hidden','true'); }
            }
        }, 700);
    } catch (err) {
        formStatus.textContent = "전송 중 오류가 발생했습니다. 다시 시도해주세요.";
        formStatus.className = "form-status error";
        sendButton.disabled = false;
    }
}

function createFaqQuestionEntry(event) {
    event.preventDefault();
    const form = document.getElementById('faqQuestionForm');
    if (!form) return;

    const name = document.getElementById('faqName');
    const company = document.getElementById('faqCompany');
    const contact = document.getElementById('faqContact');
    const question = document.getElementById('faqQuestion');
    const status = document.getElementById('faqStatus');
    const submitButton = document.getElementById('faqSubmitButton');

    const nameValue = name.value.trim();
    const companyValue = company.value.trim();
    const contactValue = contact.value.trim();
    const questionValue = question.value.trim();

    if (!nameValue || !contactValue || !questionValue) {
        status.textContent = '필수 항목을 모두 입력해주세요.';
        status.className = 'form-status error';
        return;
    }

    if (questionValue.length < 10) {
        status.textContent = '질문을 조금 더 자세히 적어주세요.';
        status.className = 'form-status error';
        question.focus();
        return;
    }

    submitButton.disabled = true;
    status.textContent = '질문을 등록하고 있습니다...';
    status.className = 'form-status';

    const questions = getFaqQuestions();
    questions.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        name: nameValue,
        company: companyValue,
        contact: contactValue,
        question: questionValue,
        answer: '',
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    saveFaqQuestions(questions);
    renderFaqQuestions();

    setTimeout(() => {
        form.reset();
        status.textContent = '질문이 등록되었습니다. 관리자 확인 후 답변드립니다.';
        status.className = 'form-status success';
        submitButton.disabled = false;
    }, 500);
}

if (document.getElementById('faqQuestionForm')) {
    document.getElementById('faqQuestionForm').addEventListener('submit', createFaqQuestionEntry);
}

renderFaqQuestions();

// ================= FADE ANIMATION & WEATHER =================
const fades = document.querySelectorAll(".fade");
const header = document.querySelector(".header");
const topBtn = document.getElementById("topBtn");
const navButtons = document.querySelectorAll(".nav-button[data-section]");
const counters = document.querySelectorAll(".count");
const autoPauseVideos = document.querySelectorAll("#portfolio video");
const flightStatus = document.getElementById("flightStatus");
const weatherLocation = document.getElementById("weatherLocation");
const windSpeed = document.getElementById("windSpeed");
const windDirection = document.getElementById("windDirection");
const precipitation = document.getElementById("precipitation");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const forecastList = document.getElementById("forecastList");
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
    if (windDirection) windDirection.textContent = (values.windDir ?? "--");
    precipitation.textContent = values.rain.toFixed(1);
    temperature.textContent = values.temp.toFixed(1);
    if (humidity) humidity.textContent = (values.humidity ?? 0).toFixed(0);
    if (sunriseEl) sunriseEl.textContent = values.sunrise || "—";
    if (sunsetEl) sunsetEl.textContent = values.sunset || "—";

    // build a small 3-day forecast
    if (forecastList && values.forecast && Array.isArray(values.forecast)) {
        forecastList.innerHTML = values.forecast
            .slice(0, 3)
            .map((d) => `<div class="forecast-item"><strong>${d.date}</strong><span>${d.min}° / ${d.max}°</span></div>`)
            .join("");
    }
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
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Weather request failed");

        const data = await response.json();

        const cw = data.current_weather || {};
        const windKmh = cw.windspeed ? Number(cw.windspeed) * 3.6 : 0;

        let humidityVal = 0;
        let precipVal = 0;
        if (data.hourly && Array.isArray(data.hourly.time)) {
            const nowISO = new Date().toISOString().slice(0, 13) + ":00";
            const idx = data.hourly.time.indexOf(nowISO);
            if (idx >= 0) {
                humidityVal = Number((data.hourly.relativehumidity_2m && data.hourly.relativehumidity_2m[idx]) || 0);
                precipVal = Number((data.hourly.precipitation && data.hourly.precipitation[idx]) || 0);
            }
        }

        const values = {
            wind: Number(windKmh || 0),
            windDir: cw.winddirection ?? "--",
            rain: Number(precipVal || 0),
            temp: Number(cw.temperature ?? 0),
            humidity: Number(humidityVal || 0),
            sunrise: data.daily && data.daily.sunrise ? (data.daily.sunrise[0] || "—") : "—",
            sunset: data.daily && data.daily.sunset ? (data.daily.sunset[0] || "—") : "—",
            forecast: (data.daily && data.daily.time) ? data.daily.time.map((d, i) => ({ date: d, min: data.daily.temperature_2m_min[i], max: data.daily.temperature_2m_max[i] })) : []
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

// ================= PORTFOLIO FILTER / CAROUSEL =================
const filterBtns = document.querySelectorAll(".filter-btn");
const slides = document.getElementById("slides");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");

function applyFilter(filter) {
    const items = slides ? slides.querySelectorAll(".portfolio-link") : [];
    items.forEach((it) => {
        const cat = it.dataset.category || "all";
        it.style.display = filter === "all" || cat === filter ? "block" : "none";
    });
}

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
    });
});

if (prevSlide && nextSlide && slides) {
    prevSlide.addEventListener("click", () => {
        slides.scrollBy({ left: -340, behavior: "smooth" });
    });

    nextSlide.addEventListener("click", () => {
        slides.scrollBy({ left: 340, behavior: "smooth" });
    });

    // 💡 슬라이더 터치/포인터 드래그 제어 스크립트 수정
    // 드래그 중에는 클릭을 무시하고, 단순 클릭(미세 움직임)일 때만 HTML의 onclick이 완벽히 작동하게 보정했습니다.
    let isDown = false, startX, scrollLeft, startTimeDrag;
    
    slides.addEventListener("pointerdown", (e) => {
        isDown = true;
        slides.classList.add('dragging');
        startX = e.pageX - slides.offsetLeft;
        scrollLeft = slides.scrollLeft;
        startTimeDrag = performance.now();
        slides.setPointerCapture(e.pointerId);
    });
    
    slides.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        const x = e.pageX - slides.offsetLeft;
        const walk = (x - startX) * 1; //scroll-fast
        slides.scrollLeft = scrollLeft - walk;
    });
    
    slides.addEventListener("pointerup", (e) => {
        isDown = false;
        slides.classList.remove('dragging');
        try { slides.releasePointerCapture(e.pointerId); } catch(err) {}

        const endTimeDrag = performance.now();
        const endX = e.pageX - slides.offsetLeft;
        const walk = Math.abs(endX - startX);

        // 사용자가 슬라이드를 드래그하여 움직인 거리가 7px 이상이거나, 꾹 누르고 오래 머문 드래그라면 클릭 이벤트를 씹어버립니다.
        if (walk > 7 || (endTimeDrag - startTimeDrag) > 250) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// ================= ESTIMATE =================
function initEstimate() {
    const calcBtn = document.getElementById('calcEstimate');
    const serviceEl = document.getElementById('service-type');
    const detailEl = document.getElementById('detail-service');
    const hoursEl = document.getElementById('estHours');
    const out = document.getElementById('estOutput');
    if (!calcBtn || !serviceEl || !detailEl || !hoursEl || !out) return;

    const detailOptions = {
        shooting: [
            { value: 'sensor', label: '일반 센서 드론 촬영 (기본가)', multiplier: 1 },
            { value: 'fpv', label: '다이나믹 FPV 촬영 (기본가 + 30% 추가)', multiplier: 1.3 },
            { value: 'premium', label: '프리미엄 종합 패키지 (일반 + FPV 믹스, 기본가 + 50% 추가)', multiplier: 1.5 },
        ],
        production: [
            { value: 'basic-edit', label: '기본 영상 제작 (기본가)', multiplier: 1 },
            { value: 'grade', label: '컬러 그레이딩 & 모션 추가 (+20%)', multiplier: 1.2 },
            { value: 'social', label: 'SNS 컷 편집 패키지 (+35%)', multiplier: 1.35 },
        ],
        training: [
            { value: 'basic-course', label: '기본 비행 교육 (기본가)', multiplier: 1 },
            { value: 'fpv-course', label: 'FPV 실습 훈련 (+20%)', multiplier: 1.2 },
            { value: 'custom-curriculum', label: '맞춤 커리큘럼 (+40%)', multiplier: 1.4 },
        ],
    };

    const baseRates = { shooting: 120000, production: 180000, training: 90000 };

    function updateDetailOptions() {
        const service = serviceEl.value;
        const options = detailOptions[service] || detailOptions.shooting;
        detailEl.innerHTML = options
            .map((item) => `<option value="${item.value}">${item.label}</option>`)
            .join('');
    }

    function calc() {
        const service = serviceEl.value;
        const detail = detailEl.value;
        const hours = Math.max(1, Number(hoursEl.value) || 1);
        const rate = baseRates[service] || baseRates.shooting;
        const option = detailOptions[service].find((item) => item.value === detail) || detailOptions[service][0];
        const multiplier = option ? option.multiplier : 1;
        const total = rate * hours * multiplier;
        out.textContent = '₩ ' + Math.round(total).toLocaleString();
    }

    serviceEl.addEventListener('change', () => {
        updateDetailOptions();
    });

    updateDetailOptions();
    calcBtn.addEventListener('click', calc);
}

// ================= SCROLL ANIMATIONS =================
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

// ================= PAGE INITIALIZATION =================
window.addEventListener("load", () => {
    window.setTimeout(() => {
        if (loader) {
            loader.classList.add("hide");
        }

        document.body.classList.remove("loading");
        handleScroll();
        initFlightWeather();
        initVideoPlaybackObserver();
        initEstimate();

        const attach = document.getElementById('attachment');
        const preview = document.getElementById('attachmentPreview');
        if (attach && preview) {
            attach.addEventListener('change', () => {
                preview.innerHTML = '';
                if (attach.files && attach.files.length) {
                    const file = attach.files[0];
                    if (/^image\//.test(file.type)) {
                        const img = document.createElement('img');
                        img.src = URL.createObjectURL(file);
                        img.alt = file.name;
                        img.style.maxWidth = '100%';
                        preview.appendChild(img);
                        preview.setAttribute('aria-hidden', 'false');
                    } else {
                        preview.textContent = file.name;
                        preview.setAttribute('aria-hidden', 'false');
                    }
                } else {
                    preview.setAttribute('aria-hidden', 'true');
                }
            });
        }

        if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
            navigator.serviceWorker.register('/service-worker.js').catch(() => {});
        }
    }, 900);
});

window.addEventListener("scroll", handleScroll);