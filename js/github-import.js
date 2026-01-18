// GitHub Import Module
// Allows users to import projects from their GitHub profile

const GitHubImport = {
    // GitHub API base URL
    API_BASE: 'https://api.github.com',

    // Fetch public repositories for a username
    async fetchRepositories(username) {
        if (!username || username.trim() === '') {
            throw new Error('Please enter a valid GitHub username');
        }

        try {
            const response = await fetch(
                `${this.API_BASE}/users/${username.trim()}/repos?sort=updated&per_page=30`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('GitHub user not found. Please check the username.');
                }
                if (response.status === 403) {
                    throw new Error('GitHub API rate limit exceeded. Please try again later.');
                }
                throw new Error('Failed to fetch repositories from GitHub.');
            }

            const repos = await response.json();
            return this.processRepositories(repos);
        } catch (error) {
            console.error('GitHub Import Error:', error);
            throw error;
        }
    },

    // Process and filter repositories
    processRepositories(repos) {
        return repos
            .filter(repo => !repo.fork) // Exclude forked repos
            .map(repo => ({
                id: repo.id,
                name: repo.name,
                description: repo.description || 'No description provided',
                url: repo.html_url,
                homepage: repo.homepage,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                topics: repo.topics || [],
                updatedAt: new Date(repo.updated_at).toLocaleDateString(),
                isSelected: false
            }))
            .sort((a, b) => b.stars - a.stars); // Sort by stars
    },

    // Convert selected repos to project format
    convertToProjects(selectedRepos) {
        return selectedRepos.map(repo => ({
            name: this.formatProjectName(repo.name),
            description: repo.description || `A ${repo.language || 'software'} project`,
            technologies: this.extractTechnologies(repo),
            link: repo.homepage || repo.url,
            highlights: this.generateHighlights(repo)
        }));
    },

    // Format repo name to readable project name
    formatProjectName(name) {
        return name
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    // Extract technologies from repo data
    extractTechnologies(repo) {
        const techs = [];

        if (repo.language) {
            techs.push(repo.language);
        }

        if (repo.topics && repo.topics.length > 0) {
            // Add up to 4 topics as technologies
            repo.topics.slice(0, 4).forEach(topic => {
                const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
                if (!techs.includes(formattedTopic)) {
                    techs.push(formattedTopic);
                }
            });
        }

        return techs.slice(0, 5); // Max 5 technologies
    },

    // Generate highlights based on repo metrics
    generateHighlights(repo) {
        const highlights = [];

        if (repo.stars > 0) {
            highlights.push(`Received ${repo.stars} star${repo.stars > 1 ? 's' : ''} on GitHub`);
        }

        if (repo.forks > 0) {
            highlights.push(`Forked ${repo.forks} time${repo.forks > 1 ? 's' : ''} by other developers`);
        }

        if (repo.language) {
            highlights.push(`Built with ${repo.language}`);
        }

        return highlights;
    },

    // Render the GitHub import modal
    renderModal(repos) {
        return `
            <div class="github-modal-overlay" id="github-modal">
                <div class="github-modal">
                    <div class="github-modal-header">
                        <h3>📦 Select GitHub Projects</h3>
                        <button class="github-modal-close" onclick="GitHubImport.closeModal()">×</button>
                    </div>
                    <div class="github-modal-body">
                        ${repos.length === 0
                ? '<p class="github-empty">No public repositories found.</p>'
                : `
                                <p class="github-hint">Select projects to import (${repos.length} found)</p>
                                <div class="github-repo-list">
                                    ${repos.map(repo => this.renderRepoCard(repo)).join('')}
                                </div>
                            `
            }
                    </div>
                    <div class="github-modal-footer">
                        <button class="btn btn-secondary" onclick="GitHubImport.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="GitHubImport.importSelected()">
                            Import Selected
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Render individual repo card
    renderRepoCard(repo) {
        return `
            <label class="github-repo-card" data-repo-id="${repo.id}">
                <input type="checkbox" class="github-repo-checkbox" value="${repo.id}">
                <div class="github-repo-info">
                    <div class="github-repo-header">
                        <span class="github-repo-name">${this.formatProjectName(repo.name)}</span>
                        ${repo.language ? `<span class="github-repo-lang">${repo.language}</span>` : ''}
                    </div>
                    <p class="github-repo-desc">${repo.description}</p>
                    <div class="github-repo-meta">
                        <span>⭐ ${repo.stars}</span>
                        <span>🍴 ${repo.forks}</span>
                        <span>📅 ${repo.updatedAt}</span>
                    </div>
                </div>
            </label>
        `;
    },

    // Store fetched repos temporarily
    _repos: [],

    // Show the modal with repos
    async showModal(username) {
        try {
            // Show loading state
            const loadingHtml = `
                <div class="github-modal-overlay" id="github-modal">
                    <div class="github-modal">
                        <div class="github-modal-body" style="text-align: center; padding: 2rem;">
                            <div class="github-loading">⏳ Fetching repositories...</div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loadingHtml);

            // Fetch repos
            this._repos = await this.fetchRepositories(username);

            // Remove loading and show actual modal
            this.closeModal();
            document.body.insertAdjacentHTML('beforeend', this.renderModal(this._repos));

        } catch (error) {
            this.closeModal();
            alert(error.message);
        }
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('github-modal');
        if (modal) {
            modal.remove();
        }
    },

    // Import selected repos
    importSelected() {
        const checkboxes = document.querySelectorAll('.github-repo-checkbox:checked');
        const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

        if (selectedIds.length === 0) {
            alert('Please select at least one project to import.');
            return;
        }

        const selectedRepos = this._repos.filter(repo => selectedIds.includes(repo.id));
        const projects = this.convertToProjects(selectedRepos);

        // Dispatch event for app.js to handle
        const event = new CustomEvent('github-import', { detail: { projects } });
        document.dispatchEvent(event);

        this.closeModal();

        // Show success message
        const successCount = projects.length;
        alert(`✅ Successfully imported ${successCount} project${successCount > 1 ? 's' : ''} from GitHub!`);
    },

    // Prompt for GitHub username
    promptUsername() {
        const username = prompt('Enter your GitHub username:');
        if (username) {
            this.showModal(username);
        }
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubImport;
}
