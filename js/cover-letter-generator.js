// Cover Letter Generator with AI
class CoverLetterGenerator {
    constructor() {
        this.tones = {
            formal: {
                name: 'Formal & Professional',
                description: 'Traditional and respectful tone for corporate positions',
                greeting: 'Dear Hiring Manager,',
                closing: 'Sincerely,'
            },
            friendly: {
                name: 'Friendly & Approachable',
                description: 'Warm and personable for startup/creative roles',
                greeting: 'Hello!',
                closing: 'Best regards,'
            },
            confident: {
                name: 'Confident & Direct',
                description: 'Assertive and impactful for leadership roles',
                greeting: 'Dear Hiring Team,',
                closing: 'With enthusiasm,'
            },
            enthusiastic: {
                name: 'Enthusiastic & Passionate',
                description: 'Energetic and motivated for entry-level positions',
                greeting: 'Dear Hiring Manager,',
                closing: 'Excitedly,'
            }
        };

        this.templates = {
            standard: this.standardTemplate.bind(this),
            technical: this.technicalTemplate.bind(this),
            creative: this.creativeTemplate.bind(this),
            entrylevel: this.entryLevelTemplate.bind(this)
        };
    }

    // Main cover letter generation function
    async generateCoverLetter(resumeData, jobInfo, tone = 'formal') {
        const toneConfig = this.tones[tone] || this.tones.formal;

        // Use AI if available
        if (!CONFIG.AI.DEMO_MODE && CONFIG.AI.API_KEY) {
            return await this.generateWithAI(resumeData, jobInfo, toneConfig);
        }

        // Fallback to template-based generation
        return this.generateWithTemplate(resumeData, jobInfo, toneConfig);
    }

    // AI-powered generation
    async generateWithAI(resumeData, jobInfo, toneConfig) {
        const prompt = this.buildAIPrompt(resumeData, jobInfo, toneConfig);

        try {
            const response = await aiEngine.callGeminiAPI(prompt);
            return this.formatCoverLetter(response, resumeData, toneConfig);
        } catch (error) {
            console.error('AI generation failed, using template:', error);
            return this.generateWithTemplate(resumeData, jobInfo, toneConfig);
        }
    }

    // Build AI prompt for cover letter
    buildAIPrompt(resumeData, jobInfo, toneConfig) {
        return `Write a professional cover letter with a ${toneConfig.name.toLowerCase()} tone for:

Applicant: ${resumeData.personalInfo.fullName}
Position: ${jobInfo.title || 'the position'}
Company: ${jobInfo.company || 'your company'}

Applicant Background:
- Education: ${resumeData.education?.[0]?.degree || 'Student'}
- Key Skills: ${resumeData.skills?.technical?.slice(0, 6).join(', ') || 'various technical skills'}
- Experience: ${resumeData.experience?.[0]?.title || 'Entry level'} at ${resumeData.experience?.[0]?.company || 'previous company'}
- Top Project: ${resumeData.projects?.[0]?.name || 'Various projects'}

${jobInfo.description ? `Job Description:\n${jobInfo.description.substring(0, 500)}` : ''}

Requirements:
1. Use greeting: "${toneConfig.greeting}"
2. Write 3-4 concise paragraphs (250-350 words total)
3. Opening: Express interest and mention how you learned about the position
4. Body 1: Highlight 2-3 relevant skills/experiences that match the role
5. Body 2: Explain why you're interested in this company/position
6. Closing: Express enthusiasm and mention next steps
7. End with: "${toneConfig.closing}"
8. Do NOT include address or date at top
9. Be specific and avoid generic statements
10. Focus on unique value proposition

Return ONLY the cover letter text, no extra formatting or explanations.`;
    }

    // Template-based generation
    generateWithTemplate(resumeData, jobInfo, toneConfig) {
        const template = this.templates.standard;
        return template(resumeData, jobInfo, toneConfig);
    }

