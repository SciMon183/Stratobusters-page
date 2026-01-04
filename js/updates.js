// Updates/Blog Management - Loads from blog folder
(function() {
    const updatesContainer = document.getElementById('updatesContainer');

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

    function renderUpdates(updates) {
        if (!updatesContainer) return;

        if (updates.length === 0) {
            updatesContainer.innerHTML = '<div class="loading">No updates yet. Add update files to the blog/ folder.</div>';
            return;
        }

        updatesContainer.innerHTML = updates.map(update => `
            <article class="update-card">
                <div class="update-header">
                    <div>
                        <h2 class="update-title">${escapeHtml(update.title)}</h2>
                        <div class="update-date">${formatDate(update.date)}</div>
                    </div>
                </div>
                <div class="update-content">
                    ${update.content}
                </div>
            </article>
        `).join('');
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
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
        loadUpdates();
    }
})();
