# AI Resume & Portfolio Builder 🚀

> Create professional resumes in minutes with AI-powered content generation

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A stunning, feature-rich web application that helps students and professionals create beautiful resumes and portfolios using AI technology. Now with a secure Node.js backend!

## ✨ Features

### 🎨 **12 Resume Templates**
- **General**: All-Purpose, ATS-Optimized, Minimalist, One-Page
- **Role-Based**: Role-Specific, Entry-Level, Executive, Career Change
- **Style-Based**: Skills-Based, Achievement-Focused, Creative/Design
- Dark mode support with multiple color themes
- Fully responsive design with smooth animations

### 🤖 **AI-Powered Content Generation**
- Professional summary generator
- Achievement bullet point enhancement
- Project description optimization
- Cover letter generation
- Transcript OCR parsing for education data
- Skill description enhancement

### 📊 **Resume Quality Tools**
- **ATS Optimizer**: Keyword analysis and scoring
- **Uniqueness Checker**: Detect generic phrases and get suggestions
- **Grammar Checker**: Powered by Hugging Face AI
- **Job Description Matcher**: Compare resume to job requirements

### 📂 **Profile Management**
- Save multiple resume versions (e.g., "Software Engineer", "Product Manager")
- Load and switch between profiles instantly
- Delete unused profiles

### 📄 **Export & Sharing**
- PDF download (print-optimized)
- DOCX export (Word format)
- DOC export (Word 97-2003, ATS-safe)
- Portfolio website generator with hosting instructions
- JSON data export/import

### 🔒 **Security & Privacy**
- **Secure Backend**: API keys hidden in server environment
- **Rate Limiting**: Protection against API abuse
- **Local Storage**: Data stays on your device
- **Privacy Manager**: Control your data with audit logs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone or download this repository**
   ```bash
   cd resume-build
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   - Edit `.env` file with your API keys:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   HF_API_KEY=your-huggingface-api-key
   ```
   - Get free keys at:
     - Gemini: https://aistudio.google.com/app/apikey
     - Hugging Face: https://huggingface.co/settings/tokens

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   - Navigate to: http://localhost:3000

## 📖 How to Use

### Step 1: Personal Information
Fill in your basic contact details including:
- Full name, email, phone
- Location
- LinkedIn, GitHub, portfolio links

### Step 2: Education
Add your educational background:
- Degree and institution
- Dates and GPA
- **NEW**: Import from transcript (AI-powered parsing)

### Step 3: Work Experience
Document your professional experience:
- Job titles and companies
- Dates and locations
- Key achievements
- Use AI to enhance descriptions

### Step 4: Skills
List your abilities:
- Technical skills
- Soft skills
- Comma-separated format

### Step 5: Projects
Showcase your work:
- Import from GitHub automatically
- Project names and descriptions
- Technologies used
- Verified badges for GitHub/GitLab links

### Step 6: ATS Analysis
- Analyze your resume for ATS compatibility
- Get keyword suggestions
- Check uniqueness score

### Step 7: Cover Letter
- AI-generated cover letters
- Tailored to job descriptions

## 🎨 Templates

| Template | Best For |
|----------|----------|
| General All-Purpose | Standard job applications |
| ATS-Optimized | Corporate/Enterprise roles |
| Minimalist | Design-conscious roles |
| One-Page | Experienced professionals |
| Role-Specific | Targeted applications |
| Entry-Level | First jobs, internships |
| Senior/Executive | Director/VP/C-level roles |
| Career Change | Pivoting careers |
| Skills-Based | Skill-heavy roles |
| Achievement-Focused | Sales, management |
| Creative/Design | Creative industries |

## 🌐 Portfolio Hosting

After generating your portfolio, deploy it for free:

1. **Netlify (Easiest)**: Drag & drop at netlify.com/drop
2. **GitHub Pages**: Upload to repo → Settings → Pages
3. **Vercel**: Connect Git repo and deploy

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **AI**: Google Gemini API, Hugging Face Inference API
- **PDF Generation**: html2pdf.js
- **Security**: Helmet, express-rate-limit, dotenv

## 📁 Project Structure

```
resume-build/
├── server.js               # Express server
├── package.json            # Dependencies
├── .env                    # API keys (private)
├── .env.example            # API key template
├── index.html              # Main application
├── css/
│   └── styles.css          # Design system
├── js/
│   ├── app.js              # Application controller
│   ├── config.js           # Configuration
│   ├── ai-engine.js        # AI content generation
│   ├── templates.js        # Resume rendering
│   ├── resume-prompts.js   # 12 template prompts
│   ├── uniqueness-checker.js # Plagiarism check
│   ├── transcript-parser.js  # OCR parsing
│   ├── portfolio-generator.js # Website generation
│   └── ...                 # Other modules
└── README.md
```

## 🔒 Security Best Practices

- Never commit `.env` to version control
- Use environment variables for all API keys
- Backend proxies all AI requests (keys never exposed to browser)
- Rate limiting prevents API abuse

## 📄 License

This project is licensed under the MIT License.

---

**Happy Resume Building! 🎉**

Made with ❤️ to help you land your dream job!