    // Standard cover letter template
    standardTemplate(resumeData, jobInfo, toneConfig) {
        const name = resumeData.personalInfo.fullName || 'Your Name';
        const position = jobInfo.title || 'this position';
        const company = jobInfo.company || 'your company';
        const topSkills = resumeData.skills?.technical?.slice(0, 3).join(', ') || 'my technical skills';
        const experience = resumeData.experience?.[0]?.title || 'my previous experience';
        const degree = resumeData.education?.[0]?.degree || 'my degree';

        return `${toneConfig.greeting}

I am writing to express my strong interest in the ${position} position at ${company}. As a motivated professional with expertise in ${topSkills}, I am excited about the opportunity to contribute to your team and help drive innovation.

Throughout my academic and professional journey as ${experience}, I have developed a strong foundation in software development and problem-solving. My ${degree} has equipped me with both theoretical knowledge and practical skills that align well with your requirements. I am particularly drawn to ${company}'s commitment to excellence and innovation in the industry.

In my recent projects and roles, I have consistently demonstrated my ability to deliver high-quality results. My hands-on experience with ${topSkills} has prepared me to make meaningful contributions from day one. I am particularly impressed by ${company}'s work and mission, and I am eager to apply my skills to help achieve your goals.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm align with ${company}'s needs. Thank you for considering my application. I look forward to the possibility of contributing to your team.

${toneConfig.closing}
${name}`;
    }

    // Technical role template
    technicalTemplate(resumeData, jobInfo, toneConfig) {
        const name = resumeData.personalInfo.fullName || 'Your Name';
        const position = jobInfo.title || 'Software Engineer';
        const company = jobInfo.company || 'your company';
        const techStack = resumeData.skills?.technical?.slice(0, 5).join(', ') || 'modern technologies';
        const project = resumeData.projects?.[0]?.name || 'various technical projects';

        return `${toneConfig.greeting}

I am excited to apply for the ${position} role at ${company}. With hands-on experience in ${techStack} and a passion for building scalable solutions, I am confident in my ability to contribute to your engineering team.

My technical background includes development with ${techStack}, which I have applied in projects such as ${project}. I thrive in collaborative environments where I can leverage technology to solve complex problems and deliver user-centric solutions. The technical challenges at ${company} align perfectly with my skills and career aspirations.

I am particularly impressed by ${company}'s innovative approach and would be thrilled to contribute my technical expertise to your projects. My problem-solving abilities, combined with my enthusiasm for learning new technologies, make me a strong fit for your team.

I would appreciate the opportunity to discuss how I can contribute to ${company}'s success. Thank you for your consideration.

${toneConfig.closing}
${name}`;
    }

    // Creative role template
    creativeTemplate(resumeData, jobInfo, toneConfig) {
        const name = resumeData.personalInfo.fullName || 'Your Name';
        const position = jobInfo.title || 'this creative position';
        const company = jobInfo.company || 'your company';

        return `${toneConfig.greeting}

The ${position} opportunity at ${company} immediately caught my attention, and I knew I had to apply. As a creative professional who thrives on innovation and bringing ideas to life, I am excited about the possibility of joining your team.

My portfolio demonstrates my ability to blend creativity with technical execution. I approach every project with fresh perspective and attention to detail, ensuring that the final result not only meets requirements but exceeds expectations. What draws me to ${company} is your reputation for pushing creative boundaries while maintaining excellence.

I am passionate about creating impactful work that resonates with audiences. My collaborative nature and adaptability allow me to work effectively in dynamic environments, and I am always eager to learn and grow. I believe my creative vision aligns well with ${company}'s innovative spirit.

I would love the opportunity to discuss how my creative approach and skills can contribute to ${company}'s continued success. Thank you for considering my application.

${toneConfig.closing}
${name}`;
    }

