(function () {
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');
    const themeToggle = document.getElementById('themeToggle');

    function setTheme(theme) {
        document.body.classList.toggle('light', theme === 'light');
        if (themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
        localStorage.setItem('site-theme', theme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            setTheme(document.body.classList.contains('light') ? 'dark' : 'light');
        });
    }

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            const isOpen = mobileNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            mobileNav.setAttribute('aria-hidden', String(!isOpen));
        });
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileNav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                mobileNav.setAttribute('aria-hidden', 'true');
            });
        });
    }

    setTheme(localStorage.getItem('site-theme') || 'dark');

    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries, currentObserver) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                currentObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        revealItems.forEach(function (item) { observer.observe(item); });
    } else {
        revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }
})();