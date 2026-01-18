// LocalStorage wrapper for data persistence
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'resume_builder_data';
        this.SETTINGS_KEY = 'resume_builder_settings';
    }

    // Save resume data to localStorage
    saveData(data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(this.STORAGE_KEY, jsonData);
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    }

    // Load resume data from localStorage
    loadData() {
        try {
            const jsonData = localStorage.getItem(this.STORAGE_KEY);
            if (jsonData) {
                return JSON.parse(jsonData);
            }
            return null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    // Save app settings (theme, template choice, etc.)
    saveSettings(settings) {
        try {
            const jsonSettings = JSON.stringify(settings);
            localStorage.setItem(this.SETTINGS_KEY, jsonSettings);
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Load app settings
    loadSettings() {
        try {
            const jsonSettings = localStorage.getItem(this.SETTINGS_KEY);
            if (jsonSettings) {
                return JSON.parse(jsonSettings);
            }
            return {
                theme: 'light',
                template: CONFIG.APP.DEFAULT_TEMPLATE
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                theme: 'light',
                template: CONFIG.APP.DEFAULT_TEMPLATE
            };
        }
    }

    // Clear all saved data
    clearData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Data cleared successfully');
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Export data as JSON file
    exportData() {
        const data = this.loadData();
        if (!data) {
            alert('No data to export');
            return;
        }

        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `resume_data_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Import data from JSON file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validate schema before import (security check)
                    if (typeof Utils !== 'undefined' && !Utils.validateResumeSchema(data)) {
                        reject(new Error('Invalid resume format. Import rejected for security.'));
                        return;
                    }

                    this.saveData(data);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    // Check if data exists
    hasData() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }

    // Get storage size (approximate)
    getStorageSize() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? new Blob([data]).size : 0;
    }
}

// Create global instance
const storage = new StorageManager();
