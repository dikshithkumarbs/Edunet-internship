// Portfolio Generator
// Generate static HTML portfolios from resume data

const PortfolioGenerator = {
    // Portfolio themes - synced with main app color themes
    themes: {
        default: {
            name: 'Indigo (Default)',
            colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899', bg: '#0f172a', text: '#f8fafc' },
            style: 'dark'
        },
        ocean: {
            name: 'Ocean Blue',
            colors: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#14b8a6', bg: '#0c1929', text: '#f8fafc' },
            style: 'dark'
        },
        forest: {
            name: 'Forest Green',
            colors: { primary: '#10b981', secondary: '#14b8a6', accent: '#22c55e', bg: '#0a1f17', text: '#f8fafc' },
            style: 'dark'
        },
        sunset: {
            name: 'Sunset Orange',
            colors: { primary: '#f97316', secondary: '#ef4444', accent: '#f59e0b', bg: '#1a0f0c', text: '#f8fafc' },
            style: 'dark'
        },
        midnight: {
            name: 'Midnight Purple',
            colors: { primary: '#8b5cf6', secondary: '#a855f7', accent: '#ec4899', bg: '#120a1f', text: '#f8fafc' },
            style: 'dark'
        },
        rose: {
            name: 'Rose Pink',
            colors: { primary: '#f43f5e', secondary: '#ec4899', accent: '#f472b6', bg: '#1a0c12', text: '#f8fafc' },
            style: 'dark'
        },
        light: {
            name: 'Light Professional',
            colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899', bg: '#ffffff', text: '#1e293b' },
            style: 'light'
        }
    },

    // Generate complete portfolio HTML
    generatePortfolio(data, theme = 'default') {
        const themeConfig = this.themes[theme] || this.themes.default;
        const { personalInfo, summary, education, experience, skills, projects } = data;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Portfolio of ${personalInfo?.fullName || 'Professional'} - ${experience?.[0]?.title || 'Developer'}">
    <meta name="keywords" content="${skills?.technical?.slice(0, 10).join(', ') || 'portfolio'}">
    <title>${personalInfo?.fullName || 'Portfolio'} - ${experience?.[0]?.title || 'Professional'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        ${this.generateCSS(themeConfig)}
    </style>
</head>
<body>
    <div class="portfolio">
        <!-- Navigation -->
        <nav class="nav">
            <div class="nav-brand">${personalInfo?.fullName?.split(' ')[0] || 'Portfolio'}</div>
            <div class="nav-links">
                <a href="#about">About</a>
                <a href="#experience">Experience</a>
                <a href="#projects">Projects</a>
                <a href="#skills">Skills</a>
                <a href="#contact">Contact</a>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero" id="home">
            <div class="hero-content">
                <p class="hero-greeting">Hello, I'm</p>
                <h1 class="hero-name">${personalInfo?.fullName || 'Your Name'}</h1>
                <p class="hero-title">${experience?.[0]?.title || 'Professional'}</p>
                <p class="hero-summary">${summary || 'Welcome to my portfolio'}</p>
                <div class="hero-buttons">
                    <a href="#projects" class="btn btn-primary">View Projects</a>
                    <a href="#contact" class="btn btn-secondary">Contact Me</a>
                </div>
            </div>
            <div class="hero-decoration"></div>
        </section>

        <!-- About Section -->
        <section class="section" id="about">
            <h2 class="section-title">About Me</h2>
            <div class="about-content">
                <div class="about-text">
                    <p>${summary || 'A passionate professional dedicated to creating impactful solutions.'}</p>
                    ${education?.[0] ? `
                    <div class="education-highlight">
                        <h3>Education</h3>
                        <p><strong>${education[0].degree}</strong></p>
                        <p>${education[0].institution}</p>
                        <p>${education[0].startDate} - ${education[0].endDate}</p>
                    </div>
                    ` : ''}
                </div>
                <div class="about-stats">
                    <div class="stat">
                        <span class="stat-number">${experience?.length || 0}+</span>
                        <span class="stat-label">Years Experience</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${projects?.length || 0}</span>
                        <span class="stat-label">Projects</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${skills?.technical?.length || 0}</span>
                        <span class="stat-label">Technologies</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Experience Section -->
        <section class="section section-alt" id="experience">
            <h2 class="section-title">Experience</h2>
            <div class="timeline">
                ${(experience || []).map(exp => `
                <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h3>${exp.title}</h3>
                        <p class="company">${exp.company}</p>
                        <p class="date">${exp.startDate} - ${exp.endDate || 'Present'}</p>
                        ${exp.achievements ? `
                        <ul class="achievements">
                            ${(Array.isArray(exp.achievements) ? exp.achievements : [exp.achievements]).map(ach => `<li>${ach}</li>`).join('')}
                        </ul>
                        ` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
        </section>

        <!-- Projects Section -->
        <section class="section" id="projects">
            <h2 class="section-title">Projects</h2>
            <div class="projects-grid">
                ${(projects || []).map(proj => `
                <div class="project-card">
                    <div class="project-header">
                        <h3>${proj.name}</h3>
                        ${proj.link ? `<a href="${proj.link}" target="_blank" class="project-link">↗</a>` : ''}
                    </div>
                    <p class="project-description">${proj.description || ''}</p>
                    <div class="project-tech">
                        ${(proj.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </section>

        <!-- Skills Section -->
        <section class="section section-alt" id="skills">
            <h2 class="section-title">Skills</h2>
            <div class="skills-container">
                <div class="skills-category">
                    <h3>Technical Skills</h3>
                    <div class="skills-grid">
                        ${(skills?.technical || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                <div class="skills-category">
                    <h3>Soft Skills</h3>
                    <div class="skills-grid">
                        ${(skills?.soft || []).map(skill => `<span class="skill-tag soft">${skill}</span>`).join('')}
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section class="section" id="contact">
            <h2 class="section-title">Get In Touch</h2>
            <div class="contact-content">
                <p>I'm always open to discussing new opportunities and interesting projects.</p>
                <div class="contact-links">
                    ${personalInfo?.email ? `<a href="mailto:${personalInfo.email}" class="contact-link">📧 ${personalInfo.email}</a>` : ''}
                    ${personalInfo?.phone ? `<a href="tel:${personalInfo.phone}" class="contact-link">📱 ${personalInfo.phone}</a>` : ''}
                    ${personalInfo?.linkedin ? `<a href="https://${personalInfo.linkedin}" target="_blank" class="contact-link">💼 LinkedIn</a>` : ''}
                    ${personalInfo?.github ? `<a href="https://${personalInfo.github}" target="_blank" class="contact-link">💻 GitHub</a>` : ''}
                    ${personalInfo?.portfolio ? `<a href="https://${personalInfo.portfolio}" target="_blank" class="contact-link">🌐 Website</a>` : ''}
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>© ${new Date().getFullYear()} ${personalInfo?.fullName || 'Portfolio'}. Built with ❤️</p>
        </footer>
    </div>

    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Nav scroll effect
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.nav');
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    </script>
</body>
</html>`;
    },

    // Generate CSS for the portfolio
    generateCSS(theme) {
        const { colors, style } = theme;
        const isDark = style === 'dark';

        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: ${colors.primary};
            --secondary: ${colors.secondary};
            --bg: ${colors.bg};
            --text: ${colors.text};
            --text-muted: ${isDark ? '#94a3b8' : '#64748b'};
            --card-bg: ${isDark ? '#1e293b' : '#ffffff'};
            --border: ${isDark ? '#334155' : '#e2e8f0'};
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
        }

        .portfolio {
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Navigation */
        .nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            background: transparent;
            z-index: 100;
            transition: all 0.3s ease;
        }

        .nav.scrolled {
            background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .nav-brand {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--primary);
        }

        .nav-links {
            display: flex;
            gap: 2rem;
        }

        .nav-links a {
            color: var(--text);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: var(--primary);
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 6rem 2rem 4rem;
            position: relative;
            overflow: hidden;
        }

        .hero-content {
            max-width: 700px;
            z-index: 1;
        }

        .hero-greeting {
            font-size: 1.25rem;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }

        .hero-name {
            font-size: 4rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
        }

        .hero-title {
            font-size: 1.5rem;
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }

        .hero-summary {
            font-size: 1.125rem;
            color: var(--text-muted);
            margin-bottom: 2rem;
            max-width: 500px;
        }

        .hero-buttons {
            display: flex;
            gap: 1rem;
        }

        .hero-decoration {
            position: absolute;
            right: -100px;
            top: 50%;
            transform: translateY(-50%);
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 50%;
            opacity: 0.1;
            filter: blur(60px);
        }

        /* Buttons */
        .btn {
            padding: 0.875rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-block;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }

        .btn-secondary {
            background: transparent;
            border: 2px solid var(--primary);
            color: var(--primary);
        }

        .btn-secondary:hover {
            background: var(--primary);
            color: white;
        }

        /* Sections */
        .section {
            padding: 5rem 2rem;
        }

        .section-alt {
            background: ${isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc'};
        }

        .section-title {
            font-size: 2.5rem;
            font-weight: 800;
            text-align: center;
            margin-bottom: 3rem;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            border-radius: 2px;
        }

        /* About */
        .about-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 3rem;
            align-items: center;
        }

        .about-text p {
            margin-bottom: 1.5rem;
            font-size: 1.125rem;
            color: var(--text-muted);
        }

        .education-highlight {
            padding: 1.5rem;
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .education-highlight h3 {
            color: var(--primary);
            margin-bottom: 0.5rem;
        }

        .about-stats {
            display: grid;
            gap: 1.5rem;
        }

        .stat {
            text-align: center;
            padding: 1.5rem;
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--primary);
        }

        .stat-label {
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        /* Timeline */
        .timeline {
            max-width: 800px;
            margin: 0 auto;
        }

        .timeline-item {
            display: flex;
            gap: 2rem;
            padding-bottom: 2rem;
            position: relative;
        }

        .timeline-marker {
            width: 16px;
            height: 16px;
            background: var(--primary);
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 4px;
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: 7px;
            top: 20px;
            bottom: 0;
            width: 2px;
            background: var(--border);
        }

        .timeline-item:last-child::before {
            display: none;
        }

        .timeline-content {
            flex: 1;
        }

        .timeline-content h3 {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
        }

        .timeline-content .company {
            color: var(--primary);
            font-weight: 600;
        }

        .timeline-content .date {
            color: var(--text-muted);
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
        }

        .achievements {
            list-style: disc;
            margin-left: 1.25rem;
            color: var(--text-muted);
        }

        .achievements li {
            margin-bottom: 0.5rem;
        }

        /* Projects */
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .project-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2rem;
            transition: all 0.3s ease;
        }

        .project-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border-color: var(--primary);
        }

        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .project-header h3 {
            font-size: 1.25rem;
        }

        .project-link {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            color: white;
            border-radius: 8px;
            text-decoration: none;
            transition: transform 0.3s;
        }

        .project-link:hover {
            transform: scale(1.1);
        }

        .project-description {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }

        .project-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .tech-tag {
            padding: 0.375rem 0.75rem;
            background: ${isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
            color: var(--primary);
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
        }

        /* Skills */
        .skills-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
        }

        .skills-category h3 {
            margin-bottom: 1.5rem;
            color: var(--primary);
        }

        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }

        .skill-tag {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border-radius: 8px;
            font-weight: 500;
        }

        .skill-tag.soft {
            background: var(--card-bg);
            color: var(--text);
            border: 1px solid var(--border);
        }

        /* Contact */
        .contact-content {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }

        .contact-content p {
            font-size: 1.25rem;
            color: var(--text-muted);
            margin-bottom: 2rem;
        }

        .contact-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .contact-link {
            padding: 0.75rem 1.5rem;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            text-decoration: none;
            transition: all 0.3s;
        }

        .contact-link:hover {
            border-color: var(--primary);
            color: var(--primary);
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
            border-top: 1px solid var(--border);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }

            .hero-name {
                font-size: 2.5rem;
            }

            .hero-buttons {
                flex-direction: column;
            }

            .about-content {
                grid-template-columns: 1fr;
            }

            .skills-container {
                grid-template-columns: 1fr;
            }

            .projects-grid {
                grid-template-columns: 1fr;
            }
        }
        `;
    },

    // Download portfolio as HTML file
    downloadPortfolio(data, theme = 'default', filename = 'portfolio') {
        const html = this.generatePortfolio(data, theme);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Preview portfolio in new tab
    previewPortfolio(data, theme = 'default') {
        const html = this.generatePortfolio(data, theme);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    },

    // Get all available themes
    getThemes() {
        return Object.entries(this.themes).map(([id, theme]) => ({
            id,
            ...theme
        }));
    },

    // Show hosting instructions modal
    showHostingInstructions() {
        const modalHtml = `
            <div class="privacy-modal-overlay" id="hosting-modal">
                <div class="privacy-modal" style="max-width: 650px;">
                    <div class="privacy-modal-header" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <h3>🚀 Deploy Your Portfolio</h3>
                        <button class="privacy-modal-close" onclick="document.getElementById('hosting-modal').remove()">×</button>
                    </div>
                    <div class="privacy-modal-body" style="max-height: 70vh;">
                        <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                            After downloading your portfolio.html file, you can host it for free using these services:
                        </p>

                        <div class="privacy-section">
                            <h4>📦 GitHub Pages (Recommended)</h4>
                            <ol style="margin-left: 1.25rem; color: var(--text-secondary); font-size: 0.9rem;">
                                <li>Create a new repository on GitHub</li>
                                <li>Rename your downloaded file to <code>index.html</code></li>
                                <li>Upload the file to your repository</li>
                                <li>Go to Settings → Pages → Select "main" branch</li>
                                <li>Your site will be live at <code>username.github.io/repo-name</code></li>
                            </ol>
                        </div>

                        <div class="privacy-section">
                            <h4>⚡ Netlify (Easiest)</h4>
                            <ol style="margin-left: 1.25rem; color: var(--text-secondary); font-size: 0.9rem;">
                                <li>Go to <a href="https://netlify.com/drop" target="_blank" style="color: var(--primary-color);">netlify.com/drop</a></li>
                                <li>Drag and drop your portfolio.html file</li>
                                <li>Your site is live instantly! (e.g., random-name.netlify.app)</li>
                                <li>Optional: Set up a custom domain</li>
                            </ol>
                        </div>

                        <div class="privacy-section">
                            <h4>▲ Vercel</h4>
                            <ol style="margin-left: 1.25rem; color: var(--text-secondary); font-size: 0.9rem;">
                                <li>Sign up at <a href="https://vercel.com" target="_blank" style="color: var(--primary-color);">vercel.com</a></li>
                                <li>Create a new project from Git or upload files</li>
                                <li>Deploy with one click</li>
                            </ol>
                        </div>

                        <div class="privacy-note">
                            <strong>Pro Tip:</strong> For a professional look, buy a custom domain (e.g., yourname.com) for ~$10/year and connect it to any of these services.
                        </div>
                    </div>
                    <div class="privacy-modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('hosting-modal').remove()">Close</button>
                        <a href="https://netlify.com/drop" target="_blank" class="btn btn-primary">Open Netlify Drop</a>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    // Download with hosting instructions
    downloadWithInstructions(data, theme = 'default', filename = 'portfolio') {
        this.downloadPortfolio(data, theme, filename);

        // Show hosting instructions after a brief delay
        setTimeout(() => {
            this.showHostingInstructions();
        }, 500);
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioGenerator;
}
