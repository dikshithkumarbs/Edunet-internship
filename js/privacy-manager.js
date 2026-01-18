// Privacy Manager Module
// Handles GDPR compliance, data protection, and user privacy controls

const PrivacyManager = {
    // Storage keys
    CONSENT_KEY: 'resume_builder_privacy_consent',
    AUDIT_KEY: 'resume_builder_audit_log',

    // Initialize privacy manager
    init() {
        this.checkConsent();
        this.logAction('app_initialized', { timestamp: new Date().toISOString() });
    },

    // Check if user has given consent
    checkConsent() {
        const consent = localStorage.getItem(this.CONSENT_KEY);
        if (!consent) {
            // First-time user - show privacy notice
            this.showPrivacyNotice();
        }
        return consent === 'granted';
    },

    // Grant consent
    grantConsent() {
        localStorage.setItem(this.CONSENT_KEY, 'granted');
        this.logAction('consent_granted');
        this.hidePrivacyNotice();
    },

    // Show privacy notice modal
    showPrivacyNotice() {
        const noticeHtml = `
            <div class="privacy-notice-overlay" id="privacy-notice">
                <div class="privacy-notice-modal">
                    <div class="privacy-notice-header">
                        <h3>🔒 Privacy & Data Protection</h3>
                    </div>
                    <div class="privacy-notice-body">
                        <p><strong>Your data stays with you.</strong></p>
                        <ul>
                            <li>✅ All data is stored locally on your device</li>
                            <li>✅ No data is sent to our servers</li>
                            <li>✅ AI features use secure API calls (data not stored)</li>
                            <li>✅ You can delete all data at any time</li>
                            <li>✅ GDPR compliant - you control your data</li>
                        </ul>
                        <p class="privacy-note">
                            By continuing, you agree to temporary processing of your resume data 
                            for AI-powered features. Your data is never used to train AI models.
                        </p>
                    </div>
                    <div class="privacy-notice-footer">
                        <button class="btn btn-primary" onclick="PrivacyManager.grantConsent()">
                            I Understand - Continue
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', noticeHtml);
    },

    // Hide privacy notice
    hidePrivacyNotice() {
        const notice = document.getElementById('privacy-notice');
        if (notice) notice.remove();
    },

    // ==========================================
    // GDPR Article 17: Right to Erasure
    // ==========================================

    // Delete all user data
    deleteAllData() {
        const confirmed = confirm(
            '⚠️ DELETE ALL DATA\n\n' +
            'This will permanently delete:\n' +
            '• All resume data\n' +
            '• All saved settings\n' +
            '• Activity logs\n\n' +
            'This action cannot be undone. Continue?'
        );

        if (confirmed) {
            // Get all resume builder keys
            const keysToDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('resume_builder')) {
                    keysToDelete.push(key);
                }
            }

            // Delete all keys
            keysToDelete.forEach(key => localStorage.removeItem(key));

            // Clear any session storage
            sessionStorage.clear();

            // Show confirmation
            alert('✅ All your data has been permanently deleted.');

            // Reload the page
            window.location.reload();
        }
    },

    // ==========================================
    // GDPR Article 20: Right to Data Portability
    // ==========================================

    // Export all user data as JSON
    exportAllData() {
        const allData = {
            exportDate: new Date().toISOString(),
            exportVersion: '1.0',
            resumeData: null,
            settings: null,
            auditLog: null
        };

        // Collect all resume builder data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('resume_builder')) {
                try {
                    const value = localStorage.getItem(key);
                    if (key.includes('data')) {
                        allData.resumeData = JSON.parse(value);
                    } else if (key.includes('settings')) {
                        allData.settings = JSON.parse(value);
                    } else if (key.includes('audit')) {
                        allData.auditLog = JSON.parse(value);
                    }
                } catch (e) {
                    console.warn('Could not parse:', key);
                }
            }
        }

        // Download as JSON file
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logAction('data_exported');
        alert('✅ Your data has been exported successfully.');
    },

    // ==========================================
    // Audit Logging (Privacy-Safe)
    // ==========================================

    // Log an action (no sensitive content)
    logAction(action, metadata = {}) {
        try {
            const logs = this.getAuditLogs();

            const logEntry = {
                timestamp: new Date().toISOString(),
                action: action,
                metadata: this.sanitizeMetadata(metadata)
            };

            logs.push(logEntry);

            // Keep only last 100 entries
            const trimmedLogs = logs.slice(-100);

            localStorage.setItem(this.AUDIT_KEY, JSON.stringify(trimmedLogs));
        } catch (e) {
            console.warn('Audit logging failed:', e);
        }
    },

    // Get audit logs
    getAuditLogs() {
        try {
            const logs = localStorage.getItem(this.AUDIT_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            return [];
        }
    },

    // Sanitize metadata - remove any potential PII
    sanitizeMetadata(metadata) {
        const sanitized = {};
        const sensitiveKeys = ['email', 'phone', 'address', 'name', 'ssn', 'password'];

        for (const [key, value] of Object.entries(metadata)) {
            if (!sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
                sanitized[key] = typeof value === 'string' && value.length > 50
                    ? '[TRUNCATED]'
                    : value;
            }
        }

        return sanitized;
    },

    // ==========================================
    // PII Detection & Masking
    // ==========================================

    // Detect PII in text
    detectPII(text) {
        if (!text || typeof text !== 'string') return { hasPII: false, types: [] };

        const patterns = {
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phone: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            ssn: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
            creditCard: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
            address: /\d{1,5}\s[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct)\b/gi
        };

        const detected = [];

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                detected.push(type);
            }
        }

        return {
            hasPII: detected.length > 0,
            types: detected
        };
    },

    // Mask PII for AI processing
    maskPII(text) {
        if (!text) return text;

        let masked = text;

        // Mask emails
        masked = masked.replace(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            '[EMAIL]'
        );

        // Mask phone numbers
        masked = masked.replace(
            /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            '[PHONE]'
        );

        // Mask SSN
        masked = masked.replace(
            /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
            '[SSN]'
        );

        return masked;
    },

    // ==========================================
    // Privacy Settings Panel
    // ==========================================

    // Show privacy settings modal
    showPrivacySettings() {
        const consent = localStorage.getItem(this.CONSENT_KEY);
        const logs = this.getAuditLogs();

        const settingsHtml = `
            <div class="privacy-modal-overlay" id="privacy-settings">
                <div class="privacy-modal">
                    <div class="privacy-modal-header">
                        <h3>⚙️ Privacy Settings</h3>
                        <button class="privacy-modal-close" onclick="PrivacyManager.hidePrivacySettings()">×</button>
                    </div>
                    <div class="privacy-modal-body">
                        <div class="privacy-section">
                            <h4>📊 Your Data</h4>
                            <p>All your resume data is stored locally on this device only.</p>
                            <div class="privacy-actions">
                                <button class="btn btn-secondary" onclick="PrivacyManager.exportAllData()">
                                    📥 Export My Data
                                </button>
                                <button class="btn btn-danger" onclick="PrivacyManager.deleteAllData()">
                                    🗑️ Delete All My Data
                                </button>
                            </div>
                        </div>
                        
                        <div class="privacy-section">
                            <h4>🤖 AI Processing</h4>
                            <p>When you use AI features:</p>
                            <ul>
                                <li>Your text is sent securely to AI providers (Gemini/Hugging Face)</li>
                                <li>PII is automatically masked before processing</li>
                                <li>Data is NOT used to train AI models</li>
                                <li>No data is stored on external servers</li>
                            </ul>
                        </div>
                        
                        <div class="privacy-section">
                            <h4>📋 Activity Log</h4>
                            <p>${logs.length} actions logged (last 100 kept)</p>
                            <button class="btn btn-secondary btn-sm" onclick="PrivacyManager.clearAuditLogs()">
                                Clear Logs
                            </button>
                        </div>
                    </div>
                    <div class="privacy-modal-footer">
                        <button class="btn btn-primary" onclick="PrivacyManager.hidePrivacySettings()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', settingsHtml);
    },

    // Hide privacy settings
    hidePrivacySettings() {
        const modal = document.getElementById('privacy-settings');
        if (modal) modal.remove();
    },

    // Clear audit logs
    clearAuditLogs() {
        localStorage.removeItem(this.AUDIT_KEY);
        alert('✅ Activity logs cleared.');
        this.hidePrivacySettings();
        this.showPrivacySettings();
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    PrivacyManager.init();
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrivacyManager;
}
