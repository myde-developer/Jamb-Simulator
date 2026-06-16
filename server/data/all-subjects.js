// server/data/all-subjects.js
const allSubjects = {
  // ===== 1. Use of English =====
  1: {
    id: 1,
    name: 'Use of English',
    code: 'ENG',
    category: 'compulsory',
    totalQuestions: 60,
    duration: 60,
    topicDistribution: {
      'The Lekki Headmaster': 10,
      'Comprehension': 10,
      'Cloze Passage': 10,
      'Sentence Interpretation': 10,
      'Antonyms': 5,
      'Synonyms': 5,
      'Sentence Completion': 5,
      'Oral English': 5,
    },
    topics: [
      'The Lekki Headmaster',
      'Comprehension',
      'Cloze Passage',
      'Sentence Interpretation',
      'Antonyms',
      'Synonyms',
      'Sentence Completion',
      'Oral English',
    ],
  },
};

module.exports = { allSubjects };