    // Entry-level template
    entryLevelTemplate(resumeData, jobInfo, toneConfig) {
        const name = resumeData.personalInfo.fullName || 'Your Name';
        const position = jobInfo.title || 'this position';
        const company = jobInfo.company || 'your company';
        const degree = resumeData.education?.[0]?.degree || 'my degree';
        const skills = resumeData.skills?.technical?.slice(0, 4).join(', ') || 'relevant skills';

        return `${toneConfig.greeting}

As a recent graduate with ${degree} and a passion for continuous learning, I am excited to apply for the ${position} role at ${company}. I am eager to launch my professional career with an organization known for excellence and innovation.

During my academic journey, I have built a strong foundation in ${skills} through coursework, projects, and internships. My hands-on experience has taught me the importance of collaboration, attention to detail, and delivering quality work. I am particularly drawn to ${company}'s mission and the opportunity to grow alongside experienced professionals.

What I lack in years of experience, I make up for with enthusiasm, adaptability, and a strong work ethic. I am a quick learner who embraces challenges and feedback as opportunities for growth. I am confident that my fresh perspective and dedication would make me a valuable addition to your team.

I would greatly appreciate the opportunity to discuss how I can contribute to ${company}'s success while developing my skills. Thank you for your consideration.

${toneConfig.closing}
${name}`;
    }

    // Format cover letter with proper structure
    formatCoverLetter(content, resumeData, toneConfig) {
        // Ensure proper greeting and closing if AI didn't include them
        if (!content.includes(toneConfig.greeting)) {
            content = `${toneConfig.greeting}\n\n${content}`;
        }

        if (!content.includes(toneConfig.closing)) {
            content = `${content}\n\n${toneConfig.closing}\n${resumeData.personalInfo.fullName}`;
        }

        return content;
    }

    // Generate multiple versions for A/B testing
    async generateMultipleVersions(resumeData, jobInfo, count = 3) {
        const versions = [];
        const tones = Object.keys(this.tones).slice(0, count);

        for (const tone of tones) {
            const letter = await this.generateCoverLetter(resumeData, jobInfo, tone);
            versions.push({
                tone: this.tones[tone].name,
                content: letter
            });
        }

        return versions;
    }

    // Analyze cover letter quality
    analyzeCoverLetter(content) {
        const wordCount = content.split(/\s+/).length;
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

        return {
            wordCount: wordCount,
            paragraphCount: paragraphs.length,
            optimalLength: wordCount >= 250 && wordCount <= 400,
            hasGreeting: /dear|hello|hi/i.test(content),
            hasClosing: /sincerely|regards|best|respectfully/i.test(content),
            quality: this.calculateQuality(content, wordCount, paragraphs.length)
        };
    }

    // Calculate quality score
    calculateQuality(content, wordCount, paragraphCount) {
        let score = 0;

        // Word count (optimal: 250-400)
        if (wordCount >= 250 && wordCount <= 400) score += 30;
        else if (wordCount >= 200 && wordCount <= 500) score += 20;
        else score += 10;

        // Paragraph structure (optimal: 3-5)
        if (paragraphCount >= 3 && paragraphCount <= 5) score += 25;
        else score += 10;

        // Has greeting and closing
        if (/dear|hello|hi/i.test(content)) score += 15;
        if (/sincerely|regards|best|respectfully/i.test(content)) score += 15;

        // Has personal pronouns (shows personalization)
        if (/\bI\b|\bmy\b|\bme\b/i.test(content)) score += 10;

        // Has company reference
        if (content.toLowerCase().includes('company') || content.toLowerCase().includes('organization')) score += 5;

        return Math.min(100, score);
    }

    // Get cover letter tips
    getCoverLetterTips() {
        return [
            'Keep it concise: 250-400 words (3-4 paragraphs)',
            'Address hiring manager by name if possible',
            'Reference specific job requirements from the posting',
            'Highlight 2-3 key achievements that match the role',
            'Show enthusiasm for the company and position',
            'Explain why you\'re interested in this specific company',
            'Use concrete examples and metrics',
            'Avoid simply repeating your resume',
            'Proofread carefully for errors',
            'Close with a clear call to action'
        ];
    }
}

// Create global instance
const coverLetterGen = new CoverLetterGenerator();
