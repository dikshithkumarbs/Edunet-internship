// Job Description Matcher - Analyze job postings and suggest missing keywords
class JobDescriptionMatcher {
    constructor() {
        this.commonKeywords = {
            technical: ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'typescript', 'html', 'css', 'mongodb', 'postgresql', 'redis', 'agile', 'scrum', 'ci/cd', 'devops', 'machine learning', 'data analysis'],
            soft: ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'collaborative', 'self-motivated', 'detail-oriented', 'time management', 'adaptable', 'creative', 'proactive', 'organized']
        };
    }

    // Extract keywords from job description
    extractKeywords(jobDescription) {
        const text = jobDescription.toLowerCase();
        const words = text.match(/\b[a-z]{3,}\b/g) || [];

        // Count word frequency
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        // Extract multi-word phrases
        const phrases = [];
        const twoWordPhrases = text.match(/\b[a-z]+\s+[a-z]+\b/g) || [];
        phrases.push(...twoWordPhrases.filter(p => p.length > 6));

        // Find technical keywords
        const technicalFound = this.commonKeywords.technical.filter(kw => text.includes(kw));

        // Find soft skills
        const softFound = this.commonKeywords.soft.filter(kw => text.includes(kw));

        // Extract important terms (frequent and relevant)
        const importantTerms = Object.entries(wordCount)
            .filter(([word, count]) => count >= 2 && word.length > 4)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word]) => word);

        return {
            technical: technicalFound,
            soft: softFound,
            important: importantTerms,
            phrases: [...new Set(phrases)].slice(0, 10)
        };
    }

    // Analyze resume against job description
    analyzeMatch(resumeData, jobDescription) {
        const jdKeywords = this.extractKeywords(jobDescription);
        const resumeText = this.getResumeText(resumeData).toLowerCase();

        const results = {
            matchScore: 0,
            matchedKeywords: [],
            missingKeywords: [],
            suggestions: []
        };

        // Check technical keywords
        jdKeywords.technical.forEach(kw => {
            if (resumeText.includes(kw)) {
                results.matchedKeywords.push({ keyword: kw, type: 'technical' });
            } else {
                results.missingKeywords.push({ keyword: kw, type: 'technical', priority: 'high' });
            }
        });

        // Check soft skills
        jdKeywords.soft.forEach(kw => {
            if (resumeText.includes(kw)) {
                results.matchedKeywords.push({ keyword: kw, type: 'soft' });
            } else {
                results.missingKeywords.push({ keyword: kw, type: 'soft', priority: 'medium' });
            }
        });

        // Check important terms
        jdKeywords.important.forEach(term => {
            if (!resumeText.includes(term) && !this.isCommonWord(term)) {
                results.missingKeywords.push({ keyword: term, type: 'term', priority: 'low' });
            }
        });

        // Calculate match score
        const totalKeywords = jdKeywords.technical.length + jdKeywords.soft.length;
        if (totalKeywords > 0) {
            results.matchScore = Math.round((results.matchedKeywords.length / totalKeywords) * 100);
        }

        // Generate suggestions
        results.suggestions = this.generateSuggestions(results.missingKeywords, resumeData);

        return results;
    }

    // Get all text from resume
    getResumeText(data) {
        const parts = [];

        if (data.summary) parts.push(data.summary);

        if (data.skills?.technical) parts.push(data.skills.technical.join(' '));
        if (data.skills?.soft) parts.push(data.skills.soft.join(' '));

        if (data.experience) {
            data.experience.forEach(exp => {
                parts.push(exp.title || '');
                parts.push(exp.company || '');
                if (exp.achievements) parts.push(exp.achievements.join(' '));
            });
        }

        if (data.projects) {
            data.projects.forEach(proj => {
                parts.push(proj.name || '');
                parts.push(proj.description || '');
                if (proj.technologies) parts.push(proj.technologies.join(' '));
                if (proj.highlights) parts.push(proj.highlights.join(' '));
            });
        }

        if (data.education) {
            data.education.forEach(edu => {
                parts.push(edu.degree || '');
                parts.push(edu.institution || '');
            });
        }

        return parts.join(' ');
    }

    // Check if word is too common to suggest
    isCommonWord(word) {
        const commonWords = ['with', 'that', 'have', 'this', 'will', 'your', 'from', 'they', 'been', 'have',
            'many', 'some', 'them', 'these', 'what', 'about', 'which', 'when', 'make', 'like',
            'just', 'over', 'such', 'into', 'year', 'good', 'most', 'work', 'also', 'after'];
        return commonWords.includes(word);
    }

    // Generate actionable suggestions
    generateSuggestions(missingKeywords, resumeData) {
        const suggestions = [];

        const highPriority = missingKeywords.filter(k => k.priority === 'high');
        const mediumPriority = missingKeywords.filter(k => k.priority === 'medium');

        if (highPriority.length > 0) {
            suggestions.push({
                type: 'skills',
                message: `Add these technical skills if you have them: ${highPriority.slice(0, 5).map(k => k.keyword).join(', ')}`,
                priority: 'high'
            });
        }

        if (mediumPriority.length > 0) {
            suggestions.push({
                type: 'summary',
                message: `Consider mentioning these skills in your summary: ${mediumPriority.slice(0, 3).map(k => k.keyword).join(', ')}`,
                priority: 'medium'
            });
        }

        if (!resumeData.summary || resumeData.summary.length < 100) {
            suggestions.push({
                type: 'summary',
                message: 'Add a professional summary that includes key terms from the job description',
                priority: 'high'
            });
        }

        if (!resumeData.experience || resumeData.experience.length === 0) {
            suggestions.push({
                type: 'experience',
                message: 'Add relevant work experience that demonstrates required skills',
                priority: 'high'
            });
        }

        return suggestions;
    }

    // Render match results UI
    renderMatchResults(results) {
        return `
            <div class="jd-match-results">
                <div class="match-score-display">
                    <div class="score-circle ${results.matchScore >= 70 ? 'high' : results.matchScore >= 50 ? 'medium' : 'low'}">
                        <span class="score-value">${results.matchScore}%</span>
                        <span class="score-label">Match</span>
                    </div>
                </div>
                
                <div class="match-details">
                    <div class="matched-section">
                        <h4>✅ Matched Keywords (${results.matchedKeywords.length})</h4>
                        <div class="keyword-tags">
                            ${results.matchedKeywords.map(k => `<span class="tag matched">${k.keyword}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="missing-section">
                        <h4>⚠️ Missing Keywords (${results.missingKeywords.filter(k => k.priority !== 'low').length})</h4>
                        <div class="keyword-tags">
                            ${results.missingKeywords.filter(k => k.priority !== 'low').map(k =>
            `<span class="tag missing ${k.priority}">${k.keyword}</span>`
        ).join('')}
                        </div>
                    </div>
                    
                    <div class="suggestions-section">
                        <h4>💡 Suggestions</h4>
                        <ul class="suggestions-list">
                            ${results.suggestions.map(s =>
            `<li class="suggestion ${s.priority}">${s.message}</li>`
        ).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
}

// Create global instance
const jobDescriptionMatcher = new JobDescriptionMatcher();
