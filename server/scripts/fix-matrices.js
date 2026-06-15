// scripts/fix-matrices.js
const fs = require('fs');
const path = require('path');

// Convert a matrix string like "[[1, 2], [3, 4]]" to LaTeX
function convertMatrixToLatex(text) {
    // Match any occurrence of [[...], [...]] possibly with spaces
    // This regex captures the entire matrix string.
    const matrixRegex = /\[\[([^\]]+)\],\s*\[([^\]]+)\]\]/g;

    return text.replace(matrixRegex, (match, row1, row2) => {
        // Clean and split each row into numbers
        const cleanRow1 = row1.split(',').map(s => s.trim()).join(' & ');
        const cleanRow2 = row2.split(',').map(s => s.trim()).join(' & ');
        // Return LaTeX inline matrix
        return `\\(\\begin{bmatrix} ${cleanRow1} \\\\ ${cleanRow2} \\end{bmatrix}\\)`;
    });
}

// Process a single file
function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // First, fix degree symbol corruption
    if (content.includes('ยฐ')) {
        content = content.replace(/ยฐ/g, '°');
        modified = true;
        console.log(`  -> Fixed degree symbols`);
    }

    // Parse JSON
    let questions;
    try {
        questions = JSON.parse(content);
    } catch (err) {
        console.error(`  Error parsing JSON in ${filePath}:`, err.message);
        return;
    }

    let anyChange = false;
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let changed = false;

        // Convert question_text
        if (q.question_text && q.question_text.includes('[[')) {
            const newText = convertMatrixToLatex(q.question_text);
            if (newText !== q.question_text) {
                q.question_text = newText;
                changed = true;
            }
        }

        // Convert options (A, B, C, D)
        for (const opt of ['option_a', 'option_b', 'option_c', 'option_d']) {
            if (q[opt] && q[opt].includes('[[')) {
                const newOpt = convertMatrixToLatex(q[opt]);
                if (newOpt !== q[opt]) {
                    q[opt] = newOpt;
                    changed = true;
                }
            }
        }

        // Also convert explanation if it contains matrices (optional)
        if (q.explanation && q.explanation.includes('[[')) {
            const newExp = convertMatrixToLatex(q.explanation);
            if (newExp !== q.explanation) {
                q.explanation = newExp;
                changed = true;
            }
        }

        if (changed) {
            anyChange = true;
        }
    }

    if (anyChange || modified) {
        // Write back the updated JSON (preserving indentation)
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
        console.log(`  -> Updated.`);
    } else {
        console.log(`  -> No matrix changes.`);
    }
}

// Main: process all questions-batch-*.json in the data folder
const dataDir = path.join(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('questions-batch-') && f.endsWith('.json'));

console.log(`Found ${files.length} batch files.`);
for (const file of files) {
    const filePath = path.join(dataDir, file);
    processFile(filePath);
}
console.log('Done.');