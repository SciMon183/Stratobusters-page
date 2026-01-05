// Updates/Blog Management - Loads from blog folder
(function() {
    const updatesContainer = document.getElementById('updatesContainer');
    
    function getTranslation(key) {
        if (typeof LanguageManager !== 'undefined') {
            return LanguageManager.get(key);
        }
        return key;
    }

    async function loadUpdates() {
        try {
            // Try to load from manifest file
            const response = await fetch('blog/manifest.json');
            if (response.ok) {
                const manifest = await response.json();
                const updates = manifest.updates || [];
                
                // Sort by date (newest first)
                updates.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                renderUpdates(updates);
            } else {
                // Fallback: try to load individual files
                loadUpdatesFromFiles();
            }
        } catch (error) {
            console.log('Using default updates. Add update files to blog/ folder.');
            renderUpdates([
                {
                    title: 'Welcome to StratoBusters!',
                    date: new Date().toISOString().split('T')[0],
                    content: '<p>We are excited to announce the launch of our CanSat project website. Stay tuned for updates on our progress!</p>'
                }
            ]);
        }
    }

    async function loadUpdatesFromFiles() {
        // This would require server-side support to list files
        // For now, we'll use the manifest approach
        renderUpdates([]);
    }
    
    function getUpdateContent(update) {
        if (typeof LanguageManager === 'undefined') return update.content;
        const lang = LanguageManager.currentLang;
        
        // Support bilingual content: content_en, content_pl, or just content
        if (lang === 'pl' && update.content_pl) {
            return update.content_pl;
        } else if (lang === 'en' && update.content_en) {
            return update.content_en;
        }
        return update.content || '';
    }
    
    function getUpdateTitle(update) {
        if (typeof LanguageManager === 'undefined') return update.title;
        const lang = LanguageManager.currentLang;
        
        // Support bilingual titles: title_en, title_pl, or just title
        if (lang === 'pl' && update.title_pl) {
            return update.title_pl;
        } else if (lang === 'en' && update.title_en) {
            return update.title_en;
        }
        return update.title || '';
    }
    
    function getImageCaption(img) {
        if (typeof LanguageManager === 'undefined') return img.caption || '';
        const lang = LanguageManager.currentLang;
        
        // Support bilingual captions: caption_en, caption_pl, or just caption
        if (lang === 'pl' && img.caption_pl) {
            return img.caption_pl;
        } else if (lang === 'en' && img.caption_en) {
            return img.caption_en;
        }
        return img.caption || '';
    }
    
    function getImageAlt(img, fallback) {
        if (typeof LanguageManager === 'undefined') return img.alt || fallback;
        const lang = LanguageManager.currentLang;
        
        // Support bilingual alt text: alt_en, alt_pl, or just alt
        if (lang === 'pl' && img.alt_pl) {
            return img.alt_pl;
        } else if (lang === 'en' && img.alt_en) {
            return img.alt_en;
        }
        return img.alt || fallback;
    }

    function renderUpdates(updates) {
        if (!updatesContainer) return;

        if (updates.length === 0) {
            updatesContainer.innerHTML = `<div class="loading">${getTranslation('updates.noUpdates')}</div>`;
            return;
        }

        updatesContainer.innerHTML = updates.map(update => {
            let imageHtml = '';
            const title = getUpdateTitle(update);
            const content = getUpdateContent(update);
            
            if (update.image) {
                imageHtml = `
                    <div class="update-image">
                        <img src="${update.image}" alt="${escapeHtml(title)}" loading="lazy">
                    </div>
                `;
            } else if (update.images && update.images.length > 0) {
                // Support multiple images
                imageHtml = `
                    <div class="update-images">
                        ${update.images.map(img => {
                            const imgAlt = getImageAlt(img, title);
                            const imgCaption = getImageCaption(img);
                            return `
                            <div class="update-image">
                                <img src="${img.src || img}" alt="${escapeHtml(imgAlt)}" loading="lazy">
                                ${imgCaption ? `<p class="image-caption">${escapeHtml(imgCaption)}</p>` : ''}
                            </div>
                        `;
                        }).join('')}
                    </div>
                `;
            }
            
            return `
                <article class="update-card">
                    <div class="update-header">
                        <div>
                            <h2 class="update-title">${escapeHtml(title)}</h2>
                            <div class="update-date">${formatDate(update.date)}</div>
                        </div>
                    </div>
                    ${imageHtml}
                    <div class="update-content">
                        ${content}
                    </div>
                </article>
            `;
        }).join('');
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const lang = (typeof LanguageManager !== 'undefined') ? LanguageManager.currentLang : 'en';
        const locale = lang === 'pl' ? 'pl-PL' : 'en-US';
        return date.toLocaleDateString(locale, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load updates on page load
    if (updatesContainer) {
        // Show loading message
        updatesContainer.innerHTML = `<div class="loading">${getTranslation('updates.loading')}</div>`;
        loadUpdates();
    }
    
    // Reload updates when language changes
    document.addEventListener('languageChanged', () => {
        if (updatesContainer) {
            loadUpdates();
        }
    });
})();
