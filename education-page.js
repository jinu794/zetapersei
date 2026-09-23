(function () {
    var revealItems = document.querySelectorAll('.education-reveal');
    var observers = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries, current) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            current.unobserve(entry.target);
        });
    }, { threshold: 0.12 }) : null;
    revealItems.forEach(function (item) { if (observers) observers.observe(item); else item.classList.add('is-visible'); });

    var lines = document.querySelectorAll('.education-roadmap-line, .education-process-line');
    function updateProgress() {
        lines.forEach(function (line) {
            var box = line.getBoundingClientRect();
            var value = Math.max(0, Math.min(100, ((window.innerHeight * 0.72 - box.top) / box.height) * 100));
            line.style.setProperty('--education-progress', value + '%');
        });
    }
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
})();
