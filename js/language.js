// Language Switcher
(function() {
    function initLanguageSwitcher() {
        const languageSelect = document.getElementById('languageSelect');
        
        if (!languageSelect) {
            // Wait a bit if script loads before DOM
            setTimeout(initLanguageSwitcher, 100);
            return;
        }
        
        // Set current language in selector
        if (typeof LanguageManager !== 'undefined') {
            languageSelect.value = LanguageManager.currentLang;
        }
        
        // Handle language change
        languageSelect.addEventListener('change', (e) => {
            if (typeof LanguageManager !== 'undefined') {
                LanguageManager.setLanguage(e.target.value);
            }
        });
        
        // Update selector when language changes (from other pages)
        document.addEventListener('languageChanged', (e) => {
            if (languageSelect) {
                languageSelect.value = e.detail.lang;
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
    } else {
        // Wait a bit to ensure LanguageManager is initialized
        setTimeout(initLanguageSwitcher, 50);
    }
})();
