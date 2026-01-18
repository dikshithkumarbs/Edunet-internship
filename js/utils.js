// Utility functions shared across the Resume Builder
// Avoid code duplication by centralizing common operations

const Utils = {
    // ============================================
    // DATE PARSING & FORMATTING
    // ============================================

    /**
     * Parse a date string into a Date object
     * Handles formats: "Jan 2023", "January 2023", "2023", "Present"
     * @param {string} dateStr - Date string to parse
     * @returns {Date|null} - Parsed date or null
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        const str = dateStr.toString().toLowerCase().trim();

        // Handle "present" or "current"
        if (str === 'present' || str === 'current' || str === 'now') {
            return new Date();
        }

        // Try direct parsing first
        const direct = new Date(dateStr);
        if (!isNaN(direct.getTime())) {
            return direct;
        }

        // Handle "Month Year" format
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
            'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        for (let i = 0; i < monthNames.length; i++) {
            if (str.includes(monthNames[i])) {
                const yearMatch = str.match(/\d{4}/);
                if (yearMatch) {
                    return new Date(parseInt(yearMatch[0]), i, 1);
                }
            }
        }

        // Handle year-only format
        const yearOnly = str.match(/^\d{4}$/);
        if (yearOnly) {
            return new Date(parseInt(yearOnly[0]), 0, 1);
        }

        return null;
    },

    /**
     * Format a date for display
     * @param {Date|string} date - Date to format
     * @param {string} format - Format style: 'short', 'long', 'year'
     * @returns {string} - Formatted date string
     */
    formatDate(date, format = 'short') {
        if (!date) return '';

        const d = typeof date === 'string' ? this.parseDate(date) : date;
        if (!d) return date.toString();

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        switch (format) {
            case 'short':
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
            case 'long':
                return `${monthsFull[d.getMonth()]} ${d.getFullYear()}`;
            case 'year':
                return d.getFullYear().toString();
            default:
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
        }
    },

    // ============================================
    // EXPERIENCE CALCULATION
    // ============================================

    /**
     * Calculate years of experience from experience array
     * @param {Array} experience - Array of experience objects
     * @returns {number} - Total years of experience
     */
    calculateYearsExperience(experience) {
        if (!experience || experience.length === 0) return 0;

        let totalMonths = 0;

        experience.forEach(exp => {
            const startDate = this.parseDate(exp.startDate);
            const endDate = this.parseDate(exp.endDate) || new Date();

            if (startDate && endDate) {
                const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
                totalMonths += Math.max(0, months);
            }
        });

        return Math.round(totalMonths / 12);
    },

    // ============================================
    // RESUME TEXT EXTRACTION
    // ============================================

    /**
     * Convert resume data to plain text for analysis
     * @param {Object} resumeData - Resume data object
     * @returns {string} - Plain text representation
     */
    resumeToText(resumeData) {
        if (!resumeData) return '';

        const parts = [];

        // Personal info
        if (resumeData.personalInfo) {
            const p = resumeData.personalInfo;
            if (p.fullName) parts.push(p.fullName);
            if (p.email) parts.push(p.email);
            if (p.location) parts.push(p.location);
        }

        // Summary
        if (resumeData.summary) {
            parts.push(resumeData.summary);
        }

        // Education
        if (resumeData.education && resumeData.education.length > 0) {
            resumeData.education.forEach(edu => {
                if (edu.degree) parts.push(edu.degree);
                if (edu.institution) parts.push(edu.institution);
                if (edu.location) parts.push(edu.location);
            });
        }

        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
            resumeData.experience.forEach(exp => {
                if (exp.title) parts.push(exp.title);
                if (exp.company) parts.push(exp.company);
                if (exp.description) parts.push(exp.description);
                if (exp.achievements) {
                    exp.achievements.forEach(ach => {
                        if (typeof ach === 'string') parts.push(ach);
                    });
                }
            });
        }

        // Skills
        if (resumeData.skills) {
            if (resumeData.skills.technical) {
                parts.push(resumeData.skills.technical.join(' '));
            }
            if (resumeData.skills.soft) {
                parts.push(resumeData.skills.soft.join(' '));
            }
        }

        // Projects
        if (resumeData.projects && resumeData.projects.length > 0) {
            resumeData.projects.forEach(proj => {
                if (proj.name) parts.push(proj.name);
                if (proj.description) parts.push(proj.description);
                if (proj.technologies) {
                    parts.push(proj.technologies.join(' '));
                }
            });
        }

        return parts.join(' ').toLowerCase();
    },

    // ============================================
    // VALIDATION
    // ============================================

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Validate phone number format
     * @param {string} phone - Phone to validate
     * @returns {boolean} - True if valid
     */
    isValidPhone(phone) {
        // Allow various formats: +1 (555) 123-4567, 555-123-4567, etc.
        const regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
        return regex.test(phone.replace(/\s/g, ''));
    },

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} - True if valid
     */
    isValidUrl(url) {
        // Allow with or without protocol
        const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return regex.test(url);
    },

    // ============================================
    // STRING UTILITIES
    // ============================================

    /**
     * Capitalize first letter of each word
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     */
    titleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, txt =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    /**
     * Truncate string with ellipsis
     * @param {string} str - String to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} - Truncated string
     */
    truncate(str, maxLength = 100) {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    },

    /**
     * Generate a unique ID
     * @returns {string} - Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // ============================================
    // DEBOUNCE & THROTTLE
    // ============================================

    /**
     * Debounce a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} - Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} - Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // ============================================
    // SECURITY
    // ============================================

    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} - Escaped string safe for innerHTML
     */
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Sanitize HTML content by removing dangerous elements
     * Allows basic formatting but strips scripts, events, etc.
     * @param {string} html - HTML to sanitize
     * @returns {string} - Sanitized HTML
     */
    sanitizeHTML(html) {
        if (!html) return '';

        // For plain text content, just escape HTML
        const div = document.createElement('div');
        div.innerHTML = html;

        // Remove dangerous elements
        const dangerous = ['script', 'iframe', 'object', 'embed', 'form', 'input'];
        dangerous.forEach(tag => {
            const elements = div.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });

        // Remove event handlers from all elements
        const allElements = div.querySelectorAll('*');
        allElements.forEach(el => {
            // Remove all event attributes
            [...el.attributes].forEach(attr => {
                if (attr.name.startsWith('on') || attr.name === 'href' && attr.value.startsWith('javascript:')) {
                    el.removeAttribute(attr.name);
                }
            });
        });

        return div.innerHTML;
    },

    /**
     * Validate resume data schema
     * @param {Object} data - Resume data to validate
     * @returns {boolean} - True if valid schema
     */
    validateResumeSchema(data) {
        if (!data || typeof data !== 'object') return false;

        // Required top-level keys
        const requiredKeys = ['personalInfo'];
        const validKeys = ['personalInfo', 'summary', 'education', 'experience', 'skills', 'projects'];

        // Check for required keys
        for (const key of requiredKeys) {
            if (!(key in data)) return false;
        }

        // Check for unknown keys (potential injection)
        for (const key of Object.keys(data)) {
            if (!validKeys.includes(key)) return false;
        }

        // Validate personalInfo is an object
        if (typeof data.personalInfo !== 'object') return false;

        // Validate arrays
        if (data.education && !Array.isArray(data.education)) return false;
        if (data.experience && !Array.isArray(data.experience)) return false;
        if (data.projects && !Array.isArray(data.projects)) return false;

        return true;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
