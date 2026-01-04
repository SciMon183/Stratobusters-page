// Team Management - Loads from team.json
(function() {
    const teamGrid = document.getElementById('teamGrid');

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
            teamGrid.innerHTML = '<div class="loading">No team information available. Add team data to data/team.json</div>';
            return;
        }

        teamGrid.innerHTML = members.map(member => `
            <div class="team-member">
                <img src="${member.image || 'images/team/placeholder.jpg'}" alt="${member.name}" onerror="this.src='images/team/placeholder.jpg'">
                <h3>${escapeHtml(member.name)}</h3>
                <div class="role">${escapeHtml(member.role || 'Team Member')}</div>
                ${member.bio ? `<p class="bio">${escapeHtml(member.bio)}</p>` : ''}
            </div>
        `).join('');
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
})();
