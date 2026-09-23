(function () {
    var timeline = document.querySelector('.production-timeline');
    if (!timeline) return;

    function updateTimeline() {
        var box = timeline.getBoundingClientRect();
        var progress = Math.max(0, Math.min(100, ((window.innerHeight * 0.72 - box.top) / box.height) * 100));
        timeline.style.setProperty('--timeline-progress', progress + '%');
    }

    updateTimeline();
    window.addEventListener('scroll', updateTimeline, { passive: true });
    window.addEventListener('resize', updateTimeline);
})();
