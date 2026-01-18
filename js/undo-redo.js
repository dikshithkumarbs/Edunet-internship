// Undo/Redo Manager for Resume Builder
// Provides history management with keyboard shortcuts

class UndoRedoManager {
    constructor(maxHistory = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = maxHistory;
        this.isRestoring = false;
        this.lastSavedState = null;

        this.init();
    }

    init() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    this.redo();
                }
            }
        });

        // Update button states
        this.updateButtons();
    }

    // Save current state to history
    saveState(description = 'Edit') {
        if (this.isRestoring) return;

        const state = this.captureState();
        const stateString = JSON.stringify(state);

        // Don't save if state hasn't changed
        if (this.lastSavedState === stateString) return;

        // Remove any future states if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push({
            state: state,
            description: description,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        this.lastSavedState = stateString;
        this.updateButtons();
    }

    // Capture current form state
    captureState() {
        const state = {
            personalInfo: {
                fullName: document.getElementById('full-name')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                location: document.getElementById('location')?.value || '',
                linkedin: document.getElementById('linkedin')?.value || '',
                github: document.getElementById('github')?.value || '',
                portfolio: document.getElementById('portfolio')?.value || ''
            },
            education: [],
            experience: [],
            projects: [],
            skills: {
                technical: document.getElementById('technical-skills')?.value || '',
                soft: document.getElementById('soft-skills')?.value || ''
            },
            summary: document.getElementById('summary-text')?.value || ''
        };

        // Capture education entries
        document.querySelectorAll('.education-entry').forEach(entry => {
            state.education.push({
                degree: entry.querySelector('.edu-degree')?.value || '',
                institution: entry.querySelector('.edu-institution')?.value || '',
                location: entry.querySelector('.edu-location')?.value || '',
                startYear: entry.querySelector('.edu-start')?.value || '',
                endYear: entry.querySelector('.edu-end')?.value || '',
                gpa: entry.querySelector('.edu-gpa')?.value || ''
            });
        });

        // Capture experience entries
        document.querySelectorAll('.experience-entry').forEach(entry => {
            state.experience.push({
                title: entry.querySelector('.exp-title')?.value || '',
                company: entry.querySelector('.exp-company')?.value || '',
                location: entry.querySelector('.exp-location')?.value || '',
                startDate: entry.querySelector('.exp-start')?.value || '',
                endDate: entry.querySelector('.exp-end')?.value || '',
                achievements: entry.querySelector('.achievement-input')?.value || ''
            });
        });

        // Capture project entries
        document.querySelectorAll('.project-entry').forEach(entry => {
            state.projects.push({
                name: entry.querySelector('.proj-name')?.value || '',
                description: entry.querySelector('.proj-description')?.value || '',
                technologies: entry.querySelector('.proj-technologies')?.value || '',
                link: entry.querySelector('.proj-link')?.value || '',
                highlights: entry.querySelector('.highlight-input')?.value || ''
            });
        });

        return state;
    }

    // Restore a state
    restoreState(state) {
        this.isRestoring = true;

        try {
            // Restore personal info
            if (state.personalInfo) {
                document.getElementById('full-name').value = state.personalInfo.fullName || '';
                document.getElementById('email').value = state.personalInfo.email || '';
                document.getElementById('phone').value = state.personalInfo.phone || '';
                document.getElementById('location').value = state.personalInfo.location || '';
                document.getElementById('linkedin').value = state.personalInfo.linkedin || '';
                document.getElementById('github').value = state.personalInfo.github || '';
                document.getElementById('portfolio').value = state.personalInfo.portfolio || '';
            }

            // Restore skills
            if (state.skills) {
                document.getElementById('technical-skills').value = state.skills.technical || '';
                document.getElementById('soft-skills').value = state.skills.soft || '';
            }

            // Restore summary
            if (state.summary !== undefined) {
                document.getElementById('summary-text').value = state.summary;
            }

            // Restore education entries
            this.restoreEntries('education-container', 'education-entry', state.education, (entry, data) => {
                entry.querySelector('.edu-degree').value = data.degree || '';
                entry.querySelector('.edu-institution').value = data.institution || '';
                entry.querySelector('.edu-location').value = data.location || '';
                entry.querySelector('.edu-start').value = data.startYear || '';
                entry.querySelector('.edu-end').value = data.endYear || '';
                entry.querySelector('.edu-gpa').value = data.gpa || '';
            });

            // Restore experience entries
            this.restoreEntries('experience-container', 'experience-entry', state.experience, (entry, data) => {
                entry.querySelector('.exp-title').value = data.title || '';
                entry.querySelector('.exp-company').value = data.company || '';
                entry.querySelector('.exp-location').value = data.location || '';
                entry.querySelector('.exp-start').value = data.startDate || '';
                entry.querySelector('.exp-end').value = data.endDate || '';
                entry.querySelector('.achievement-input').value = data.achievements || '';
            });

            // Restore project entries
            this.restoreEntries('projects-container', 'project-entry', state.projects, (entry, data) => {
                entry.querySelector('.proj-name').value = data.name || '';
                entry.querySelector('.proj-description').value = data.description || '';
                entry.querySelector('.proj-technologies').value = data.technologies || '';
                entry.querySelector('.proj-link').value = data.link || '';
                entry.querySelector('.highlight-input').value = data.highlights || '';
            });

            // Trigger preview update
            if (typeof app !== 'undefined' && app.updatePreview) {
                app.updatePreview();
            }

            // Update character counters
            document.querySelectorAll('textarea').forEach(textarea => {
                textarea.dispatchEvent(new Event('input'));
            });

        } finally {
            this.isRestoring = false;
        }
    }

    // Helper to restore entry sections
    restoreEntries(containerId, entryClass, data, fillCallback) {
        const container = document.getElementById(containerId);
        if (!container || !data) return;

        const entries = container.querySelectorAll('.' + entryClass);
        const template = entries[0];

        // Remove extra entries
        while (entries.length > data.length && container.children.length > 1) {
            container.lastElementChild.remove();
        }

        // Add or update entries
        data.forEach((itemData, index) => {
            let entry = container.querySelectorAll('.' + entryClass)[index];

            if (!entry && template) {
                entry = template.cloneNode(true);
                entry.querySelectorAll('input, textarea').forEach(el => el.value = '');
                container.appendChild(entry);
            }

            if (entry) {
                fillCallback(entry, itemData);
            }
        });
    }

    // Undo action
    undo() {
        if (!this.canUndo()) return false;

        this.currentIndex--;
        this.restoreState(this.history[this.currentIndex].state);
        this.updateButtons();
        this.showNotification('Undo: ' + this.history[this.currentIndex + 1].description);
        return true;
    }

    // Redo action
    redo() {
        if (!this.canRedo()) return false;

        this.currentIndex++;
        this.restoreState(this.history[this.currentIndex].state);
        this.updateButtons();
        this.showNotification('Redo: ' + this.history[this.currentIndex].description);
        return true;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    // Update undo/redo button states
    updateButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
            undoBtn.title = this.canUndo()
                ? `Undo: ${this.history[this.currentIndex]?.description || 'Last action'} (Ctrl+Z)`
                : 'Nothing to undo';
        }

        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
            redoBtn.title = this.canRedo()
                ? `Redo: ${this.history[this.currentIndex + 1]?.description || 'Next action'} (Ctrl+Y)`
                : 'Nothing to redo';
        }
    }

    // Show notification
    showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('undo-redo-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'undo-redo-notification';
            notification.className = 'undo-redo-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Clear history
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.lastSavedState = null;
        this.updateButtons();
    }
}

