// Error Boundary - Graceful error handling for the application
class ErrorBoundary {
    constructor() {
        this.errors = [];
        this.maxErrors = 10;
        this.init();
    }

    init() {
        // Global error handler
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError({
                type: 'runtime',
                message: message,
                source: source,
                line: lineno,
                column: colno,
                stack: error?.stack
            });
            return true; // Prevent default error handling
        };

        // Promise rejection handler
        window.onunhandledrejection = (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack
            });
        };

        // Resource load error handler
        document.addEventListener('error', (event) => {
            if (event.target?.tagName === 'SCRIPT' || event.target?.tagName === 'LINK') {
                this.handleError({
                    type: 'resource',
                    message: `Failed to load ${event.target.tagName.toLowerCase()}: ${event.target.src || event.target.href}`,
                    source: event.target.src || event.target.href
                });
            }
        }, true);
    }

    // Handle error
    handleError(errorInfo) {
        // Add timestamp
        errorInfo.timestamp = new Date().toISOString();

        // Store error
        this.errors.push(errorInfo);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Log to console
        console.error('Application Error:', errorInfo);

        // Show user-friendly notification
        this.showErrorNotification(errorInfo);

        // Try to recover
        this.attemptRecovery(errorInfo);
    }

    // Show user-friendly error notification
    showErrorNotification(errorInfo) {
        // Create or update error notification
        let notification = document.getElementById('error-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'error-notification';
            notification.className = 'error-notification';
            notification.innerHTML = `
                <div class="error-content">
                    <span class="error-icon">⚠️</span>
                    <span class="error-message"></span>
                    <button class="error-dismiss" onclick="this.parentElement.parentElement.classList.remove('show')">×</button>
                </div>
                <button class="error-details-btn" onclick="errorBoundary.showErrorDetails()">Show Details</button>
            `;
            document.body.appendChild(notification);
        }

        // Update message
        const messageEl = notification.querySelector('.error-message');
        messageEl.textContent = this.getUserFriendlyMessage(errorInfo);

        // Show notification
        notification.classList.add('show');

        // Auto-hide after 10 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 10000);
    }

    // Get user-friendly error message
    getUserFriendlyMessage(errorInfo) {
        const messages = {
            'runtime': 'Something went wrong. Your data is safe, but some features may not work properly.',
            'promise': 'A background task failed. Please try again.',
            'resource': 'Some resources failed to load. The page may not work correctly.',
            'network': 'Network error. Please check your internet connection.'
        };

        return messages[errorInfo.type] || 'An unexpected error occurred.';
    }

    // Attempt to recover from error
    attemptRecovery(errorInfo) {
        // Try to save current data
        try {
            if (typeof app !== 'undefined' && app.data) {
                const backup = JSON.stringify({
                    data: app.data,
                    timestamp: new Date().toISOString(),
                    error: errorInfo.message
                });
                localStorage.setItem('resume_backup', backup);
            }
        } catch (e) {
            console.error('Backup failed:', e);
        }

        // Resource load error - try reloading
        if (errorInfo.type === 'resource' && errorInfo.source) {
            this.retryResourceLoad(errorInfo.source);
        }
    }

    // Retry loading a failed resource (only for local scripts)
    retryResourceLoad(source) {
        // Skip external CDN scripts - they have their own fallback logic
        if (source.includes('cdn.') || source.includes('unpkg.com') || source.includes('cdnjs.')) {
            console.log('Skipping retry for external CDN:', source);
            return;
        }

        if (source.endsWith('.js')) {
            const script = document.createElement('script');
            script.src = source + '?retry=' + Date.now();
            document.head.appendChild(script);
        } else if (source.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = source + '?retry=' + Date.now();
            document.head.appendChild(link);
        }
    }

    // Show detailed error information
    showErrorDetails() {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="error-modal-content">
                <h3>Error Details</h3>
                <p>These details may help troubleshoot the issue:</p>
                <div class="error-list">
                    ${this.errors.map(e => `
                        <div class="error-item">
                            <strong>${e.type}</strong>
                            <p>${e.message}</p>
                            <small>${e.timestamp}</small>
                        </div>
                    `).join('')}
                </div>
                <div class="error-actions">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                    <button class="btn btn-primary" onclick="errorBoundary.downloadErrorLog()">Download Log</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Download error log
    downloadErrorLog() {
        const log = {
            errors: this.errors,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Clear errors
    clearErrors() {
        this.errors = [];
    }

    // Get error count
    getErrorCount() {
        return this.errors.length;
    }
}

// Create global instance
const errorBoundary = new ErrorBoundary();

// Add CSS for error notification
const errorStyles = document.createElement('style');
errorStyles.textContent = `
.error-notification {
    position: fixed;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
    z-index: 10000;
    transition: bottom 0.3s ease;
    max-width: 90vw;
}

.error-notification.show {
    bottom: 20px;
}

.error-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.error-icon {
    font-size: 1.25rem;
}

.error-message {
    flex: 1;
    font-size: 0.9rem;
}

.error-dismiss {
    background: none;
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.8;
}

.error-dismiss:hover {
    opacity: 1;
}

.error-details-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    cursor: pointer;
    font-size: 0.75rem;
}

.error-modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
}

.error-modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.error-list {
    max-height: 300px;
    overflow-y: auto;
    margin: 1rem 0;
}

.error-item {
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.error-item p {
    margin: 0.25rem 0;
    color: #666;
    font-size: 0.85rem;
}

.error-item small {
    color: #999;
    font-size: 0.75rem;
}

.error-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

body.dark-mode .error-modal-content {
    background: #1e293b;
    color: white;
}

body.dark-mode .error-item {
    background: #334155;
}
`;
document.head.appendChild(errorStyles);
