// Hugging Face API Integration
// Free AI-powered content generation using Hugging Face Inference API

class HuggingFaceAPI {
    constructor() {
        this.apiKey = CONFIG.HUGGINGFACE?.API_KEY || '';
        this.baseUrl = 'https://api-inference.huggingface.co/models';
        this.apiBaseUrl = CONFIG.HUGGINGFACE.API_BASE_URL;
        this.demoMode = false;

        // Model configurations
        this.models = {
            textGeneration: 'google/flan-t5-base',
            summarization: 'facebook/bart-large-cnn',
            grammar: 'vennify/t5-base-grammar-correction',
            embedding: 'sentence-transformers/all-MiniLM-L6-v2'
        };
    }

    // Generic API call to Hugging Face (Proxied via Backend)
    async callModel(model, inputs, parameters = {}) {
        if (this.demoMode && !CONFIG.HUGGINGFACE.API_BASE_URL) {
            return this.getDemoResponse(model, inputs);
        }

        try {
            const response = await fetch(CONFIG.HUGGINGFACE.API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    inputs: inputs,
                    parameters: parameters
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Attempt to parse JSON error if possible
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('HuggingFace Backend Error:', errorJson);
                } catch (e) {
                    console.error('HuggingFace Backend Error:', errorText);
                }
                return this.getDemoResponse(model, inputs);
            }

            return await response.json();
        } catch (error) {
            console.error('HuggingFace API Error:', error);
            return this.getDemoResponse(model, inputs);
        }
    }

    // Generate professional bullet points
    async enhanceBulletPoint(text, context = '') {
        const prompt = `Transform this into a professional resume bullet point with quantified impact and action verbs: "${text}"${context ? ` Context: ${context}` : ''}`;

        const result = await this.callModel(this.models.textGeneration, prompt, {
            max_length: 150,
            temperature: 0.7
        });

        return this.extractText(result) || this.generateSmartBullet(text);
    }

    // Generate professional summary
    async generateProfessionalSummary(data) {
        const { personalInfo, education, skills, experience, projects } = data;

        // Build detailed context from user's actual data
        const name = personalInfo?.fullName || '';
        const degree = education?.[0]?.degree || '';
        const institution = education?.[0]?.institution || '';
        const technicalSkills = skills?.technical?.slice(0, 6).join(', ') || '';
        const softSkills = skills?.soft?.slice(0, 3).join(', ') || '';
        const latestTitle = experience?.[0]?.title || '';
        const latestCompany = experience?.[0]?.company || '';
        const achievements = experience?.[0]?.achievements?.join('; ') || '';
        const projectNames = projects?.map(p => p.name).slice(0, 3).join(', ') || '';

        // Create comprehensive prompt with all user data
        const prompt = `Write a professional 3-sentence resume summary for this person:

Name: ${name}
Current/Latest Role: ${latestTitle} at ${latestCompany}
Education: ${degree} from ${institution}
Technical Skills: ${technicalSkills}
Soft Skills: ${softSkills}
Key Achievements: ${achievements}
Notable Projects: ${projectNames}

Create a compelling first-person summary highlighting their expertise, experience, and value proposition.`;

        console.log('🤖 Calling HuggingFace API with user data...');

        const result = await this.callModel(this.models.textGeneration, prompt, {
            max_length: 250,
            temperature: 0.7,
            do_sample: true
        });

        const generatedText = this.extractText(result);

        if (generatedText && generatedText.length > 50) {
            console.log('✅ AI Generated Summary:', generatedText);
            return generatedText;
        }

        console.log('⚠️ Using smart fallback with user data...');
        return this.generateDemoSummary(data);
    }

    // Summarize long text
    async summarizeText(text, maxLength = 100) {
        const result = await this.callModel(this.models.summarization, text, {
            max_length: maxLength,
            min_length: 30
        });

        return this.extractText(result) || text.substring(0, maxLength);
    }

    // Fix grammar issues
    async correctGrammar(text) {
        const prompt = `grammar: ${text}`;
        const result = await this.callModel(this.models.grammar, prompt);
        return this.extractText(result) || text;
    }

    // Calculate text similarity (for job matching)
    async calculateSimilarity(text1, text2) {
        if (this.demoMode) {
            return this.calculateLocalSimilarity(text1, text2);
        }

        try {
            const [embedding1, embedding2] = await Promise.all([
                this.callModel(this.models.embedding, text1),
                this.callModel(this.models.embedding, text2)
            ]);

            return this.cosineSimilarity(embedding1, embedding2);
        } catch (error) {
            return this.calculateLocalSimilarity(text1, text2);
        }
    }

    // Extract job keywords from description
    extractJobKeywords(jobDescription) {
        const technicalPatterns = [
            /\b(javascript|python|java|react|node\.?js|angular|vue|typescript|sql|mongodb|aws|azure|docker|kubernetes|git|html|css|api|rest|graphql)\b/gi,
            /\b(machine learning|ai|data science|cloud|devops|agile|scrum|ci\/cd)\b/gi,
            /\b(leadership|communication|problem.solving|team.?work|analytical|project.management)\b/gi
        ];

        const keywords = new Set();
        const text = jobDescription.toLowerCase();

        technicalPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            matches.forEach(match => keywords.add(match.toLowerCase()));
        });

        // Extract years of experience requirements
        const expMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
        if (expMatch) {
            keywords.add(`${expMatch[1]}+ years experience`);
        }

        return Array.from(keywords);
    }

    // Match resume to job description
    async matchResumeToJob(resumeData, jobDescription) {
        const jobKeywords = this.extractJobKeywords(jobDescription);
        const resumeText = this.resumeToText(resumeData).toLowerCase();

        const matchedKeywords = [];
        const missingKeywords = [];

        jobKeywords.forEach(keyword => {
            if (resumeText.includes(keyword.toLowerCase())) {
                matchedKeywords.push(keyword);
            } else {
                missingKeywords.push(keyword);
            }
        });

        const matchScore = Math.round((matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 100);

        return {
            score: matchScore,
            matchedKeywords,
            missingKeywords,
            totalKeywords: jobKeywords.length,
            suggestions: this.generateMatchSuggestions(missingKeywords, matchScore)
        };
    }

    // Generate smart bullet point (demo mode)
    generateSmartBullet(text) {
        const actionVerbs = ['Developed', 'Implemented', 'Led', 'Designed', 'Optimized', 'Created', 'Managed', 'Delivered'];
        const impacts = ['resulting in 25% improvement', 'serving 10,000+ users', 'reducing costs by 30%', 'improving efficiency by 40%'];

        const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
        const impact = impacts[Math.floor(Math.random() * impacts.length)];

        // Clean and enhance the text
        let enhanced = text.replace(/^(i |we |worked on |helped with )/i, '');
        enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

        if (!enhanced.includes('%') && !enhanced.includes('users')) {
            enhanced = `${verb} ${enhanced.toLowerCase()}, ${impact}`;
        }

        return enhanced;
    }

    // Generate demo summary - uses actual user data for personalized result
    generateDemoSummary(data) {
        const name = data.personalInfo?.fullName || '';
        const degree = data.education?.[0]?.degree || '';
        const institution = data.education?.[0]?.institution || '';
        const technicalSkills = data.skills?.technical?.slice(0, 4).join(', ') || 'diverse technical skills';
        const softSkills = data.skills?.soft?.slice(0, 2).join(' and ') || 'excellent communication';
        const title = data.experience?.[0]?.title || 'professional';
        const company = data.experience?.[0]?.company || '';
        const yearsExp = this.calculateYearsExperience(data.experience);
        const projectCount = data.projects?.length || 0;

        // Generate personalized summary based on available data
        let summary = '';

        if (title && technicalSkills) {
            summary = `Results-driven ${title}`;
            if (yearsExp > 0) {
                summary += ` with ${yearsExp}+ years of experience`;
            }
            summary += ` specializing in ${technicalSkills}. `;
        } else {
            summary = `Dedicated professional with expertise in ${technicalSkills}. `;
        }

        if (degree && institution) {
            summary += `Holds a ${degree} from ${institution}. `;
        } else if (degree) {
            summary += `Holds a ${degree} with a strong academic foundation. `;
        }

        if (projectCount > 0) {
            summary += `Successfully delivered ${projectCount}+ projects demonstrating ${softSkills}. `;
        } else {
            summary += `Demonstrates ${softSkills} with a proven track record of delivering impactful solutions. `;
        }

        summary += 'Passionate about leveraging technology to solve complex problems and drive business success.';

        return summary.trim();
    }

    // Calculate years of experience - delegate to Utils
    calculateYearsExperience(experience) {
        return Utils.calculateYearsExperience(experience);
    }

    // Parse date string - delegate to Utils
    parseDate(dateStr) {
        return Utils.parseDate(dateStr);
    }

    // Convert resume data to text - delegate to Utils
    resumeToText(data) {
        return Utils.resumeToText(data);
    }

    // Generate match suggestions
    generateMatchSuggestions(missingKeywords, score) {
        const suggestions = [];

        if (score < 50) {
            suggestions.push('Your resume needs significant improvements to match this job');
            suggestions.push('Consider adding more relevant skills and experience');
        } else if (score < 70) {
            suggestions.push('Your resume is a partial match - consider highlighting relevant experience');
        } else if (score < 90) {
            suggestions.push('Good match! Minor improvements could help');
        } else {
            suggestions.push('Excellent match! Your resume aligns well with this job');
        }

        if (missingKeywords.length > 0) {
            suggestions.push(`Consider adding these keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
        }

        return suggestions;
    }

    // Calculate local similarity (fallback)
    calculateLocalSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    // Cosine similarity calculation
    cosineSimilarity(vec1, vec2) {
        if (!Array.isArray(vec1) || !Array.isArray(vec2)) return 0;

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    // Extract text from API response
    extractText(result) {
        if (!result) return null;

        if (typeof result === 'string') return result;
        if (Array.isArray(result) && result[0]) {
            if (result[0].generated_text) return result[0].generated_text;
            if (result[0].summary_text) return result[0].summary_text;
            if (typeof result[0] === 'string') return result[0];
        }
        if (result.generated_text) return result.generated_text;

        return null;
    }

    // Demo mode responses
    getDemoResponse(model, inputs) {
        if (model.includes('flan-t5') || model.includes('text-generation')) {
            return this.generateSmartBullet(inputs);
        }
        if (model.includes('bart') || model.includes('summarization')) {
            return inputs.substring(0, 150) + '...';
        }
        if (model.includes('grammar')) {
            return inputs; // Return as-is in demo mode
        }
        return inputs;
    }
}

// Global instance
const huggingFaceAPI = new HuggingFaceAPI();
