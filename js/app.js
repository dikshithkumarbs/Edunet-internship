// Main Application Controller
class ResumeBuilder {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7; // Updated for Step 7: Cover Letter & ATS
        this.data = this.initializeData();
        this.settings = storage.loadSettings();
        this.autoSaveTimeout = null;
        this.previewTimeout = null; // Debounced preview updates
        this.jobInfo = {}; // Store job posting information

        // Cache frequently accessed DOM elements for performance
        this.elements = null; // Initialized in init() after DOM is ready
    }

    // Cache DOM elements to avoid repeated queries
    cacheElements() {
        this.elements = {
            preview: document.getElementById('resume-preview'),
            progressFill: document.getElementById('progress-fill'),
            completionPercent: document.getElementById('completion-percent'),
            nextBtn: document.getElementById('next-btn'),
            prevBtn: document.getElementById('prev-btn'),
            atsScore: document.getElementById('ats-score-value'),
            formSteps: document.querySelectorAll('.form-step'),
            stepIndicators: document.querySelectorAll('.step-indicator')
        };
    }

    // Initialize with empty or loaded data
    initializeData() {
        const savedData = storage.loadData();
        if (savedData) {
            return savedData;
        }

        return {
            personalInfo: {},
            summary: '',
            education: [],
            experience: [],
            skills: { technical: [], soft: [] },
            projects: []
        };
    }

    // Initialize the application
    init() {
        this.cacheElements(); // Cache DOM elements first for performance
        this.loadSettings();
        this.setupEventListeners();
        this.loadSavedData();
        this.renderCurrentStep();
        this.updatePreview();
        this.updateCompletionDisplay();
        this.updateATSScore();
        this.initDragAndDrop();
        this.setupCollapsibleListeners();
    }

    // Load user settings (theme, template)
    loadSettings() {
        // Apply dark mode
        if (this.settings.theme === 'dark') {
            document.body.classList.add('dark-mode');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = true;
            }
        }

        // Set template
        const templateSelect = document.getElementById('template-select');
        if (templateSelect) {
            templateSelect.value = this.settings.template;
        }

        // Load color theme
        this.loadColorTheme();

        // Sync custom color
        if (this.settings.customColor && typeof ResumeStyles !== 'undefined' && ResumeStyles.styles.custom) {
            ResumeStyles.styles.custom.primaryColor = this.settings.customColor;
            ResumeStyles.styles.custom.secondaryColor = this.adjustColorBrightness(this.settings.customColor, 30);
        }

        // Apply active style
        const activeStyle = this.settings.style || 'modern';
        if (typeof ResumeStyles !== 'undefined') {
            ResumeStyles.applyStyle(activeStyle, document.getElementById('resume-preview'));
        }

        // Load resume font
        if (this.settings.resumeFont) {
            this.setResumeFont(this.settings.resumeFont);
            const fontSelect = document.getElementById('font-select');
            if (fontSelect) fontSelect.value = this.settings.resumeFont;
        }
    }

    // Setup all event listeners (delegated to focused methods)
    setupEventListeners() {
        this.setupNavigationListeners();
        this.setupStepNavigationListeners();
        this.setupTemplateListeners();
        this.setupThemeListeners();
        this.setupExportListeners();
        this.setupAIListeners();
        this.setupDataListeners();
        this.setupFormListeners();
    }

    // Navigation button listeners
    setupNavigationListeners() {
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('mobile-preview-toggle')?.addEventListener('click', () => this.toggleMobilePreview());
        document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Toggle Mobile Menu
    toggleMobileMenu() {
        const controlsBar = document.querySelector('.controls-bar');
        controlsBar.classList.toggle('show');
    }

    // Interactive step indicator listeners
    setupStepNavigationListeners() {
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToStep(index + 1);
            });
        });
    }

    // Template, style, font selection listeners
    setupTemplateListeners() {
        document.getElementById('template-select')?.addEventListener('change', (e) => {
            this.settings.template = e.target.value;
            storage.saveSettings(this.settings);
            // Update form configuration based on template
            if (typeof ResumeTemplates !== 'undefined') {
                ResumeTemplates.updateFormForTemplate(e.target.value);
            }
            this.updatePreview();
        });

        document.getElementById('style-select')?.addEventListener('change', (e) => {
            this.updateStyleFromUI(e.target.value);
        });

        document.getElementById('font-select')?.addEventListener('change', (e) => {
            this.setResumeFont(e.target.value);
        });
    }

    // Theme and color listeners
    setupThemeListeners() {
        document.getElementById('color-theme-select')?.addEventListener('change', (e) => {
            const customColorContainer = document.getElementById('custom-color-container');
            if (e.target.value === 'custom') {
                customColorContainer.style.display = 'flex';
            } else {
                customColorContainer.style.display = 'none';
                this.setColorTheme(e.target.value);
            }
        });

        document.getElementById('custom-color-picker')?.addEventListener('input', (e) => {
            this.applyCustomColor(e.target.value);
        });

        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            this.toggleTheme(!isDark);
            const icon = document.querySelector('#theme-toggle-btn .theme-icon');
            if (icon) icon.textContent = isDark ? '🌙' : '☀️';
        });
    }

    // Export, print, portfolio listeners
    setupExportListeners() {
        document.getElementById('export-pdf-btn')?.addEventListener('click', () => this.exportPDF());
        document.getElementById('export-docx-btn')?.addEventListener('click', () => this.exportDOCX());
        document.getElementById('export-doc-btn')?.addEventListener('click', () => this.exportDOC());
        document.getElementById('print-btn')?.addEventListener('click', () => pdfGenerator.printResume());
        document.getElementById('share-btn')?.addEventListener('click', () => this.shareResume());
        document.getElementById('export-portfolio-btn')?.addEventListener('click', () => this.exportPortfolio());
        document.getElementById('uniqueness-btn')?.addEventListener('click', () => this.checkUniqueness());
    }

    // Export to Word 97-2003 format (ATS-optimized)
    exportDOC() {
        this.collectFormData();
        const filename = this.data.personalInfo?.fullName?.replace(/\s+/g, '_') || 'resume';
        docxExport.generateDoc(this.data, filename);

        if (typeof PrivacyManager !== 'undefined') {
            PrivacyManager.logAction('export_doc');
        }
    }

    // AI enhancement and ATS listeners
    setupAIListeners() {
        document.getElementById('linkedin-import-trigger')?.addEventListener('click', () => this.toggleLinkedInImport());
        document.getElementById('import-linkedin-btn')?.addEventListener('click', () => this.importLinkedIn());
        document.getElementById('generate-summary-btn')?.addEventListener('click', () => this.generateSummary());
        document.getElementById('enhance-experience-btn')?.addEventListener('click', () => this.enhanceExperience());
        document.getElementById('analyze-ats-btn')?.addEventListener('click', () => this.analyzeATS());
        document.getElementById('generate-cover-btn')?.addEventListener('click', () => this.generateCoverLetter());
        document.getElementById('copy-cover-letter-btn')?.addEventListener('click', () => this.copyCoverLetterToClipboard());
        document.getElementById('download-cover-letter-btn')?.addEventListener('click', () => this.downloadCoverLetter());

        // GitHub Import event handler
        document.addEventListener('github-import', (e) => this.handleGitHubImport(e.detail.projects));
    }

    // Handle GitHub Import - add projects to resume
    handleGitHubImport(projects) {
        if (!projects || projects.length === 0) return;

        const container = document.getElementById('projects-container');
        if (!container) return;

        projects.forEach(project => {
            // Clone the project entry template
            const template = document.querySelector('.project-entry');
            if (!template) return;

            const newEntry = template.cloneNode(true);

            // Fill in the project data
            const nameInput = newEntry.querySelector('.proj-name');
            const descInput = newEntry.querySelector('.proj-description');
            const techInput = newEntry.querySelector('.proj-technologies');
            const linkInput = newEntry.querySelector('.proj-link');

            if (nameInput) nameInput.value = project.name || '';
            if (descInput) descInput.value = project.description || '';
            if (techInput) techInput.value = (project.technologies || []).join(', ');
            if (linkInput) linkInput.value = project.link || '';

            container.appendChild(newEntry);
        });

        // Update preview and save
        this.collectFormData();
        this.updatePreview();
        this.scheduleAutoSave();
    }

    // Save, load, clear, undo/redo listeners
    setupDataListeners() {
        document.getElementById('save-btn')?.addEventListener('click', () => this.saveData());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearData());
        document.getElementById('export-json-btn')?.addEventListener('click', () => storage.exportData());

        document.getElementById('undo-btn')?.addEventListener('click', () => {
            if (typeof undoRedoManager !== 'undefined') undoRedoManager.undo();
        });

        document.getElementById('redo-btn')?.addEventListener('click', () => {
            if (typeof undoRedoManager !== 'undefined') undoRedoManager.redo();
        });
    }

    // Check resume uniqueness/plagiarism
    checkUniqueness() {
        this.collectFormData();
        if (typeof UniquenessChecker !== 'undefined') {
            UniquenessChecker.showReport(this.data);
        } else {
            alert('Uniqueness Checker is not available.');
        }
    }

    // Setup form input listeners for auto-save
    setupFormListeners() {
        const forms = document.querySelectorAll('input, textarea, select');
        forms.forEach(input => {
            input.addEventListener('input', () => {
                this.scheduleAutoSave();
            });
        });

        // Setup input validation
        this.setupInputValidation();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // Setup input validation with visual feedback
    setupInputValidation() {
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const linkedinInput = document.getElementById('linkedin');

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                const value = emailInput.value.trim();
                if (value && typeof Utils !== 'undefined') {
                    emailInput.classList.toggle('valid', Utils.isValidEmail(value));
                    emailInput.classList.toggle('invalid', !Utils.isValidEmail(value) && value.length > 0);
                }
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                const value = phoneInput.value.trim();
                if (value && typeof Utils !== 'undefined') {
                    phoneInput.classList.toggle('valid', Utils.isValidPhone(value));
                    phoneInput.classList.toggle('invalid', !Utils.isValidPhone(value) && value.length > 0);
                }
            });
        }

        if (linkedinInput) {
            linkedinInput.addEventListener('blur', () => {
                const value = linkedinInput.value.trim();
                if (value && typeof Utils !== 'undefined') {
                    linkedinInput.classList.toggle('valid', Utils.isValidUrl(value));
                    linkedinInput.classList.toggle('invalid', !Utils.isValidUrl(value) && value.length > 0);
                }
            });
        }
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S / Cmd+S - Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.collectFormData();
                this.saveData();
                this.showNotification('Resume saved!', 'success');
            }

            // Ctrl+P / Cmd+P - Print/Export PDF
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.exportPDF();
            }

            // Escape - Close modals
            if (e.key === 'Escape') {
                document.getElementById('completion-celebration')?.classList.remove('show');
                document.getElementById('celebration-overlay')?.classList.remove('show');
            }

            // Arrow keys for navigation when not in input
            if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                if (e.key === 'ArrowRight' && !e.ctrlKey) {
                    this.nextStep();
                } else if (e.key === 'ArrowLeft' && !e.ctrlKey) {
                    this.prevStep();
                }
            }
        });
    }

    // Schedule auto-save with debounce
    scheduleAutoSave() {
        // Debounced preview update (faster - 300ms)
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        this.previewTimeout = setTimeout(() => {
            this.collectFormData();
            this.updatePreview();
            this.updateCompletionDisplay();
        }, 300);

        // Debounced auto-save (slower - 1000ms)
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        this.autoSaveTimeout = setTimeout(() => {
            this.collectFormData();
            this.saveData();
            this.updateATSScore();
        }, CONFIG.APP.AUTO_SAVE_DELAY);
    }

    // Calculate resume completion percentage
    calculateCompletion() {
        let totalFields = 0;
        let filledFields = 0;

        // Personal Info (required: name, email)
        totalFields += 5;
        if (this.data.personalInfo?.fullName) filledFields += 2;
        if (this.data.personalInfo?.email) filledFields += 2;
        if (this.data.personalInfo?.phone) filledFields += 0.5;
        if (this.data.personalInfo?.location) filledFields += 0.5;

        // Education (at least 1)
        totalFields += 2;
        if (this.data.education?.length > 0 && this.data.education[0].degree) {
            filledFields += 2;
        }

        // Experience (at least 1 with achievements)
        totalFields += 3;
        if (this.data.experience?.length > 0) {
            if (this.data.experience[0].title) filledFields += 1;
            if (this.data.experience[0].company) filledFields += 1;
            if (this.data.experience[0].achievements?.length > 0) filledFields += 1;
        }

        // Skills (technical, soft)
        totalFields += 2;
        if (this.data.skills?.technical?.length > 0) filledFields += 1;
        if (this.data.skills?.soft?.length > 0) filledFields += 1;

        // Projects (optional but recommended)
        totalFields += 1;
        if (this.data.projects?.length > 0 && this.data.projects[0].name) {
            filledFields += 1;
        }

        // Summary
        totalFields += 1;
        if (this.data.summary && this.data.summary.length > 20) filledFields += 1;

        return Math.min(100, Math.round((filledFields / totalFields) * 100));
    }

    // Update completion display
    updateCompletionDisplay() {
        const percent = this.calculateCompletion();
        const percentElement = document.getElementById('completion-percent');
        const fillElement = document.getElementById('completion-fill');
        const badgeElement = document.getElementById('completion-badge');

        if (percentElement) {
            percentElement.textContent = `${percent}%`;
        }

        if (fillElement) {
            fillElement.style.width = `${percent}%`;
        }

        // Color based on completion
        if (badgeElement) {
            if (percent >= 80) {
                badgeElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (percent >= 50) {
                badgeElement.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            } else {
                badgeElement.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
            }
        }

        // Trigger celebration at 100%
        if (percent === 100 && !this.celebrationTriggered) {
            this.showCelebration();
            this.celebrationTriggered = true;
        } else if (percent < 100) {
            this.celebrationTriggered = false;
        }
    }

    // Show completion celebration
    showCelebration() {
        const modal = document.getElementById('completion-celebration');
        const overlay = document.getElementById('celebration-overlay');

        if (modal && overlay) {
            modal.classList.add('show');
            overlay.classList.add('show');
            this.triggerConfetti();
        }
    }

    // Confetti effect
    triggerConfetti() {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
            confetti.style.width = Math.random() * 8 + 5 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.opacity = Math.random();
            document.body.appendChild(confetti);

            // Clean up
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    // Update real-time ATS score display
    updateATSScore() {
        if (typeof atsOptimizer === 'undefined') return;

        const jobDescription = document.getElementById('job-description')?.value || '';
        const analysis = atsOptimizer.analyzeResume(this.data, jobDescription);
        const score = analysis.score;

        const scoreElement = document.getElementById('ats-score-value');
        const badgeElement = document.getElementById('ats-score-mini');

        if (scoreElement) {
            scoreElement.textContent = `${score}%`;
        }

        if (badgeElement) {
            // Remove all score classes
            badgeElement.classList.remove('score-high', 'score-medium', 'score-low');

            // Add appropriate class based on score
            if (score >= 70) {
                badgeElement.classList.add('score-high');
            } else if (score >= 50) {
                badgeElement.classList.add('score-medium');
            } else {
                badgeElement.classList.add('score-low');
            }
        }
    }

    // Collect data from current step
    collectFormData() {
        switch (this.currentStep) {
            case 1:
                this.collectPersonalInfo();
                break;
            case 2:
                this.collectEducation();
                break;
            case 3:
                this.collectExperience();
                break;
            case 4:
                this.collectSkills();
                break;
            case 5:
                this.collectProjects();
                break;
        }
    }

    // Collect personal information
    collectPersonalInfo() {
        this.data.personalInfo = {
            fullName: document.getElementById('full-name')?.value || '',
            jobHeadline: document.getElementById('job-headline')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            location: document.getElementById('location')?.value || '',
            linkedin: document.getElementById('linkedin')?.value || '',
            github: document.getElementById('github')?.value || '',
            portfolio: document.getElementById('portfolio')?.value || ''
        };
    }

    // Collect education data
    collectEducation() {
        this.data.education = [];
        const educationItems = document.querySelectorAll('.education-entry');

        educationItems.forEach(item => {
            this.data.education.push({
                degree: item.querySelector('.edu-degree')?.value || '',
                institution: item.querySelector('.edu-institution')?.value || '',
                location: item.querySelector('.edu-location')?.value || '',
                startDate: item.querySelector('.edu-start')?.value || '',
                endDate: item.querySelector('.edu-end')?.value || '',
                gpa: item.querySelector('.edu-gpa')?.value || ''
            });
        });
    }

    // Collect experience data
    collectExperience() {
        this.data.experience = [];
        const experienceItems = document.querySelectorAll('.experience-entry');

        experienceItems.forEach(item => {
            const achievements = [];
            item.querySelectorAll('.achievement-input').forEach(ach => {
                if (ach.value.trim()) {
                    achievements.push(ach.value.trim());
                }
            });

            this.data.experience.push({
                title: item.querySelector('.exp-title')?.value || '',
                company: item.querySelector('.exp-company')?.value || '',
                location: item.querySelector('.exp-location')?.value || '',
                startDate: item.querySelector('.exp-start')?.value || '',
                endDate: item.querySelector('.exp-end')?.value || '',
                achievements: achievements
            });
        });
    }

    // Collect skills data
    collectSkills() {
        const technicalSkills = document.getElementById('technical-skills')?.value || '';
        const softSkills = document.getElementById('soft-skills')?.value || '';
        const languagesText = document.getElementById('languages')?.value || '';
        const awardsText = document.getElementById('awards')?.value || '';

        this.data.skills = {
            technical: technicalSkills.split(',').map(s => s.trim()).filter(s => s),
            soft: softSkills.split(',').map(s => s.trim()).filter(s => s)
        };

        this.data.languages = languagesText.split(',').map(s => s.trim()).filter(s => s);
        this.data.awards = awardsText.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(s => s);
    }

    // Collect projects data
    collectProjects() {
        this.data.projects = [];
        const projectItems = document.querySelectorAll('.project-entry');

        projectItems.forEach(item => {
            const technologies = item.querySelector('.proj-technologies')?.value || '';
            const highlights = [];

            item.querySelectorAll('.highlight-input').forEach(hl => {
                if (hl.value.trim()) {
                    highlights.push(hl.value.trim());
                }
            });

            this.data.projects.push({
                name: item.querySelector('.proj-name')?.value || '',
                description: item.querySelector('.proj-description')?.value || '',
                technologies: technologies.split(',').map(t => t.trim()).filter(t => t),
                link: item.querySelector('.proj-link')?.value || '',
                highlights: highlights
            });
        });
    }

    // Save data to localStorage
    saveData() {
        storage.saveData(this.data);
        // Silent save - no notification to avoid interruption
    }

    // Load saved data
    loadSavedData() {
        if (storage.hasData()) {
            this.populateForm();
        }
    }

    // Populate form with saved data
    populateForm() {
        // Personal Info
        if (this.data.personalInfo) {
            document.getElementById('full-name').value = this.data.personalInfo.fullName || '';
            const headlineEl = document.getElementById('job-headline');
            if (headlineEl) headlineEl.value = this.data.personalInfo.jobHeadline || '';
            document.getElementById('email').value = this.data.personalInfo.email || '';
            document.getElementById('phone').value = this.data.personalInfo.phone || '';
            document.getElementById('location').value = this.data.personalInfo.location || '';
            document.getElementById('linkedin').value = this.data.personalInfo.linkedin || '';
            document.getElementById('github').value = this.data.personalInfo.github || '';
            document.getElementById('portfolio').value = this.data.personalInfo.portfolio || '';
        }

        // Summary
        if (this.data.summary) {
            const summaryEl = document.getElementById('summary-text');
            if (summaryEl) summaryEl.value = this.data.summary;
        }

        // Skills
        if (this.data.skills) {
            const techSkills = document.getElementById('technical-skills');
            const softSkills = document.getElementById('soft-skills');
            if (techSkills && this.data.skills.technical) {
                techSkills.value = this.data.skills.technical.join(', ');
            }
            if (softSkills && this.data.skills.soft) {
                softSkills.value = this.data.skills.soft.join(', ');
            }
        }

        // Languages
        if (this.data.languages) {
            const languagesEl = document.getElementById('languages');
            if (languagesEl) languagesEl.value = this.data.languages.join(', ');
        }

        // Awards
        if (this.data.awards) {
            const awardsEl = document.getElementById('awards');
            if (awardsEl) awardsEl.value = this.data.awards.map(a => '• ' + a).join('\n');
        }

        // Education entries
        this.populateEntries('education', this.data.education, '.education-entry');

        // Experience entries
        this.populateEntries('experience', this.data.experience, '.experience-entry');

        // Project entries
        this.populateEntries('projects', this.data.projects, '.project-entry');

        // Update preview
        this.updatePreview();
    }

    // Field mappings for data-driven entry population
    static FIELD_MAPPINGS = {
        education: {
            '.edu-degree': 'degree',
            '.edu-institution': 'institution',
            '.edu-location': 'location',
            '.edu-start': 'startDate',
            '.edu-end': 'endDate',
            '.edu-gpa': 'gpa'
        },
        experience: {
            '.exp-title': 'title',
            '.exp-company': 'company',
            '.exp-location': 'location',
            '.exp-start': 'startDate',
            '.exp-end': 'endDate'
        },
        projects: {
            '.proj-name': 'name',
            '.proj-description': 'description',
            '.proj-link': 'link'
        }
    };

    // Helper to populate dynamic entries (education, experience, projects)
    populateEntries(type, dataArray, selector) {
        if (!dataArray?.length) return;

        const container = document.getElementById(`${type}-container`);
        if (!container) return;

        const template = container.querySelector(selector);
        if (!template) return;

        // Clear existing entries except the first
        container.querySelectorAll(selector).forEach((entry, i) => {
            if (i > 0) entry.remove();
        });

        const mappings = ResumeBuilder.FIELD_MAPPINGS[type] || {};

        dataArray.forEach((item, index) => {
            const entry = index === 0 ? template : template.cloneNode(true);
            if (index > 0) container.appendChild(entry);

            // Apply field mappings
            Object.entries(mappings).forEach(([sel, field]) => {
                const el = entry.querySelector(sel);
                if (el) el.value = item[field] || '';
            });

            // Handle special array fields
            if (type === 'experience') {
                const achInput = entry.querySelector('.achievement-input');
                if (achInput && item.achievements) {
                    achInput.value = item.achievements.join('\n');
                }
            } else if (type === 'projects') {
                const techEl = entry.querySelector('.proj-technologies');
                if (techEl) techEl.value = (item.technologies || []).join(', ');

                const hlInput = entry.querySelector('.highlight-input');
                if (hlInput && item.highlights) {
                    hlInput.value = item.highlights.join('\n');
                }
            }
        });
    }

    // Clear all data
    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            storage.clearData();
            this.data = this.initializeData();
            this.currentStep = 1;
            this.renderCurrentStep();
            this.updatePreview();
            this.showNotification('All data cleared', 'info');
        }
    }

    // Navigation
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.collectFormData();
            this.saveData();
            this.currentStep++;
            this.renderCurrentStep();
            this.updatePreview();
        }
    }

    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps && stepNumber !== this.currentStep) {
            this.collectFormData();
            this.saveData();
            this.currentStep = stepNumber;
            this.renderCurrentStep();
            this.updatePreview();

            // Auto-scroll to top of form for better UX
            const formPanel = document.querySelector('.form-panel');
            if (formPanel) {
                formPanel.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderCurrentStep();
        }
    }

    // Render current step
    renderCurrentStep() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Update progress bar
        this.updateProgressBar();

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    // Update progress bar
    updateProgressBar() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        const stepIndicators = document.querySelectorAll('.step-indicator');
        stepIndicators.forEach((indicator, index) => {
            if (index < this.currentStep) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else if (index === this.currentStep - 1) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });
    }

    // Update navigation buttons
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.textContent = 'Finish';
            } else {
                nextBtn.textContent = 'Next Step →';
            }
        }
    }

    // Logic to update style and sync UI components
    updateStyleFromUI(styleId) {
        this.settings.style = styleId;
        storage.saveSettings(this.settings);

        if (typeof ResumeStyles !== 'undefined') {
            ResumeStyles.applyStyle(styleId, document.getElementById('resume-preview'));
        }

        this.updatePreview();
    }

    // Update resume preview
    updatePreview() {
        const previewContainer = document.getElementById('resume-preview');
        if (previewContainer) {
            const html = resumeTemplates.render(this.data, this.settings.template);
            previewContainer.innerHTML = html;
        }
    }

    // Toggle theme
    toggleTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            this.settings.theme = 'dark';
        } else {
            document.body.classList.remove('dark-mode');
            this.settings.theme = 'light';
        }
        storage.saveSettings(this.settings);
    }

    // Toggle mobile preview (for responsive view)
    toggleMobilePreview() {
        const mainLayout = document.querySelector('.main-layout');
        const toggleBtn = document.getElementById('mobile-preview-toggle');

        if (mainLayout) {
            const isShowingPreview = mainLayout.classList.toggle('show-preview');

            // Update button text
            if (toggleBtn) {
                if (isShowingPreview) {
                    toggleBtn.textContent = '📝 Back to Form';
                } else {
                    toggleBtn.textContent = '👁️ Toggle Preview';
                }
            }
        }
    }

    // Set color theme
    setColorTheme(theme) {
        if (theme === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        // Save preference
        this.settings.colorTheme = theme;
        storage.saveSettings(this.settings);

        // Show notification
        const themeNames = {
            'default': 'Indigo',
            'ocean': 'Ocean Blue',
            'forest': 'Forest Green',
            'sunset': 'Sunset Orange',
            'midnight': 'Midnight Purple',
            'rose': 'Rose Pink'
        };
        this.showNotification(`Theme: ${themeNames[theme] || theme}`, 'success');
    }

    // Load saved color theme
    loadColorTheme() {
        const savedTheme = this.settings.colorTheme || 'default';
        const selector = document.getElementById('color-theme-select');

        if (selector) {
            selector.value = savedTheme;
        }

        if (savedTheme !== 'default') {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }

    // Set resume font
    setResumeFont(font) {
        const preview = document.getElementById('resume-preview');
        if (preview) {
            // Remove all font classes
            const fontClasses = ['resume-font-inter', 'resume-font-roboto', 'resume-font-opensans',
                'resume-font-lato', 'resume-font-poppins', 'resume-font-montserrat',
                'resume-font-sourcesans', 'resume-font-nunito', 'resume-font-georgia', 'resume-font-times'];
            fontClasses.forEach(fc => preview.classList.remove(fc));

            // Add selected font class
            preview.classList.add(`resume-font-${font}`);

            // Save preference
            this.settings.resumeFont = font;
            storage.saveSettings(this.settings);
        }
    }

    // Apply custom color from color picker
    applyCustomColor(color) {
        const root = document.documentElement;

        // Set primary color and derived colors
        root.style.setProperty('--primary-color', color);

        // Generate lighter and darker variants
        const lighterColor = this.adjustColorBrightness(color, 30);
        const darkerColor = this.adjustColorBrightness(color, -20);

        root.style.setProperty('--primary-light', lighterColor);
        root.style.setProperty('--primary-dark', darkerColor);
        root.style.setProperty('--gradient-start', color);
        root.style.setProperty('--gradient-end', lighterColor);

        // Sync with ResumeStyles custom preset if available
        if (typeof ResumeStyles !== 'undefined' && ResumeStyles.styles.custom) {
            ResumeStyles.styles.custom.primaryColor = color;
            ResumeStyles.styles.custom.secondaryColor = lighterColor;

            // If currently on custom style, update layout immediately
            if (this.settings.style === 'custom') {
                ResumeStyles.applyStyle('custom', document.getElementById('resume-preview'));
            }
        }

        // Save custom color
        this.settings.customColor = color;
        storage.saveSettings(this.settings);

        this.updatePreview();
    }

    // Helper to adjust color brightness
    adjustColorBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // Show skeleton loading in a target element
    showSkeletonLoading(targetElement, lineCount = 3) {
        if (!targetElement) return;

        targetElement.classList.add('ai-loading');
        const originalContent = targetElement.value || targetElement.innerHTML;

        // Create skeleton placeholder
        let skeletonHTML = '';
        for (let i = 0; i < lineCount; i++) {
            const width = i === lineCount - 1 ? 'short' : (i % 2 === 0 ? 'full' : 'medium');
            skeletonHTML += `<div class="skeleton skeleton-text ${width}"></div>`;
        }

        if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
            targetElement.placeholder = 'Generating with AI...';
        } else {
            targetElement.innerHTML = skeletonHTML;
        }

        return originalContent;
    }

    // Hide skeleton loading
    hideSkeletonLoading(targetElement, content) {
        if (!targetElement) return;

        targetElement.classList.remove('ai-loading');

        if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
            targetElement.value = content;
            targetElement.placeholder = '';
        } else {
            targetElement.innerHTML = content;
        }
    }


    // Duplicate an entry (Education/Experience/Project)
    duplicateEntry(element, type) {
        if (!this.data[type]) return;

        // Find index of the entry being duplicated
        const entry = element.closest(`.${type}-entry`);
        const container = document.getElementById(`${type}-container`);
        if (!entry || !container) return;

        const index = Array.from(container.querySelectorAll(`.${type}-entry`)).indexOf(entry);
        if (index === -1) return;

        // Collect current data before duplicating to ensure we have the latest values
        this.collectFormData();

        const entryData = JSON.parse(JSON.stringify(this.data[type][index]));
        this.data[type].splice(index + 1, 0, entryData);

        this.saveData();
        this.renderCurrentStep();
        this.updatePreview();
        this.showNotification(`Entry duplicated!`, 'success');
    }

    // Export to PDF
    async exportPDF() {
        const previewElement = document.querySelector('.resume-template');
        if (previewElement) {
            const filename = `${this.data.personalInfo.fullName || 'resume'}`.replace(/\s+/g, '_');
            await pdfGenerator.generatePDF(previewElement, filename);
        } else {
            this.showNotification('Please complete your resume first', 'error');
        }
    }

    // Export Portfolio
    exportPortfolio() {
        this.collectFormData();

        if (!this.data.personalInfo?.fullName) {
            this.showNotification('Please add your personal information first', 'error');
            return;
        }

        // Get selected color theme from UI
        const selectedTheme = document.getElementById('color-theme-select')?.value || 'default';

        if (typeof PortfolioGenerator !== 'undefined') {
            const filename = `${this.data.personalInfo.fullName || 'portfolio'}`.replace(/\s+/g, '_').toLowerCase();
            PortfolioGenerator.downloadPortfolio(this.data, selectedTheme, filename);
            this.showNotification('Portfolio downloaded with your selected theme!', 'success');
        } else {
            this.showNotification('Portfolio generator not available', 'error');
        }
    }

    // Preview Portfolio in new tab
    previewPortfolio() {
        this.collectFormData();

        // Get selected color theme from UI
        const selectedTheme = document.getElementById('color-theme-select')?.value || 'default';

        if (typeof PortfolioGenerator !== 'undefined') {
            PortfolioGenerator.previewPortfolio(this.data, selectedTheme);
        }
    }

    // AI Features
    async generateSummary() {
        this.showNotification('Generating AI-powered summary...', 'info');

        const tone = document.getElementById('summary-tone')?.value || 'professional';
        const industry = document.getElementById('summary-industry')?.value || 'technology';

        try {
            let summary;

            // Priority 1: Use Gemini API (best quality)
            if (typeof aiEngine !== 'undefined' && !CONFIG.AI?.DEMO_MODE && CONFIG.AI?.API_KEY) {
                summary = await aiEngine.generateSummary(
                    this.data.personalInfo,
                    this.data.education,
                    this.data.skills,
                    industry,
                    tone
                );
            }
            // Priority 2: Use Hugging Face API
            else if (typeof huggingFaceAPI !== 'undefined' && !CONFIG.HUGGINGFACE?.DEMO_MODE) {
                summary = await huggingFaceAPI.generateProfessionalSummary(this.data);
            }
            // Priority 3: Smart template generation
            else if (typeof SmartContent !== 'undefined') {
                summary = SmartContent.generateSummary(this.data, tone);
            }
            // Fallback
            else {
                summary = `Results-driven professional with expertise in ${this.data.skills?.technical?.slice(0, 3).join(', ') || 'various technologies'}. Proven track record of delivering high-quality solutions.`;
            }

            this.data.summary = summary;
            const summaryTextarea = document.getElementById('summary-text');
            if (summaryTextarea) {
                summaryTextarea.value = summary;
            }

            this.saveData();
            this.updatePreview();
            this.showNotification('✨ AI Summary generated!', 'success');
        } catch (error) {
            this.showNotification('Failed to generate summary. Using fallback.', 'error');
            console.error('Summary generation error:', error);

            // Fallback to SmartContent
            if (typeof SmartContent !== 'undefined') {
                const fallbackSummary = SmartContent.generateSummary(this.data, tone);
                this.data.summary = fallbackSummary;
                document.getElementById('summary-text').value = fallbackSummary;
                this.saveData();
                this.updatePreview();
            }
        }
    }

    async enhanceExperience() {
        this.showNotification('Enhancing experience descriptions...', 'info');

        try {
            // Get all achievement inputs
            const achievementInputs = document.querySelectorAll('.achievement-input');
            let enhanced = 0;

            for (const input of achievementInputs) {
                if (input.value.trim()) {
                    const lines = input.value.split('\n').filter(line => line.trim());
                    const enhancedLines = [];

                    for (const line of lines) {
                        let enhancedLine = line;

                        // Use SmartContent if available
                        if (typeof SmartContent !== 'undefined') {
                            enhancedLine = SmartContent.enhanceBulletPoint(line, 'achievement');
                        }
                        // Use Hugging Face if available
                        else if (typeof huggingFaceAPI !== 'undefined') {
                            enhancedLine = await huggingFaceAPI.enhanceBulletPoint(line);
                        }

                        enhancedLines.push(enhancedLine);
                    }

                    input.value = enhancedLines.map(l => l.startsWith('•') ? l : `• ${l}`).join('\n');
                    enhanced++;
                }
            }

            this.scheduleAutoSave();
            this.showNotification(`Enhanced ${enhanced} experience entries!`, 'success');
        } catch (error) {
            this.showNotification('Failed to enhance experience', 'error');
            console.error(error);
        }
    }

    // Step 7 Features: ATS & Cover Letter

    // Analyze ATS compatibility
    async analyzeATS() {
        this.collectFormData();
        const jobDescription = document.getElementById('job-description')?.value || '';

        this.showNotification('Analyzing ATS compatibility...', 'info');

        try {
            const analysis = atsOptimizer.analyzeResume(this.data, jobDescription);

            // Update UI with score
            const scoreElement = document.getElementById('ats-score');
            if (scoreElement) {
                scoreElement.textContent = analysis.score;

                // Color code the score
                if (analysis.score >= 80) {
                    scoreElement.style.color = 'var(--success-color)';
                } else if (analysis.score >= 60) {
                    scoreElement.style.color = 'var(--warning-color)';
                } else {
                    scoreElement.style.color = 'var(--error-color)';
                }
            }

            // Display suggestions
            const suggestionsList = document.getElementById('ats-suggestions-list');
            const suggestionsContainer = document.getElementById('ats-suggestions');
            if (suggestionsList && analysis.suggestions.length > 0) {
                // Escape HTML to prevent XSS
                suggestionsList.innerHTML = analysis.suggestions
                    .map(sug => `<li style="margin-bottom: 0.5rem;">${Utils.escapeHTML(sug.message)}</li>`)
                    .join('');
                suggestionsContainer.style.display = 'block';
            }

            // Display missing keywords
            if (jobDescription) {
                const keywordsList = document.getElementById('ats-keywords-list');
                const keywordsContainer = document.getElementById('ats-keywords');
                const missingKeywords = analysis.keywords.filter(k => !analysis.matchedKeywords.includes(k)).slice(0, 10);

                if (keywordsList && missingKeywords.length > 0) {
                    // Escape HTML to prevent XSS
                    keywordsList.innerHTML = missingKeywords
                        .map(keyword => `<span class="skill-tag">${Utils.escapeHTML(keyword)}</span>`)
                        .join('');
                    keywordsContainer.style.display = 'block';
                }
            }

            this.showNotification(`ATS Score: ${analysis.score}/100`, 'success');

            // NEW: Job Description Matcher results
            const jdMatchContainer = document.getElementById('jd-match-container');
            if (jdMatchContainer && typeof jobDescriptionMatcher !== 'undefined') {
                const results = jobDescriptionMatcher.analyzeMatch(this.data, jobDescription);
                jdMatchContainer.innerHTML = jobDescriptionMatcher.renderMatchResults(results);
                jdMatchContainer.style.display = 'block';
            }
        } catch (error) {
            this.showNotification('Failed to analyze ATS compatibility', 'error');
            console.error(error);
        }
    }

    // New feature handlers
    async exportDOCX() {
        if (typeof docxExport === 'undefined') {
            this.showNotification('DOCX export module not loaded', 'error');
            return;
        }
        this.collectFormData();
        this.showNotification('Generating DOCX...', 'info');
        try {
            await docxExport.generateDocx(this.data, `${this.data.personalInfo?.fullName || 'resume'}_asap`);
            this.showNotification('DOCX exported successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to export DOCX', 'error');
        }
    }

    async shareResume() {
        if (typeof resumeSharing === 'undefined') {
            this.showNotification('Sharing module not loaded', 'error');
            return;
        }
        this.collectFormData();
        this.showNotification('Generating share link...', 'info');
        try {
            const result = await resumeSharing.generateShareLink(this.data);
            if (result.success) {
                const shareInput = document.getElementById('share-link-input');
                const shareResult = document.getElementById('share-result');
                if (shareInput && shareResult) {
                    shareInput.value = result.url;
                    shareResult.style.display = 'block';
                    // Show a simple modal or alert with the link
                    alert(`Share Link Created!\n\n${result.url}\n\nCopied to clipboard.`);
                    resumeSharing.copyToClipboard(result.url);
                }
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to generate share link', 'error');
        }
    }

    toggleLinkedInImport() {
        const container = document.getElementById('linkedin-import-container');
        if (container) {
            if (container.style.display === 'none') {
                container.innerHTML = linkedInImport.renderImportUI();
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        }
    }

    importLinkedIn() {
        const jsonInput = document.getElementById('linkedin-json-input');
        if (jsonInput) {
            const data = linkedInImport.parseProfileData(jsonInput.value);
            if (data.error) {
                this.showNotification(data.error, 'error');
            } else {
                linkedInImport.applyToForm(data);
                this.data = { ...this.data, ...data };
                this.populateForm();
                this.updatePreview();
                document.getElementById('linkedin-import-container').style.display = 'none';
            }
        }
    }

    async checkGrammar(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field || typeof grammarChecker === 'undefined') return;

        this.showNotification('Checking grammar...', 'info');
        try {
            const text = field.value;
            const results = await grammarChecker.checkGrammar(text);

            if (results.isClean) {
                this.showNotification('No grammar issues found!', 'success');
            } else {
                // Show issues in a user-friendly way
                // For now, we'll just show a summary notification
                this.showNotification(`Found ${results.matches.length} possible issues.`, 'warning');
                console.log('Grammar issues:', results.matches);

                // You could inject a results UI next to the field
                let resultsContainer = field.parentElement.querySelector('.grammar-results-inline');
                if (!resultsContainer) {
                    resultsContainer = document.createElement('div');
                    resultsContainer.className = 'grammar-results-inline';
                    field.parentElement.appendChild(resultsContainer);
                }
                resultsContainer.innerHTML = grammarChecker.renderIssues(results.matches);
            }
        } catch (error) {
            this.showNotification('Grammar check failed', 'error');
        }
    }

    // Generate cover letter
    async generateCoverLetter() {
        this.collectFormData();

        const jobTitle = document.getElementById('job-title')?.value || '';
        const jobCompany = document.getElementById('job-company')?.value || '';
        const jobDescription = document.getElementById('job-description')?.value || '';
        const tone = document.getElementById('cover-letter-tone')?.value || 'formal';

        if (!jobTitle || !jobCompany) {
            this.showNotification('Please enter job title and company name', 'error');
            return;
        }

        this.jobInfo = {
            title: jobTitle,
            company: jobCompany,
            description: jobDescription
        };

        this.showNotification('Generating cover letter with AI...', 'info');

        try {
            const coverLetter = await coverLetterGen.generateCoverLetter(
                this.data,
                this.jobInfo,
                tone
            );

            const coverLetterTextarea = document.getElementById('cover-letter-text');
            if (coverLetterTextarea) {
                coverLetterTextarea.value = coverLetter;
            }

            this.showNotification('Cover letter generated!', 'success');
        } catch (error) {
            this.showNotification('Failed to generate cover letter', 'error');
            console.error(error);
        }
    }

    // Copy cover letter to clipboard
    async copyCoverLetterToClipboard() {
        const coverLetterText = document.getElementById('cover-letter-text')?.value;

        if (!coverLetterText) {
            this.showNotification('No cover letter to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(coverLetterText);
            this.showNotification('Cover letter copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textarea = document.getElementById('cover-letter-text');
            textarea.select();
            document.execCommand('copy');
            this.showNotification('Cover letter copied to clipboard!', 'success');
        }
    }

    // Download cover letter as TXT
    downloadCoverLetter() {
        const coverLetterText = document.getElementById('cover-letter-text')?.value;

        if (!coverLetterText) {
            this.showNotification('No cover letter to download', 'error');
            return;
        }

        const blob = new Blob([coverLetterText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const fileName = `${this.data.personalInfo.fullName || 'cover_letter'}_cover_letter.txt`.replace(/\s+/g, '_');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Cover letter downloaded!', 'success');
    }

    // Export portfolio with selected theme
    exportPortfolio() {
        this.collectFormData();

        // Use the main color theme selector for portfolio
        const themeSelect = document.getElementById('color-theme-select');
        const selectedTheme = themeSelect?.value || 'default';

        if (!this.data.personalInfo?.fullName) {
            this.showNotification('Please add your name before generating a portfolio', 'error');
            return;
        }

        this.showNotification('Generating portfolio...', 'info');

        // Use PortfolioGenerator with selected theme
        if (typeof PortfolioGenerator !== 'undefined') {
            PortfolioGenerator.previewPortfolio(this.data, selectedTheme);
            this.showNotification('Portfolio opened in new tab!', 'success');
        } else {
            this.showNotification('Portfolio generator not available', 'error');
        }
    }

    // Set color theme
    setColorTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.settings.colorTheme = theme;
        storage.saveSettings(this.settings);
        this.updatePreview();
    }

    // Show notification
    showNotification(message, type = 'info') {
        pdfGenerator.showNotification(message, type);
    }

    // Step 8: Drag and Drop Reordering
    initDragAndDrop() {
        const containers = ['education-container', 'experience-container', 'projects-container'];

        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;

            let dragItem = null;

            container.addEventListener('dragstart', (e) => {
                const entry = e.target.closest('.entry-item');
                if (!entry) return;

                dragItem = entry;
                entry.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            container.addEventListener('dragend', (e) => {
                const entry = e.target.closest('.entry-item');
                if (entry) entry.classList.remove('dragging');
                this.collectFormData();
                this.saveData();
                this.updatePreview();
            });

            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (dragItem) {
                    if (afterElement == null) {
                        container.appendChild(dragItem);
                    } else {
                        container.insertBefore(dragItem, afterElement);
                    }
                }
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.entry-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Mobile Collapsible Entries
    setupCollapsibleListeners() {
        document.addEventListener('click', (e) => {
            if (window.innerWidth > 768) return;

            const entry = e.target.closest('.entry-item');
            if (entry) {
                // If clicking an input or button, don't collapse/expand (let them work)
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }

                const isActive = entry.classList.contains('active-editing');

                // Collapse others in same container
                const container = entry.parentElement;
                container.querySelectorAll('.entry-item').forEach(item => {
                    item.classList.remove('active-editing');
                });

                if (!isActive) {
                    entry.classList.add('active-editing');
                }

                e.stopPropagation();
            }
        });
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ResumeBuilder();
    app.init();
});
