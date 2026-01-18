// Resume Styles Configuration
// Based on AI Resume Builder Template Documentation - January 2026
// 4 Templates: Professional, Creative, Academic, Minimal

const ResumeStyles = {
    // Available style presets - aligned with documentation
    styles: {
        modern: {
            id: 'modern',
            name: 'Professional',
            description: 'Clean, corporate design with center-aligned header',
            font: 'Inter',
            primaryColor: '#6366f1',
            secondaryColor: '#8b5cf6',
            accentColor: '#ec4899',
            bulletStyle: '•',
            headerAlign: 'center'
        },
        creative: {
            id: 'creative',
            name: 'Creative',
            description: 'Bold gradient header with modern design',
            font: 'Inter',
            primaryColor: '#8b5cf6',
            secondaryColor: '#ec4899',
            accentColor: '#ec4899',
            bulletStyle: '▸',
            headerAlign: 'left'
        },
        academic: {
            id: 'academic',
            name: 'Academic',
            description: 'Traditional serif typography for scholarly design',
            font: 'Times New Roman',
            primaryColor: '#333333',
            secondaryColor: '#555555',
            accentColor: '#333333',
            bulletStyle: '–',
            headerAlign: 'center'
        },
        minimal: {
            id: 'minimal',
            name: 'Minimal',
            description: 'Ultra-clean, condensed design with no borders',
            font: 'Inter',
            primaryColor: '#666666',
            secondaryColor: '#888888',
            accentColor: '#666666',
            bulletStyle: '·',
            headerAlign: 'left'
        }
    },

    // Color schemes for theme switching
    colorSchemes: {
        indigo: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' },
        ocean: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#14b8a6' },
        forest: { primary: '#10b981', secondary: '#059669', accent: '#22c55e' },
        sunset: { primary: '#f97316', secondary: '#ef4444', accent: '#f59e0b' },
        midnight: { primary: '#8b5cf6', secondary: '#a855f7', accent: '#ec4899' },
        rose: { primary: '#f43f5e', secondary: '#e11d48', accent: '#f472b6' }
    },

    // Font options
    fonts: {
        'Inter': { name: 'Inter', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
        'Times New Roman': { name: 'Times New Roman', category: 'serif', url: null },
        'Georgia': { name: 'Georgia', category: 'serif', url: null }
    },

    // Get style configuration
    getStyle(styleId) {
        return this.styles[styleId] || this.styles.modern;
    },

    // Apply style to preview container
    applyStyle(styleId, container) {
        const styleConfig = this.getStyle(styleId);

        // Remove existing template classes
        container.classList.remove('template-professional', 'template-creative', 'template-academic', 'template-minimal');

        // Map style IDs to template classes
        // New templates map to the most appropriate visual style
        const templateMap = {
            // Original templates
            'modern': 'template-professional',
            'creative': 'template-creative',
            'academic': 'template-academic',
            'minimal': 'template-minimal',
            // New templates - mapped to visual styles
            'ats': 'template-minimal',           // ATS = minimal, clean
            'onePage': 'template-minimal',       // One-page = condensed
            'roleSpecific': 'template-professional',
            'entryLevel': 'template-professional',
            'executive': 'template-professional',
            'careerChange': 'template-professional',
            'skillsBased': 'template-academic',  // Skills = structured like academic
            'achievementFocused': 'template-professional',
            'minimalist': 'template-minimal'
        };

        // Add new template class
        const templateClass = templateMap[styleId] || 'template-professional';
        container.classList.add(templateClass);

        // Load font if needed
        if (this.fonts[styleConfig.font]?.url) {
            this.loadFont(this.fonts[styleConfig.font]);
        }

        return styleConfig;
    },

    // Load external font
    loadFont(fontConfig) {
        if (!fontConfig.url) return;

        const existingLink = document.querySelector(`link[href="${fontConfig.url}"]`);
        if (existingLink) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontConfig.url;
        document.head.appendChild(link);
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeStyles;
}
