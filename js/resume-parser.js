// Resume Parser - Parse uploaded/pasted resume content and extract structured data
// Enhanced version - extracts maximum content from any resume format

const ResumeParser = {
    // Common section headers to identify resume parts
    sectionHeaders: {
        contact: ['contact', 'personal information', 'personal details', 'contact info', 'contact information', 'details'],
        summary: ['summary', 'professional summary', 'profile', 'objective', 'career objective', 'about me', 'about', 'overview', 'introduction'],
        experience: ['experience', 'work experience', 'employment history', 'work history', 'professional experience', 'employment', 'career history', 'work'],
        education: ['education', 'academic', 'qualifications', 'academic background', 'educational background', 'academics', 'schooling'],
        skills: ['skills', 'technical skills', 'core competencies', 'competencies', 'expertise', 'technologies', 'proficiencies', 'abilities', 'core skills', 'key skills'],
        projects: ['projects', 'personal projects', 'key projects', 'notable projects', 'portfolio', 'side projects', 'academic projects']
    },

    // Parse pasted/uploaded resume text - extracts EVERYTHING possible
    parseResumeText(text) {
        if (!text || typeof text !== 'string') return null;

        // Clean and normalize text
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);

        const result = {
            personalInfo: {},
            summary: '',
            experience: [],
            education: [],
            skills: { technical: [], soft: [] },
            projects: []
        };

        // ===== EXTRACT ALL CONTACT INFO =====

        // Email (multiple patterns)
        const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/gi);
        if (emailMatch) {
            result.personalInfo.email = emailMatch[0];
        }

        // Phone (multiple formats)
        const phonePatterns = [
            /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
            /\+\d{1,3}[-.\s]?\d{10}/,
            /\d{5}[-.\s]?\d{5}/,  // Indian format
            /\d{3}[-.\s]?\d{4}[-.\s]?\d{3}/
        ];
        for (const pattern of phonePatterns) {
            const match = text.match(pattern);
            if (match) {
                result.personalInfo.phone = match[0];
                break;
            }
        }

        // LinkedIn
        const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin:?\s*:?\s*)([\w-]+)/i);
        if (linkedinMatch) {
            result.personalInfo.linkedin = 'https://linkedin.com/in/' + linkedinMatch[1];
        }

        // GitHub
        const githubMatch = text.match(/(?:github\.com\/|github:?\s*:?\s*)([\w-]+)/i);
        if (githubMatch) {
            result.personalInfo.github = 'https://github.com/' + githubMatch[1];
        }

        // Portfolio/Website
        const websiteMatch = text.match(/(?:portfolio|website|site)[:\s]*(https?:\/\/\S+|www\.\S+)/i);
        if (websiteMatch) {
            result.personalInfo.portfolio = websiteMatch[1];
        }

        // Location (City, State/Country patterns)
        const locationMatch = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),?\s*([A-Z]{2,}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
        if (locationMatch) {
            result.personalInfo.location = locationMatch[0];
        }

        // ===== EXTRACT NAME =====
        // First 5 lines, find the one that looks like a name
        for (let i = 0; i < Math.min(8, lines.length); i++) {
            const line = lines[i];
            // Name criteria: 2-4 words, no special chars, no numbers, not an email/phone
            if (line.length > 2 && line.length < 60 &&
                !line.includes('@') &&
                !line.match(/^\+?\d/) &&
                !line.match(/\d{4}/) &&
                !line.toLowerCase().includes('resume') &&
                !line.toLowerCase().includes('curriculum') &&
                !line.toLowerCase().includes('vitae') &&
                !line.toLowerCase().includes('summary') &&
                !line.toLowerCase().includes('objective') &&
                !this.isSectionHeader(line)) {

                // Check if it looks like a name (mostly letters, possibly with . or -)
                const nameWords = line.split(/\s+/);
                if (nameWords.length >= 1 && nameWords.length <= 5) {
                    const looksLikeName = nameWords.every(w =>
                        w.match(/^[A-Za-z][A-Za-z.''-]*$/) && w.length > 1
                    );
                    if (looksLikeName || nameWords.length >= 2) {
                        result.personalInfo.fullName = line;
                        break;
                    }
                }
            }
        }

        // ===== IDENTIFY AND PARSE SECTIONS =====
        const sections = this.identifySections(lines);

        // Parse Summary - also try to extract if no header found
        if (sections.summary) {
            result.summary = sections.summary.join(' ').trim();
        } else {
            // Try to find summary in first few paragraphs
            const potentialSummary = this.findSummaryText(lines);
            if (potentialSummary) {
                result.summary = potentialSummary;
            }
        }

        // Parse Experience
        if (sections.experience && sections.experience.length > 0) {
            result.experience = this.parseExperience(sections.experience);
        }
        // If no experience found by header, try to find any job-like entries
        if (result.experience.length === 0) {
            result.experience = this.findExperienceWithoutHeader(lines);
        }

        // Parse Education
        if (sections.education && sections.education.length > 0) {
            result.education = this.parseEducation(sections.education);
        }
        // If no education found by header, try to find any education-like entries
        if (result.education.length === 0) {
            result.education = this.findEducationWithoutHeader(lines);
        }

        // Parse Skills
        if (sections.skills && sections.skills.length > 0) {
            result.skills = this.parseSkills(sections.skills);
        }
        // If no skills found, try to extract from entire text
        if (result.skills.technical.length === 0) {
            result.skills = this.extractSkillsFromText(text);
        }

        // Parse Projects
        if (sections.projects && sections.projects.length > 0) {
            result.projects = this.parseProjects(sections.projects);
        }

        return result;
    },

    // Check if a line is a section header
    isSectionHeader(line) {
        const normalized = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        for (const headers of Object.values(this.sectionHeaders)) {
            for (const header of headers) {
                if (normalized === header || normalized.startsWith(header)) {
                    return true;
                }
            }
        }
        return false;
    },

    // Find summary text even without header
    findSummaryText(lines) {
        for (let i = 0; i < Math.min(20, lines.length); i++) {
            const line = lines[i];
            // Look for a long descriptive paragraph (likely summary)
            if (line.length > 80 && !line.match(/\d{4}/) && !line.includes('@')) {
                return line;
            }
        }
        return '';
    },

    // Find experience entries without explicit header
    findExperienceWithoutHeader(lines) {
        const experiences = [];
        let current = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Look for date patterns that indicate job entries
            const dateMatch = line.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|\d{4})\b.*?(-|–|to|till).*?\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|\d{4}|present|current|now)\b/i);

            if (dateMatch && line.length > 20) {
                if (current && (current.title || current.company)) {
                    experiences.push(current);
                }
                current = {
                    title: '',
                    company: '',
                    startDate: '',
                    endDate: '',
                    achievements: []
                };

                // Parse the line for title/company
                const beforeDate = line.substring(0, line.indexOf(dateMatch[0])).trim();
                const parts = beforeDate.split(/[|,@]/).map(p => p.trim()).filter(p => p);
                if (parts.length >= 2) {
                    current.title = parts[0];
                    current.company = parts[1];
                } else if (parts.length === 1) {
                    current.title = parts[0];
                }

                // Extract dates
                const dateStr = dateMatch[0];
                const dateParts = dateStr.split(/\s*(-|–|to|till)\s*/i);
                if (dateParts.length >= 2) {
                    current.startDate = dateParts[0].trim();
                    current.endDate = dateParts[dateParts.length - 1].trim();
                }
            } else if (current && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('–'))) {
                current.achievements.push(line.replace(/^[•\-*–]\s*/, '').trim());
            }
        }

        if (current && (current.title || current.company)) {
            experiences.push(current);
        }
        return experiences;
    },

    // Find education entries without explicit header
    findEducationWithoutHeader(lines) {
        const education = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Look for education-related keywords
            if (line.match(/\b(bachelor|master|phd|doctorate|associate|diploma|certificate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|mba|bba|bca|mca)\b/i)) {
                const edu = {
                    degree: line,
                    institution: '',
                    startDate: '',
                    endDate: '',
                    gpa: ''
                };

                // Look for institution in next few lines
                for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
                    if (lines[j].match(/\b(university|college|institute|school|academy)\b/i)) {
                        edu.institution = lines[j].replace(/\d{4}.*/, '').trim();
                        break;
                    }
                }

                // Extract year
                const yearMatch = line.match(/(\d{4})\s*(-|–|to)?\s*(\d{4}|present)?/i);
                if (yearMatch) {
                    edu.startDate = yearMatch[1];
                    edu.endDate = yearMatch[3] || '';
                }

                // Extract GPA
                const gpaMatch = (line + ' ' + (lines[i + 1] || '')).match(/\b(gpa|cgpa|grade|percentage)[:\s]*([\d.]+)/i);
                if (gpaMatch) {
                    edu.gpa = gpaMatch[2];
                }

                education.push(edu);
            }
        }
        return education;
    },

    // Extract skills from entire text
    extractSkillsFromText(text) {
        const skills = { technical: [], soft: [] };

        // Common technical skills to look for
        const techKeywords = [
            'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
            'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
            'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'oracle',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
            'linux', 'windows', 'macos', 'bash', 'powershell',
            'rest', 'api', 'graphql', 'json', 'xml',
            'machine learning', 'ai', 'tensorflow', 'pytorch', 'pandas', 'numpy',
            'agile', 'scrum', 'jira', 'figma', 'photoshop', 'excel'
        ];

        const softKeywords = [
            'communication', 'leadership', 'teamwork', 'problem solving', 'time management',
            'critical thinking', 'adaptability', 'creativity', 'collaboration', 'organization',
            'analytical', 'detail oriented', 'self motivated', 'team player'
        ];

        const lowerText = text.toLowerCase();

        for (const skill of techKeywords) {
            if (lowerText.includes(skill.toLowerCase())) {
                skills.technical.push(skill.charAt(0).toUpperCase() + skill.slice(1));
            }
        }

        for (const skill of softKeywords) {
            if (lowerText.includes(skill.toLowerCase())) {
                skills.soft.push(skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
            }
        }

        return skills;
    },

    // Identify sections in the resume
    identifySections(lines) {
        const sections = {};
        let currentSection = null;
        let currentContent = [];

        for (const line of lines) {
            const sectionType = this.identifySectionHeader(line);

            if (sectionType) {
                // Save previous section
                if (currentSection && currentContent.length > 0) {
                    sections[currentSection] = currentContent;
                }
                currentSection = sectionType;
                currentContent = [];
            } else if (currentSection) {
                currentContent.push(line);
            }
        }

        // Save last section
        if (currentSection && currentContent.length > 0) {
            sections[currentSection] = currentContent;
        }

        return sections;
    },

    // Identify if a line is a section header
    identifySectionHeader(line) {
        const normalized = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();

        for (const [type, headers] of Object.entries(this.sectionHeaders)) {
            for (const header of headers) {
                if (normalized === header || normalized.startsWith(header + ' ') || normalized.endsWith(' ' + header)) {
                    return type;
                }
            }
        }
        return null;
    },

    // Parse experience section
    parseExperience(lines) {
        const experiences = [];
        let current = null;

        for (const line of lines) {
            // Check if this looks like a new position
            const dateMatch = line.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|\d{4})\b.*?(-|–|to|till).*?\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|\d{4}|present|current|now)\b/i);

            if (dateMatch || (line.includes('|') && !line.startsWith('•') && !line.startsWith('-') && line.length > 15)) {
                if (current) experiences.push(current);
                current = {
                    title: '',
                    company: '',
                    startDate: '',
                    endDate: '',
                    achievements: []
                };

                // Try to extract company and title from this line
                let textPart = line;
                if (dateMatch) {
                    textPart = line.substring(0, line.indexOf(dateMatch[0])).trim();
                }

                const parts = textPart.split(/[|,@]/).map(p => p.trim()).filter(p => p && p.length > 1);
                if (parts.length >= 2) {
                    current.title = parts[0];
                    current.company = parts[1];
                } else if (parts.length === 1) {
                    current.title = parts[0];
                }

                // Extract dates
                if (dateMatch) {
                    const dateStr = dateMatch[0];
                    const dateParts = dateStr.split(/\s*(-|–|to|till)\s*/i);
                    if (dateParts.length >= 2) {
                        current.startDate = dateParts[0].trim();
                        current.endDate = dateParts[dateParts.length - 1].trim();
                    }
                }
            } else if (current && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('–') || line.startsWith('○'))) {
                current.achievements.push(line.replace(/^[•\-*–○]\s*/, '').trim());
            } else if (current && line.length > 15 && !current.title && !line.match(/\d{4}/)) {
                current.title = line;
            } else if (current && line.length > 15 && current.title && !current.company && !line.match(/\d{4}/)) {
                current.company = line;
            } else if (current && line.length > 30 && !line.startsWith('•') && !line.startsWith('-')) {
                // Long line might be an achievement without bullet
                current.achievements.push(line);
            }
        }

        if (current) experiences.push(current);
        return experiences.filter(exp => exp.title || exp.company || exp.achievements.length > 0);
    },

    // Parse education section
    parseEducation(lines) {
        const education = [];
        let current = null;

        for (const line of lines) {
            // Look for degree keywords
            if (line.match(/\b(bachelor|master|phd|doctorate|associate|diploma|certificate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|mba|bba|bca|mca|high school|secondary|12th|10th)\b/i)) {
                if (current) education.push(current);
                current = {
                    degree: line,
                    institution: '',
                    startDate: '',
                    endDate: '',
                    gpa: ''
                };

                // Extract GPA if present
                const gpaMatch = line.match(/\b(gpa|cgpa|grade)[:\s]*([\d.]+)/i);
                if (gpaMatch) {
                    current.gpa = gpaMatch[2];
                }

                // Extract years
                const yearMatch = line.match(/(\d{4})\s*(-|–|to)?\s*(\d{4}|present)?/i);
                if (yearMatch) {
                    current.startDate = yearMatch[1];
                    current.endDate = yearMatch[3] || '';
                }
            } else if (current && !current.institution && line.length > 3) {
                // University/institution usually follows degree
                if (line.match(/\b(university|college|institute|school|academy)\b/i) || line.length > 5) {
                    current.institution = line.replace(/\d{4}.*/, '').trim();

                    // Extract years from institution line if not found
                    if (!current.startDate) {
                        const yearMatch = line.match(/(\d{4})\s*(-|–|to)?\s*(\d{4}|present)?/i);
                        if (yearMatch) {
                            current.startDate = yearMatch[1];
                            current.endDate = yearMatch[3] || '';
                        }
                    }
                }
            }
        }

        if (current) education.push(current);
        return education.filter(edu => edu.degree || edu.institution);
    },

    // Parse skills section
    parseSkills(lines) {
        const skills = { technical: [], soft: [] };
        const allSkills = [];

        // Common soft skills keywords
        const softSkillKeywords = ['communication', 'leadership', 'teamwork', 'problem solving', 'time management',
            'critical thinking', 'adaptability', 'creativity', 'collaboration', 'organization', 'analytical'];

        for (const line of lines) {
            // Split by common delimiters
            const items = line.split(/[,;•|\-○]/).map(s => s.trim()).filter(s => s && s.length > 1 && s.length < 50);
            allSkills.push(...items);
        }

        // Categorize skills
        for (const skill of allSkills) {
            const normalized = skill.toLowerCase();
            if (softSkillKeywords.some(kw => normalized.includes(kw))) {
                skills.soft.push(skill);
            } else {
                skills.technical.push(skill);
            }
        }

        return skills;
    },

    // Parse projects section
    parseProjects(lines) {
        const projects = [];
        let current = null;

        for (const line of lines) {
            // New project starts with a capitalized name or bullet
            if ((line.length < 100 && line.match(/^[A-Z]/) && !line.startsWith('•') && !line.startsWith('-') && line.length > 3) ||
                (line.includes('|') && !line.startsWith('•') && line.length > 5)) {
                if (current) projects.push(current);
                current = {
                    name: line.split(/[|–\-:]/)[0].trim(),
                    description: '',
                    technologies: [],
                    link: ''
                };

                // Check for GitHub/link
                const linkMatch = line.match(/(https?:\/\/\S+|github\.com\/\S+|gitlab\.com\/\S+)/i);
                if (linkMatch) {
                    current.link = linkMatch[0].startsWith('http') ? linkMatch[0] : 'https://' + linkMatch[0];
                }
            } else if (current) {
                if (line.toLowerCase().includes('technolog') || line.toLowerCase().includes('built with') ||
                    line.toLowerCase().includes('tech stack') || line.toLowerCase().includes('using:')) {
                    const techs = line.replace(/.*?[:\-]/i, '').split(/[,;]/).map(t => t.trim()).filter(t => t);
                    current.technologies.push(...techs);
                } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('○')) {
                    current.description += (current.description ? ' ' : '') + line.replace(/^[•\-○]\s*/, '');
                } else if (!current.description && line.length > 10) {
                    current.description = line;
                } else if (line.length > 20) {
                    current.description += (current.description ? ' ' : '') + line;
                }
            }
        }

        if (current) projects.push(current);
        return projects.filter(p => p.name && p.name.length > 2);
    },

    // Show upload/paste modal
    showImportModal() {
        const existingModal = document.getElementById('resume-import-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'resume-import-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal resume-import-modal">
                <div class="modal-header">
                    <h3>📄 Import Previous Resume</h3>
                    <button class="modal-close" onclick="ResumeParser.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 0.75rem; color: var(--text-secondary); font-size: 0.75rem;">
                        Paste your entire resume content below. We'll extract ALL information automatically.
                    </p>
                    
                    <div class="import-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <button class="btn btn-primary btn-sm" id="paste-tab" onclick="ResumeParser.showTab('paste')">📋 Paste Text</button>
                        <button class="btn btn-secondary btn-sm" id="upload-tab" onclick="ResumeParser.showTab('upload')">📁 Upload File</button>
                    </div>
                    
                    <div id="paste-content">
                        <textarea id="resume-paste-area" class="form-textarea" 
                            style="min-height: 250px; font-family: monospace; font-size: 0.7rem;"
                            placeholder="Copy and paste your ENTIRE resume here...

Just select all text from your resume (Ctrl+A) and paste it here (Ctrl+V).

We'll automatically extract:
✓ Name, Email, Phone, LinkedIn, GitHub
✓ Professional Summary
✓ All Work Experience entries
✓ All Education entries  
✓ All Skills (Technical & Soft)
✓ All Projects

Tip: You can copy from PDF, Word, or any format!"></textarea>
                    </div>
                    
                    <div id="upload-content" style="display: none;">
                        <div style="border: 2px dashed var(--border-color); border-radius: var(--radius-md); padding: 2rem; text-align: center;">
                            <input type="file" id="resume-file-input" accept=".txt,.text,.doc,.docx,.pdf" style="display: none;" 
                                onchange="ResumeParser.handleFileUpload(event)">
                            <button class="btn btn-secondary" onclick="document.getElementById('resume-file-input').click()">
                                📁 Choose File
                            </button>
                            <p style="margin-top: 0.5rem; color: var(--text-tertiary); font-size: 0.7rem;">
                                Supports .txt files. For PDF/DOCX, copy-paste the text content.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="ResumeParser.closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="ResumeParser.parseAndFill()">✨ Import & Fill All Fields</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Show tab
    showTab(tab) {
        const pasteTab = document.getElementById('paste-tab');
        const uploadTab = document.getElementById('upload-tab');
        const pasteContent = document.getElementById('paste-content');
        const uploadContent = document.getElementById('upload-content');

        if (tab === 'paste') {
            pasteTab.classList.replace('btn-secondary', 'btn-primary');
            uploadTab.classList.replace('btn-primary', 'btn-secondary');
            pasteContent.style.display = 'block';
            uploadContent.style.display = 'none';
        } else {
            uploadTab.classList.replace('btn-secondary', 'btn-primary');
            pasteTab.classList.replace('btn-primary', 'btn-secondary');
            uploadContent.style.display = 'block';
            pasteContent.style.display = 'none';
        }
    },

    // Handle file upload
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('resume-paste-area').value = e.target.result;
            this.showTab('paste');
        };
        reader.readAsText(file);
    },

    // Parse and fill form - uses AI for best extraction, falls back to regex
    async parseAndFill() {
        const text = document.getElementById('resume-paste-area').value;
        if (!text.trim()) {
            return;
        }

        // Show loading state
        const parseBtn = document.querySelector('.modal-footer .btn-primary');
        if (parseBtn) {
            parseBtn.disabled = true;
            parseBtn.innerHTML = '⏳ Parsing with AI...';
        }

        let parsed = null;

        // Try AI parsing first (much more accurate)
        if (typeof aiEngine !== 'undefined') {
            try {
                parsed = await aiEngine.parseResume(text);
            } catch (e) {
                console.log('AI parsing failed, using fallback:', e);
            }
        }

        // Fallback to regex parsing if AI fails
        if (!parsed) {
            if (parseBtn) parseBtn.innerHTML = '⏳ Parsing...';
            parsed = this.parseResumeText(text);
        }

        if (!parsed) {
            if (parseBtn) {
                parseBtn.disabled = false;
                parseBtn.innerHTML = '✨ Import & Fill All Fields';
            }
            return;
        }

        // Fill personal info
        this.setInputValue('full-name', parsed.personalInfo.fullName);
        this.setInputValue('job-headline', parsed.personalInfo.jobHeadline);
        this.setInputValue('email', parsed.personalInfo.email);
        this.setInputValue('phone', parsed.personalInfo.phone);
        this.setInputValue('linkedin', parsed.personalInfo.linkedin);
        this.setInputValue('github', parsed.personalInfo.github);
        this.setInputValue('location', parsed.personalInfo.location);
        this.setInputValue('portfolio', parsed.personalInfo.portfolio);

        // Fill summary
        this.setInputValue('summary-text', parsed.summary);

        // Fill skills
        if (parsed.skills) {
            if (parsed.skills.technical && parsed.skills.technical.length) {
                this.setInputValue('technical-skills', parsed.skills.technical.join(', '));
            }
            if (parsed.skills.soft && parsed.skills.soft.length) {
                this.setInputValue('soft-skills', parsed.skills.soft.join(', '));
            }
        }

        // Fill languages
        if (parsed.languages && parsed.languages.length) {
            this.setInputValue('languages', parsed.languages.join(', '));
        }

        // Fill awards
        if (parsed.awards && parsed.awards.length) {
            this.setInputValue('awards', parsed.awards.map(a => '• ' + a).join('\n'));
        }

        // Fill education entries
        if (parsed.education.length > 0) {
            this.fillEducation(parsed.education);
        }

        // Fill experience entries
        if (parsed.experience.length > 0) {
            this.fillExperience(parsed.experience);
        }

        // Fill project entries
        if (parsed.projects.length > 0) {
            this.fillProjects(parsed.projects);
        }

        // Close modal
        this.closeModal();

        // Trigger form update
        if (window.app) {
            window.app.collectFormData();
            window.app.updatePreview();
            window.app.scheduleAutoSave();
        }
    },

    // Helper to set input value
    setInputValue(id, value) {
        if (!value) return;
        const el = document.getElementById(id);
        if (el) el.value = value;
    },

    // Fill education entries
    fillEducation(educationList) {
        const container = document.getElementById('education-container');
        if (!container) return;

        // Get existing entries
        const existingEntries = container.querySelectorAll('.education-entry');

        educationList.forEach((edu, index) => {
            let entry;
            if (index < existingEntries.length) {
                entry = existingEntries[index];
            } else {
                // Clone first entry and add to container
                const template = existingEntries[0];
                if (template) {
                    entry = template.cloneNode(true);
                    entry.querySelectorAll('input').forEach(input => input.value = '');
                    container.appendChild(entry);
                }
            }

            if (entry) {
                const degreeInput = entry.querySelector('.edu-degree');
                const institutionInput = entry.querySelector('.edu-institution');
                const locationInput = entry.querySelector('.edu-location');
                const startInput = entry.querySelector('.edu-start');
                const endInput = entry.querySelector('.edu-end');
                const gpaInput = entry.querySelector('.edu-gpa');

                if (degreeInput) degreeInput.value = edu.degree || '';
                if (institutionInput) institutionInput.value = edu.institution || '';
                if (locationInput) locationInput.value = edu.location || '';
                if (startInput) startInput.value = edu.startDate || '';
                if (endInput) endInput.value = edu.endDate || '';
                if (gpaInput) gpaInput.value = edu.gpa || '';
            }
        });
    },

    // Fill experience entries
    fillExperience(experienceList) {
        const container = document.getElementById('experience-container');
        if (!container) return;

        const existingEntries = container.querySelectorAll('.experience-entry');

        experienceList.forEach((exp, index) => {
            let entry;
            if (index < existingEntries.length) {
                entry = existingEntries[index];
            } else {
                const template = existingEntries[0];
                if (template) {
                    entry = template.cloneNode(true);
                    entry.querySelectorAll('input, textarea').forEach(input => input.value = '');
                    container.appendChild(entry);
                }
            }

            if (entry) {
                const titleInput = entry.querySelector('.exp-title');
                const companyInput = entry.querySelector('.exp-company');
                const locationInput = entry.querySelector('.exp-location');
                const startInput = entry.querySelector('.exp-start');
                const endInput = entry.querySelector('.exp-end');
                const achievementsInput = entry.querySelector('.exp-achievements');

                if (titleInput) titleInput.value = exp.title || '';
                if (companyInput) companyInput.value = exp.company || '';
                if (locationInput) locationInput.value = exp.location || '';
                if (startInput) startInput.value = exp.startDate || '';
                if (endInput) endInput.value = exp.endDate || '';
                if (achievementsInput && exp.achievements.length) {
                    achievementsInput.value = exp.achievements.map(a => '• ' + a).join('\n');
                }
            }
        });
    },

    // Fill project entries
    fillProjects(projectList) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const existingEntries = container.querySelectorAll('.project-entry');

        projectList.forEach((proj, index) => {
            let entry;
            if (index < existingEntries.length) {
                entry = existingEntries[index];
            } else {
                const template = existingEntries[0];
                if (template) {
                    entry = template.cloneNode(true);
                    entry.querySelectorAll('input, textarea').forEach(input => input.value = '');
                    container.appendChild(entry);
                }
            }

            if (entry) {
                const nameInput = entry.querySelector('.proj-name');
                const descInput = entry.querySelector('.proj-description');
                const techInput = entry.querySelector('.proj-technologies');
                const linkInput = entry.querySelector('.proj-link');

                if (nameInput) nameInput.value = proj.name || '';
                if (descInput) descInput.value = proj.description || '';
                if (techInput) techInput.value = proj.technologies.join(', ');
                if (linkInput) linkInput.value = proj.link || '';
            }
        });
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('resume-import-modal');
        if (modal) modal.remove();
    }
};

// Make globally available
window.ResumeParser = ResumeParser;
