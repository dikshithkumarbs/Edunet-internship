// AI Engine for generating resume content
class AIEngine {
    constructor() {
        this.apiBaseUrl = CONFIG.AI.API_BASE_URL;
        this.model = CONFIG.AI.MODEL;
        this.demoMode = false;

        // Rate limiting - prevent API abuse
        this.lastCallTime = 0;
        this.minInterval = 1000; // 1 second between calls

        // Response caching - improve performance
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    }

    // Rate limit helper - wait if needed
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;
        if (timeSinceLastCall < this.minInterval) {
            await new Promise(resolve =>
                setTimeout(resolve, this.minInterval - timeSinceLastCall)
            );
        }
        this.lastCallTime = Date.now();
    }

    // Check cache for existing response
    getCachedResponse(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.time < this.cacheTTL) {
            return cached.data;
        }
        return null;
    }

    // Store response in cache
    setCacheResponse(key, data) {
        this.cache.set(key, { data, time: Date.now() });
        // Clean old entries
        if (this.cache.size > 50) {
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
    }

    // Main API call to Gemini (Proxied via Backend)
    async callGeminiAPI(prompt) {

        // Check cache first
        const cacheKey = prompt.substring(0, 100);
        const cached = this.getCachedResponse(cacheKey);
        if (cached) return cached;

        // Rate limit
        await this.waitForRateLimit();

        try {
            const response = await fetch(CONFIG.AI.API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: this.model
                })
            });

            if (!response.ok) {
                console.error('Backend API Error:', response.status);
                return null;
            }

            const data = await response.json();

            // Cache and return
            if (data.text) {
                this.setCacheResponse(cacheKey, data.text);
                return data.text;
            } else {
                return null;
            }
        } catch (error) {
            console.error('AI API Error:', error);
            return null;
        }
    }



    // Generate professional summary with industry context
    async generateSummary(personalInfo, education, skills, industry = 'technology', tone = 'professional') {
        const industryContext = this.getIndustryContext(industry);

        const prompt = `You are an expert resume writer with 15+ years of experience. Generate a compelling professional summary.

REQUIREMENTS:
- Write exactly 2-3 impactful sentences
- DO NOT start with the person's name
- Start with a strong descriptor (e.g., "Results-driven", "Innovative", "Strategic")
- Include years of experience if inferable
- Mention 2-3 key technical skills
- Include a measurable achievement if possible
- Match the tone: ${tone}
- Industry focus: ${industryContext.name}

TONE GUIDELINES:
- professional: Formal, corporate-friendly, emphasizes qualifications
- modern: Conversational yet professional, shows personality
- creative: Bold, unique phrasing, highlights innovation
- academic: Research-focused, emphasizes education and publications

GOOD EXAMPLES:
1. "Results-driven Software Engineer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and AWS, with a track record of reducing load times by 40% and improving user engagement."
2. "Strategic Product Manager who transforms complex technical requirements into user-centric solutions. Led cross-functional teams to launch 3 products generating $2M+ in annual revenue."

BAD EXAMPLES (avoid these):
- "I am a hardworking professional..." (first person)
- "John Smith is a developer..." (starting with name)
- "Seeking a position to utilize my skills..." (objective statement)

USER DATA:
Name: ${personalInfo.fullName || 'Professional'}
Education: ${education[0]?.degree || 'Bachelor\'s degree'} from ${education[0]?.institution || 'University'}
Key Skills: ${skills.technical?.slice(0, 6).join(', ') || 'Various technical skills'}
Soft Skills: ${skills.soft?.slice(0, 3).join(', ') || 'Team collaboration'}

Generate ONLY the summary text, no quotes or labels:`;

        return await this.callGeminiAPI(prompt);
    }

    // Get industry-specific context
    getIndustryContext(industry) {
        const industries = {
            technology: {
                name: 'Technology & Software',
                keywords: ['scalable', 'innovative', 'agile', 'full-stack', 'cloud-native'],
                focus: 'Technical achievements, system improvements, code quality'
            },
            finance: {
                name: 'Finance & Banking',
                keywords: ['analytical', 'compliance', 'risk management', 'portfolio', 'ROI'],
                focus: 'Quantitative results, regulatory compliance, financial impact'
            },
            healthcare: {
                name: 'Healthcare & Medical',
                keywords: ['patient-centered', 'clinical', 'HIPAA', 'evidence-based', 'care quality'],
                focus: 'Patient outcomes, quality metrics, compliance, care improvements'
            },
            marketing: {
                name: 'Marketing & Communications',
                keywords: ['brand', 'engagement', 'ROI', 'conversion', 'campaign'],
                focus: 'Campaign results, engagement metrics, brand growth'
            },
            education: {
                name: 'Education & Academia',
                keywords: ['curriculum', 'student outcomes', 'research', 'pedagogy', 'assessment'],
                focus: 'Student success, research contributions, curriculum development'
            },
            consulting: {
                name: 'Consulting & Strategy',
                keywords: ['strategic', 'client-facing', 'deliverables', 'stakeholder', 'transformation'],
                focus: 'Client impact, project delivery, strategic recommendations'
            }
        };
        return industries[industry] || industries.technology;
    }

    // Generate achievement bullet points with STAR method
    async generateAchievements(role, company, basicDescription, industry = 'technology') {
        const industryContext = this.getIndustryContext(industry);

        const prompt = `You are an expert resume writer. Generate 3-4 achievement-focused bullet points using the STAR method (Situation, Task, Action, Result).

REQUIREMENTS:
- Start each bullet with a strong ACTION VERB
- Include SPECIFIC METRICS (percentages, dollar amounts, time saved)
- Show IMPACT and RESULTS, not just responsibilities
- Keep each bullet to 1-2 lines (under 150 characters)
- Use industry-relevant language for: ${industryContext.name}

STRONG ACTION VERBS TO USE:
Technical: Developed, Engineered, Architected, Optimized, Automated, Deployed
Leadership: Led, Managed, Directed, Mentored, Coordinated, Spearheaded
Results: Increased, Reduced, Improved, Achieved, Delivered, Generated

GOOD BULLET EXAMPLES:
- "Architected microservices platform serving 2M+ daily users, reducing latency by 60%"
- "Led team of 8 engineers to deliver product 3 weeks ahead of schedule"
- "Automated CI/CD pipeline, reducing deployment time from 4 hours to 15 minutes"

BAD BULLET EXAMPLES (avoid):
- "Responsible for developing software" (passive, no metrics)
- "Worked on various projects" (vague)
- "Helped the team with tasks" (weak verb)

ROLE CONTEXT:
Role: ${role}
Company: ${company}
Description: ${basicDescription || 'General responsibilities in the role'}
Industry Focus: ${industryContext.focus}

Generate 3-4 bullet points, each starting with "• ":`;

        return await this.callGeminiAPI(prompt);
    }

    // Enhanced cover letter generation
    async generateCoverLetter(resumeData, jobTitle, companyName, tone = 'formal') {
        const toneGuide = {
            formal: 'Traditional, respectful, focuses on qualifications',
            enthusiastic: 'Energetic, shows genuine excitement, still professional',
            modern: 'Conversational but professional, shows personality',
            creative: 'Unique voice, memorable opening, shows creativity'
        };

        const prompt = `You are an expert career coach. Write a compelling cover letter.

REQUIREMENTS:
- 3-4 paragraphs maximum
- Opening: Hook that shows genuine interest in THIS specific company
- Body: Connect YOUR specific skills to THEIR specific needs
- Closing: Clear call to action
- Tone: ${toneGuide[tone] || toneGuide.formal}
- Length: 250-350 words

STRUCTURE:
Paragraph 1: Opening hook + position you're applying for
Paragraph 2: Your relevant experience + achievements (with metrics)
Paragraph 3: Why this company specifically + cultural fit
Paragraph 4: Call to action + thank you

APPLICANT DATA:
Name: ${resumeData.personalInfo?.fullName || 'Applicant'}
Position Applied: ${jobTitle}
Target Company: ${companyName}
Current/Recent Role: ${resumeData.experience?.[0]?.title || 'Professional'} at ${resumeData.experience?.[0]?.company || 'Previous Company'}
Key Skills: ${resumeData.skills?.technical?.slice(0, 5).join(', ') || 'Various skills'}
Education: ${resumeData.education?.[0]?.degree || 'Degree'} from ${resumeData.education?.[0]?.institution || 'University'}
Key Achievement: ${resumeData.experience?.[0]?.achievements?.[0] || 'Delivered successful projects'}

Write the cover letter with proper greeting and closing:`;

        return await this.callGeminiAPI(prompt);
    }

    // Optimize project description
    async optimizeProjectDescription(projectName, currentDescription, technologies, industry = 'technology') {
        const prompt = `You are a technical writer optimizing project descriptions for resumes.

REQUIREMENTS:
- 2-3 sentences maximum
- Start with an action verb
- Highlight the PROBLEM solved or VALUE created
- Mention 2-3 key technologies naturally
- Include a metric if possible (users, performance, time saved)
- Make it ATS-friendly with relevant keywords

PROJECT DETAILS:
Name: ${projectName}
Current Description: ${currentDescription}
Technologies: ${technologies.join(', ')}

GOOD EXAMPLE:
"Developed a real-time analytics dashboard processing 10K+ events/second, enabling data-driven decisions that increased conversion by 25%. Built with React, Node.js, and Redis."

OUTPUT ONLY the optimized description:`;

        return await this.callGeminiAPI(prompt);
    }

    // Parse transcript text to extract education details
    async parseTranscript(text) {
        const prompt = `You are an intelligent document parser. Extract education details from the following transcript text.
        
RESPONSE FORMAT:
Return ONLY a valid JSON array of objects with these fields (use null if not found):
[
  {
    "institution": "University Name",
    "degree": "Degree Name (e.g. Bachelor of Science in CS)",
    "startDate": "Month Year",
    "endDate": "Month Year",
    "gpa": "3.8/4.0",
    "courses": ["Course 1", "Course 2", "Course 3"] (extract top 5-6 major courses)
  }
]

TRANSCRIPT TEXT:
${text.substring(0, 3000)}

Constraint: Output valid JSON only. No markdown formatting.`;

        // Should return a JSON string
        const jsonStr = await this.callGeminiAPI(prompt);

        // Clean markdown code blocks if present
        const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse AI response as JSON:', e);
            return null; // Fallback or empty result
        }
    }

    // AI-Powered Resume Parsing - Extract ALL content from resume text
    async parseResume(resumeText) {
        const prompt = `You are an expert resume parser. Extract ALL information from this resume text into a structured JSON format.

REQUIREMENTS:
- Extract EVERY piece of information you can find
- Be thorough - don't miss any experience, education, skill, or project
- Parse dates in any format (Jan 2020, 01/2020, 2020, etc.)
- Extract achievements/bullets from experience entries
- Categorize skills as technical or soft

RESPONSE FORMAT - Return ONLY valid JSON:
{
    "personalInfo": {
        "fullName": "Full Name",
        "jobHeadline": "Professional Title (e.g., Software Engineer)",
        "email": "email@example.com",
        "phone": "+1 234 567 8900",
        "linkedin": "linkedin.com/in/username",
        "github": "github.com/username",
        "location": "City, Country",
        "portfolio": "website.com"
    },
    "summary": "Professional summary text if present",
    "experience": [
        {
            "title": "Job Title",
            "company": "Company Name",
            "startDate": "Jan 2020",
            "endDate": "Present",
            "location": "City, Country",
            "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
        }
    ],
    "education": [
        {
            "degree": "Degree Name",
            "institution": "University Name",
            "startDate": "2016",
            "endDate": "2020",
            "gpa": "3.8",
            "field": "Field of Study"
        }
    ],
    "skills": {
        "technical": ["Skill1", "Skill2", "Skill3"],
        "soft": ["Soft Skill1", "Soft Skill2"]
    },
    "projects": [
        {
            "name": "Project Name",
            "description": "Description of what the project does",
            "technologies": ["Tech1", "Tech2"],
            "link": "github.com/project"
        }
    ],
    "languages": ["English (Native)", "French (B2)"],
    "awards": ["Employee of the Month", "Hackathon Winner 2023", "AWS Certified Cloud Practitioner"]
}

RESUME TEXT:
${resumeText.substring(0, 6000)}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no explanations.`;

        try {
            const response = await this.callGeminiAPI(prompt);

            // Clean any markdown formatting
            let cleanJson = response
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim();

            // Try to find JSON object in response
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanJson = jsonMatch[0];
            }

            const parsed = JSON.parse(cleanJson);
            return parsed;
        } catch (e) {
            console.error('AI Resume Parse Error:', e);
            return null;
        }
    }

    // Suggest action verbs for experience
    getActionVerbs() {
        return [
            'Developed', 'Implemented', 'Designed', 'Created', 'Built',
            'Optimized', 'Improved', 'Increased', 'Reduced', 'Streamlined',
            'Collaborated', 'Led', 'Managed', 'Coordinated', 'Facilitated',
            'Analyzed', 'Researched', 'Evaluated', 'Assessed', 'Monitored',
            'Launched', 'Delivered', 'Achieved', 'Exceeded', 'Accomplished'
        ];
    }

    // Batch generate content for entire resume
    async generateFullResume(basicData) {
        const results = {
            summary: null,
            enhancedExperiences: [],
            enhancedProjects: [],
            coverLetter: null
        };

        // Generate summary
        if (basicData.personalInfo && basicData.education && basicData.skills) {
            results.summary = await this.generateSummary(
                basicData.personalInfo,
                basicData.education,
                basicData.skills
            );
        }

        // Enhance experiences
        if (basicData.experience && basicData.experience.length > 0) {
            for (const exp of basicData.experience) {
                const achievements = await this.generateAchievements(
                    exp.title,
                    exp.company,
                    exp.description || 'General responsibilities'
                );
                if (achievements) {
                    results.enhancedExperiences.push({
                        ...exp,
                        achievements: achievements.split('\n').filter(line => line.trim())
                    });
                }
            }
        }

        // Enhance projects
        if (basicData.projects && basicData.projects.length > 0) {
            for (const project of basicData.projects) {
                const optimizedDesc = await this.optimizeProjectDescription(
                    project.name,
                    project.description,
                    project.technologies || []
                );
                if (optimizedDesc) {
                    results.enhancedProjects.push({
                        ...project,
                        description: optimizedDesc
                    });
                }
            }
        }

        return results;
    }
}

// Create global instance
const aiEngine = new AIEngine();
