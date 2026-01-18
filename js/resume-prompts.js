// Resume Prompt Templates
// AI-powered resume generation prompts for different use cases

const ResumePrompts = {
    // Template definitions with AI prompts
    templates: {
        atsOptimized: {
            id: 'atsOptimized',
            name: 'ATS-Optimized',
            description: 'Maximum ATS compatibility',
            icon: '🤖',
            prompt: `Generate an ATS-optimized resume that:
- Avoids tables, images, or columns
- Uses standard section headings (Summary, Experience, Skills, Education)
- Includes relevant keywords from the job description
- Uses simple bullet points
- Ensures machine readability
- Maintains professional tone and structure`
        },
        skillsBased: {
            id: 'skillsBased',
            name: 'Skills-Based',
            description: 'Prioritizes competencies over job history',
            icon: '🛠️',
            prompt: `Generate a skills-based resume that prioritizes competencies over job history.
- Organize sections by skill categories
- Provide evidence of each skill through examples
- Keep formatting professional and ATS-friendly
- Include a brief work history section after skills
- Use measurable outcomes where possible`
        },
        creative: {
            id: 'creative',
            name: 'Creative/Design',
            description: 'For design, marketing, or media roles',
            icon: '🎨',
            prompt: `Create a professional creative resume suitable for design, marketing, or media roles.
- Maintain readability and professionalism
- Allow subtle creative formatting
- Keep it ATS-friendly where possible
- Highlight portfolio, projects, and achievements
- Balance creativity with clarity`
        }
    },

    // Get a specific template
    getTemplate(templateId) {
        return this.templates[templateId] || this.templates.atsOptimized;
    },

    // Get all templates as array
    getAllTemplates() {
        return Object.values(this.templates);
    },

    // Build the full prompt with user data
    buildPrompt(templateId, userData, options = {}) {
        const template = this.getTemplate(templateId);
        let prompt = template ? template.prompt : '';
        if (!prompt) return '';

        // Replace placeholders
        if (options.jobTitle) {
            prompt = prompt.replace('{JOB_TITLE}', options.jobTitle);
        }
        if (options.industry) {
            prompt = prompt.replace('{INDUSTRY}', options.industry);
        }
        if (options.oldField) {
            prompt = prompt.replace('{OLD_FIELD}', options.oldField);
        }
        if (options.newField) {
            prompt = prompt.replace('{NEW_FIELD}', options.newField);
        }

        // Add user data context
        const dataContext = this.formatUserData(userData);

        return `${prompt}\n\nUSER DATA:\n${dataContext}\n\nGenerate the resume content now:`;
    },

    // Format user data for AI context
    formatUserData(data) {
        const parts = [];

        if (data.personalInfo) {
            parts.push(`Name: ${data.personalInfo.fullName || 'N/A'}`);
            parts.push(`Email: ${data.personalInfo.email || 'N/A'}`);
            parts.push(`Phone: ${data.personalInfo.phone || 'N/A'}`);
            parts.push(`Location: ${data.personalInfo.location || 'N/A'}`);
            if (data.personalInfo.linkedin) parts.push(`LinkedIn: ${data.personalInfo.linkedin}`);
            if (data.personalInfo.github) parts.push(`GitHub: ${data.personalInfo.github}`);
        }

        if (data.summary) {
            parts.push(`\nCurrent Summary: ${data.summary}`);
        }

        if (data.education?.length) {
            parts.push(`\nEducation:`);
            data.education.forEach(edu => {
                parts.push(`- ${edu.degree} from ${edu.institution} (${edu.startDate} - ${edu.endDate})`);
            });
        }

        if (data.experience?.length) {
            parts.push(`\nExperience:`);
            data.experience.forEach(exp => {
                parts.push(`- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})`);
                if (exp.achievements?.length) {
                    exp.achievements.forEach(ach => parts.push(`  • ${ach}`));
                }
            });
        }

        if (data.skills) {
            if (data.skills.technical?.length) {
                parts.push(`\nTechnical Skills: ${data.skills.technical.join(', ')}`);
            }
            if (data.skills.soft?.length) {
                parts.push(`Soft Skills: ${data.skills.soft.join(', ')}`);
            }
        }

        if (data.projects?.length) {
            parts.push(`\nProjects:`);
            data.projects.forEach(proj => {
                parts.push(`- ${proj.name}: ${proj.description || 'N/A'}`);
                if (proj.technologies?.length) {
                    parts.push(`  Technologies: ${proj.technologies.join(', ')}`);
                }
            });
        }

        return parts.join('\n');
    },

    // Show template selector modal
    showTemplateSelector(onSelect) {
        const templates = this.getAllTemplates();

        const modalHtml = `
            <div class="privacy-modal-overlay" id="template-selector-modal">
                <div class="privacy-modal" style="max-width: 700px;">
                    <div class="privacy-modal-header" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));">
                        <h3>📄 Choose Resume Template Style</h3>
                        <button class="privacy-modal-close" onclick="document.getElementById('template-selector-modal').remove()">×</button>
                    </div>
                    <div class="privacy-modal-body" style="max-height: 60vh;">
                        <p style="margin-bottom: 1rem; color: var(--text-secondary);">Select a template style to generate your resume with AI. Each template is optimized for different scenarios.</p>
                        <div class="template-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;">
                            ${templates.map(t => `
                                <div class="template-card" data-template="${t.id}" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${t.icon}</div>
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${t.name}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${t.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="privacy-modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('template-selector-modal').remove()">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Add click handlers
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.template;
                document.getElementById('template-selector-modal').remove();
                if (onSelect) onSelect(templateId);
            });

            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = 'var(--primary-color)';
                card.style.background = 'var(--bg-secondary)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = 'var(--border-color)';
                card.style.background = '';
            });
        });
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumePrompts;
}
