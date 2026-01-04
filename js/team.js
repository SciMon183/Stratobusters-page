// Team Management - Loads from team.json
(function() {
    const teamGrid = document.getElementById('teamGrid');
    
    function getTranslation(key) {
        if (typeof LanguageManager !== 'undefined') {
            return LanguageManager.get(key);
        }
        return key;
    }
    
    function getTeamText(member, field) {
        if (typeof LanguageManager === 'undefined') return member[field] || '';
        const lang = LanguageManager.currentLang;
        
        // Support bilingual fields: name_en, name_pl, role_en, role_pl, bio_en, bio_pl
        if (lang === 'pl' && member[field + '_pl']) {
            return member[field + '_pl'];
        } else if (lang === 'en' && member[field + '_en']) {
            return member[field + '_en'];
        }
        return member[field] || '';
    }

    async function loadTeam() {
        try {
            const response = await fetch('data/team.json');
            if (response.ok) {
                const team = await response.json();
                renderTeam(team.members || []);
            } else {
                renderTeam([]);
            }
        } catch (error) {
            console.log('Team data not found. Create data/team.json with team information.');
            renderTeam([
                {
                    name: 'Team Member',
                    role: 'Role',
                    image: 'images/team/placeholder.jpg',
                    bio: 'Add team member information to data/team.json'
                }
            ]);
        }
    }

    function renderTeam(members) {
        if (!teamGrid) return;

        if (members.length === 0) {
            teamGrid.innerHTML = `<div class="loading">${getTranslation('team.noTeam')}</div>`;
            return;
        }

        teamGrid.innerHTML = members.map(member => {
            const name = getTeamText(member, 'name');
            const role = getTeamText(member, 'role');
            const bio = getTeamText(member, 'bio');
            
            return `
            <div class="team-member">
                <img src="${member.image || 'images/team/placeholder.jpg'}" alt="${escapeHtml(name)}" onerror="this.src='images/team/placeholder.jpg'">
                <h3>${escapeHtml(name)}</h3>
                <div class="role">${escapeHtml(role || getTranslation('team.member'))}</div>
                ${bio ? `<p class="bio">${escapeHtml(bio)}</p>` : ''}
            </div>
            `;
        }).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load team on page load
    if (teamGrid) {
        loadTeam();
    }
    
    // Reload team when language changes
    document.addEventListener('languageChanged', () => {
        if (teamGrid) {
            loadTeam();
        }
    });
})();
