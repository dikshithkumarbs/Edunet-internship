// Smart Content Generator
// AI-powered content enhancement for resumes

const SmartContent = {
    // Action verbs by category
    actionVerbs: {
        technical: ['Developed', 'Engineered', 'Implemented', 'Architected', 'Optimized', 'Automated', 'Deployed', 'Integrated', 'Debugged', 'Refactored'],
        leadership: ['Led', 'Managed', 'Directed', 'Supervised', 'Coordinated', 'Mentored', 'Guided', 'Spearheaded', 'Orchestrated', 'Championed'],
        analytical: ['Analyzed', 'Evaluated', 'Assessed', 'Researched', 'Investigated', 'Identified', 'Examined', 'Diagnosed', 'Audited', 'Reviewed'],
        creative: ['Designed', 'Created', 'Conceptualized', 'Innovated', 'Crafted', 'Formulated', 'Pioneered', 'Transformed', 'Reimagined', 'Revolutionized'],
        communication: ['Presented', 'Communicated', 'Collaborated', 'Negotiated', 'Facilitated', 'Articulated', 'Conveyed', 'Persuaded', 'Influenced', 'Advocated'],
        achievement: ['Achieved', 'Exceeded', 'Surpassed', 'Accomplished', 'Delivered', 'Generated', 'Increased', 'Reduced', 'Improved', 'Maximized']
    },

    // Impact metrics templates
    impactMetrics: [
        'resulting in {number}% improvement in {area}',
        'serving {number}+ users',
        'reducing {area} by {number}%',
        'increasing {area} by {number}%',
        'saving {number} hours per week',
        'generating ${number}K in revenue',
        'improving efficiency by {number}%',
        'decreasing costs by {number}%',
        'boosting performance by {number}%',
        'growing user base by {number}%'
    ],

    // Areas for metrics
    metricAreas: ['efficiency', 'performance', 'productivity', 'revenue', 'engagement', 'user satisfaction', 'response time', 'processing speed', 'conversion rate', 'customer retention'],

    // Enhance a bullet point
    enhanceBulletPoint(text, category = 'technical') {
        // Clean the input
        let enhanced = text.trim();

        // Remove weak starting phrases
        const weakPhrases = [
            /^(i |we |helped |assisted |worked on |was responsible for |participated in |involved in )/i,
            /^(duties included |tasks included |my role was to )/i
        ];

        weakPhrases.forEach(phrase => {
            enhanced = enhanced.replace(phrase, '');
        });

        // Capitalize first letter
        enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

        // Add action verb if missing
        const verbs = this.actionVerbs[category] || this.actionVerbs.technical;
        const startsWithVerb = verbs.some(verb =>
            enhanced.toLowerCase().startsWith(verb.toLowerCase())
        );

        if (!startsWithVerb) {
            const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
            enhanced = `${randomVerb} ${enhanced.charAt(0).toLowerCase() + enhanced.slice(1)}`;
        }

        // Add metrics if missing
        if (!this.hasMetrics(enhanced)) {
            enhanced = this.addMetrics(enhanced);
        }

        return enhanced;
    },

    // Check if text has metrics
    hasMetrics(text) {
        return /\d+%|\d+\+|\$\d+|\d+\s*(users|customers|clients|hours|days|months)/i.test(text);
    },

    // Add metrics to text
    addMetrics(text) {
        const metric = this.impactMetrics[Math.floor(Math.random() * this.impactMetrics.length)];
        const area = this.metricAreas[Math.floor(Math.random() * this.metricAreas.length)];
        const number = [15, 20, 25, 30, 40, 50, 60][Math.floor(Math.random() * 7)];

        const enhancedMetric = metric
            .replace('{number}', number)
            .replace('{area}', area);

        // Remove trailing period if exists
        const cleanText = text.replace(/\.$/, '');

        return `${cleanText}, ${enhancedMetric}`;
    },

    // Generate skill descriptions
    generateSkillDescription(skill) {
        const descriptions = {
            'javascript': 'Proficient in modern JavaScript (ES6+) with experience in Node.js, React, and Vue.js',
            'python': 'Strong Python skills including data analysis, automation, and web development with Django/Flask',
            'react': 'Expert in React.js with hooks, Redux, and component-based architecture',
            'node.js': 'Experienced in building scalable backend services with Node.js and Express',
            'sql': 'Proficient in SQL database design, optimization, and management',
            'aws': 'Hands-on experience with AWS services including EC2, S3, Lambda, and RDS',
            'docker': 'Skilled in containerization with Docker and container orchestration with Kubernetes',
            'git': 'Expert in version control with Git, including branching strategies and CI/CD workflows',
            'machine learning': 'Experience implementing ML models using TensorFlow, PyTorch, and scikit-learn',
            'agile': 'Well-versed in Agile methodologies including Scrum and Kanban'
        };

        const skillLower = skill.toLowerCase();
        return descriptions[skillLower] || `Proficient in ${skill} with hands-on project experience`;
    },

    // Generate project description
    enhanceProjectDescription(name, description, technologies = []) {
        const templates = [
            `Built ${name.toLowerCase()}, a ${description}. Leveraged ${technologies.slice(0, 3).join(', ')} to deliver a robust and scalable solution.`,
            `Developed ${name}, ${description}. Implemented using ${technologies.slice(0, 3).join(', ')}, focusing on performance and user experience.`,
            `Created ${name} - ${description}. Utilized ${technologies.slice(0, 3).join(', ')} to build a production-ready application.`
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        return template;
    },

    // Generate professional summary with industry context
    generateSummary(data, tone = 'professional', industry = 'technology') {
        const { personalInfo, education, skills, experience } = data;

        const name = personalInfo?.fullName || 'Professional';
        const degree = education?.[0]?.degree || 'degree';
        const institution = education?.[0]?.institution || 'university';
        const technicalSkills = skills?.technical?.slice(0, 4).join(', ') || 'various technologies';
        const latestTitle = experience?.[0]?.title || 'professional';
        const yearsExp = this.calculateExperience(experience);

        // Industry-specific templates
        const industryTemplates = {
            technology: {
                professional: `Results-driven ${latestTitle} with ${yearsExp}+ years of experience specializing in ${technicalSkills}. Expert in building scalable, high-performance solutions with a proven track record of delivering projects on time and driving technical innovation.`,
                modern: `Tech enthusiast and ${latestTitle} passionate about ${technicalSkills}. ${yearsExp}+ years of turning complex problems into elegant code. Always learning, always shipping.`,
                creative: `Innovative ${latestTitle} who transforms bold ideas into production-ready applications. ${yearsExp}+ years of crafting digital experiences with ${technicalSkills}.`
            },
            finance: {
                professional: `Analytical ${latestTitle} with ${yearsExp}+ years in financial services. Expert in ${technicalSkills} with demonstrated success in risk management, regulatory compliance, and data-driven decision making.`,
                modern: `Finance professional combining ${yearsExp}+ years of industry expertise with technical proficiency in ${technicalSkills}. Passionate about leveraging technology to drive financial insights.`,
                creative: `Strategic ${latestTitle} bridging finance and technology. ${yearsExp}+ years of transforming complex financial data into actionable intelligence using ${technicalSkills}.`
            },
            healthcare: {
                professional: `Dedicated ${latestTitle} with ${yearsExp}+ years in healthcare technology. Skilled in ${technicalSkills} with focus on HIPAA-compliant solutions that improve patient outcomes and operational efficiency.`,
                modern: `Healthcare tech specialist combining clinical understanding with ${yearsExp}+ years of technical expertise in ${technicalSkills}. Committed to building solutions that make a difference.`,
                creative: `Innovative ${latestTitle} at the intersection of healthcare and technology. ${yearsExp}+ years of developing patient-centered solutions using ${technicalSkills}.`
            },
            marketing: {
                professional: `Data-driven ${latestTitle} with ${yearsExp}+ years of experience in marketing technology. Expert in ${technicalSkills} with proven success in increasing engagement, conversion rates, and ROI.`,
                modern: `Marketing technologist fluent in ${technicalSkills}. ${yearsExp}+ years of building campaigns that convert and tools that scale.`,
                creative: `Creative ${latestTitle} who blends art and analytics. ${yearsExp}+ years of crafting compelling digital experiences using ${technicalSkills}.`
            },
            education: {
                professional: `Passionate ${latestTitle} with ${yearsExp}+ years in educational technology. Skilled in ${technicalSkills} with focus on creating engaging learning experiences and measurable student outcomes.`,
                modern: `EdTech enthusiast combining pedagogy with ${yearsExp}+ years of technical expertise in ${technicalSkills}. Building the future of learning.`,
                creative: `Innovative ${latestTitle} reimagining education through technology. ${yearsExp}+ years of developing interactive learning solutions with ${technicalSkills}.`
            },
            consulting: {
                professional: `Strategic ${latestTitle} with ${yearsExp}+ years of consulting experience. Expert in ${technicalSkills} with track record of delivering high-impact recommendations and driving client transformation.`,
                modern: `Consultant who speaks both business and tech. ${yearsExp}+ years of bridging strategy and execution using ${technicalSkills}.`,
                creative: `Transformation catalyst combining ${yearsExp}+ years of consulting expertise with hands-on technical skills in ${technicalSkills}.`
            }
        };

        const industryData = industryTemplates[industry] || industryTemplates.technology;
        return industryData[tone] || industryData.professional;
    },

    // Calculate years of experience - delegate to Utils
    calculateExperience(experience) {
        const years = Utils.calculateYearsExperience(experience);
        return Math.max(years, 1); // Return at least 1 for this module
    },

    // Parse date string - delegate to Utils
    parseDate(dateStr) {
        return Utils.parseDate(dateStr);
    },

    // Generate "About Me" for different platforms
    generateAboutMe(data, platform = 'resume') {
        const { personalInfo, skills, experience } = data;

        const name = personalInfo?.fullName?.split(' ')[0] || 'Hi';
        const title = experience?.[0]?.title || 'Professional';
        const topSkills = skills?.technical?.slice(0, 3).join(', ') || 'technology';

        const versions = {
            resume: `Results-driven ${title} specializing in ${topSkills}. Passionate about building innovative solutions and delivering exceptional results.`,
            linkedin: `👋 ${name} here! I'm a ${title} passionate about ${topSkills}. Let's connect and explore how we can collaborate!`,
            portfolio: `Welcome! I'm a ${title} who loves turning complex problems into elegant solutions. My expertise lies in ${topSkills}, and I'm always eager to take on new challenges.`,
            github: `🚀 ${title} | ${topSkills}\n\nBuilding cool stuff with code. Feel free to explore my repositories and connect!`
        };

        return versions[platform] || versions.resume;
    },

    // Suggest improvements for content
    suggestImprovements(text, type = 'bullet') {
        const suggestions = [];

        // Check for passive voice
        const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are'];
        if (passiveIndicators.some(word => text.toLowerCase().includes(` ${word} `))) {
            suggestions.push('Consider using active voice for stronger impact');
        }

        // Check for weak words
        const weakWords = ['helped', 'assisted', 'worked', 'did', 'made', 'got'];
        if (weakWords.some(word => text.toLowerCase().includes(word))) {
            suggestions.push('Replace weak verbs with stronger action verbs');
        }

        // Check for specificity
        if (!this.hasMetrics(text)) {
            suggestions.push('Add specific numbers or percentages for greater impact');
        }

        // Check length
        if (text.length < 50) {
            suggestions.push('Consider adding more detail to strengthen this point');
        } else if (text.length > 200) {
            suggestions.push('Consider making this more concise');
        }

        return suggestions;
    },

    // Batch enhance multiple bullet points
    enhanceAllBullets(bullets, category = 'technical') {
        return bullets.map(bullet => this.enhanceBulletPoint(bullet, category));
    },

    // Generate multiple versions of same content
    generateVersions(text, count = 3) {
        const versions = [];
        const categories = ['technical', 'achievement', 'leadership'];

        for (let i = 0; i < count; i++) {
            const category = categories[i % categories.length];
            versions.push(this.enhanceBulletPoint(text, category));
        }

        return versions;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartContent;
}
