// Shooting Star Animation
(function() {
    // Wait for DOM to be ready
    function init() {
        const shootingStars = [
            document.getElementById('shootingStar1'),
            document.getElementById('shootingStar2'),
            document.getElementById('shootingStar3'),
            document.getElementById('shootingStar4'),
            document.getElementById('shootingStar5')
        ].filter(star => star !== null);

        if (shootingStars.length === 0) {
            // Retry after a short delay if elements aren't ready
            setTimeout(init, 100);
            return;
        }

        let shootingStarIntervals = [];
        let isDarkMode = false;

        function checkTheme() {
            const theme = document.documentElement.getAttribute('data-theme');
            isDarkMode = theme === 'dark';
            
            if (isDarkMode) {
                startShootingStars();
            } else {
                stopShootingStars();
            }
        }

        function startShootingStars() {
            // Clear any existing intervals
            stopShootingStars();

            // Start each shooting star with different timings - less frequent
            shootingStars.forEach((star, index) => {
                // Stagger the initial delays (0-5s, 2-7s, 4-9s, etc.)
                const initialDelay = (index * 2000) + Math.random() * 3000;
                // Less frequent intervals: 12-20 seconds
                const interval = 12000 + (index * 1000) + Math.random() * 8000;
                
                setTimeout(() => {
                    triggerShootingStar(star);
                    const intervalId = setInterval(() => {
                        triggerShootingStar(star);
                    }, interval);
                    shootingStarIntervals.push(intervalId);
                }, initialDelay);
            });
        }

        function stopShootingStars() {
            shootingStarIntervals.forEach(intervalId => {
                clearInterval(intervalId);
            });
            shootingStarIntervals = [];
            
            shootingStars.forEach(star => {
                star.classList.remove('active');
            });
        }

        function triggerShootingStar(star) {
            if (!isDarkMode) return;
            if (!star) return;

            // Random starting position (anywhere on top half of screen)
            const startTop = Math.random() * 50 - 10; // -10% to 40% (top half of screen)
            const startRight = Math.random() * 120 - 10; // -10% to 110% (anywhere horizontally)
            
            // Random ending position (anywhere on bottom half of screen)
            const endTop = 60 + Math.random() * 50; // 60% to 110% (bottom half of screen)
            const endRight = Math.random() * 120 - 10; // -10% to 110% (anywhere horizontally)
            
            // Add some random curve variation (midpoint offset) - creates smooth curved path
            // Smaller variation for smoother movement
            const midTop = (startTop + endTop) / 2 + (Math.random() * 15 - 7.5); // -7.5% to +7.5% variation
            const midRight = (startRight + endRight) / 2 + (Math.random() * 15 - 7.5); // -7.5% to +7.5% variation
            
            // Calculate angles at different points for curved path
            // Start angle (from start to mid) - trail follows this direction
            const deltaXStart = midRight - startRight;
            const deltaYStart = midTop - startTop;
            const angleStart = Math.atan2(deltaYStart, deltaXStart) * (180 / Math.PI) - 90;
            
            // Mid angle (from mid to end)
            const deltaXMid = endRight - midRight;
            const deltaYMid = endTop - midTop;
            const angleMid = Math.atan2(deltaYMid, deltaXMid) * (180 / Math.PI) - 90;
            
            // End angle (final direction)
            const deltaXEnd = endRight - startRight;
            const deltaYEnd = endTop - startTop;
            const angleEnd = Math.atan2(deltaYEnd, deltaXEnd) * (180 / Math.PI) - 90;
            
            // Use the start angle for initial trail direction
            const currentAngle = angleStart;
            
            // Random trail length for variety (smaller)
            const trailLength = 250 + Math.random() * 150; // 250px to 400px
            
            // Apply calculated angles and positions via CSS variables
            star.style.setProperty('--star-angle', `${currentAngle}deg`);
            star.style.setProperty('--star-angle-start', `${angleStart}deg`);
            star.style.setProperty('--star-angle-mid', `${angleMid}deg`);
            star.style.setProperty('--star-angle-end', `${angleEnd}deg`);
            star.style.setProperty('--star-start-top', `${startTop}%`);
            star.style.setProperty('--star-start-right', `${startRight}%`);
            star.style.setProperty('--star-mid-top', `${midTop}%`);
            star.style.setProperty('--star-mid-right', `${midRight}%`);
            star.style.setProperty('--star-end-top', `${endTop}%`);
            star.style.setProperty('--star-end-right', `${endRight}%`);
            star.style.setProperty('--trail-length', `${trailLength}px`);

            // Remove active class to reset animation
            star.classList.remove('active');
            
            // Force reflow to restart animation
            void star.offsetWidth;
            
            // Add active class to start animation immediately
            requestAnimationFrame(() => {
                star.classList.add('active');
            });
        }

        // Check theme on load
        checkTheme();

        // Watch for theme changes
        const themeObserver = new MutationObserver(() => {
            checkTheme();
        });
        themeObserver.observe(document.documentElement, { 
            attributes: true, 
            attributeFilter: ['data-theme'] 
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
