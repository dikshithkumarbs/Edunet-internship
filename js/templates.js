// Resume template definitions and rendering
// Dynamic templates that change input fields and output based on selection

class ResumeTemplates {
    constructor() {
        this.currentTemplate = CONFIG.APP.DEFAULT_TEMPLATE || 'ats';
    }

    // Template configurations - define what each template emphasizes
    static TEMPLATE_CONFIG = {
        // General Templates
        'ats': {
            name: 'ATS-Optimized',
            category: 'general',
            sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'languages', 'awards'],
            emphasis: { skills: true, experience: true },
            showSections: { summary: true, experience: true, education: true, skills: true, projects: true, languages: true, awards: true },
            cssClass: 'template-minimal template-ats'
        },

        // Style-Based Templates
        'skillsBased': {
            name: 'Skills-Based',
            category: 'style',
            sectionOrder: ['summary', 'skills', 'projects', 'experience', 'education'],
            emphasis: { skills: true, projects: true },
            showSections: { summary: true, experience: true, education: true, skills: true, projects: true },
            cssClass: 'template-academic'
        },
        'creative': {
            name: 'Creative/Design',
            category: 'style',
            sectionOrder: ['summary', 'projects', 'skills', 'experience', 'education', 'languages', 'awards'],
            emphasis: { projects: true, skills: true },
            showSections: { summary: true, experience: true, education: true, skills: true, projects: true, languages: true, awards: true },
            cssClass: 'template-creative'
        },
        // Reference-Based Templates
        'noah': {
            name: 'Modern Sidebar (Noah)',
            category: 'reference',
            sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],
            emphasis: { experience: true },
            showSections: { summary: true, experience: true, education: true, skills: true, projects: false, languages: true, awards: false },
            cssClass: 'template-noah',
            layout: 'two-column-left'
        },
        'anaisha': {
            name: 'Clean Professional (Anaisha)',
            category: 'reference',
            sectionOrder: ['summary', 'education', 'experience', 'skills', 'awards'],
            emphasis: { education: true, experience: true },
            showSections: { summary: true, experience: true, education: true, skills: true, projects: false, languages: false, awards: true },
            cssClass: 'template-anaisha'
        },
        'prasha': {
            name: 'Elegant Sidebar (Prasha)',
            category: 'reference',
            sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages', 'awards'],
            emphasis: { experience: true },
            showSections: { summary: true, experience: true, education: true, skills: true, projects: false, languages: true, awards: true },
            cssClass: 'template-prasha',
            layout: 'two-column-right'
        },
        'olivia': {
            name: 'Bold Modern (Olivia)',
            category: 'reference',
            sectionOrder: ['skills', 'projects', 'education', 'experience', 'awards'],
            emphasis: { projects: true, skills: true },
            showSections: { summary: false, experience: true, education: true, skills: true, projects: true, languages: false, awards: true },
            cssClass: 'template-olivia'
        },
        'premium': {
            name: 'Premium Minimal',
            category: 'reference',
            sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'languages'],
            emphasis: { summary: true, experience: true },
            showSections: { summary: true, experience: true, education: true, skills: true, projects: true, languages: true, awards: true },
            cssClass: 'template-premium'
        }
    };

    // Get current template config
    getConfig(templateName) {
        return ResumeTemplates.TEMPLATE_CONFIG[templateName] || ResumeTemplates.TEMPLATE_CONFIG['ats'];
    }

    // Main render method - uses template-specific section order
    render(data, templateName) {
        this.currentTemplate = templateName || this.currentTemplate;
        const config = this.getConfig(this.currentTemplate);

        const renderedSections = {};
        for (const sectionName of config.sectionOrder) {
            if (config.showSections[sectionName]) {
                renderedSections[sectionName] = this.renderSection(sectionName, data, config);
            }
        }

        let mainContent = '';

        if (config.layout === 'two-column-left' || config.layout === 'two-column-right') {
            const sidebarSections = ['skills', 'education', 'languages', 'awards', 'contact'];
            // Note: Contact is usually in header, but sometimes in sidebar. For now keeping header as is.
            // Let's define which sections go to sidebar based on template.
            // For Noah (Left Sidebar): Experience, Summary in Main. Skills, Education, Languages in Sidebar.

            let mainSectionsList = [];
            let sidebarSectionsList = [];

            if (config.layout === 'two-column-left') { // Noah
                // Sidebar: Contact (if moved), Education, Skills, Languages, Awards
                // Main: Summary, Experience, Projects
                sidebarSectionsList = ['education', 'skills', 'languages', 'awards'];
                mainSectionsList = ['summary', 'experience', 'projects'];
            } else if (config.layout === 'two-column-right') { // Prasha
                // Main: Summary, Experience, Projects
                // Sidebar: Education, Skills, Languages, Awards
                mainSectionsList = ['summary', 'experience', 'projects'];
                sidebarSectionsList = ['education', 'skills', 'languages', 'awards'];
            }

            const renderList = (list) => list.map(name => renderedSections[name] || '').join('');

            const sidebarContent = `<div class="resume-sidebar">${renderList(sidebarSectionsList)}</div>`;
            const bodyContent = `<div class="resume-main-content">${renderList(mainSectionsList)}</div>`;

            if (config.layout === 'two-column-left') {
                mainContent = `<div class="resume-columns">${sidebarContent}${bodyContent}</div>`;
            } else {
                mainContent = `<div class="resume-columns">${bodyContent}${sidebarContent}</div>`;
            }

        } else {
            // Standard linear layout
            mainContent = config.sectionOrder.map(name => renderedSections[name] || '').join('');
        }

        return `
            <div class="resume-preview ${config.cssClass}" data-layout="${config.layout || 'standard'}">
                ${this.renderHeader(data, config)}
                ${mainContent}
            </div>
        `;
    }

    // Render a specific section
    renderSection(sectionName, data, config) {
        const isEmphasized = config.emphasis[sectionName];
        const emphasizedClass = isEmphasized ? 'emphasized-section' : '';

        switch (sectionName) {
            case 'summary':
                return data.summary ? this.renderSummary(data.summary, emphasizedClass) : '';
            case 'experience':
                return this.renderExperience(data, emphasizedClass);
            case 'education':
                return this.renderEducation(data, emphasizedClass);
            case 'skills':
                return this.renderSkills(data, emphasizedClass);
            case 'projects':
                return this.renderProjects(data, emphasizedClass);
            case 'languages':
                return this.renderLanguages(data, emphasizedClass);
            case 'awards':
                return this.renderAwards(data, emphasizedClass);
            default:
                return '';
        }
    }

    // Header Renderer
    renderHeader(data, config) {
        const info = data.personalInfo || {};
        const contactParts = [];

        if (info.email) contactParts.push(`<span>${info.email}</span>`);
        if (info.phone) contactParts.push(`<span>${info.phone}</span>`);
        if (info.location) contactParts.push(`<span>${info.location}</span>`);
        if (info.linkedin) contactParts.push(`<span>${info.linkedin}</span>`);
        if (info.github) contactParts.push(`<span>${info.github}</span>`);

        return `
            <header class="resume-header">
                <h1 class="resume-name">${info.fullName || 'Your Name'}</h1>
                <div class="resume-contact">
                    ${contactParts.join('<span>•</span>')}
                </div>
            </header>
        `;
    }

    // Summary Section
    renderSummary(summary, extraClass = '') {
        if (!summary) return '';
        return `
            <section class="resume-section ${extraClass}">
                <h2 class="resume-section-title">Professional Summary</h2>
                <p class="resume-summary-text">${summary}</p>
            </section>
        `;
    }

    // Experience Section
    renderExperience(data, extraClass = '') {
        if (!data.experience?.length) return '';

        const items = data.experience.map(exp => {
            const bullets = exp.achievements?.length
                ? exp.achievements.map(ach => `<div class="resume-bullet">${ach}</div>`).join('')
                : '';

            return `
                <div class="resume-item">
                    <div class="resume-item-header">
                        <div>
                            <span class="resume-item-title">${exp.title || ''}</span>
                            <span class="resume-item-subtitle"> | ${exp.company || ''}</span>
                        </div>
                        <span class="resume-item-date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</span>
                    </div>
                    <div class="resume-item-description">
                        ${bullets}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <section class="resume-section ${extraClass}">
                <h2 class="resume-section-title">Experience</h2>
                ${items}
            </section>
        `;
    }

    // Education Section
    renderEducation(data, extraClass = '') {
        if (!data.education?.length) return '';

        const items = data.education.map(edu => {
            const details = [];
            if (edu.gpa) details.push(`GPA: ${edu.gpa}`);

            return `
                <div class="resume-item">
                    <div class="resume-item-header">
                        <div>
                            <span class="resume-item-title">${edu.degree || ''}</span>
                            <span class="resume-item-subtitle"> | ${edu.institution || ''}</span>
                        </div>
                        <span class="resume-item-date">${edu.startDate || ''} - ${edu.endDate || ''}</span>
                    </div>
                    ${details.length ? `<div class="resume-item-description"><div class="resume-bullet">${details.join(', ')}</div></div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <section class="resume-section ${extraClass}">
                <h2 class="resume-section-title">Education</h2>
                ${items}
            </section>
        `;
    }

    // Skills Section
    renderSkills(data, extraClass = '') {
        if (!data.skills) return '';

        const categories = [];

        if (data.skills.technical?.length) {
            categories.push(`
                <div class="resume-skill-category">
                    <span class="resume-skill-label">Technical:</span>
                    <span>${data.skills.technical.join(', ')}</span>
                </div>
            `);
        }

        if (data.skills.soft?.length) {
            categories.push(`
                <div class="resume-skill-category">
                    <span class="resume-skill-label">Soft Skills:</span>
                    <span>${data.skills.soft.join(', ')}</span>
                </div>
            `);
        }

        if (!categories.length) return '';

        return `
            <section class="resume-section ${extraClass}">
                <h2 class="resume-section-title">Skills</h2>
                <div class="resume-skills">
                    ${categories.join('')}
                </div>
            </section>
        `;
    }

    // Projects Section
    renderProjects(data, extraClass = '') {
        if (!data.projects?.length) return '';

        const items = data.projects.map(proj => {
            const bullets = [];
            if (proj.description) bullets.push(`<div class="resume-bullet">${proj.description}</div>`);
            if (proj.highlights?.length) {
                proj.highlights.forEach(hl => bullets.push(`<div class="resume-bullet">${hl}</div>`));
            }

            const techString = proj.technologies?.length
                ? `<div class="resume-bullet">Technologies: ${proj.technologies.join(', ')}</div>`
                : '';

            const linkHtml = proj.link ? (() => {
                const isVerified = proj.link.includes('github.com') || proj.link.includes('gitlab.com');
                const badge = isVerified ? '<span style="color:var(--primary-color); margin-left:4px;">✓</span>' : '';
                return `<span class="resume-item-subtitle"> | <a href="${(proj.link || '').startsWith('http') ? proj.link : 'https://' + proj.link}" target="_blank">${(proj.link || '').replace(/^https?:\/\//, '')}</a>${badge}</span>`;
            })() : '';

            return `
                <div class="resume-item">
                    <div class="resume-item-header">
                        <div>
                            <span class="resume-item-title">${proj.name || ''}</span>
                            ${linkHtml}
                        </div>
                    </div>
                    <div class="resume-item-description">
                        ${bullets.join('')}
                        ${techString}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <section class="resume-section ${extraClass}">
                <h2 class="resume-section-title">Projects</h2>
                ${items}
            </section>
        `;
    }

    // Languages Section
    renderLanguages(data, extraClass = '') {
        if (!data.languages || data.languages.length === 0) return '';

        // Handle both string and array
        const langList = Array.isArray(data.languages) ? data.languages : data.languages.split(',').map(s => s.trim()).filter(s => s);
        if (langList.length === 0) return '';

        return `
            <section class="resume-section ${extraClass}">
                <h2 class="resume-section-title">Languages</h2>
                <div class="resume-skills">
                    <div class="resume-skill-category">
                        <span>${langList.join(', ')}</span>
                    </div>
                </div>
            </section>
        `;
    }

    // Awards & Achievements Section
    renderAwards(data, extraClass = '') {
        if (!data.awards || data.awards.length === 0) return '';

        // Handle both string (one per line) and array
        let awardList = [];
        if (Array.isArray(data.awards)) {
            awardList = data.awards;
        } else {
            awardList = data.awards.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(s => s);
        }

        if (awardList.length === 0) return '';

        const items = awardList.map(award => `<div class="resume-bullet">${award}</div>`).join('');

        return `
            <section class="resume-section ${extraClass}">
                <h2 class="resume-section-title">Awards & Achievements</h2>
                <div class="resume-item-description">
                    ${items}
                </div>
            </section>
        `;
    }

    // Get form configuration for a template (which sections to show/hide)
    static getFormConfig(templateName) {
        const config = ResumeTemplates.TEMPLATE_CONFIG[templateName] || ResumeTemplates.TEMPLATE_CONFIG['ats'];

        return {
            showProjects: config.showSections.projects,
            emphasizeEducation: config.emphasis.education || false,
            emphasizeExperience: config.emphasis.experience || false,
            emphasizeSkills: config.emphasis.skills || false,
            emphasizeProjects: config.emphasis.projects || false,
            category: config.category,
            name: config.name
        };
    }

    // Update form visibility based on template
    static updateFormForTemplate(templateName) {
        const config = this.getFormConfig(templateName);

        // Show/hide projects step indicator
        const projectsStep = document.querySelector('.step-indicator:nth-child(5)');
        if (projectsStep) {
            projectsStep.style.opacity = config.showProjects ? '1' : '0.4';
        }

        // Add visual hints for emphasized sections
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('section-emphasized');
        });

        // Highlight emphasized sections in form
        if (config.emphasizeEducation) {
            document.getElementById('step-2')?.classList.add('section-emphasized');
        }
        if (config.emphasizeExperience) {
            document.getElementById('step-3')?.classList.add('section-emphasized');
        }
        if (config.emphasizeSkills) {
            document.getElementById('step-4')?.classList.add('section-emphasized');
        }
        if (config.emphasizeProjects && config.showProjects) {
            document.getElementById('step-5')?.classList.add('section-emphasized');
        }

        // Show template guidance message
        const guidance = this.getTemplateGuidance(templateName);
        const guidanceEl = document.getElementById('template-guidance');
        if (guidanceEl) {
            guidanceEl.innerHTML = guidance;
            guidanceEl.style.display = guidance ? 'block' : 'none';
        }
    }

    // Get guidance text for each template
    static getTemplateGuidance(templateName) {
        const guidance = {
            'ats': '💡 <strong>ATS Tip:</strong> Use standard section headers and include keywords from the job description.',
            'skillsBased': '💡 <strong>Skills-Based:</strong> Skills appear first - group them by category.',
            'creative': '💡 <strong>Creative:</strong> Showcase projects prominently with visual descriptions.'
        };
        return guidance[templateName] || '';
    }
}

const resumeTemplates = new ResumeTemplates();
