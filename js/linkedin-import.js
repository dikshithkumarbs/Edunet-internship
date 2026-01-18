// LinkedIn Import - Parse LinkedIn data export to auto-fill resume
class LinkedInImport {
    constructor() {
        this.fieldMappings = {
            'First Name': 'firstName',
            'Last Name': 'lastName',
            'Email Address': 'email',
            'Phone Number': 'phone',
            'City': 'city',
            'Country': 'country'
        };
    }

    // Parse LinkedIn profile JSON data export
    parseProfileData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            return this.mapToResumeFormat(data);
        } catch (error) {
            console.error('LinkedIn parse error:', error);
            return { error: 'Invalid LinkedIn data format. Please check your export.' };
        }
    }

    // Map LinkedIn data to resume format
    mapToResumeFormat(linkedInData) {
        const resume = {
            personalInfo: {},
            education: [],
            experience: [],
            skills: { technical: [], soft: [] },
            projects: []
        };

        // Personal Info
        if (linkedInData.profile || linkedInData) {
            const profile = linkedInData.profile || linkedInData;
            resume.personalInfo = {
                fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.name || '',
                email: profile.email || profile.emailAddress || '',
                phone: profile.phoneNumber || profile.phone || '',
                location: this.formatLocation(profile),
                linkedin: profile.publicProfileUrl || profile.linkedinUrl || ''
            };
        }

        // Education
        if (linkedInData.education || linkedInData.schools) {
            const eduList = linkedInData.education || linkedInData.schools || [];
            resume.education = eduList.map(edu => ({
                degree: edu.degreeName || edu.degree || edu.fieldOfStudy || '',
                institution: edu.schoolName || edu.school || edu.name || '',
                location: edu.location || '',
                startDate: this.formatDate(edu.startDate || edu.startYear),
                endDate: this.formatDate(edu.endDate || edu.endYear) || 'Present',
                gpa: edu.grade || edu.gpa || ''
            })).filter(edu => edu.institution);
        }

        // Experience
        if (linkedInData.positions || linkedInData.experience || linkedInData.jobs) {
            const expList = linkedInData.positions || linkedInData.experience || linkedInData.jobs || [];
            resume.experience = expList.map(exp => ({
                title: exp.title || exp.position || exp.jobTitle || '',
                company: exp.companyName || exp.company || exp.employer || '',
                location: exp.location || exp.locationName || '',
                startDate: this.formatDate(exp.startDate || exp.startYear),
                endDate: this.formatDate(exp.endDate || exp.endYear) || 'Present',
                achievements: this.parseDescription(exp.description || exp.summary || '')
            })).filter(exp => exp.title || exp.company);
        }

        // Skills
        if (linkedInData.skills) {
            const skillsList = linkedInData.skills || [];
            resume.skills.technical = skillsList
                .map(s => typeof s === 'string' ? s : (s.name || s.skill))
                .filter(s => s)
                .slice(0, 15);
        }

        // Projects (from volunteer or projects)
        if (linkedInData.projects || linkedInData.volunteer) {
            const projList = linkedInData.projects || linkedInData.volunteer || [];
            resume.projects = projList.map(proj => ({
                name: proj.title || proj.name || proj.organization || '',
                description: proj.description || proj.cause || '',
                technologies: [],
                link: proj.url || '',
                highlights: proj.responsibilities ? [proj.responsibilities] : []
            })).filter(proj => proj.name);
        }

        return resume;
    }

    // Format location from various formats
    formatLocation(profile) {
        if (profile.location) return profile.location;
        const parts = [profile.city, profile.state, profile.country].filter(Boolean);
        return parts.join(', ');
    }

    // Format date from various formats
    formatDate(date) {
        if (!date) return '';
        if (typeof date === 'string') return date;
        if (typeof date === 'number') return date.toString();
        if (date.year) {
            return date.month ? `${date.month}/${date.year}` : date.year.toString();
        }
        return '';
    }

    // Parse description into bullet points
    parseDescription(description) {
        if (!description) return [];

        // Split by common bullet patterns
        let bullets = description
            .split(/[\n•\-\*]/)
            .map(s => s.trim())
            .filter(s => s.length > 10);

        // If no bullets found, create from sentences
        if (bullets.length === 0 && description.length > 50) {
            bullets = description
                .split(/[.!?]+/)
                .map(s => s.trim())
                .filter(s => s.length > 20)
                .slice(0, 5);
        }

        return bullets;
    }

    // Render import UI
    renderImportUI() {
        return `
            <div class="linkedin-import-container">
                <div class="import-header">
                    <h3>📥 Import from LinkedIn</h3>
                    <p class="import-instructions">
                        1. Go to LinkedIn → Settings → Data Privacy → Get a copy of your data<br>
                        2. Download your data (Basic account data)<br>
                        3. Open the ZIP file and find Profile.csv or positions.csv<br>
                        4. Paste the data below or upload the file
                    </p>
                </div>
                
                <div class="import-methods">
                    <div class="method-tab active" data-method="paste">Paste JSON</div>
                    <div class="method-tab" data-method="file">Upload File</div>
                </div>
                
                <div class="import-content">
                    <div id="paste-method" class="method-content active">
                        <textarea id="linkedin-json-input" class="form-textarea" rows="8" 
                            placeholder='Paste your LinkedIn JSON data here...\n\nExample format:\n{\n  "firstName": "Your",\n  "lastName": "Name",\n  ....\n}'></textarea>
                    </div>
                    
                    <div id="file-method" class="method-content">
                        <input type="file" id="linkedin-file-input" accept=".json,.csv" class="file-input">
                        <label for="linkedin-file-input" class="file-label">
                            📁 Choose file or drag & drop
                        </label>
                    </div>
                </div>
                
                <button id="import-linkedin-btn" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                    🔄 Import Data
                </button>
                
                <div id="import-preview" class="import-preview" style="display: none;">
                    <h4>Preview</h4>
                    <div id="preview-content"></div>
                    <button id="confirm-import-btn" class="btn btn-success">✅ Apply to Resume</button>
                </div>
            </div>
        `;
    }

    // Apply imported data to form
    applyToForm(resumeData) {
        // Personal Info
        if (resumeData.personalInfo) {
            const pi = resumeData.personalInfo;
            if (pi.fullName) document.getElementById('full-name').value = pi.fullName;
            if (pi.email) document.getElementById('email').value = pi.email;
            if (pi.phone) document.getElementById('phone').value = pi.phone;
            if (pi.location) document.getElementById('location').value = pi.location;
            if (pi.linkedin) document.getElementById('linkedin').value = pi.linkedin;
        }

        // Skills
        if (resumeData.skills?.technical?.length > 0) {
            const techField = document.getElementById('technical-skills');
            if (techField) techField.value = resumeData.skills.technical.join(', ');
        }

        // Trigger form update
        if (typeof app !== 'undefined') {
            app.scheduleAutoSave();
            app.showNotification('LinkedIn data imported successfully!', 'success');
        }

        return true;
    }
}

// Create global instance
const linkedInImport = new LinkedInImport();
