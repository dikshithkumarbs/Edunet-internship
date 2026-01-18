// DOCX Export - Generate Word documents from resume
class DocxExport {
    constructor() {
        this.docxLoaded = false;
        this.loadDocxLibrary();
    }

    // Load docx.js library dynamically
    async loadDocxLibrary() {
        if (window.docx) {
            this.docxLoaded = true;
            return;
        }

        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/docx/8.5.0/index.umd.min.js'
        ];

        for (const url of cdnUrls) {
            try {
                await this.loadScript(url);
                if (window.docx) {
                    this.docxLoaded = true;
                    return;
                }
            } catch (e) {
                console.warn('Failed to load docx from:', url);
            }
        }
        console.error('Could not load docx library from any CDN');
    }

    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Generate DOCX file
    async generateDocx(resumeData, filename = 'resume') {
        await this.loadDocxLibrary();

        if (!window.docx) {
            throw new Error('DOCX library not loaded');
        }

        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
            BorderStyle, TabStopType, TabStopPosition } = window.docx;

        // Create document
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 720, right: 720, bottom: 720, left: 720 // 0.5 inch margins
                        }
                    }
                },
                children: this.buildDocumentContent(resumeData, { Paragraph, TextRun, HeadingLevel, AlignmentType })
            }]
        });

        // Generate and download
        const blob = await Packer.toBlob(doc);
        this.downloadBlob(blob, `${filename}.docx`);

        return true;
    }

    // Build document content
    buildDocumentContent(data, { Paragraph, TextRun, HeadingLevel, AlignmentType }) {
        const content = [];

        // Header - Name
        if (data.personalInfo?.fullName) {
            content.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                    new TextRun({
                        text: data.personalInfo.fullName,
                        bold: true,
                        size: 36 // 18pt
                    })
                ]
            }));
        }

        // Contact Info
        const contactParts = [
            data.personalInfo?.email,
            data.personalInfo?.phone,
            data.personalInfo?.location
        ].filter(Boolean);

        if (contactParts.length > 0) {
            content.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: contactParts.join(' | '),
                        size: 20 // 10pt
                    })
                ]
            }));
        }

        // Links
        const links = [
            data.personalInfo?.linkedin,
            data.personalInfo?.github,
            data.personalInfo?.portfolio
        ].filter(Boolean);

        if (links.length > 0) {
            content.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                children: [
                    new TextRun({
                        text: links.join(' | '),
                        size: 18,
                        color: '0066CC'
                    })
                ]
            }));
        }

        // Summary
        if (data.summary) {
            content.push(this.createSectionHeader('Professional Summary', { Paragraph, TextRun }));
            content.push(new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: data.summary, size: 22 })
                ]
            }));
        }

        // Experience
        if (data.experience?.length > 0) {
            content.push(this.createSectionHeader('Professional Experience', { Paragraph, TextRun }));

            data.experience.forEach(exp => {
                // Title and dates
                content.push(new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: exp.title || '', bold: true, size: 22 }),
                        new TextRun({ text: `  |  ${exp.startDate} - ${exp.endDate}`, size: 20, italics: true })
                    ]
                }));

                // Company
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: exp.company || '', italics: true, size: 20 }),
                        exp.location ? new TextRun({ text: `, ${exp.location}`, size: 20 }) : null
                    ].filter(Boolean)
                }));

                // Achievements
                if (exp.achievements?.length > 0) {
                    exp.achievements.forEach(ach => {
                        content.push(new Paragraph({
                            bullet: { level: 0 },
                            spacing: { before: 50 },
                            children: [
                                new TextRun({ text: ach, size: 20 })
                            ]
                        }));
                    });
                }
            });
        }

        // Education
        if (data.education?.length > 0) {
            content.push(this.createSectionHeader('Education', { Paragraph, TextRun }));

            data.education.forEach(edu => {
                content.push(new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: edu.degree || '', bold: true, size: 22 }),
                        new TextRun({ text: `  |  ${edu.startDate} - ${edu.endDate}`, size: 20, italics: true })
                    ]
                }));

                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: edu.institution || '', italics: true, size: 20 }),
                        edu.gpa ? new TextRun({ text: ` | GPA: ${edu.gpa}`, size: 20 }) : null
                    ].filter(Boolean)
                }));
            });
        }

        // Skills
        if (data.skills?.technical?.length > 0 || data.skills?.soft?.length > 0) {
            content.push(this.createSectionHeader('Skills', { Paragraph, TextRun }));

            if (data.skills.technical?.length > 0) {
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Technical: ', bold: true, size: 20 }),
                        new TextRun({ text: data.skills.technical.join(', '), size: 20 })
                    ]
                }));
            }

            if (data.skills.soft?.length > 0) {
                content.push(new Paragraph({
                    children: [
                        new TextRun({ text: 'Soft Skills: ', bold: true, size: 20 }),
                        new TextRun({ text: data.skills.soft.join(', '), size: 20 })
                    ]
                }));
            }
        }

        // Projects
        if (data.projects?.length > 0) {
            content.push(this.createSectionHeader('Projects', { Paragraph, TextRun }));

            data.projects.forEach(proj => {
                content.push(new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: proj.name || '', bold: true, size: 22 })
                    ]
                }));

                if (proj.description) {
                    content.push(new Paragraph({
                        children: [
                            new TextRun({ text: proj.description, size: 20 })
                        ]
                    }));
                }

                if (proj.technologies?.length > 0) {
                    content.push(new Paragraph({
                        children: [
                            new TextRun({ text: 'Technologies: ', bold: true, size: 18 }),
                            new TextRun({ text: proj.technologies.join(', '), size: 18, italics: true })
                        ]
                    }));
                }
            });
        }

        return content;
    }

    // Create section header with underline
    createSectionHeader(title, { Paragraph, TextRun }) {
        return new Paragraph({
            spacing: { before: 300, after: 100 },
            border: {
                bottom: { color: '000000', size: 1, style: 'single' }
            },
            children: [
                new TextRun({
                    text: title.toUpperCase(),
                    bold: true,
                    size: 24
                })
            ]
        });
    }

    // Download blob as file
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ==========================================
    // Word 97-2003 (.doc) Format - ATS Optimized
    // ==========================================
    // Many ATS systems cannot read newer .docx formats
    // This generates a simpler .doc using HTML conversion

    generateDoc(resumeData, filename = 'resume') {
        const htmlContent = this.buildDocHtml(resumeData);

        // Create Word-compatible HTML document
        const docContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:w="urn:schemas-microsoft-com:office:word"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; margin: 0.5in; }
                    h1 { font-size: 18pt; margin: 0 0 5pt 0; text-align: center; }
                    h2 { font-size: 12pt; margin: 15pt 0 5pt 0; border-bottom: 1px solid #000; text-transform: uppercase; }
                    .contact { text-align: center; font-size: 10pt; margin-bottom: 10pt; }
                    .section { margin-bottom: 10pt; }
                    .entry { margin-bottom: 8pt; }
                    .entry-header { font-weight: bold; }
                    .entry-subtitle { font-style: italic; }
                    ul { margin: 5pt 0 5pt 20pt; padding: 0; }
                    li { margin-bottom: 3pt; }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        // Create blob with Word MIME type
        const blob = new Blob([docContent], {
            type: 'application/msword'
        });

        this.downloadBlob(blob, `${filename}.doc`);

        // Log export action
        if (typeof PrivacyManager !== 'undefined') {
            PrivacyManager.logAction('export_doc');
        }

        return true;
    }

    // Build HTML content for DOC format
    buildDocHtml(data) {
        let html = '';

        // Name
        if (data.personalInfo?.fullName) {
            html += `<h1>${this.escapeHtml(data.personalInfo.fullName)}</h1>`;
        }

        // Contact
        const contact = [
            data.personalInfo?.email,
            data.personalInfo?.phone,
            data.personalInfo?.location
        ].filter(Boolean);

        if (contact.length > 0) {
            html += `<p class="contact">${contact.map(c => this.escapeHtml(c)).join(' | ')}</p>`;
        }

        // Links
        const links = [
            data.personalInfo?.linkedin,
            data.personalInfo?.github,
            data.personalInfo?.portfolio
        ].filter(Boolean);

        if (links.length > 0) {
            html += `<p class="contact">${links.map(l => this.escapeHtml(l)).join(' | ')}</p>`;
        }

        // Summary
        if (data.summary) {
            html += `<h2>Professional Summary</h2>`;
            html += `<p>${this.escapeHtml(data.summary)}</p>`;
        }

        // Experience
        if (data.experience?.length > 0) {
            html += `<h2>Professional Experience</h2>`;
            data.experience.forEach(exp => {
                html += `<div class="entry">`;
                html += `<p class="entry-header">${this.escapeHtml(exp.title || '')} | ${this.escapeHtml(exp.startDate || '')} - ${this.escapeHtml(exp.endDate || '')}</p>`;
                html += `<p class="entry-subtitle">${this.escapeHtml(exp.company || '')}${exp.location ? ', ' + this.escapeHtml(exp.location) : ''}</p>`;
                if (exp.achievements?.length > 0) {
                    html += `<ul>`;
                    exp.achievements.forEach(ach => {
                        html += `<li>${this.escapeHtml(ach)}</li>`;
                    });
                    html += `</ul>`;
                }
                html += `</div>`;
            });
        }

        // Education
        if (data.education?.length > 0) {
            html += `<h2>Education</h2>`;
            data.education.forEach(edu => {
                html += `<div class="entry">`;
                html += `<p class="entry-header">${this.escapeHtml(edu.degree || '')} | ${this.escapeHtml(edu.startDate || '')} - ${this.escapeHtml(edu.endDate || '')}</p>`;
                html += `<p class="entry-subtitle">${this.escapeHtml(edu.institution || '')}${edu.gpa ? ' | GPA: ' + this.escapeHtml(edu.gpa) : ''}</p>`;
                html += `</div>`;
            });
        }

        // Skills
        if (data.skills?.technical?.length > 0 || data.skills?.soft?.length > 0) {
            html += `<h2>Skills</h2>`;
            if (data.skills.technical?.length > 0) {
                html += `<p><strong>Technical:</strong> ${data.skills.technical.map(s => this.escapeHtml(s)).join(', ')}</p>`;
            }
            if (data.skills.soft?.length > 0) {
                html += `<p><strong>Soft Skills:</strong> ${data.skills.soft.map(s => this.escapeHtml(s)).join(', ')}</p>`;
            }
        }

        // Projects
        if (data.projects?.length > 0) {
            html += `<h2>Projects</h2>`;
            data.projects.forEach(proj => {
                html += `<div class="entry">`;
                html += `<p class="entry-header">${this.escapeHtml(proj.name || '')}</p>`;
                if (proj.description) {
                    html += `<p>${this.escapeHtml(proj.description)}</p>`;
                }
                if (proj.technologies?.length > 0) {
                    html += `<p><em>Technologies: ${proj.technologies.map(t => this.escapeHtml(t)).join(', ')}</em></p>`;
                }
                html += `</div>`;
            });
        }

        return html;
    }

    // Escape HTML special characters
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Create global instance
const docxExport = new DocxExport();

