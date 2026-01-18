// Transcript Parser Module
// Extracts education details from transcript text using AI

const TranscriptParser = {
    // Show the transcript import modal
    showModal() {
        const modalHtml = `
            <div class="privacy-modal-overlay" id="transcript-modal">
                <div class="privacy-modal">
                    <div class="privacy-modal-header" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));">
                        <h3>🎓 Import Transcript</h3>
                        <button class="privacy-modal-close" onclick="TranscriptParser.closeModal()">×</button>
                    </div>
                    <div class="privacy-modal-body">
                        <div class="privacy-section">
                            <h4>Paste Transcript Text</h4>
                            <p>Copy text from your academic transcript PDF or portal and paste it below. Our AI will extract your degree, GPA, and coursework.</p>
                            <textarea class="transcript-area" id="transcript-text" placeholder="Paste transcript text here...\n\nExample:\nUniversity of Technology\nBachelor of Science in Computer Science\nGPA: 3.8\nFall 2023\n- Data Structures (A)\n- Algorithms (A-)"></textarea>
                        </div>
                        
                        <div class="privacy-note">
                            <strong>Note:</strong> Data is processed locally and via secure AI. We do not store your transcript.
                        </div>
                    </div>
                    <div class="privacy-modal-footer">
                        <button class="btn btn-secondary" onclick="TranscriptParser.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="TranscriptParser.parse()" id="parse-transcript-btn">
                            ✨ Extract Data with AI
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('transcript-modal');
        if (modal) modal.remove();
    },

    // Parse the pasted text
    async parse() {
        const text = document.getElementById('transcript-text').value;
        if (!text || text.trim().length < 10) {
            alert('Please paste valid transcript text.');
            return;
        }

        const btn = document.getElementById('parse-transcript-btn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Analyzing...';

        try {
            // Call AI Engine
            const results = await aiEngine.parseTranscript(text);

            if (results && results.length > 0) {
                this.populateEducation(results);
                this.closeModal();
                const count = results.length;
                alert(`✅ Successfully extracted ${count} education entr${count > 1 ? 'ies' : 'y'}!`);
            } else {
                throw new Error('Could not extract valid data.');
            }
        } catch (error) {
            console.error('Transcript parse error:', error);
            alert('⚠️ Failed to extract data. Please check the text and try again.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    },

    // Populate education section with results
    populateEducation(entries) {
        const container = document.getElementById('education-container');
        if (!container) return;

        // Add each entry
        entries.forEach(entry => {
            // Use existing addEducationEntry function from index.html scope or simulate click
            // Since addEducationEntry is global in index.html, we can try to call it if accessible, 
            // or we clone manually like we did for github-import.

            // Clone the template
            const template = document.querySelector('.education-entry');
            if (!template) return;

            const newEntry = template.cloneNode(true);

            // Clear default values if any
            newEntry.querySelectorAll('input').forEach(i => i.value = '');

            // Fill data
            if (entry.institution) {
                newEntry.querySelector('.edu-school').value = entry.institution;
            }
            if (entry.degree) {
                newEntry.querySelector('.edu-degree').value = entry.degree;
            }
            if (entry.startDate) {
                newEntry.querySelector('.edu-start').value = entry.startDate;
            }
            if (entry.endDate) {
                newEntry.querySelector('.edu-end').value = entry.endDate;
            }
            if (entry.gpa) {
                newEntry.querySelector('.edu-gpa').value = entry.gpa;
            }

            // Append to container
            container.appendChild(newEntry);
        });

        // Trigger auto save
        if (window.app) {
            window.app.collectData();
            window.app.updatePreview();
            window.app.scheduleAutoSave();
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranscriptParser;
}
