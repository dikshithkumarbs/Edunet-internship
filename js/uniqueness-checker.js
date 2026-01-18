// Uniqueness Checker Module
// Checks resume content for originality and common phrases

const UniquenessChecker = {
    // Common generic phrases to avoid
    genericPhrases: [
        'hardworking',
        'team player',
        'self-starter',
        'go-getter',
        'results-driven',
        'detail-oriented',
        'think outside the box',
        'synergy',
        'leverage',
        'fast-paced environment',
        'works well under pressure',
        'excellent communication skills',
        'strong work ethic',
        'proven track record',
        'highly motivated',
        'passionate about',
        'quick learner',
        'multitasker',
        'responsible for',
        'duties included',
        'helped with',
        'worked on',
        'assisted in',
        'participated in'
    ],

    // Overused action verbs
    overusedVerbs: [
        'managed',
        'led',
        'handled',
        'worked',
        'helped',
        'assisted',
        'responsible',
        'involved'
    ],

    // Better alternatives
    betterAlternatives: {
        'managed': ['Orchestrated', 'Directed', 'Spearheaded', 'Oversaw'],
        'led': ['Championed', 'Pioneered', 'Headed', 'Steered'],
        'handled': ['Executed', 'Administered', 'Coordinated', 'Facilitated'],
        'worked': ['Collaborated', 'Partnered', 'Contributed', 'Engaged'],
        'helped': ['Enabled', 'Empowered', 'Supported', 'Bolstered'],
        'assisted': ['Augmented', 'Reinforced', 'Aided', 'Supplemented'],
        'responsible': ['Accountable', 'Entrusted', 'Charged with', 'Tasked with'],
        'hardworking': ['Dedicated', 'Committed', 'Diligent', 'Industrious'],
        'team player': ['Collaborative professional', 'Cross-functional contributor', 'Team-oriented'],
        'detail-oriented': ['Meticulous', 'Precise', 'Thorough', 'Analytical']
    },

    // Analyze resume for uniqueness
    analyzeResume(resumeData) {
        const results = {
            score: 100,
            issues: [],
            suggestions: [],
            genericPhraseCount: 0,
            overusedVerbCount: 0,
            uniquenessLevel: 'Excellent'
        };

        // Collect all text content
        const allText = this.extractAllText(resumeData).toLowerCase();

        // Check for generic phrases
        this.genericPhrases.forEach(phrase => {
            if (allText.includes(phrase.toLowerCase())) {
                results.genericPhraseCount++;
                results.issues.push({
                    type: 'generic_phrase',
                    text: phrase,
                    severity: 'warning'
                });
                results.score -= 3;
            }
        });

        // Check for overused verbs at start of bullets
        const bullets = this.extractBullets(resumeData);
        bullets.forEach(bullet => {
            const firstWord = bullet.trim().split(' ')[0].toLowerCase();
            if (this.overusedVerbs.includes(firstWord)) {
                results.overusedVerbCount++;
                const alternatives = this.betterAlternatives[firstWord];
                if (alternatives) {
                    results.suggestions.push({
                        original: bullet.substring(0, 50) + '...',
                        issue: `Starts with overused verb "${firstWord}"`,
                        alternatives: alternatives.slice(0, 2).join(' or ')
                    });
                }
                results.score -= 2;
            }
        });

        // Determine uniqueness level
        if (results.score >= 90) {
            results.uniquenessLevel = 'Excellent';
        } else if (results.score >= 75) {
            results.uniquenessLevel = 'Good';
        } else if (results.score >= 60) {
            results.uniquenessLevel = 'Fair';
        } else {
            results.uniquenessLevel = 'Needs Improvement';
        }

        results.score = Math.max(0, results.score);

        return results;
    },

    // Extract all text from resume data
    extractAllText(data) {
        const parts = [];

        if (data.summary) parts.push(data.summary);

        if (data.experience) {
            data.experience.forEach(exp => {
                if (exp.title) parts.push(exp.title);
                if (exp.achievements) {
                    parts.push(...(Array.isArray(exp.achievements) ? exp.achievements : [exp.achievements]));
                }
            });
        }

        if (data.projects) {
            data.projects.forEach(proj => {
                if (proj.description) parts.push(proj.description);
            });
        }

        return parts.join(' ');
    },

    // Extract bullet points
    extractBullets(data) {
        const bullets = [];

        if (data.experience) {
            data.experience.forEach(exp => {
                if (exp.achievements) {
                    bullets.push(...(Array.isArray(exp.achievements) ? exp.achievements : [exp.achievements]));
                }
            });
        }

        if (data.projects) {
            data.projects.forEach(proj => {
                if (proj.description) bullets.push(proj.description);
            });
        }

        return bullets;
    },

    // Show uniqueness report modal
    showReport(resumeData) {
        const results = this.analyzeResume(resumeData);

        const scoreColor = results.score >= 75 ? '#10b981' : results.score >= 50 ? '#f59e0b' : '#ef4444';

        const modalHtml = `
            <div class="privacy-modal-overlay" id="uniqueness-modal">
                <div class="privacy-modal" style="max-width: 600px;">
                    <div class="privacy-modal-header" style="background: linear-gradient(135deg, ${scoreColor}, var(--secondary-color));">
                        <h3>📊 Resume Uniqueness Analysis</h3>
                        <button class="privacy-modal-close" onclick="document.getElementById('uniqueness-modal').remove()">×</button>
                    </div>
                    <div class="privacy-modal-body">
                        <div style="text-align: center; margin-bottom: 1.5rem;">
                            <div style="font-size: 3rem; font-weight: bold; color: ${scoreColor};">${results.score}%</div>
                            <div style="font-size: 1.1rem; color: var(--text-secondary);">${results.uniquenessLevel}</div>
                        </div>

                        <div class="privacy-section">
                            <h4>📈 Summary</h4>
                            <ul style="margin-left: 1rem;">
                                <li>Generic phrases found: ${results.genericPhraseCount}</li>
                                <li>Overused action verbs: ${results.overusedVerbCount}</li>
                            </ul>
                        </div>

                        ${results.issues.length > 0 ? `
                        <div class="privacy-section">
                            <h4>⚠️ Generic Phrases Detected</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${results.issues.slice(0, 8).map(issue =>
            `<span style="padding: 0.25rem 0.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; font-size: 0.85rem; color: #ef4444;">${issue.text}</span>`
        ).join('')}
                            </div>
                        </div>
                        ` : ''}

                        ${results.suggestions.length > 0 ? `
                        <div class="privacy-section">
                            <h4>💡 Suggestions</h4>
                            <ul style="margin-left: 1rem; font-size: 0.9rem;">
                                ${results.suggestions.slice(0, 5).map(s =>
            `<li style="margin-bottom: 0.5rem;"><strong>${s.issue}</strong><br/>Try: ${s.alternatives}</li>`
        ).join('')}
                            </ul>
                        </div>
                        ` : ''}

                        <div class="privacy-note">
                            <strong>Tip:</strong> Replace generic phrases with specific achievements and metrics. Use varied action verbs to make your resume stand out.
                        </div>
                    </div>
                    <div class="privacy-modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('uniqueness-modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniquenessChecker;
}
