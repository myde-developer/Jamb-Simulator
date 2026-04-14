// server/data/all-subjects.js
const allSubjects = {
    // Compulsory
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
            'Antonyms & Synonyms': 10,
            'Sentence Completion': 5,
            'Oral English': 5
        },
        topics: [
            'The Lekki Headmaster', 'Comprehension', 'Cloze Passage', 
            'Sentence Interpretation', 'Antonyms & Synonyms', 
            'Sentence Completion', 'Oral English'
        ]
    },
    
    // Sciences
    2: {
        id: 2,
        name: 'Mathematics',
        code: 'MTH',
        category: 'science',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Number Bases': 2,
            'Indices & Logarithms': 2,
            'Sets': 2,
            'Polynomials': 3,
            'Inequalities': 2,
            'Progression': 2,
            'Matrices': 2,
            'Euclidean Geometry': 4,
            'Mensuration': 4,
            'Coordinate Geometry': 3,
            'Trigonometry': 4,
            'Calculus': 4,
            'Statistics': 3,
            'Probability': 3
        },
        topics: [
            'Number Bases', 'Indices & Logarithms', 'Sets', 'Polynomials',
            'Inequalities', 'Progression', 'Matrices', 'Euclidean Geometry',
            'Mensuration', 'Coordinate Geometry', 'Trigonometry',
            'Calculus', 'Statistics', 'Probability'
        ]
    },
    3: {
        id: 3,
        name: 'Physics',
        code: 'PHY',
        category: 'science',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Measurements & Units': 2,
            'Scalars & Vectors': 2,
            'Motion': 4,
            'Gravitational Field': 2,
            'Equilibrium of Forces': 3,
            'Work, Energy & Power': 2,
            'Friction': 2,
            'Simple Machines': 2,
            'Elasticity': 2,
            'Pressure': 2,
            'Heat Energy': 2,
            'Waves': 3,
            'Light': 4,
            'Sound': 2,
            'Electricity': 4,
            'Magnetism': 2
        },
        topics: [
            'Measurements & Units', 'Scalars & Vectors', 'Motion',
            'Gravitational Field', 'Equilibrium of Forces', 'Work, Energy & Power',
            'Friction', 'Simple Machines', 'Elasticity', 'Pressure',
            'Heat Energy', 'Waves', 'Light', 'Sound', 'Electricity', 'Magnetism'
        ]
    },
    4: {
        id: 4,
        name: 'Chemistry',
        code: 'CHM',
        category: 'science',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Atomic Structure': 3,
            'Chemical Combination': 3,
            'Gas Laws': 2,
            'Water & Solubility': 2,
            'Acids & Bases': 3,
            'Salts': 2,
            'Oxidation & Reduction': 3,
            'Electrolysis': 3,
            'Organic Chemistry': 4,
            'Separation of Mixtures': 2,
            'Environmental Pollution': 2,
            'Chemical Kinetics': 2,
            'Thermochemistry': 2,
            'Nuclear Chemistry': 1,
            'Qualitative Analysis': 2,
            'Stoichiometry': 2
        },
        topics: [
            'Atomic Structure', 'Chemical Combination', 'Gas Laws',
            'Water & Solubility', 'Acids & Bases', 'Salts',
            'Oxidation & Reduction', 'Electrolysis', 'Organic Chemistry',
            'Separation of Mixtures', 'Environmental Pollution',
            'Chemical Kinetics', 'Thermochemistry', 'Nuclear Chemistry',
            'Qualitative Analysis', 'Stoichiometry'
        ]
    },
    5: {
        id: 5,
        name: 'Biology',
        code: 'BIO',
        category: 'science',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Living Organisms': 2,
            'Classification': 2,
            'Internal Structure of Plants': 3,
            'Internal Structure of Mammals': 3,
            'Nutrition': 3,
            'Transport': 2,
            'Respiration': 2,
            'Excretion': 2,
            'Support & Movement': 2,
            'Reproduction': 3,
            'Growth': 2,
            'Coordination & Control': 2,
            'Homeostasis': 2,
            'Ecology': 4,
            'Genetics': 3,
            'Evolution': 2,
            'Cell Biology': 2
        },
        topics: [
            'Living Organisms', 'Classification', 'Internal Structure of Plants',
            'Internal Structure of Mammals', 'Nutrition', 'Transport',
            'Respiration', 'Excretion', 'Support & Movement', 'Reproduction',
            'Growth', 'Coordination & Control', 'Homeostasis', 'Ecology',
            'Genetics', 'Evolution', 'Cell Biology'
        ]
    },
    6: {
        id: 6,
        name: 'Agricultural Science',
        code: 'AGR',
        category: 'science',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Basic Concepts': 3,
            'Agro-ecology': 3,
            'Genetics': 2,
            'Crop Production': 5,
            'Animal Production': 5,
            'Agricultural Economics': 4,
            'Soil Science': 3,
            'Fisheries & Wildlife': 2,
            'Forestry': 2,
            'Farm Machinery': 2,
            'Crop Protection': 3,
            'Animal Health': 2,
            'Agricultural Extension': 2,
            'Farm Inputs': 2
        },
        topics: [
            'Basic Concepts', 'Agro-ecology', 'Genetics', 'Crop Production',
            'Animal Production', 'Agricultural Economics', 'Soil Science',
            'Fisheries & Wildlife', 'Forestry', 'Farm Machinery',
            'Crop Protection', 'Animal Health', 'Agricultural Extension', 'Farm Inputs'
        ]
    },
    7: {
        id: 7,
        name: 'Computer Studies',
        code: 'CSC',
        category: 'science',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'History of Computing': 2,
            'Computer Hardware': 4,
            'Computer Software': 3,
            'Operating Systems': 3,
            'Data Processing': 3,
            'Number Systems': 4,
            'Computer Networks': 4,
            'Programming Concepts': 5,
            'Database Management': 3,
            'Computer Ethics': 2,
            'Emerging Technologies': 2,
            'Internet & Web Technologies': 2,
            'Multimedia': 1,
            'Security': 2
        },
        topics: [
            'History of Computing', 'Computer Hardware', 'Computer Software',
            'Operating Systems', 'Data Processing', 'Number Systems',
            'Computer Networks', 'Programming Concepts', 'Database Management',
            'Computer Ethics', 'Emerging Technologies', 'Internet & Web Technologies',
            'Multimedia', 'Security'
        ]
    },
    
    // Arts & Humanities
    8: { id: 8, name: 'Literature in English', code: 'LIT', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Drama', 'Prose', 'Poetry', 'Literary Principles', 'Literary Appreciation', 'African Literature', 'Non-African Literature', 'The Lekki Headmaster', 'Figures of Speech', 'Literary Criticism'] },
    9: { id: 9, name: 'Government', code: 'GOV', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Basic Concepts', 'Forms of Government', 'Arms of Government', 'Structures of Governance', 'Political Ideologies', 'Nigerian Constitution', 'Political Parties', 'Electoral Process', 'Public Administration', 'Local Government', 'Foreign Policy', 'International Organizations', 'Decolonization', 'Public Corporations', 'Nigerian Federalism'] },
    10: { id: 10, name: 'History', code: 'HIS', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Pre-colonial Nigeria', 'Trans-Saharan Trade', 'European Contact', 'Slave Trade', 'Sokoto Caliphate', 'Yoruba States', 'Benin Kingdom', 'Igbo Systems', 'Colonial Conquest', 'Nationalist Movements', 'Nigerian Independence', 'Military Rule', 'Nigerian Civil War', 'Foreign Policy', 'ECOWAS'] },
    11: { id: 11, name: 'Christian Religious Studies', code: 'CRS', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Sovereignty of God', 'Leadership & Authority', 'The Covenant', 'Prophetic Mission', 'Faith & Works', 'Justice & Fairness', 'Sermon on the Mount', 'Parables of Jesus', 'Miracles of Jesus', 'Death & Resurrection', 'Early Church', "Paul's Journeys", 'Christian Living', 'Social Justice', 'Religious Tolerance'] },
    12: { id: 12, name: 'Islamic Studies', code: 'IRS', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Tawhid', 'Prophethood', 'Revealed Books', 'Angels', 'Day of Judgment', 'Quranic Studies', 'Hadith', 'Islamic Law', 'Prayer', 'Fasting', 'Zakat', 'Pilgrimage', 'Islamic History', 'Islamic Ethics'] },
    13: { id: 13, name: 'French', code: 'FRE', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Greetings', 'Numbers', 'Family', 'Food', 'Daily Activities', 'Travel', 'Housing', 'Work', 'Health', 'Weather', 'Grammar', 'Culture'] },
    14: { id: 14, name: 'Yoruba', code: 'YRB', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Alphabet', 'Grammar', 'Culture', 'History', 'Composition', 'Literature'] },
    15: { id: 15, name: 'Igbo', code: 'IGB', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Alphabet', 'Vocabulary', 'Grammar', 'Culture', 'History', 'Literature'] },
    16: { id: 16, name: 'Hausa', code: 'HAU', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Alphabet', 'Grammar', 'Culture', 'History', 'Writing', 'Literature'] },
    17: { id: 17, name: 'Music', code: 'MUS', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Elements', 'Notation', 'Scales', 'Rhythm', 'Harmony', 'Instruments', 'African Music', 'Western History', 'Analysis', 'Composition'] },
    18: { id: 18, name: 'Fine Arts', code: 'ART', category: 'arts', totalQuestions: 40, duration: 60, topics: ['Drawing', 'Painting', 'Sculpture', 'Printmaking', 'Art History', 'African Art', 'Contemporary Art', 'Color Theory', 'Composition', 'Criticism'] },
    
    // Commercial & Social Sciences
    19: { id: 19, name: 'Economics', code: 'ECO', category: 'commercial', totalQuestions: 40, duration: 60, topics: ['Basic Concepts', 'Economic Systems', 'Demand & Supply', 'Elasticity', 'Consumer Behavior', 'Production', 'Cost Concepts', 'Market Structures', 'National Income', 'Money & Banking', 'Inflation', 'International Trade', 'Economic Development', 'Public Finance', 'Population'] },
    20: { id: 20, name: 'Commerce', code: 'COM', category: 'commercial', totalQuestions: 40, duration: 60, topics: ['Meaning', 'Occupation', 'Production', 'Trade', 'Purchase & Sales', 'Aids to Trade', 'Business Units', 'Financing', 'Trade Associations', 'Money & Banking', 'Stock Exchange', 'Management', 'Marketing', 'Legal Aspects', 'Commodity Exchange'] },
    21: { id: 21, name: 'Principles of Accounts', code: 'ACC', category: 'commercial', totalQuestions: 40, duration: 60, topics: ['Bookkeeping', 'Double Entry', 'Books of Entry', 'Ledger Accounts', 'Trial Balance', 'Cash Book', 'Bank Reconciliation', 'Final Accounts', 'Stock Valuation', 'Control Accounts', 'Manufacturing', 'Partnership', 'Company Accounts', 'Public Sector', 'Accounting Software'] },
    22: { id: 22, name: 'Geography', code: 'GEO', category: 'commercial', totalQuestions: 40, duration: 60, topics: ['Basic Concepts', 'Earth Structure', 'Rocks', 'Landforms', 'Weather', 'Water Bodies', 'Vegetation', 'Population', 'Settlement', 'Economic Geography', 'Transportation', 'Environment', 'Map Reading', 'GIS', 'Regional Geography'] }
};

module.exports = { allSubjects };