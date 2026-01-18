// Configuration file for AI Resume & Portfolio Builder

// ⚠️ SECURITY WARNING: Never expose API keys in client-side code for production!
// For production, implement a backend proxy to handle API calls securely.
// The keys below are for demo/development purposes only.

const CONFIG = {
    // AI Configuration
    // API calls are now proxied through the local Node.js server
    AI: {
        PROVIDER: 'gemini',
        API_BASE_URL: 'http://localhost:3000/api/generate-content',
        MODEL: 'gemini-1.5-flash',
        DEMO_MODE: false
    },

    // Hugging Face Configuration
    HUGGINGFACE: {
        API_BASE_URL: 'http://localhost:3000/api/huggingface',
        DEMO_MODE: false,
        MODELS: {
            textGeneration: 'google/flan-t5-base',
            summarization: 'facebook/bart-large-cnn',
            grammar: 'vennify/t5-base-grammar-correction',
            embedding: 'sentence-transformers/all-MiniLM-L6-v2'
        }
    },

    // Application Settings
    APP: {
        NAME: 'AI Resume Builder',
        VERSION: '2.0.0',
        AUTO_SAVE_DELAY: 1000, // milliseconds
        DEFAULT_TEMPLATE: 'modern',
        DEFAULT_STYLE: 'modern'
    },

    // Template Configuration
    TEMPLATES: {
        modern: {
            name: 'Modern',
            description: 'Clean and contemporary design',
            colors: {
                primary: '#6366f1',
                secondary: '#8b5cf6',
                accent: '#ec4899'
            }
        },
        classic: {
            name: 'Classic',
            description: 'Professional and timeless',
            colors: {
                primary: '#1e40af',
                secondary: '#075985',
                accent: '#0369a1'
            }
        },
        creative: {
            name: 'Creative',
            description: 'Bold and eye-catching',
            colors: {
                primary: '#f59e0b',
                secondary: '#ef4444',
                accent: '#8b5cf6'
            }
        }
    },

    // Default placeholder content (empty - user fills in their own data)
    PLACEHOLDERS: {
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            portfolio: ''
        },
        summary: '',
        education: [],
        experience: [],
        skills: {
            technical: [],
            soft: []
        },
        projects: []
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