// Character Counter for textareas
class CharacterCounter {
    constructor() {
        this.limits = {
            'summary-text': { max: 500, warn: 400 },
            'achievement-input': { max: 300, warn: 250 },
            'proj-description': { max: 250, warn: 200 },
            'highlight-input': { max: 200, warn: 150 }
        };

        this.init();
    }

    init() {
        // Add counters to existing textareas
        this.addCounters();

        // Observe for new textareas (when entries are added)
        const observer = new MutationObserver(() => {
            this.addCounters();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    addCounters() {
        document.querySelectorAll('textarea').forEach(textarea => {
            if (textarea.dataset.hasCounter) return;

            // Find matching limit config
            let config = null;
            for (const [className, cfg] of Object.entries(this.limits)) {
                if (textarea.id === className || textarea.classList.contains(className)) {
                    config = cfg;
                    break;
                }
            }

            if (!config) {
                // Default config for other textareas
                config = { max: 500, warn: 400 };
            }

            // Create counter element
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.innerHTML = `<span class="char-count">0</span>/<span class="char-max">${config.max}</span>`;

            // Insert after textarea
            textarea.parentNode.insertBefore(counter, textarea.nextSibling);
            textarea.dataset.hasCounter = 'true';
            textarea.dataset.maxChars = config.max;
            textarea.dataset.warnChars = config.warn;

            // Update counter on input
            const updateCounter = () => {
                const length = textarea.value.length;
                const countSpan = counter.querySelector('.char-count');
                countSpan.textContent = length;

                counter.classList.remove('warning', 'error');
                if (length > config.max) {
                    counter.classList.add('error');
                } else if (length > config.warn) {
                    counter.classList.add('warning');
                }
            };

            textarea.addEventListener('input', updateCounter);
            updateCounter(); // Initial update
        });
    }
}

// Input Validator with inline error messages
class InputValidator {
    constructor() {
        this.rules = {
            'full-name': {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s\-'.]+$/,
                message: 'Enter a valid name (letters only)'
            },
            'email': {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address'
            },
            'phone': {
                pattern: /^[\d\s\+\-\(\)]+$/,
                message: 'Enter a valid phone number'
            },
            'linkedin': {
                pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i,
                message: 'Enter a valid LinkedIn URL'
            },
            'github': {
                pattern: /^(https?:\/\/)?(www\.)?github\.com\/.*$/i,
                message: 'Enter a valid GitHub URL'
            }
        };

        this.init();
    }

    init() {
        // Add validation to inputs
        Object.keys(this.rules).forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                this.addValidation(input, this.rules[id]);
            }
        });

        // Add validation to dynamic class-based inputs
        this.addDynamicValidation();
    }

