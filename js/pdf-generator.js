// PDF Generation using html2pdf.js
class PDFGenerator {
    constructor() {
        this.options = {
            margin: 10,
            filename: 'resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
    }

    // Generate and download PDF from resume HTML
    async generatePDF(resumeElement, filename = 'resume') {
        try {
            // Show loading indicator
            this.showLoading();

            // Clone the element to avoid modifying the original
            const clonedElement = resumeElement.cloneNode(true);

            // Apply print-specific styles
            clonedElement.style.width = '210mm';
            clonedElement.style.background = '#ffffff';
            clonedElement.style.padding = '10mm';

            // Update filename
            this.options.filename = `${filename}_${new Date().getTime()}.pdf`;

            // Generate PDF
            await html2pdf()
                .set(this.options)
                .from(clonedElement)
                .save();

            this.hideLoading();
            this.showSuccess('PDF downloaded successfully!');
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to generate PDF: ' + error.message);
            console.error('PDF Generation Error:', error);
        }
    }

    // Generate PDF blob (for preview or upload)
    async generateBlob(resumeElement) {
        try {
            const clonedElement = resumeElement.cloneNode(true);
            clonedElement.style.width = '210mm';
            clonedElement.style.background = '#ffffff';
            clonedElement.style.padding = '10mm';

            const blob = await html2pdf()
                .set(this.options)
                .from(clonedElement)
                .outputPdf('blob');

            return blob;
        } catch (error) {
            console.error('PDF Blob Generation Error:', error);
            throw error;
        }
    }

    // Print resume directly
    printResume() {
        window.print();
    }

    // Helper methods
    showLoading() {
        const loader = document.getElementById('pdf-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    hideLoading() {
        const loader = document.getElementById('pdf-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to body
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Create global instance
const pdfGenerator = new PDFGenerator();
