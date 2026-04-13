const ShareManager = {
    // Generate and share PDF of exam results
    async shareExamResultsAsPDF(examData) {
        this.showToast('📄 Generating PDF...');
        
        try {
            const pdfBlob = await this.generateExamPDF(examData);
            await this.sharePDF(pdfBlob, `JAMB_Results_${this.getDateString()}.pdf`);
            this.showToast('✅ PDF shared successfully!');
        } catch (error) {
            console.error('PDF sharing error:', error);
            this.showToast('❌ Failed to share PDF. Please try again.');
        }
    },

    // Generate and share PDF of practice results
    async sharePracticeResultsAsPDF(practiceData) {
        this.showToast('📄 Generating PDF...');
        
        try {
            const pdfBlob = await this.generatePracticePDF(practiceData);
            await this.sharePDF(pdfBlob, `Practice_Results_${this.getDateString()}.pdf`);
            this.showToast('✅ PDF shared successfully!');
        } catch (error) {
            console.error('PDF sharing error:', error);
            this.showToast('❌ Failed to share PDF. Please try again.');
        }
    },

    // Generate Exam Results PDF
    async generateExamPDF(examData) {
        const { scores, subjects, date } = examData;
        const totalCorrect = Object.values(scores.subjectScores).reduce((sum, s) => sum + s.correct, 0);
        const totalQuestions = Object.values(examData.subjectQuestions).reduce((sum, q) => sum + q.length, 0);
        
        // Build subject rows
        let subjectRows = '';
        subjects.forEach(subject => {
            const subjectName = subject.name;
            const data = scores.subjectScores[subjectName] || { correct: 0, total: 0 };
            const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            const jambScore = subjectName === 'Use of English' 
                ? (data.correct * 1.67).toFixed(2)
                : (data.correct * 2.5).toFixed(2);
            
            subjectRows += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${subjectName}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb; text-align: center;">${data.correct}/${data.total}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb; text-align: center;">${percentage.toFixed(1)}%</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb; text-align: center;">${jambScore}</td>
                </tr>
            `;
        });
        
        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px;">
                    <h1 style="color: #1a1a2e; margin-bottom: 5px; font-size: 24px;">JAMB UTME 2026 Mock Exam</h1>
                    <p style="color: #718096; font-size: 12px;">${new Date(date).toLocaleString()}</p>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background: #1a1a2e; color: white; width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto;">
                        <div style="font-size: 32px; font-weight: bold;">${scores.total}</div>
                        <div style="font-size: 12px;">/400</div>
                    </div>
                    <div style="margin-top: 15px; font-size: 18px; font-weight: 500; color: #2d6a4f;">${scores.percentage}% Overall</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                    <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: #1a1a2e;">${totalQuestions}</div>
                        <div style="font-size: 11px; color: #718096;">Total Questions</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: #2d6a4f;">${totalCorrect}</div>
                        <div style="font-size: 11px; color: #718096;">Correct Answers</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: bold; color: #c92a2a;">${totalQuestions - totalCorrect}</div>
                        <div style="font-size: 11px; color: #718096;">Incorrect Answers</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h2 style="font-size: 16px; color: #1a1a2e; margin-bottom: 15px;">Performance by Subject</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e1e5eb;">Subject</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e1e5eb;">Score</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e1e5eb;">Accuracy</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e1e5eb;">JAMB Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectRows}
                        </tbody>
                    </table>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5eb; font-size: 10px; color: #718096;">
                    <p>Generated by JAMB Simulator 2026</p>
                    <p>Keep practicing to improve your score!</p>
                </div>
            </div>
        `;
        
        return this.htmlToPDF(html);
    },

    // Generate Practice Results PDF
    async generatePracticePDF(practiceData) {
        const { correct, total, accuracy, subject, topic, streak, date } = practiceData;
        
        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px;">
                    <h1 style="color: #1a1a2e; margin-bottom: 5px; font-size: 24px;">JAMB Practice Session</h1>
                    <p style="color: #718096; font-size: 12px;">${new Date(date || Date.now()).toLocaleString()}</p>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background: #1a1a2e; color: white; width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto;">
                        <div style="font-size: 32px; font-weight: bold;">${accuracy}%</div>
                        <div style="font-size: 12px;">Accuracy</div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #718096;">Subject:</span>
                        <span style="font-weight: 600;">${subject}</span>
                    </div>
                    ${topic ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #718096;">Topic:</span>
                        <span style="font-weight: 600;">${topic}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #718096;">Correct:</span>
                        <span style="font-weight: 600; color: #2d6a4f;">${correct}/${total}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #718096;">Current Streak:</span>
                        <span style="font-weight: 600; color: #e6a017;">${streak || 0} days</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5eb; font-size: 10px; color: #718096;">
                    <p>Generated by JAMB Simulator 2026</p>
                    <p>Keep practicing to improve your score!</p>
                </div>
            </div>
        `;
        
        return this.htmlToPDF(html);
    },

    // Convert HTML to PDF blob
    async htmlToPDF(html) {
        // Create a temporary element
        const element = document.createElement('div');
        element.innerHTML = html;
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '-9999px';
        document.body.appendChild(element);
        
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        try {
            const pdf = await html2pdf().set(opt).from(element).outputPdf();
            const blob = pdf.output('blob');
            return blob;
        } finally {
            document.body.removeChild(element);
        }
    },

    // Share PDF using Web Share API (mobile) or fallback to download
    async sharePDF(pdfBlob, filename) {
        // Check if Web Share API is available (mobile)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([], filename)] })) {
            const file = new File([pdfBlob], filename, { type: 'application/pdf' });
            await navigator.share({
                title: 'My JAMB Results',
                text: 'Check out my JAMB exam results!',
                files: [file]
            });
        } else {
            // Fallback: download the PDF
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast('📄 PDF downloaded! Share it manually.');
        }
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
        message += `🎯 Total Score: ${scores.total}/400\n`;
        message += `📊 Percentage: ${scores.percentage}%\n\n`;
        message += `Subject Breakdown:\n`;
        
        subjects.forEach(subject => {
            const subjectData = scores.subjectScores[subject.name];
            if (subjectData) {
                const subjectScore = subject.name === 'Use of English' 
                    ? (subjectData.correct * 1.67).toFixed(2)
                    : (subjectData.correct * 2.5).toFixed(2);
                message += `📖 ${subject.name}: ${subjectData.correct}/${subjectData.total} (${subjectScore}/100)\n`;
            }
        });
        
        message += `\n🔗 ${window.location.origin}`;
        return message;
    },

    getDateString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.transform = 'translateX(-50%) translateY(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};

// Export for use in other files
window.ShareManager = ShareManager;