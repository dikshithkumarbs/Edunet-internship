// ATS (Applicant Tracking System) Optimizer
class ATSOptimizer {
    constructor() {
        this.commonATSKeywords = {
            technical: ['programming', 'development', 'software', 'engineering', 'coding', 'debugging', 'testing', 'deployment', 'architecture', 'design'],
            soft: ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'collaborative', 'innovative', 'efficient', 'organized', 'detail-oriented'],
            action: ['developed', 'implemented', 'designed', 'created', 'built', 'optimized', 'improved', 'managed', 'led', 'coordinated', 'achieved', 'delivered']
        };

        this.atsUnfriendlyElements = [
            'images', 'graphics', 'tables', 'text boxes', 'headers/footers',
            'columns', 'special characters', 'fancy fonts', 'colored text'
        ];
    }

    // Main ATS scoring function
    analyzeResume(resumeData, jobDescription = '') {
        const scores = {
            format: this.checkFormatCompatibility(resumeData),
            keywords: this.analyzeKeywords(resumeData, jobDescription),
            structure: this.checkStructure(resumeData),
            readability: this.checkReadability(resumeData),
            overall: 0
        };

        // Calculate weighted overall score
        scores.overall = Math.round(
            (scores.format * 0.25) +
            (scores.keywords * 0.40) +
            (scores.structure * 0.20) +
            (scores.readability * 0.15)
        );

        // Debug: log score breakdown to help diagnose issues
        console.log('ATS Score Breakdown:', {
            format: scores.format,
            keywords: scores.keywords,
            structure: scores.structure,
            readability: scores.readability,
            overall: scores.overall,
            hasName: !!resumeData.personalInfo?.fullName,
            hasSummary: !!resumeData.summary,
            dataSnapshot: JSON.stringify(resumeData).substring(0, 200)
        });

        return {
            score: scores.overall,
            breakdown: scores,
            suggestions: this.generateSuggestions(scores, resumeData, jobDescription),
            keywords: this.extractJobKeywords(jobDescription),
            matchedKeywords: this.findMatchedKeywords(resumeData, jobDescription)
        };
    }

    // Check format compatibility (0-100)
    checkFormatCompatibility(resumeData) {
        // Check for appropriate section headers
        const hasPersonalInfo = resumeData.personalInfo?.fullName || resumeData.personalInfo?.email;
        const hasEducation = resumeData.education && resumeData.education.length > 0;
        const hasExperience = resumeData.experience && resumeData.experience.length > 0;
        const hasSkills = resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.soft?.length > 0);
        const hasSummary = resumeData.summary && resumeData.summary.trim().length > 0;

        // Completely empty resume = 0 score
        if (!hasPersonalInfo && !hasEducation && !hasExperience && !hasSkills && !hasSummary) {
            return 0;
        }

        let score = 50; // Start at 50% base

        // Add points for having content
        if (hasPersonalInfo) score += 15;
        if (hasSummary) score += 10;
        if (hasEducation) score += 10;
        if (hasExperience) score += 10;
        if (hasSkills) score += 5;

        return Math.min(100, score);
    }

    // Analyze keyword matching (0-100)
    analyzeKeywords(resumeData, jobDescription) {
        const resumeText = this.flattenResumeToText(resumeData);

        // Check if resume has any meaningful content
        if (!resumeText || resumeText.trim().length < 20) {
            return 0; // Empty resume = 0 score
        }

        if (!jobDescription || jobDescription.trim() === '') {
            // No job description - check for general action verbs and keywords
            const hasActionVerbs = this.commonATSKeywords.action.some(verb =>
                resumeText.toLowerCase().includes(verb)
            );
            const hasTechnicalKeywords = this.commonATSKeywords.technical.some(keyword =>
                resumeText.toLowerCase().includes(keyword)
            );
            // Base score on content quality without job description
            let baseScore = 30;
            if (hasActionVerbs) baseScore += 20;
            if (hasTechnicalKeywords) baseScore += 15;
            return baseScore;
        }

        const jobKeywords = this.extractJobKeywords(jobDescription);

        if (jobKeywords.length === 0) {
            return 40; // No keywords extracted from job description
        }

        const matchedKeywords = jobKeywords.filter(keyword => {
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(resumeText);
        });

        const matchPercentage = (matchedKeywords.length / jobKeywords.length) * 100;

        // Score based on match percentage
        if (matchPercentage >= 70) return 100;
        if (matchPercentage >= 50) return 85;
        if (matchPercentage >= 30) return 70;
        if (matchPercentage >= 15) return 50;
        return 30;
    }

    // Check resume structure (0-100)
    checkStructure(resumeData) {
        let score = 0;

        // Clear contact information
        if (resumeData.personalInfo?.fullName) score += 15;
        if (resumeData.personalInfo?.email) score += 15;
        if (resumeData.personalInfo?.phone) score += 10;

        // Professional summary
        if (resumeData.summary && resumeData.summary.length > 50) score += 15;

        // Experience with achievements
        if (resumeData.experience && resumeData.experience.length > 0) {
            score += 15;
            const hasAchievements = resumeData.experience.some(exp =>
                exp.achievements && exp.achievements.length > 0
            );
            if (hasAchievements) score += 10;
        }

        // Skills section
        if (resumeData.skills) {
            if (resumeData.skills.technical?.length > 0) score += 10;
            if (resumeData.skills.soft?.length > 0) score += 5;
        }

        // Projects (bonus)
        if (resumeData.projects && resumeData.projects.length > 0) score += 5;

        return Math.min(100, score);
    }

    // Check readability and formatting (0-100)
    checkReadability(resumeData) {
        // Check if resume has any content
        const hasContent = resumeData.summary ||
            (resumeData.experience && resumeData.experience.length > 0) ||
            (resumeData.education && resumeData.education.length > 0);

        if (!hasContent) {
            return 0; // Empty resume = 0 readability
        }

        let score = 100;

        // Check summary length (should be 2-4 sentences)
        if (resumeData.summary) {
            const sentences = resumeData.summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
            if (sentences.length < 2) score -= 10;
            if (sentences.length > 5) score -= 5;
        } else {
            score -= 20; // Missing summary
        }

        // Check for action verbs in experience
        if (resumeData.experience && resumeData.experience.length > 0) {
            const hasActionVerbs = resumeData.experience.some(exp => {
                if (!exp.achievements) return false;
                const achievementText = exp.achievements.join(' ').toLowerCase();
                return this.commonATSKeywords.action.some(verb => achievementText.includes(verb));
            });

            if (!hasActionVerbs) score -= 15;
        }

        // Check for quantifiable achievements
        const hasNumbers = this.checkForMetrics(resumeData);
        if (!hasNumbers) score -= 10;

        return Math.max(0, score);
    }

    // Extract important keywords from job description
    extractJobKeywords(jobDescription) {
        if (!jobDescription) return [];

        const text = jobDescription.toLowerCase();

        // Common stop words to exclude
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'should', 'could', 'may', 'might', 'must', 'can', 'about',
            'into', 'through', 'during', 'before', 'after', 'above', 'below',
            'between', 'under', 'over', 'again', 'further', 'then', 'once', 'here',
            'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few',
            'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
            'own', 'same', 'so', 'than', 'too', 'very', 'that', 'these', 'those',
            'this', 'we', 'you', 'your', 'our'
        ]);

        // Extract words (2+ characters, alphanumeric)
        const words = text.match(/\b[a-z][a-z0-9+#.]{1,}\b/g) || [];

        // Count word frequency
        const wordFreq = {};
        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 2) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // Get top keywords (mentioned 2+ times)
        const keywords = Object.entries(wordFreq)
            .filter(([word, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([word]) => word);

        return keywords;
    }

    // Find which keywords from job are in resume
    findMatchedKeywords(resumeData, jobDescription) {
        const jobKeywords = this.extractJobKeywords(jobDescription);
        const resumeText = this.flattenResumeToText(resumeData).toLowerCase();

        return jobKeywords.filter(keyword => {
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(resumeText);
        });
    }

    // Convert resume data to plain text
    flattenResumeToText(resumeData) {
        let text = [];

        if (resumeData.personalInfo) {
            text.push(resumeData.personalInfo.fullName || '');
        }

        if (resumeData.summary) {
            text.push(resumeData.summary);
        }

        if (resumeData.education) {
            resumeData.education.forEach(edu => {
                text.push(edu.degree, edu.institution);
            });
        }

        if (resumeData.experience) {
            resumeData.experience.forEach(exp => {
                text.push(exp.title, exp.company);
                if (exp.achievements) {
                    text.push(...exp.achievements);
                }
            });
        }

        if (resumeData.skills) {
            if (resumeData.skills.technical) text.push(...resumeData.skills.technical);
            if (resumeData.skills.soft) text.push(...resumeData.skills.soft);
        }

        if (resumeData.projects) {
            resumeData.projects.forEach(proj => {
                text.push(proj.name, proj.description);
                if (proj.technologies) text.push(...proj.technologies);
            });
        }

        return text.join(' ');
    }

    // Check for quantifiable metrics
    checkForMetrics(resumeData) {
        const text = this.flattenResumeToText(resumeData);

        // Look for numbers, percentages, dollar amounts
        const hasMetrics = /\d+%|\$\d+|\d+\+|\d+ [a-z]+/i.test(text);

        return hasMetrics;
    }

    // Generate improvement suggestions
    generateSuggestions(scores, resumeData, jobDescription) {
        const suggestions = [];

        // Format suggestions
        if (scores.format < 80) {
            if (!resumeData.education || resumeData.education.length === 0) {
                suggestions.push({
                    type: 'critical',
                    category: 'format',
                    message: 'Add education section - most ATS systems require this'
                });
            }
            if (!resumeData.experience || resumeData.experience.length === 0) {
                suggestions.push({
                    type: 'critical',
                    category: 'format',
                    message: 'Add work experience or internships'
                });
            }
            if (!resumeData.skills || (!resumeData.skills.technical?.length && !resumeData.skills.soft?.length)) {
                suggestions.push({
                    type: 'warning',
                    category: 'format',
                    message: 'Add a skills section with relevant technical and soft skills'
                });
            }
        }

        // Keyword suggestions
        if (scores.keywords < 70 && jobDescription) {
            const jobKeywords = this.extractJobKeywords(jobDescription);
            const matchedKeywords = this.findMatchedKeywords(resumeData, jobDescription);
            const missingKeywords = jobKeywords.filter(k => !matchedKeywords.includes(k)).slice(0, 10);

            if (missingKeywords.length > 0) {
                suggestions.push({
                    type: 'warning',
                    category: 'keywords',
                    message: `Add these missing keywords from the job description: ${missingKeywords.slice(0, 5).join(', ')}`
                });
            }
        }

        // Structure suggestions
        if (scores.structure < 80) {
            if (!resumeData.summary || resumeData.summary.length < 50) {
                suggestions.push({
                    type: 'info',
                    category: 'structure',
                    message: 'Add a professional summary at the top of your resume'
                });
            }
            if (resumeData.experience && resumeData.experience.some(exp => !exp.achievements || exp.achievements.length === 0)) {
                suggestions.push({
                    type: 'info',
                    category: 'structure',
                    message: 'Add achievement bullet points to your experience entries'
                });
            }
        }

        // Readability suggestions
        if (scores.readability < 80) {
            if (!this.checkForMetrics(resumeData)) {
                suggestions.push({
                    type: 'info',
                    category: 'readability',
                    message: 'Add quantifiable metrics to your achievements (e.g., "increased by 25%", "managed team of 5")'
                });
            }

            const resumeText = this.flattenResumeToText(resumeData);
            const hasActionVerbs = this.commonATSKeywords.action.some(verb =>
                resumeText.toLowerCase().includes(verb)
            );

            if (!hasActionVerbs) {
                suggestions.push({
                    type: 'info',
                    category: 'readability',
                    message: 'Use strong action verbs (developed, implemented, designed, led, etc.)'
                });
            }
        }

        return suggestions;
    }

    // Get ATS-friendly tips
    getATSTips() {
        return [
            'Use standard section headers: Summary, Experience, Education, Skills',
            'Avoid images, graphics, and fancy formatting',
            'Use simple, readable fonts',
            'Include relevant keywords from the job description',
            'Use standard date formats (MM/YYYY)',
            'Spell out acronyms on first use',
            'Use bullet points for achievements',
            'Quantify achievements with numbers and percentages',
            'Save in ATS-friendly format (PDF or DOCX)',
            'Keep formatting consistent throughout'
        ];
    }

    // Get keyword density for a specific term
    getKeywordDensity(resumeData, keyword) {
        const text = this.flattenResumeToText(resumeData).toLowerCase();
        const words = text.split(/\s+/);
        const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;

        return {
            count: keywordCount,
            density: words.length > 0 ? (keywordCount / words.length * 100).toFixed(2) : 0
        };
    }
}

// Create global instance
const atsOptimizer = new ATSOptimizer();
