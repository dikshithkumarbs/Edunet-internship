// Grammar & Tone Checker using LanguageTool API
class GrammarChecker {
    constructor() {
        this.apiUrl = 'https://api.languagetool.org/v2/check';
        this.isChecking = false;
    }

    // Check text for grammar issues
    async checkGrammar(text, language = 'en-US') {
        if (!text || text.trim().length < 10) {
            return { matches: [], isClean: true };
        }

        try {
            const formData = new URLSearchParams();
            formData.append('text', text);
            formData.append('language', language);
            formData.append('enabledOnly', 'false');

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Grammar check failed');
            }

            const data = await response.json();
            return {
                matches: this.processMatches(data.matches || []),
                isClean: (data.matches || []).length === 0
            };
        } catch (error) {
            console.error('Grammar check error:', error);
            // Fallback to basic checks
            return this.basicGrammarCheck(text);
        }
    }

    // Process API matches into user-friendly format
    processMatches(matches) {
        return matches.map(match => ({
            message: match.message,
            shortMessage: match.shortMessage || match.message.substring(0, 50),
            context: match.context?.text || '',
            offset: match.offset,
            length: match.length,
            replacements: (match.replacements || []).slice(0, 3).map(r => r.value),
            type: this.categorizeIssue(match.rule?.category?.id || ''),
            severity: this.getSeverity(match.rule?.category?.id || '')
        }));
    }

    // Categorize issue type
    categorizeIssue(categoryId) {
        const categories = {
            'TYPOS': 'spelling',
            'GRAMMAR': 'grammar',
            'PUNCTUATION': 'punctuation',
            'STYLE': 'style',
            'CASING': 'capitalization',
            'REDUNDANCY': 'wordiness',
            'CONFUSED_WORDS': 'word-choice'
        };
        return categories[categoryId] || 'general';
    }

    // Get severity level
    getSeverity(categoryId) {
        const highSeverity = ['GRAMMAR', 'TYPOS', 'CONFUSED_WORDS'];
        const mediumSeverity = ['PUNCTUATION', 'CASING'];

        if (highSeverity.includes(categoryId)) return 'high';
        if (mediumSeverity.includes(categoryId)) return 'medium';
        return 'low';
    }

    // Basic fallback grammar check
    basicGrammarCheck(text) {
        const issues = [];

        // Check for double spaces
        const doubleSpaces = text.match(/  +/g);
        if (doubleSpaces) {
            issues.push({
                message: 'Multiple consecutive spaces found',
                type: 'spacing',
                severity: 'low',
                replacements: [' ']
            });
        }

        // Check for missing period at end
        if (text.trim() && !/[.!?]$/.test(text.trim())) {
            issues.push({
                message: 'Sentence may be missing ending punctuation',
                type: 'punctuation',
                severity: 'medium',
                replacements: [text.trim() + '.']
            });
        }

        // Check for lowercase start after period
        const lowercaseAfterPeriod = text.match(/\.\s+[a-z]/g);
        if (lowercaseAfterPeriod) {
            issues.push({
                message: 'Sentence should start with capital letter',
                type: 'capitalization',
                severity: 'medium',
                replacements: []
            });
        }

        // Check for common typos
        const commonTypos = {
            'teh': 'the',
            'recieve': 'receive',
            'occured': 'occurred',
            'seperate': 'separate',
            'definately': 'definitely',
            'occassion': 'occasion',
            'accomodate': 'accommodate'
        };

        Object.entries(commonTypos).forEach(([typo, correct]) => {
            if (text.toLowerCase().includes(typo)) {
                issues.push({
                    message: `Possible spelling mistake: "${typo}" should be "${correct}"`,
                    type: 'spelling',
                    severity: 'high',
                    replacements: [correct]
                });
            }
        });

        return { matches: issues, isClean: issues.length === 0 };
    }

    // Check resume tone
    analyzeTone(text) {
        const analysis = {
            professional: 0,
            actionOriented: 0,
            quantified: 0,
            issues: []
        };

        // Action verbs check
        const actionVerbs = ['achieved', 'led', 'developed', 'created', 'implemented', 'managed',
            'designed', 'built', 'improved', 'increased', 'reduced', 'launched', 'delivered',
            'collaborated', 'established', 'initiated', 'optimized', 'streamlined'];
        const foundActionVerbs = actionVerbs.filter(v => text.toLowerCase().includes(v));
        analysis.actionOriented = Math.min(100, foundActionVerbs.length * 15);

        // Numbers/metrics check
        const hasNumbers = (text.match(/\d+%|\d+\+|\d+ (users|customers|projects|team)/gi) || []).length;
        analysis.quantified = Math.min(100, hasNumbers * 25);

        // Weak words check
        const weakWords = ['helped', 'assisted', 'worked on', 'was responsible for', 'duties included'];
        weakWords.forEach(weak => {
            if (text.toLowerCase().includes(weak)) {
                analysis.issues.push({
                    type: 'weak-language',
                    message: `Replace "${weak}" with a stronger action verb`,
                    severity: 'medium'
                });
            }
        });

        // First person check
        if (/\b(I|me|my)\b/i.test(text)) {
            analysis.issues.push({
                type: 'first-person',
                message: 'Avoid using first person (I, me, my) in resume',
                severity: 'low'
            });
        }

        // Calculate professional score
        analysis.professional = Math.round((analysis.actionOriented + analysis.quantified) / 2);

        return analysis;
    }

    // Check all resume text fields
    async checkResume(resumeData) {
        const results = {
            summary: null,
            experience: [],
            projects: [],
            overallScore: 0,
            totalIssues: 0
        };

        // Check summary
        if (resumeData.summary) {
            results.summary = await this.checkGrammar(resumeData.summary);
            results.summary.tone = this.analyzeTone(resumeData.summary);
            results.totalIssues += results.summary.matches.length;
        }

        // Check experience achievements
        if (resumeData.experience) {
            for (const exp of resumeData.experience) {
                if (exp.achievements) {
                    const text = exp.achievements.join('. ');
                    const check = await this.checkGrammar(text);
                    check.tone = this.analyzeTone(text);
                    results.experience.push({
                        title: exp.title,
                        ...check
                    });
                    results.totalIssues += check.matches.length;
                }
            }
        }

        // Check project descriptions
        if (resumeData.projects) {
            for (const proj of resumeData.projects) {
                if (proj.description || proj.highlights) {
                    const text = (proj.description || '') + ' ' + (proj.highlights || []).join('. ');
                    const check = await this.checkGrammar(text);
                    results.projects.push({
                        name: proj.name,
                        ...check
                    });
                    results.totalIssues += check.matches.length;
                }
            }
        }

        // Calculate overall score
        results.overallScore = results.totalIssues === 0 ? 100 : Math.max(0, 100 - (results.totalIssues * 10));

        return results;
    }

    // Render grammar check results
    renderResults(results) {
        return `
            <div class="grammar-check-results">
                <div class="grammar-score">
                    <div class="score-circle ${results.overallScore >= 80 ? 'high' : results.overallScore >= 60 ? 'medium' : 'low'}">
                        <span class="score-value">${results.overallScore}</span>
                        <span class="score-label">Grammar Score</span>
                    </div>
                    <p class="issues-count">${results.totalIssues} issue${results.totalIssues !== 1 ? 's' : ''} found</p>
                </div>
                
                ${results.summary ? `
                    <div class="check-section">
                        <h4>Summary</h4>
                        ${results.summary.isClean ?
                    '<p class="clean">✅ No issues found</p>' :
                    this.renderIssues(results.summary.matches)
                }
                        ${this.renderToneAnalysis(results.summary.tone)}
                    </div>
                ` : ''}
                
                ${results.experience.length > 0 ? `
                    <div class="check-section">
                        <h4>Experience</h4>
                        ${results.experience.map(exp => `
                            <div class="exp-check">
                                <strong>${exp.title}</strong>
                                ${exp.isClean ?
                        '<span class="clean">✅</span>' :
                        this.renderIssues(exp.matches)
                    }
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderIssues(matches) {
        return `
            <ul class="grammar-issues">
                ${matches.map(m => `
                    <li class="issue ${m.severity}">
                        <span class="issue-icon">${m.severity === 'high' ? '🔴' : m.severity === 'medium' ? '🟡' : '🔵'}</span>
                        <span class="issue-message">${m.message}</span>
                        ${m.replacements.length > 0 ? `
                            <span class="suggestion">Try: ${m.replacements.join(' or ')}</span>
                        ` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderToneAnalysis(tone) {
        if (!tone) return '';
        return `
            <div class="tone-analysis">
                <div class="tone-metrics">
                    <div class="metric">
                        <span class="label">Action-Oriented</span>
                        <div class="bar"><div class="fill" style="width: ${tone.actionOriented}%"></div></div>
                    </div>
                    <div class="metric">
                        <span class="label">Quantified Results</span>
                        <div class="bar"><div class="fill" style="width: ${tone.quantified}%"></div></div>
                    </div>
                </div>
                ${tone.issues.length > 0 ? `
                    <div class="tone-issues">
                        ${tone.issues.map(i => `<p class="tone-issue">💡 ${i.message}</p>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Create global instance
const grammarChecker = new GrammarChecker();
