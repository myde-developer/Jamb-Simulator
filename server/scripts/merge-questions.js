const fs = require('fs');
const path = require('path');

async function mergeQuestions() {
  const batchesDir = path.join(__dirname, '../data');
  const outputFile = path.join(__dirname, '../data/questions.json');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(batchesDir)) {
    fs.mkdirSync(batchesDir, { recursive: true });
  }
  
  let allQuestions = [];
  let totalCount = 0;
  
  console.log('🔍 Scanning for batch files in data folder...');
  console.log(`📁 Data directory: ${batchesDir}`);
  
  // Read all batch files (1-30)
  for (let i = 1; i <= 30; i++) {
    const batchFile = path.join(batchesDir, `questions-batch-${i}.json`);
    
    try {
      if (fs.existsSync(batchFile)) {
        const batchData = fs.readFileSync(batchFile, 'utf8');
        const batchQuestions = JSON.parse(batchData);
        allQuestions = allQuestions.concat(batchQuestions);
        totalCount += batchQuestions.length;
        console.log(`✅ Batch ${i}: ${batchQuestions.length} questions loaded`);
      } else {
        console.log(`⚠️ Batch ${i} file not found - skipping`);
      }
    } catch (error) {
      console.error(`❌ Error reading batch ${i}:`, error.message);
    }
  }
  
  // Write merged file
  fs.writeFileSync(outputFile, JSON.stringify(allQuestions, null, 2));
  console.log(`\n🎉 Successfully merged ${totalCount} questions into questions.json`);
  console.log(`📁 File saved to: ${outputFile}`);
  
  // Validate the merged file
  try {
    const validation = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`✅ Validation passed: ${validation.length} questions in final file`);
    
    // Show summary by subject_id
    const subjectCounts = {};
    validation.forEach(q => {
      subjectCounts[q.subject_id] = (subjectCounts[q.subject_id] || 0) + 1;
    });
    
    console.log('\n📊 Questions by subject:');
    Object.keys(subjectCounts).sort().forEach(subject => {
      console.log(`   Subject ${subject}: ${subjectCounts[subject]} questions`);
    });
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

mergeQuestions().catch(console.error);