const ShareManager = {
    // Check if html2pdf is loaded
    isHtml2PdfLoaded() {
        return typeof html2pdf !== 'undefined';
    },

    // Load html2pdf library dynamically if not present
    async loadHtml2Pdf() {
        if (this.isHtml2PdfLoaded()) return true;
        
        return new Promise((resolve, reject) => {
            // Load html2pdf from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
                // Also need to ensure html2canvas is loaded
                if (typeof html2canvas === 'undefined') {
                    const canvasScript = document.createElement('script');
                    canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    canvasScript.onload = () => resolve(true);
                    canvasScript.onerror = reject;
                    document.head.appendChild(canvasScript);
                } else {
                    resolve(true);
                }
            }; Legacy text-based
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // Generate and share PDF of exam results
    async shareExamResultsAsPDF(examData) {
        this.showToast('📄 Generating PDF...');
        
        try {
            // Ensure library is loaded
            await this.loadHtml2Pdf();
            
            const pdfBlob = await this.generateExamPDF(examData);
            await this.sharePDF(pdfBlob, `JAMB_Results_${this.getDateString()}.pdf`);
            this.showToast('✅ PDF shared successfully!');
        } catch (error) {
            console.error('PDF sharing error:', error);
            this.showToast('❌ Failed to share PDF: ' + error.message);
        }
    },

    // Generate and share PDF of practice results
    async sharePracticeResultsAsPDF(practiceData) {
        this.showToast('📄 Generating PDF...');
        
        try {
            await this.loadHtml2Pdf();
            const pdfBlob = await this.generatePracticePDF(practiceData);
            await this.sharePDF(pdfBlob, `Practice_Results_${this.getDateString()}.pdf`);
            this.showToast('✅ PDF shared successfully!');
        } catch (error) {
            console.error('PDF sharing error:', error);
            this.showToast('❌ Failed to share PDF: ' + error.message);
        }
    },

    // Generate Exam Results PDF - FIXED VERSION
    async generateExamPDF(examData) {
        const { scores, subjects, date } = examData;
        
        // Handle different data structures
        let totalCorrect = 0;
        let totalQuestions = 0;
        
        if (scores.subjectScores) {
            totalCorrect = Object.values(scores.subjectScores).reduce((sum, s) => sum + (s.correct || 0), 0);
        }
        
        if (examData.subjectQuestions) {
            totalQuestions = Object.values(examData.subjectQuestions).reduce((sum, q) => sum + (q.length || 0), 0);
        } else if (scores.totalQuestions) {
            totalQuestions = scores.totalQuestions;
        } else {
            totalQuestions = 180; // Default JAMB total
        }
        
        // Build subject rows
        let subjectRows = '';
        if (subjects && subjects.length > 0) {
            subjects.forEach(subject => {
                const subjectName = subject.name || subject;
                const data = scores.subjectScores?.[subjectName] || { correct: 0, total: 0 };
                const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                const jambScore = subjectName === 'Use of English' 
                    ? (data.correct * 1.67).toFixed(2)
                    : (data.correct * 2.5).toFixed(2);
                
                subjectRows += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${this.escapeHtml(subjectName)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb; text-align: center;">${data.correct}/${data.total}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb; text-align: center;">${percentage.toFixed(1)}%</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb; text-align: center;">${jambScore}</td>
                    </tr>
                `;
            });
        } else {
            subjectRows = `
                <tr>
                    <td colspan="4" style="padding: 20px; text-align: center;">No subject data available</td>
                </tr>
            `;
        }
        
        const totalScore = scores.total || scores.totalScore || 0;
        const percentage = scores.percentage || ((totalCorrect / totalQuestions) * 100).toFixed(1);
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>JAMB Exam Results</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #1a1a2e;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #1a1a2e;
                        margin-bottom: 5px;
                        font-size: 24px;
                    }
                    .header p {
                        color: #718096;
                        font-size: 12px;
                    }
                    .score-circle {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .circle {
                        display: inline-block;
                        background: #1a1a2e;
                        color: white;
                        width: 140px;
                        height: 140px;
                        border-radius: 50%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto;
                    }
                    .circle .score {
                        font-size: 32px;
                        font-weight: bold;
                    }
                    .circle .label {
                        font-size: 12px;
                    }
                    .overall {
                        margin-top: 15px;
                        font-size: 18px;
                        font-weight: 500;
                        color: #2d6a4f;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    .stat-card {
                        background: #f8f9fa;
                        padding: 15px;
                        text-align: center;
                        border-radius: 8px;
                    }
                    .stat-number {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1a1a2e;
                    }
                    .stat-label {
                        font-size: 11px;
                        color: #718096;
                    }
                    .subjects-table {
                        margin-bottom: 30px;
                    }
                    .subjects-table h2 {
                        font-size: 16px;
                        color: #1a1a2e;
                        margin-bottom: 15px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 2px solid #e1e5eb;
                        background: #f8f9fa;
                    }
                    td {
                        padding: 10px;
                        border-bottom: 1px solid #e1e5eb;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e1e5eb;
                        font-size: 10px;
                        color: #718096;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>JAMB UTME 2026 Mock Exam</h1>
                    <p>${new Date(date || Date.now()).toLocaleString()}</p>
                </div>
                
                <div class="score-circle">
                    <div class="circle">
                        <div class="score">${totalScore}</div>
                        <div class="label">/400</div>
                    </div>
                    <div class="overall">${percentage}% Overall</div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${totalQuestions}</div>
                        <div class="stat-label">Total Questions</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #2d6a4f;">${totalCorrect}</div>
                        <div class="stat-label">Correct Answers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #c92a2a;">${totalQuestions - totalCorrect}</div>
                        <div class="stat-label">Incorrect Answers</div>
                    </div>
                </div>
                
                <div class="subjects-table">
                    <h2>Performance by Subject</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th style="text-align: center;">Score</th>
                                <th style="text-align: center;">Accuracy</th>
                                <th style="text-align: center;">JAMB Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectRows}
                        </tbody>
                    </table>
                </div>
                
                <div class="footer">
                    <p>Generated by JAMB Simulator 2026</p>
                    <p>Keep practicing to improve your score!</p>
                </div>
            </body>
            </html>
        `;
        
        return await this.htmlToPDF(html);
    },

    // Generate Practice Results PDF - FIXED VERSION
    async generatePracticePDF(practiceData) {
        const { correct, total, accuracy, subject, topic, streak, date } = practiceData;
        
        const correctNum = correct || 0;
        const totalNum = total || 1;
        const accuracyNum = accuracy || ((correctNum / totalNum) * 100).toFixed(1);
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Practice Results</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 40px;
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #1a1a2e;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #1a1a2e;
                        margin-bottom: 5px;
                        font-size: 24px;
                    }
                    .header p {
                        color: #718096;
                        font-size: 12px;
                    }
                    .score-circle {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .circle {
                        display: inline-block;
                        background: #1a1a2e;
                        color: white;
                        width: 140px;
                        height: 140px;
                        border-radius: 50%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto;
                    }
                    .circle .score {
                        font-size: 32px;
                        font-weight: bold;
                    }
                    .circle .label {
                        font-size: 12px;
                    }
                    .details-card {
                        background: #f8f9fa;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 15px;
                    }
                    .detail-label {
                        color: #718096;
                    }
                    .detail-value {
                        font-weight: 600;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e1e5eb;
                        font-size: 10px;
                        color: #718096;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>JAMB Practice Session</h1>
                    <p>${new Date(date || Date.now()).toLocaleString()}</p>
                </div>
                
                <div class="score-circle">
                    <div class="circle">
                        <div class="score">${accuracyNum}%</div>
                        <div class="label">Accuracy</div>
                    </div>
                </div>
                
                <div class="details-card">
                    <div class="detail-row">
                        <span class="detail-label">Subject:</span>
                        <span class="detail-value">${this.escapeHtml(subject || 'General')}</span>
                    </div>
                    ${topic ? `
                    <div class="detail-row">
                        <span class="detail-label">Topic:</span>
                        <span class="detail-value">${this.escapeHtml(topic)}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Correct:</span>
                        <span class="detail-value" style="color: #2d6a4f;">${correctNum}/${totalNum}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Current Streak:</span>
                        <span class="detail-value" style="color: #e6a017;">${streak || 0} days</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Generated by JAMB Simulator 2026</p>
                    <p>Keep practicing to improve your score!</p>
                </div>
            </body>
            </html>
        `;
        
        return await this.htmlToPDF(html);
    },

    // Convert HTML to PDF blob - FIXED VERSION
    async htmlToPDF(html) {
        // Create a container element
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '800px';
        container.style.background = 'white';
        document.body.appendChild(container);
        
        // Wait for any images/fonts to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: 'results.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                logging: false,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'in', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        try {
            // Use html2pdf with promise
            const pdf = await html2pdf().set(opt).from(container).outputPdf();
            const blob = pdf.output('blob');
            return blob;
        } catch (error) {
            console.error('PDF generation error:', error);
            // Fallback: try simpler method
            const worker = html2pdf();
            const result = await worker.set(opt).from(container).save();
            const blob = await worker.output('blob');
            return blob;
        } finally {
            // Clean up
            document.body.removeChild(container);
        }
    },

    // Share PDF using Web Share API (mobile) or fallback to download
    async sharePDF(pdfBlob, filename) {
        // Check if Web Share API is available (mobile)
        if (navigator.share && navigator.canShare) {
            try {
                const file = new File([pdfBlob], filename, { type: 'application/pdf' });
                await navigator.share({
                    title: 'My JAMB Results',
                    text: 'Check out my JAMB exam results!',
                    files: [file]
                });
            } catch (shareError) {
                // User cancelled share or share failed
                if (shareError.name !== 'AbortError') {
                    this.downloadPDF(pdfBlob, filename);
                }
            }
        } else {
            // Fallback: download the PDF
            this.downloadPDF(pdfBlob, filename);
        }
    },

    downloadPDF(pdfBlob, filename) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('📄 PDF downloaded!');
    },

    // Legacy text-based sharing (kept for backward compatibility)
    shareExamResultsText(examData) {
        const text = this.formatExamMessage(examData);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },

    formatExamMessage(examData) {
        const { scores, subjects, date } = examData;
        
        let message = `📚 JAMB UTME Mock Exam Results\n`;
        message += `📅 ${new Date(date).toLocaleDateString()}\n\n`;
        message += `🎯 Total Score: ${scores.total || scores.totalScore || 0}/400\n`;
        message += `📊 Percentage: ${scores.percentage || 0}%\n\n`;
        message += `Subject Breakdown:\n`;
        
        if (subjects && subjects.length > 0) {
            subjects.forEach(subject => {
                const subjectName = subject.name || subject;
                const subjectData = scores.subjectScores?.[subjectName];
                if (subjectData) {
                    const subjectScore = subjectName === 'Use of English' 
                        ? (subjectData.correct * 1.67).toFixed(2)
                        : (subjectData.correct * 2.5).toFixed(2);
                    message += `📖 ${subjectName}: ${subjectData.correct}/${subjectData.total} (${subjectScore}/100)\n`;
                }
            });
        }
        
        message += `\n🔗 ${window.location.origin}`;
        return message;
    },

    getDateString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },

    escapeHtml(text) {
        if (!text) return '';
        return String(text).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    },

    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.share-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #1a1a2e;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            z-index: 10001;
            transition: transform 0.3s;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.transform = 'translateX(-50%) translateY(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Export for use in other files
window.ShareManager = ShareManager;