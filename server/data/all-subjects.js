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
            'Oral English': 5
        },
        topics: [
            'The Lekki Headmaster', 'Comprehension', 'Cloze Passage',
            'Sentence Interpretation', 'Antonyms', 'Synonyms',
            'Sentence Completion', 'Oral English'
        ]
    },

    // ===== 2. Mathematics =====
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

    // ===== 3. Physics =====
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

    // ===== 4. Chemistry =====
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
            'Organic Chemistry': 5,
            'Separation of Mixtures': 2,
            'Environmental Pollution': 2,
            'Chemical Kinetics': 2,
            'Thermochemistry': 2,
            'Nuclear Chemistry': 1,
            'Qualitative Analysis': 2,
            'Stoichiometry': 3
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

    // ===== 5. Biology =====
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

    // ===== 6. Agricultural Science =====
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

    // ===== 7. Computer Studies =====
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

    // ===== 8. Literature in English =====
    8: {
        id: 8,
        name: 'Literature in English',
        code: 'LIT',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Drama': 6,
            'Prose': 6,
            'Poetry': 5,
            'Literary Principles': 4,
            'Literary Appreciation': 5,
            'African Literature': 5,
            'Non-African Literature': 4,
            'Figures of Speech': 3,
            'Literary Criticism': 2
        },
        topics: [
            'Drama', 'Prose', 'Poetry', 'Literary Principles',
            'Literary Appreciation', 'African Literature', 'Non-African Literature',
            'Figures of Speech', 'Literary Criticism'
        ]
    },

    // ===== 9. Government =====
    9: {
        id: 9,
        name: 'Government',
        code: 'GOV',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Basic Concepts': 3,
            'Forms of Government': 3,
            'Arms of Government': 3,
            'Political Ideologies': 2,
            'Nigerian Constitution': 3,
            'Political Parties': 3,
            'Electoral Process': 3,
            'Public Administration': 3,
            'Local Government': 3,
            'Foreign Policy': 3,
            'International Organizations': 3,
            'Decolonization': 2,
            'Public Corporations': 2,
            'Nigerian Federalism': 3
        },
        topics: [
            'Basic Concepts', 'Forms of Government', 'Arms of Government',
            'Political Ideologies', 'Nigerian Constitution', 'Political Parties',
            'Electoral Process', 'Public Administration', 'Local Government',
            'Foreign Policy', 'International Organizations', 'Decolonization',
            'Public Corporations', 'Nigerian Federalism'
        ]
    },

    // ===== 10. History =====
    10: {
        id: 10,
        name: 'History',
        code: 'HIS',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Pre-colonial Nigeria': 4,
            'Trans-Saharan Trade': 3,
            'European Contact': 3,
            'Slave Trade': 3,
            'Sokoto Caliphate': 3,
            'Yoruba States': 3,
            'Benin Kingdom': 3,
            'Igbo Systems': 2,
            'Colonial Conquest': 3,
            'Nationalist Movements': 4,
            'Nigerian Independence': 3,
            'Military Rule': 3,
            'Nigerian Civil War': 3,
            'Foreign Policy': 2,
            'ECOWAS': 2
        },
        topics: [
            'Pre-colonial Nigeria', 'Trans-Saharan Trade', 'European Contact',
            'Slave Trade', 'Sokoto Caliphate', 'Yoruba States', 'Benin Kingdom',
            'Igbo Systems', 'Colonial Conquest', 'Nationalist Movements',
            'Nigerian Independence', 'Military Rule', 'Nigerian Civil War',
            'Foreign Policy', 'ECOWAS'
        ]
    },

    // ===== 11. Christian Religious Studies =====
    11: {
        id: 11,
        name: 'Christian Religious Studies',
        code: 'CRS',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Sovereignty of God': 3,
            'Leadership & Authority': 3,
            'The Covenant': 3,
            'Prophetic Mission': 3,
            'Faith & Works': 3,
            'Justice & Fairness': 2,
            'Sermon on the Mount': 3,
            'Parables of Jesus': 4,
            'Miracles of Jesus': 4,
            'Death & Resurrection': 3,
            'Early Church': 3,
            "Paul's Journeys": 3,
            'Christian Living': 2,
            'Social Justice': 2,
            'Religious Tolerance': 2
        },
        topics: [
            'Sovereignty of God', 'Leadership & Authority', 'The Covenant',
            'Prophetic Mission', 'Faith & Works', 'Justice & Fairness',
            'Sermon on the Mount', 'Parables of Jesus', 'Miracles of Jesus',
            'Death & Resurrection', 'Early Church', "Paul's Journeys",
            'Christian Living', 'Social Justice', 'Religious Tolerance'
        ]
    },

    // ===== 12. Islamic Studies =====
    12: {
        id: 12,
        name: 'Islamic Studies',
        code: 'IRS',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Tawhid': 4,
            'Prophethood': 4,
            'Revealed Books': 3,
            'Angels': 2,
            'Day of Judgment': 2,
            'Quranic Studies': 5,
            'Hadith': 4,
            'Islamic Law': 3,
            'Prayer': 3,
            'Fasting': 2,
            'Zakat': 2,
            'Pilgrimage': 2,
            'Islamic History': 3,
            'Islamic Ethics': 2
        },
        topics: [
            'Tawhid', 'Prophethood', 'Revealed Books', 'Angels',
            'Day of Judgment', 'Quranic Studies', 'Hadith', 'Islamic Law',
            'Prayer', 'Fasting', 'Zakat', 'Pilgrimage', 'Islamic History',
            'Islamic Ethics'
        ]
    },

    // ===== 13. French =====
    13: {
        id: 13,
        name: 'French',
        code: 'FRE',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Greetings': 4,
            'Numbers': 3,
            'Family': 3,
            'Food': 3,
            'Daily Activities': 4,
            'Travel': 3,
            'Housing': 3,
            'Work': 3,
            'Health': 3,
            'Weather': 3,
            'Grammar': 5,
            'Culture': 3
        },
        topics: [
            'Greetings', 'Numbers', 'Family', 'Food',
            'Daily Activities', 'Travel', 'Housing', 'Work',
            'Health', 'Weather', 'Grammar', 'Culture'
        ]
    },

    // ===== 14. Yoruba =====
    14: {
        id: 14,
        name: 'Yoruba',
        code: 'YRB',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Alphabet': 8,
            'Grammar': 8,
            'Culture': 8,
            'History': 8,
            'Composition': 8
        },
        topics: [
            'Alphabet', 'Grammar', 'Culture', 'History', 'Composition'
        ]
    },

    // ===== 15. Igbo =====
    15: {
        id: 15,
        name: 'Igbo',
        code: 'IGB',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Alphabet': 8,
            'Vocabulary': 8,
            'Grammar': 8,
            'Culture': 8,
            'History': 8
        },
        topics: [
            'Alphabet', 'Vocabulary', 'Grammar', 'Culture', 'History'
        ]
    },

    // ===== 16. Hausa =====
    16: {
        id: 16,
        name: 'Hausa',
        code: 'HAU',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Alphabet': 8,
            'Grammar': 8,
            'Culture': 8,
            'History': 8,
            'Writing': 8
        },
        topics: [
            'Alphabet', 'Grammar', 'Culture', 'History', 'Writing'
        ]
    },

    // ===== 17. Music =====
    17: {
        id: 17,
        name: 'Music',
        code: 'MUS',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Elements of Music': 5,
            'Music Notation': 5,
            'Scales & Intervals': 5,
            'Rhythm & Meter': 4,
            'Harmony': 4,
            'Musical Instruments': 5,
            'African Music': 4,
            'Western Music History': 4,
            'Music Analysis': 4
        },
        topics: [
            'Elements of Music', 'Music Notation', 'Scales & Intervals',
            'Rhythm & Meter', 'Harmony', 'Musical Instruments',
            'African Music', 'Western Music History', 'Music Analysis'
        ]
    },

    // ===== 18. Fine Arts =====
    18: {
        id: 18,
        name: 'Fine Arts',
        code: 'ART',
        category: 'arts',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Drawing': 5,
            'Painting': 5,
            'Sculpture': 5,
            'Printmaking': 4,
            'Art History': 5,
            'African Art': 5,
            'Contemporary Art': 4,
            'Color Theory': 4,
            'Composition': 3
        },
        topics: [
            'Drawing', 'Painting', 'Sculpture', 'Printmaking',
            'Art History', 'African Art', 'Contemporary Art',
            'Color Theory', 'Composition'
        ]
    },

    // ===== 19. Economics =====
    19: {
        id: 19,
        name: 'Economics',
        code: 'ECO',
        category: 'commercial',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Basic Concepts': 3,
            'Economic Systems': 3,
            'Demand & Supply': 4,
            'Elasticity': 2,
            'Consumer Behavior': 2,
            'Production': 3,
            'Cost Concepts': 2,
            'Market Structures': 3,
            'National Income': 3,
            'Money & Banking': 3,
            'Inflation': 2,
            'International Trade': 3,
            'Economic Development': 3,
            'Public Finance': 2,
            'Population': 2
        },
        topics: [
            'Basic Concepts', 'Economic Systems', 'Demand & Supply',
            'Elasticity', 'Consumer Behavior', 'Production',
            'Cost Concepts', 'Market Structures', 'National Income',
            'Money & Banking', 'Inflation', 'International Trade',
            'Economic Development', 'Public Finance', 'Population'
        ]
    },

    // ===== 20. Commerce =====
    20: {
        id: 20,
        name: 'Commerce',
        code: 'COM',
        category: 'commercial',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Meaning of Commerce': 3,
            'Occupation': 2,
            'Production': 3,
            'Trade': 4,
            'Aids to Trade': 4,
            'Business Units': 4,
            'Financing': 3,
            'Trade Associations': 2,
            'Money & Banking': 3,
            'Stock Exchange': 3,
            'Business Management': 3,
            'Marketing': 3,
            'Legal Aspects': 2,
            'Commodity Exchange': 2
        },
        topics: [
            'Meaning of Commerce', 'Occupation', 'Production', 'Trade',
            'Aids to Trade', 'Business Units', 'Financing', 'Trade Associations',
            'Money & Banking', 'Stock Exchange', 'Business Management',
            'Marketing', 'Legal Aspects', 'Commodity Exchange'
        ]
    },

    // ===== 21. Principles of Accounts =====
    21: {
        id: 21,
        name: 'Principles of Accounts',
        code: 'ACC',
        category: 'commercial',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Bookkeeping': 3,
            'Double Entry': 4,
            'Books of Entry': 3,
            'Ledger Accounts': 4,
            'Trial Balance': 3,
            'Cash Book': 3,
            'Bank Reconciliation': 3,
            'Final Accounts': 4,
            'Stock Valuation': 2,
            'Control Accounts': 2,
            'Manufacturing': 2,
            'Partnership': 3,
            'Company Accounts': 2,
            'Public Sector': 1,
            'Accounting Software': 1
        },
        topics: [
            'Bookkeeping', 'Double Entry', 'Books of Entry', 'Ledger Accounts',
            'Trial Balance', 'Cash Book', 'Bank Reconciliation', 'Final Accounts',
            'Stock Valuation', 'Control Accounts', 'Manufacturing', 'Partnership',
            'Company Accounts', 'Public Sector', 'Accounting Software'
        ]
    },

    // ===== 22. Geography =====
    22: {
        id: 22,
        name: 'Geography',
        code: 'GEO',
        category: 'commercial',
        totalQuestions: 40,
        duration: 60,
        topicDistribution: {
            'Basic Concepts': 3,
            'Earth Structure': 2,
            'Rocks & Minerals': 2,
            'Landforms': 3,
            'Weather & Climate': 4,
            'Water Bodies': 2,
            'Vegetation & Soils': 3,
            'Population Geography': 3,
            'Settlement Geography': 3,
            'Economic Geography': 4,
            'Transportation': 2,
            'Environmental Issues': 3,
            'Map Reading': 3,
            'GIS': 2,
            'Regional Geography': 2
        },
        topics: [
            'Basic Concepts', 'Earth Structure', 'Rocks & Minerals', 'Landforms',
            'Weather & Climate', 'Water Bodies', 'Vegetation & Soils',
            'Population Geography', 'Settlement Geography', 'Economic Geography',
            'Transportation', 'Environmental Issues', 'Map Reading', 'GIS',
            'Regional Geography'
        ]
    }
};

module.exports = { allSubjects };