    addValidation(input, rules) {
        // Create error element if not exists
        let errorEl = input.parentNode.querySelector('.input-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'input-error';
            input.parentNode.appendChild(errorEl);
        }

        const validate = () => {
            const value = input.value.trim();
            let isValid = true;
            let message = '';

            // Required check
            if (rules.required && !value) {
                isValid = false;
                message = 'This field is required';
            }
            // Min length check
            else if (rules.minLength && value.length < rules.minLength && value.length > 0) {
                isValid = false;
                message = `Minimum ${rules.minLength} characters`;
            }
            // Pattern check
            else if (rules.pattern && value && !rules.pattern.test(value)) {
                isValid = false;
                message = rules.message;
            }

            // Update UI
            input.classList.toggle('input-invalid', !isValid);
            input.classList.toggle('input-valid', isValid && value);
            errorEl.textContent = message;
            errorEl.classList.toggle('show', !isValid);

            return isValid;
        };

        input.addEventListener('blur', validate);
        input.addEventListener('input', () => {
            if (input.classList.contains('input-invalid')) {
                validate();
            }
        });
    }

    addDynamicValidation() {
        // Observe for new inputs
        const observer = new MutationObserver(() => {
            // Validate degree fields
            document.querySelectorAll('.edu-degree').forEach(input => {
                if (!input.dataset.validated) {
                    this.addValidation(input, { required: true, minLength: 2, message: 'Enter degree name' });
                    input.dataset.validated = 'true';
                }
            });

            // Validate institution fields
            document.querySelectorAll('.edu-institution').forEach(input => {
                if (!input.dataset.validated) {
                    this.addValidation(input, { required: true, minLength: 2, message: 'Enter institution name' });
                    input.dataset.validated = 'true';
                }
            });

            // Validate job title fields
            document.querySelectorAll('.exp-title').forEach(input => {
                if (!input.dataset.validated) {
                    this.addValidation(input, { required: true, minLength: 2, message: 'Enter job title' });
                    input.dataset.validated = 'true';
                }
            });

            // Validate company fields
            document.querySelectorAll('.exp-company').forEach(input => {
                if (!input.dataset.validated) {
                    this.addValidation(input, { required: true, minLength: 2, message: 'Enter company name' });
                    input.dataset.validated = 'true';
                }
            });

            // Validate project name fields
            document.querySelectorAll('.proj-name').forEach(input => {
                if (!input.dataset.validated) {
                    this.addValidation(input, { required: true, minLength: 2, message: 'Enter project name' });
                    input.dataset.validated = 'true';
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Initial validation setup
        observer.takeRecords();
        document.querySelectorAll('.edu-degree, .edu-institution, .exp-title, .exp-company, .proj-name').forEach(input => {
            if (!input.dataset.validated) {
                const rules = { required: true, minLength: 2, message: 'This field is required' };
                this.addValidation(input, rules);
                input.dataset.validated = 'true';
            }
        });
    }

    // Validate all fields
    validateAll() {
        let isValid = true;

        document.querySelectorAll('input[required], .input-invalid').forEach(input => {
            input.dispatchEvent(new Event('blur'));
            if (input.classList.contains('input-invalid')) {
                isValid = false;
            }
        });

        return isValid;
    }
}

// Initialize on DOM ready
let undoRedoManager;
let characterCounter;
let inputValidator;

document.addEventListener('DOMContentLoaded', () => {
    undoRedoManager = new UndoRedoManager();
    characterCounter = new CharacterCounter();
    inputValidator = new InputValidator();

    // Save initial state
    setTimeout(() => {
        undoRedoManager.saveState('Initial state');
    }, 500);

    // Save state on input changes (debounced)
    let saveTimeout;
    document.addEventListener('input', (e) => {
        if (e.target.matches('input, textarea, select')) {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                undoRedoManager.saveState('Edit ' + (e.target.placeholder || e.target.name || 'field'));
            }, 1000);
        }
    });
});

// Export for use in other modules
window.undoRedoManager = undoRedoManager;
window.inputValidator = inputValidator;
