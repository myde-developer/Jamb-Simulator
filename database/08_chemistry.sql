-- ============================================
-- CHEMISTRY - 200 QUESTIONS
-- Topics: Organic, Inorganic, Physical, Analytical, Electrochemistry
-- ============================================

INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty) VALUES
(4, 'Balance the redox reaction: MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺ (acidic medium)',
 'MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O', 'MnO₄⁻ + 3Fe²⁺ + 4H⁺ → Mn²⁺ + 3Fe³⁺ + 2H₂O', 'MnO₄⁻ + 2Fe²⁺ + 4H⁺ → Mn²⁺ + 2Fe³⁺ + 2H₂O', 'MnO₄⁻ + 4Fe²⁺ + 8H⁺ → Mn²⁺ + 4Fe³⁺ + 4H₂O', 'A',
 'Mn goes from +7 to +2 (gain 5 e⁻). Fe goes from +2 to +3 (loss 1 e⁻). So 5 Fe²⁺ needed. Balance O with H₂O, H with H⁺.', 'Electrochemistry', 'hard'),

(4, 'Calculate the pH of a 0.01 M HCl solution.',
 '2', '1', '3', '4', 'A',
 'HCl is strong acid, completely dissociated. [H⁺] = 0.01 M = 10⁻² M. pH = -log(10⁻²) = 2.', 'Acids/Bases', 'easy'),

(4, 'What volume of 0.1 M NaOH is needed to neutralize 25 mL of 0.2 M H₂SO₄?',
 '100 mL', '50 mL', '25 mL', '75 mL', 'A',
 'H₂SO₄ has 2 H⁺, so moles H⁺ = 2 × 0.2 × 0.025 = 0.01 mol. Need equal moles OH⁻ = 0.01 mol. Volume NaOH = 0.01/0.1 = 0.1 L = 100 mL.', 'Stoichiometry', 'medium'),

(4, 'Which of the following has the highest boiling point?',
 'Ethanol', 'Dimethyl ether', 'Ethane', 'Ethene', 'A',
 'Ethanol has hydrogen bonding, strongest intermolecular force among these.', 'Organic Chemistry', 'medium'),

(4, 'Calculate the oxidation state of Cr in K₂Cr₂O₇.',
 '+6', '+3', '+4', '+5', 'A',
 'K: +1 each (total +2), O: -2 each (total -14). So 2(+1) + 2x + 7(-2) = 0 → 2 + 2x -14 = 0 → 2x = 12 → x = +6.', 'Inorganic', 'medium'),

(4, 'How many isomers does C₄H₁₀O have?',
 '7', '4', '5', '6', 'A',
 'Alcohols: butan-1-ol, butan-2-ol, 2-methylpropan-1-ol, 2-methylpropan-2-ol (4 alcohols). Ethers: methoxypropane, ethoxyethane, methoxyisopropane (3 ethers). Total 7.', 'Organic', 'hard'),

(4, 'In the reaction: 2A + B → C, if the rate law is rate = k[A][B]², what is the overall order?',
 '3', '1', '2', '4', 'A',
 'Overall order = sum of exponents = 1 + 2 = 3.', 'Physical Chemistry', 'easy'),

(4, 'Calculate the standard emf of the cell: Zn|Zn²⁺(1M) || Cu²⁺(1M)|Cu. (E°Zn²⁺/Zn = -0.76 V, E°Cu²⁺/Cu = +0.34 V)',
 '1.10 V', '0.42 V', '-0.42 V', '-1.10 V', 'A',
 'E°cell = E°cathode - E°anode = 0.34 - (-0.76) = 1.10 V.', 'Electrochemistry', 'medium'),

(4, 'Which element has the electron configuration [Ar] 4s² 3d¹⁰ 4p³?',
 'Arsenic', 'Selenium', 'Bromine', 'Gallium', 'A',
 'Count electrons: Ar (18) + 2 + 10 + 3 = 33. Atomic number 33 is arsenic.', 'Atomic Structure', 'medium'),

(4, 'What is the hybridization of carbon in methane (CH₄)?',
 'sp³', 'sp²', 'sp', 'dsp²', 'A',
 'Tetrahedral geometry requires sp³ hybridization.', 'Organic', 'easy'),

(4, 'Calculate the mass of CaCO₃ needed to produce 11.2 L of CO₂ at STP. (Ca=40, C=12, O=16)',
 '50 g', '25 g', '100 g', '75 g', 'A',
 'CaCO₃ → CaO + CO₂. 1 mol CO₂ at STP = 22.4 L. So 11.2 L = 0.5 mol CO₂. Requires 0.5 mol CaCO₃ = 0.5 × 100 = 50 g.', 'Stoichiometry', 'medium'),

(4, 'Which of these is an aromatic compound?',
 'Benzene', 'Cyclohexane', 'Hexane', 'Ethene', 'A',
 'Benzene has aromatic ring with conjugated π system.', 'Organic', 'easy'),

(4, 'Calculate the number of moles in 36 g of water. (H=1, O=16)',
 '2 moles', '1 mole', '3 moles', '0.5 moles', 'A',
 'Molar mass H₂O = 18 g/mol. Moles = mass/molar mass = 36/18 = 2 moles.', 'Stoichiometry', 'easy'),

(4, 'What is the empirical formula of a compound containing 40% carbon, 6.7% hydrogen, and 53.3% oxygen?',
 'CH₂O', 'C₂H₄O₂', 'CHO', 'C₂H₆O', 'A',
 'C: 40/12 = 3.33, H: 6.7/1 = 6.7, O: 53.3/16 = 3.33. Divide by smallest (3.33): C=1, H=2, O=1. So CH₂O.', 'Stoichiometry', 'hard'),

(4, 'Which gas is evolved when sodium reacts with ethanol?',
 'Hydrogen', 'Oxygen', 'Carbon dioxide', 'Nitrogen', 'A',
 'Sodium displaces hydrogen from the -OH group of ethanol.', 'Organic', 'medium'),

(4, 'What is the IUPAC name for CH₃CH₂CH₂OH?',
 'Propan-1-ol', 'Propan-2-ol', 'Propanol', 'Propyl alcohol', 'A',
 'Three carbons with -OH on first carbon: propan-1-ol.', 'Organic', 'medium'),

(4, 'Calculate the pH of a 0.001 M NaOH solution.',
 '11', '3', '10', '12', 'A',
 '[OH⁻] = 0.001 = 10⁻³ M, pOH = 3, pH = 14 - 3 = 11.', 'Acids/Bases', 'medium'),

(4, 'Which of these is a strong acid?',
 'HCl', 'CH₃COOH', 'H₂CO₃', 'H₃PO₄', 'A',
 'HCl completely dissociates in water; others are weak acids.', 'Acids/Bases', 'easy'),

(4, 'What is the oxidation state of sulfur in H₂SO₄?',
 '+6', '+4', '+2', '0', 'A',
 'H: +1 each (total +2), O: -2 each (total -8). So 2 + x -8 = 0 → x = +6.', 'Inorganic', 'medium'),

(4, 'Which functional group is present in aldehydes?',
 '-CHO', '-COOH', '-OH', '-CO-', 'A',
 'Aldehydes have carbonyl group with H attached: -CHO.', 'Organic', 'easy'),
 
 (4, 'The shape of XeF₄ molecule is:',
 'Square planar', 'Tetrahedral', 'See-saw', 'Trigonal bipyramidal', 'A',
 'XeF₄ has 6 electron pairs (4 bonding + 2 lone pairs) → square planar geometry.', 'Inorganic', 'medium'),

(4, 'Which of the following is not a colligative property?',
 'Viscosity', 'Relative lowering of vapour pressure', 'Osmotic pressure', 'Elevation in boiling point', 'A',
 'Viscosity depends on nature of solute and solvent, not number of particles.', 'Physical Chemistry', 'medium'),

(4, 'The hybridization of nitrogen in NH₃ is:',
 'sp³', 'sp²', 'sp', 'sp³d', 'A',
 'Nitrogen has 3 bonding pairs and 1 lone pair → tetrahedral electron geometry, trigonal pyramidal molecular shape, sp³ hybridization.', 'Inorganic', 'easy'),

(4, 'In the Haber process, the catalyst used is:',
 'Finely divided iron', 'Platinum', 'Nickel', 'Vanadium pentoxide', 'A',
 'Fe with promoters (K₂O, Al₂O₃) is used to synthesize ammonia from N₂ and H₂.', 'Inorganic', 'medium'),

(4, 'Which compound shows optical isomerism?',
 '2-butanol', '1-propanol', 'Ethanol', 'Methanol', 'A',
 '2-Butanol has a chiral carbon (four different groups attached).', 'Organic', 'medium'),

(4, 'The indicator used in the titration of weak acid vs strong base is:',
 'Phenolphthalein', 'Methyl orange', 'Bromothymol blue', 'Methyl red', 'A',
 'Phenolphthalein changes color in basic range (8.2–10), suitable for weak acid–strong base endpoint.', 'Analytical', 'medium'),

(4, 'Calculate the molarity of a solution containing 4 g of NaOH in 500 mL of solution. (Na=23, O=16, H=1)',
 '0.2 M', '0.1 M', '0.4 M', '0.8 M', 'A',
 'Molar mass NaOH = 40 g/mol. Moles = 4/40 = 0.1 mol. Volume = 0.5 L → M = 0.1/0.5 = 0.2 M.', 'Stoichiometry', 'easy'),

(4, 'Which of the following has the highest lattice energy?',
 'MgO', 'NaCl', 'KBr', 'CsI', 'A',
 'Lattice energy increases with higher charge and smaller ionic radii (Mg²⁺ and O²⁻ have high charges and small sizes).', 'Physical Chemistry', 'hard'),

(4, 'The reaction CH₃COOH + CH₃CH₂OH ⇌ CH₃COOCH₂CH₃ + H₂O is an example of:',
 'Esterification', 'Saponification', 'Hydrolysis', 'Neutralization', 'A',
 'Carboxylic acid + alcohol → ester + water (acid-catalyzed esterification).', 'Organic', 'easy'),

(4, 'In which medium is the reaction MnO₄⁻ + SO₃²⁻ → Mn²⁺ + SO₄²⁻ balanced with 5H⁺ on left?',
 'Acidic', 'Basic', 'Neutral', 'Cannot be balanced', 'A',
 'Permanganate is reduced to Mn²⁺ only in acidic medium.', 'Electrochemistry', 'medium'),

(4, 'The IUPAC name of CH₃CH=CHCHO is:',
 'But-2-enal', 'Butenal', 'But-3-enal', '2-Butenal', 'A',
 'Four carbons, double bond between 2–3, aldehyde at position 1 → but-2-enal.', 'Organic', 'medium'),

(4, 'Which element shows the highest electronegativity?',
 'Fluorine', 'Oxygen', 'Nitrogen', 'Chlorine', 'A',
 'Fluorine has the highest electronegativity (4.0 on Pauling scale).', 'Inorganic', 'easy'),

(4, 'The half-life of a first-order reaction is 10 minutes. What fraction of reactant remains after 30 minutes?',
 '1/8', '1/4', '1/2', '1/16', 'A',
 'Number of half-lives = 30/10 = 3 → fraction left = (1/2)³ = 1/8.', 'Physical Chemistry', 'medium'),

(4, 'Which of the following is a greenhouse gas?',
 'CO₂', 'N₂', 'O₂', 'Ar', 'A',
 'Carbon dioxide absorbs infrared radiation and contributes to global warming.', 'Physical/Inorganic', 'easy'),

(4, 'The compound with formula C₆H₅COCH₃ is:',
 'Acetophenone', 'Benzaldehyde', 'Benzophenone', 'Benzyl alcohol', 'A',
 'Phenyl methyl ketone → acetophenone.', 'Organic', 'medium'),

(4, 'In Daniell cell, the electrode at which oxidation occurs is:',
 'Zinc electrode', 'Copper electrode', 'Both', 'Neither', 'A',
 'Zn → Zn²⁺ + 2e⁻ (anode – oxidation).', 'Electrochemistry', 'easy'),

(4, 'Which of the following is used as an antiseptic?',
 'Iodoform', 'Chloroform', 'Ethanol', 'Both A and C', 'D',
 'Iodoform and dilute ethanol (spirit) are used as antiseptics.', 'Organic', 'easy'),

(4, 'The van der Waals equation corrects for:',
 'Volume of gas molecules and intermolecular attractions', 'Temperature and pressure only', 'Number of moles', 'Ideal gas behavior', 'A',
 'van der Waals: (P + a/V²)(V – b) = RT', 'Physical Chemistry', 'medium'),

(4, 'Which ion is diamagnetic?',
 'Cu⁺', 'Fe³⁺', 'Mn²⁺', 'Co²⁺', 'A',
 'Cu⁺ (d¹⁰) has no unpaired electrons → diamagnetic.', 'Inorganic', 'hard'),

(4, 'The functional group in carboxylic acids is:',
 '-COOH', '-CHO', '-CO-', '-OH', 'A',
 'Carboxyl group: -COOH.', 'Organic', 'easy'),

(4, 'Calculate the normality of 0.3 M H₃PO₄ solution for complete neutralization with NaOH.',
 '0.9 N', '0.3 N', '1.2 N', '0.6 N', 'A',
 'H₃PO₄ has 3 replaceable H⁺ → normality = 3 × molarity = 0.9 N.', 'Analytical', 'medium'),

(4, 'Which of the following exhibits geometric isomerism?',
 'But-2-ene', 'Ethene', 'Propene', 'But-1-ene', 'A',
 'But-2-ene has cis and trans isomers due to restricted rotation around C=C.', 'Organic', 'medium'),

(4, 'The standard reduction potential of Li⁺/Li is -3.04 V. This means Li is:',
 'Strongest reducing agent', 'Strongest oxidizing agent', 'Weak reducing agent', 'Inert', 'A',
 'Most negative E° → strongest tendency to lose electrons (strong reducing agent).', 'Electrochemistry', 'medium'),

(4, 'Which compound is used in the preparation of Bakelite?',
 'Phenol and formaldehyde', 'Urea and formaldehyde', 'Ethene and chlorine', 'Styrene and butadiene', 'A',
 'Phenol + HCHO → Bakelite (phenolic resin).', 'Organic', 'medium'),

(4, 'The rate constant of a zero-order reaction has the unit:',
 'mol L⁻¹ s⁻¹', 's⁻¹', 'L mol⁻¹ s⁻¹', 'L² mol⁻² s⁻¹', 'A',
 'Rate = k [A]⁰ → k = rate → mol L⁻¹ s⁻¹.', 'Physical Chemistry', 'medium'),

(4, 'Which of the following is an allotrope of carbon?',
 'Diamond', 'Graphite', 'Fullerene', 'All of the above', 'D',
 'Diamond, graphite, fullerene, graphene, etc. are carbon allotropes.', 'Inorganic', 'easy'),

(4, 'The common name of ethanoic acid is:',
 'Acetic acid', 'Formic acid', 'Propionic acid', 'Butyric acid', 'A',
 'CH₃COOH → acetic acid.', 'Organic', 'easy'),

(4, 'In flame photometry, the element most commonly determined is:',
 'Sodium', 'Calcium', 'Potassium', 'All of the above', 'D',
 'Alkali and alkaline earth metals emit characteristic flame colors.', 'Analytical', 'medium'),

(4, 'Which gas turns lime water milky?',
 'CO₂', 'SO₂', 'NO₂', 'H₂', 'A',
 'CO₂ + Ca(OH)₂ → CaCO₃ (white ppt) + H₂O.', 'Inorganic', 'easy'),

(4, 'The compound CH₃CH₂OCH₂CH₃ is:',
 'Diethyl ether', 'Ethyl methyl ether', 'Dimethyl ether', 'Ethoxyethane', 'A',
 'Common name: diethyl ether; IUPAC: ethoxyethane.', 'Organic', 'easy'),

(4, 'The Le Chatelier’s principle predicts that increasing pressure on N₂ + 3H₂ ⇌ 2NH₃ will:',
 'Favor forward reaction', 'Favor backward reaction', 'No effect', 'Stop reaction', 'A',
 '4 moles gas → 2 moles → pressure increase shifts to fewer moles (forward).', 'Physical Chemistry', 'medium'),

(4, 'Which of the following is used as a drying agent for ammonia gas?',
 'Quicklime (CaO)', 'Conc. H₂SO₄', 'Anhydrous CaCl₂', 'P₄O₁₀', 'A',
 'CaO absorbs water but does not react with NH₃.', 'Inorganic', 'medium'),

(4, 'The monomer of PVC is:',
 'Vinyl chloride', 'Ethene', 'Styrene', 'Tetrafluoroethene', 'A',
 'Poly(vinyl chloride) from CH₂=CHCl.', 'Organic', 'easy'),

(4, 'The pH at the equivalence point of strong acid vs weak base titration is:',
 'Less than 7', 'Greater than 7', 'Equal to 7', 'Depends on concentration', 'A',
 'Salt formed is acidic (e.g., NH₄Cl), so pH < 7.', 'Analytical', 'medium'),

(4, 'Which element has the electron configuration [Kr] 5s² 4d¹⁰ 5p⁵?',
 'Iodine', 'Bromine', 'Chlorine', 'Astatine', 'A',
 'Kr (36) + 2 + 10 + 5 = 53 electrons → Iodine (Z=53).', 'Atomic Structure', 'medium'),

(4, 'The reaction of alkene with cold alkaline KMnO₄ gives:',
 'Vicinal diol', 'Aldehyde', 'Carboxylic acid', 'Ketone', 'A',
 'Syn-dihydroxylation (Baeyer’s reagent).', 'Organic', 'medium'),

(4, 'Faraday’s first law of electrolysis relates to:',
 'Mass deposited proportional to quantity of electricity', 'Equivalent weight', 'Nature of electrolyte', 'Voltage applied', 'A',
 'm ∝ Q (m = Z × Q).', 'Electrochemistry', 'easy'),

(4, 'Which of the following is a buffer solution?',
 'CH₃COOH + CH₃COONa', 'HCl + NaCl', 'NaOH + NaCl', 'H₂SO₄ + Na₂SO₄', 'A',
 'Weak acid + its salt → acidic buffer.', 'Physical Chemistry', 'medium'),

(4, 'The IUPAC name of CH₃COCH₂CH₃ is:',
 'Butan-2-one', 'Butanone', 'Propanone', 'Methyl ethyl ketone', 'A',
 'Four carbons, ketone at position 2 → butan-2-one.', 'Organic', 'easy'),

(4, 'Which metal is extracted by the Hall-Héroult process?',
 'Aluminium', 'Iron', 'Copper', 'Zinc', 'A',
 'Electrolysis of alumina dissolved in cryolite.', 'Inorganic', 'medium'),

(4, 'The activation energy of a reaction can be determined from:',
 'Arrhenius equation', 'Rate law', 'Equilibrium constant', 'Nernst equation', 'A',
 'k = A e^(-Ea/RT) → plot ln k vs 1/T gives Ea.', 'Physical Chemistry', 'medium'),

(4, 'Which compound gives iodoform test?',
 'Ethanol', 'Acetone', 'Acetaldehyde', 'All of the above', 'D',
 'Compounds with CH₃CH(OH)- or CH₃CO- group give yellow ppt with I₂/NaOH.', 'Organic', 'medium'),

(4, 'The most stable oxidation state of manganese is:',
 '+2', '+7', '+4', '+6', 'A',
 'Mn²⁺ is most stable in aqueous solution.', 'Inorganic', 'medium'),

(4, 'In complexometric titration, EDTA is used to determine:',
 'Hardness of water (Ca²⁺, Mg²⁺)', 'Chloride ions', 'Sulfate ions', 'Phosphate ions', 'A',
 'EDTA forms stable complexes with Ca²⁺ and Mg²⁺.', 'Analytical', 'medium'),

(4, 'The compound with formula C₆H₅NH₂ is:',
 'Aniline', 'Phenol', 'Benzylamine', 'Nitrobenzene', 'A',
 'Aminobenzene → aniline.', 'Organic', 'easy'),

(4, 'Which of the following has the lowest pKa value?',
 'HCl', 'CH₃COOH', 'HF', 'H₂CO₃', 'A',
 'Strongest acid has lowest pKa (HCl ≈ -7).', 'Acids/Bases', 'medium'),

(4, 'The process of coating iron with zinc to prevent rusting is called:',
 'Galvanization', 'Electroplating', 'Anodizing', 'Tinning', 'A',
 'Sacrificial protection using more reactive Zn.', 'Inorganic', 'easy'),

(4, 'In SN1 reaction, the rate depends on:',
 'Concentration of substrate only', 'Concentration of nucleophile', 'Both substrate and nucleophile', 'Temperature only', 'A',
 'Unimolecular – rate = k [RX].', 'Organic', 'medium'),

(4, 'The SI unit of electric conductance is:',
 'Siemens (S)', 'Ohm', 'Ampere', 'Volt', 'A',
 'Conductance = 1/resistance → S = A/V.', 'Physical/Electrochemistry', 'easy'),
 
 (4, 'The compound responsible for the smell of rotten eggs is:',
 'H₂S', 'SO₂', 'NH₃', 'CH₄', 'A',
 'Hydrogen sulfide (H₂S) has a characteristic rotten egg odor.', 'Inorganic', 'easy'),

(4, 'Which of the following is a secondary alcohol?',
 'Propan-2-ol', 'Propan-1-ol', 'Ethanol', '2-Methylpropan-2-ol', 'A',
 'Secondary alcohol has the -OH group attached to a carbon bonded to two other carbons.', 'Organic', 'easy'),

(4, 'The common ion effect suppresses the ionization of a weak electrolyte when:',
 'A common ion is added from a strong electrolyte', 'Temperature is increased', 'Dilution occurs', 'Pressure is applied', 'A',
 'Adding a common ion shifts equilibrium left (Le Chatelier’s principle).', 'Physical Chemistry', 'medium'),

(4, 'Which metal reacts with steam but not with cold water?',
 'Magnesium', 'Sodium', 'Potassium', 'Calcium', 'A',
 'Mg reacts slowly with steam to form MgO and H₂; alkali metals react vigorously with cold water.', 'Inorganic', 'medium'),

(4, 'The monomer of Teflon is:',
 'Tetrafluoroethene', 'Vinyl chloride', 'Styrene', 'Ethene', 'A',
 'Polytetrafluoroethylene (PTFE) from CF₂=CF₂.', 'Organic', 'medium'),

(4, 'In Kjeldahl’s method, nitrogen is estimated by converting it to:',
 'Ammonium sulfate', 'Ammonia', 'Nitric acid', 'Nitrogen gas', 'B',
 'Organic compound → NH₃ → absorbed in H₂SO₄ as (NH₄)₂SO₄, then distilled and titrated.', 'Analytical', 'medium'),

(4, 'The standard electrode potential for the half-cell Fe³⁺/Fe²⁺ is +0.77 V. This indicates that Fe³⁺ is:',
 'A good oxidizing agent', 'A good reducing agent', 'Inert', 'Weak acid', 'A',
 'Positive E° means Fe³⁺ tends to gain electrons (oxidizing agent).', 'Electrochemistry', 'medium'),

(4, 'Which of the following shows tautomerism?',
 'Acetone', 'Ethanol', 'Benzene', 'Ethene', 'A',
 'Keto-enol tautomerism in acetone (CH₃COCH₃ ⇌ CH₂=C(OH)CH₃).', 'Organic', 'medium'),

(4, 'The solubility product (Ksp) of sparingly soluble salt is:',
 'Product of ion concentrations at saturation', 'Product of molar solubilities', 'Inverse of solubility', 'Equal to solubility', 'A',
 'For AB ⇌ A⁺ + B⁻, Ksp = [A⁺][B⁻].', 'Physical Chemistry', 'medium'),

(4, 'Which gas is used in the manufacture of soda lime?',
 'CO₂', 'NH₃', 'Cl₂', 'SO₂', 'A',
 'Ca(OH)₂ + CO₂ → CaCO₃ + H₂O (soda lime production).', 'Inorganic', 'medium'),

(4, 'The reaction CH₄ + Cl₂ → CH₃Cl + HCl (in sunlight) is an example of:',
 'Free radical substitution', 'Electrophilic addition', 'Nucleophilic substitution', 'Elimination', 'A',
 'Initiation, propagation, termination steps with chlorine radicals.', 'Organic', 'medium'),

(4, 'The indicator methyl orange shows color change in the pH range:',
 '3.1–4.4', '4.2–6.3', '6.2–7.6', '8.2–10.0', 'A',
 'Red in acid, yellow in base; suitable for strong acid–strong base or weak base titrations.', 'Analytical', 'medium'),

(4, 'Which element has the highest first ionization energy?',
 'Helium', 'Neon', 'Fluorine', 'Nitrogen', 'A',
 'He has the smallest size and highest effective nuclear charge among these.', 'Inorganic', 'medium'),

(4, 'In Cannizzaro reaction, the aldehyde that undergoes it must have:',
 'No alpha hydrogen', 'Alpha hydrogen', 'Aromatic ring', 'Double bond', 'A',
 'Aldehydes without α-H (e.g., benzaldehyde, formaldehyde) undergo disproportionation.', 'Organic', 'hard'),

(4, 'The cell reaction in a lead-acid battery during discharge is:',
 'Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O', 'Pb + SO₄²⁻ → PbSO₄', 'PbO₂ + 4H⁺ + SO₄²⁻ + 2e⁻ → PbSO₄ + 2H₂O', 'Both A and C contribute', 'D',
 'Overall discharge reaction consumes H₂SO₄ and produces PbSO₄ and water.', 'Electrochemistry', 'hard'),

(4, 'Which of the following is a lyophilic colloid?',
 'Starch in water', 'Gold sol', 'Fe(OH)₃ sol', 'As₂S₃ sol', 'A',
 'Lyophilic colloids (solvent-loving) are stable and reversible (e.g., starch, gelatin).', 'Physical Chemistry', 'medium'),

(4, 'The IUPAC name of CH₃CH(OH)CH₂CH₃ is:',
 'Butan-2-ol', 'Butan-1-ol', '2-Butanol', 'sec-Butyl alcohol', 'A',
 'Four-carbon chain, -OH on carbon 2 → butan-2-ol.', 'Organic', 'easy'),

(4, 'Which compound is used as a refrigerant in domestic refrigerators?',
 'Freon (CCl₂F₂)', 'Ammonia', 'CO₂', 'SO₂', 'A',
 'Chlorofluorocarbons (CFCs) like Freon-12 were widely used (now phased out).', 'Organic/Inorganic', 'medium'),

(4, 'The order of a reaction can be determined by:',
 'Plotting suitable graphs or half-life method', 'Measuring initial rate only', 'Equilibrium constant', 'Nernst equation', 'A',
 'Integrated rate laws give straight lines for different orders.', 'Physical Chemistry', 'medium'),

(4, 'Which of the following is an example of interstitial compound?',
 'Steel (Fe + C)', 'Brass (Cu + Zn)', 'Bronze (Cu + Sn)', 'Solder (Pb + Sn)', 'A',
 'Small atoms (C, H, N) occupy interstitial sites in metal lattice.', 'Inorganic', 'medium'),

(4, 'In gravimetric analysis, the precipitate should be:',
 'Insoluble, pure, and easily filterable', 'Highly soluble', 'Colored', 'Volatile', 'A',
 'Ideal precipitate has low solubility product, large particle size, and known composition.', 'Analytical', 'medium'),

(4, 'Which alkene on ozonolysis gives only one product (acetone)?',
 '2-Methylpropene', 'But-2-ene', 'Ethene', 'Propene', 'A',
 '(CH₃)₂C=CH₂ → 2 (CH₃)₂C=O.', 'Organic', 'hard'),

(4, 'The electrode used as reference in pH measurement is:',
 'Calomel electrode', 'Hydrogen electrode', 'Silver-silver chloride', 'Both A and C', 'D',
 'Saturated calomel electrode (SCE) or Ag/AgCl are common reference electrodes.', 'Analytical/Electrochemistry', 'medium'),

(4, 'Which of the following has maximum dipole moment?',
 'NH₃', 'NF₃', 'BF₃', 'CH₄', 'A',
 'NH₃ has a significant dipole due to lone pair on N; NF₃ has opposing effects but smaller net dipole.', 'Physical/Inorganic', 'hard'),

(4, 'The reaction of Grignard reagent with CO₂ followed by hydrolysis gives:',
 'Carboxylic acid', 'Alcohol', 'Aldehyde', 'Ketone', 'A',
 'RMgX + CO₂ → RCOOMgX → RCOOH.', 'Organic', 'medium'),

(4, 'The unit of rate constant for a third-order reaction is:',
 'L² mol⁻² s⁻¹', 'L mol⁻¹ s⁻¹', 'mol L⁻¹ s⁻¹', 's⁻¹', 'A',
 'Rate = k [A]³ → k = rate / [A]³ → units: mol L⁻¹ s⁻¹ / (mol L⁻¹)³ = L² mol⁻² s⁻¹.', 'Physical Chemistry', 'medium'),

(4, 'Which of the following is used to absorb CO₂ in respiration experiments?',
 'KOH', 'NaOH', 'Ca(OH)₂', 'All of the above', 'D',
 'Potassium hydroxide is commonly used in soda lime or as solution.', 'Inorganic', 'easy'),

(4, 'The compound CH₃COCH₃ is:',
 'Acetone', 'Acetaldehyde', 'Acetic acid', 'Ethyl methyl ketone', 'A',
 'Dimethyl ketone → acetone (propan-2-one).', 'Organic', 'easy'),

(4, 'In chromatography, Rf value is:',
 'Distance travelled by solute / distance travelled by solvent', 'Distance travelled by solvent / distance travelled by solute', 'Area under peak', 'Retention time', 'A',
 'Rf is constant for a compound under given conditions.', 'Analytical', 'medium'),

(4, 'Which halogen forms interhalogen compound with lowest boiling point?',
 'Fluorine', 'Chlorine', 'Bromine', 'Iodine', 'A',
 'Interhalogens like ClF, BrF₃; fluorine compounds often more volatile.', 'Inorganic', 'hard'),

(4, 'The electrophile in Friedel-Crafts acylation is:',
 'CH₃CO⁺ (acylium ion)', 'CH₃⁺', 'AlCl₃', 'Cl⁻', 'A',
 'AlCl₃ + CH₃COCl → CH₃CO⁺ + AlCl₄⁻.', 'Organic', 'medium'),

(4, 'Nernst equation for a cell is E = E° - (RT/nF) ln Q. At 298 K, (RT/F) ≈ 0.059/n, so the term becomes:',
 'E = E° - (0.059/n) log Q', 'E = E° + (0.059/n) log Q', 'E = E° - (0.0257/n) ln Q', 'Both A and C are equivalent', 'D',
 '0.059/n log Q is common approximation at 25°C.', 'Electrochemistry', 'medium'),

(4, 'Which of the following is an example of chain growth polymer?',
 'Polythene', 'Nylon-6,6', 'Bakelite', 'Terylene', 'A',
 'Addition polymerization (e.g., ethene → polyethene).', 'Organic', 'medium'),

(4, 'The color of KMnO₄ in acidic medium disappears due to reduction to:',
 'Mn²⁺ (colorless)', 'MnO₂ (brown)', 'MnO₄²⁻ (green)', 'Mn³⁺ (red)', 'A',
 'MnO₄⁻ (purple) → Mn²⁺ (very pale pink/almost colorless) in acidic medium.', 'Inorganic', 'medium'),

(4, 'Which titration is used to determine the strength of vinegar?',
 'Strong base vs weak acid', 'Weak base vs strong acid', 'Strong acid vs strong base', 'Redox titration', 'A',
 'CH₃COOH (weak acid) titrated with NaOH using phenolphthalein.', 'Analytical', 'easy'),

(4, 'The compound with formula C₆H₅CHO is:',
 'Benzaldehyde', 'Acetophenone', 'Benzoic acid', 'Phenol', 'A',
 'Benzene carbaldehyde → benzaldehyde.', 'Organic', 'easy'),

(4, 'Which factor does NOT affect the rate of a heterogeneous reaction?',
 'Concentration of solid reactant', 'Surface area of solid', 'Temperature', 'Concentration of gaseous reactant', 'A',
 'Solids have constant concentration; rate depends on surface area instead.', 'Physical Chemistry', 'medium'),

(4, 'The alloy used for making permanent magnets is:',
 'Alnico', 'Brass', 'Bronze', 'Solder', 'A',
 'Alnico contains Al, Ni, Co, Fe.', 'Inorganic', 'medium'),

(4, 'In Reimer-Tiemann reaction, phenol reacts with CHCl₃ in presence of NaOH to give:',
 'Salicylaldehyde', 'Benzaldehyde', 'Phenol', 'Benzoic acid', 'A',
 'Ortho-hydroxybenzaldehyde (salicylaldehyde) is the main product.', 'Organic', 'hard'),

(4, 'The equivalent weight of KMnO₄ in acidic medium is:',
 'M/5', 'M/3', 'M/2', 'M', 'A',
 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O → change of 5 electrons → eq. wt. = mol. wt./5.', 'Analytical', 'medium'),

(4, 'Which of the following shows the highest lattice energy?',
 'LiF', 'NaCl', 'KBr', 'RbI', 'A',
 'Smallest ions with highest charges give highest lattice energy (Li⁺ and F⁻).', 'Physical Chemistry', 'medium'),

(4, 'The IUPAC name of CH₃CH₂COCH₃ is:',
 'Butan-2-one', 'Propanone', 'Butanone', 'Methyl ethyl ketone', 'A',
 'CH₃CH₂COCH₃ = four carbons, ketone at position 2.', 'Organic', 'easy'),

(4, 'Which process is used for large-scale production of sulfuric acid?',
 'Contact process', 'Lead chamber process', 'Ostwald process', 'Haber process', 'A',
 'Contact process: SO₂ → SO₃ (V₂O₅ catalyst) → H₂SO₄.', 'Inorganic', 'medium'),

(4, 'The half-life of a radioactive isotope is 2 hours. What fraction remains after 6 hours?',
 '1/8', '1/4', '1/2', '1/16', 'A',
 '3 half-lives → (1/2)³ = 1/8.', 'Physical Chemistry', 'medium'),

(4, 'Which functional group gives positive FeCl₃ test (violet color)?',
 'Phenols', 'Alcohols', 'Aldehydes', 'Ketones', 'A',
 'Enolic form of phenols complexes with Fe³⁺.', 'Organic', 'medium'),

(4, 'In potentiometric titration, the endpoint is determined by:',
 'Sharp change in potential', 'Color change', 'Precipitate formation', 'Gas evolution', 'A',
 'Potential jump at equivalence point.', 'Analytical/Electrochemistry', 'medium'),

(4, 'The element with atomic number 26 is:',
 'Iron', 'Cobalt', 'Nickel', 'Copper', 'A',
 'Fe (Z=26).', 'Inorganic', 'easy'),

(4, 'Which of the following is an example of nucleophilic addition reaction?',
 'Aldehydes with HCN', 'Alkenes with HBr', 'Benzene with Cl₂', 'Alkanes with Cl₂', 'A',
 'Carbonyl compounds undergo nucleophilic addition (e.g., cyanohydrin formation).', 'Organic', 'medium'),

(4, 'The salt that gives acidic solution in water is:',
 'NH₄Cl', 'Na₂CO₃', 'KCl', 'NaCH₃COO', 'A',
 'NH₄⁺ hydrolyzes to give H⁺ (from weak base NH₃ + strong acid HCl).', 'Physical Chemistry', 'medium'),

(4, 'Which gas is liberated when dilute H₂SO₄ is added to zinc?',
 'Hydrogen', 'Oxygen', 'Sulfur dioxide', 'Carbon dioxide', 'A',
 'Zn + H₂SO₄ → ZnSO₄ + H₂.', 'Inorganic', 'easy'),
 
 (4, 'The compound CH₃CH₂CH₂COOH is named:',
 'Butanoic acid', 'Propanoic acid', 'Butyric acid', 'Both A and C', 'D',
 'IUPAC: butanoic acid; common name: butyric acid.', 'Organic', 'easy'),

(4, 'Which of the following is used as an oxidizing agent in the preparation of aldehydes from alcohols?',
 'PCC (Pyridinium chlorochromate)', 'KMnO₄ (alkaline)', 'K₂Cr₂O₇ (acidic)', 'Both B and C', 'A',
 'PCC selectively oxidizes primary alcohols to aldehydes without further oxidation.', 'Organic', 'medium'),

(4, 'The colligative property that depends on the number of particles is:',
 'All colligative properties', 'Only osmotic pressure', 'Only boiling point elevation', 'Only freezing point depression', 'A',
 'Relative lowering of vapour pressure, boiling point elevation, freezing point depression, and osmotic pressure all depend on particle number.', 'Physical Chemistry', 'medium'),

(4, 'Which of the following elements forms the maximum number of oxides?',
 'Nitrogen', 'Phosphorus', 'Sulfur', 'Chlorine', 'A',
 'Nitrogen forms N₂O, NO, N₂O₃, NO₂, N₂O₅ (five oxides).', 'Inorganic', 'medium'),

(4, 'The reaction of ethene with bromine water gives:',
 '1,2-Dibromoethane', 'Bromoethane', 'Ethanol', 'Ethyl bromide', 'A',
 'Br₂ adds across the double bond → vicinal dibromide (anti addition).', 'Organic', 'easy'),

(4, 'In iodometric titration, iodine is liberated from KI by:',
 'Strong oxidizing agent', 'Strong reducing agent', 'Weak acid', 'Weak base', 'A',
 'Example: Cu²⁺ + 2I⁻ → CuI + ½I₂; liberated I₂ is titrated with Na₂S₂O₃.', 'Analytical', 'medium'),

(4, 'The E° value for the half-cell Cu²⁺ + 2e⁻ → Cu is +0.34 V. This means Cu²⁺ is:',
 'A weaker oxidizing agent than H⁺', 'A stronger oxidizing agent than H⁺', 'A reducing agent', 'Inert', 'B',
 'Positive E° > 0 (H⁺/H₂ = 0 V) → Cu²⁺ is a stronger oxidizing agent.', 'Electrochemistry', 'medium'),

(4, 'Which compound does NOT show stereoisomerism?',
 '2-Methylpropane', 'But-2-ene', '2-Butanol', 'Lactic acid', 'A',
 '2-Methylpropane (isobutane) has no chiral center or double bond for cis-trans.', 'Organic', 'medium'),

(4, 'The pH of 10⁻⁸ M HCl solution is approximately:',
 '6.98', '7.00', '8.00', '2.00', 'A',
 'Very dilute strong acid: [H⁺] from HCl ≈ 10⁻⁸, from water 10⁻⁷ → total [H⁺] ≈ 1.1 × 10⁻⁷ → pH ≈ 6.96–7.0.', 'Physical Chemistry', 'hard'),

(4, 'Which of the following is a reducing agent?',
 'NaH', 'KMnO₄', 'K₂Cr₂O₇', 'HNO₃ (conc.)', 'A',
 'Sodium hydride (NaH) donates hydride ion (H⁻), strong reducing agent.', 'Inorganic', 'medium'),

(4, 'The reaction C₂H₅Br + KOH (alc.) → C₂H₄ + KBr + H₂O is:',
 'Elimination (E2)', 'Substitution (SN2)', 'Substitution (SN1)', 'Addition', 'A',
 'Alcoholic KOH → dehydrohalogenation → alkene (β-elimination).', 'Organic', 'medium'),

(4, 'In complexometric titration with EDTA, the indicator used is:',
 'Eriochrome Black T', 'Phenolphthalein', 'Methyl orange', 'Potassium chromate', 'A',
 'Eriochrome Black T forms wine-red complex with Mg²⁺/Ca²⁺; changes to blue at endpoint.', 'Analytical', 'medium'),

(4, 'Which of the following has the highest bond dissociation energy?',
 'H–F', 'H–Cl', 'H–Br', 'H–I', 'A',
 'Bond strength decreases down the group due to increasing size → H–F strongest.', 'Inorganic/Physical', 'medium'),

(4, 'The compound that gives positive Tollens’ test is:',
 'Aldehydes', 'Ketones', 'Carboxylic acids', 'Esters', 'A',
 'Tollens’ reagent (ammoniacal AgNO₃) oxidizes aldehydes to carboxylic acids, depositing silver mirror.', 'Organic', 'easy'),

(4, 'In a concentration cell, the emf is zero when:',
 'Concentrations of both half-cells are equal', 'Electrodes are identical', 'Temperature is same', 'Both A and B', 'D',
 'E = (RT/nF) ln (C₂/C₁); when C₂ = C₁, E = 0.', 'Electrochemistry', 'medium'),

(4, 'Which of the following is a condensation polymer?',
 'Nylon-6,6', 'Polythene', 'PVC', 'Teflon', 'A',
 'Nylon-6,6 from hexamethylenediamine + adipic acid (condensation with loss of H₂O).', 'Organic', 'medium'),

(4, 'The IUPAC name of CH₃CH=CHCOOH is:',
 'But-2-enoic acid', 'Butenoic acid', 'Crotonic acid', 'Both A and C', 'D',
 'IUPAC: but-2-enoic acid; common: crotonic acid.', 'Organic', 'medium'),

(4, 'Which gas is evolved when ammonium dichromate is heated?',
 'Nitrogen', 'Oxygen', 'Ammonia', 'Nitrous oxide', 'A',
 '(NH₄)₂Cr₂O₇ → Cr₂O₃ + N₂ + 4H₂O (volcano experiment).', 'Inorganic', 'easy'),

(4, 'The rate of a reaction increases with temperature because:',
 'Activation energy decreases', 'Number of effective collisions increases', 'Catalyst is formed', 'Equilibrium shifts', 'B',
 'Higher temperature increases kinetic energy → more molecules exceed Ea.', 'Physical Chemistry', 'easy'),

(4, 'Which of the following is used in the test for unsaturation?',
 'Bromine water', 'Baeyer’s reagent', 'Both A and B', 'KMnO₄ (acidic)', 'C',
 'Decolorization of Br₂ water or cold alkaline KMnO₄ indicates unsaturation.', 'Organic', 'easy'),

(4, 'The standard hydrogen electrode has E° = 0 V by convention because:',
 'It is the reference electrode', 'Hydrogen is most abundant', 'It is inert', 'It has zero potential difference', 'A',
 'All other potentials are measured relative to SHE.', 'Electrochemistry', 'easy'),

(4, 'Which element exhibits +7 oxidation state most commonly?',
 'Manganese', 'Chlorine', 'Iodine', 'Fluorine', 'B',
 'Chlorine in Cl₂O₇, HClO₄; fluorine does not show positive oxidation states.', 'Inorganic', 'medium'),

(4, 'In paper chromatography, the stationary phase is:',
 'Water adsorbed on cellulose', 'Mobile solvent', 'Silica gel', 'Alumina', 'A',
 'Paper chromatography uses water bound to cellulose fibers as stationary phase.', 'Analytical', 'medium'),

(4, 'The compound CH₃COOC₂H₅ is:',
 'Ethyl ethanoate', 'Ethyl acetate', 'Methyl ethanoate', 'Both A and B', 'D',
 'IUPAC: ethyl ethanoate; common: ethyl acetate.', 'Organic', 'easy'),

(4, 'Which of the following is an example of auto-catalysis?',
 'Oxidation of oxalic acid by KMnO₄', 'Decomposition of H₂O₂', 'Hydrolysis of ester', 'Both A and B', 'A',
 'Mn²⁺ produced acts as catalyst in acidic KMnO₄ + oxalic acid reaction.', 'Physical Chemistry', 'hard'),

(4, 'The alloy used for making heating elements is:',
 'Nichrome', 'Brass', 'Bronze', 'Duralumin', 'A',
 'Ni + Cr alloy has high resistance and melting point.', 'Inorganic', 'easy'),

(4, 'Which reaction is used to convert alkyl halide to nitrile?',
 'Reaction with KCN', 'Reaction with AgCN', 'Reaction with NaCN', 'Both A and C', 'D',
 'RX + KCN (or NaCN) → RCN + KX (SN2).', 'Organic', 'medium'),

(4, 'The equivalent conductance at infinite dilution (Λ°) is:',
 'Sum of ionic conductances of cation and anion', 'Product of ionic conductances', 'Difference of ionic conductances', 'Independent of ions', 'A',
 'Kohlrausch’s law: Λ° = λ°cation + λ°anion.', 'Physical Chemistry', 'medium'),

(4, 'Which gas is used for ripening of fruits?',
 'Ethene (ethylene)', 'Acetylene', 'Methane', 'Carbon monoxide', 'A',
 'Ethylene (C₂H₄) is a natural plant hormone for fruit ripening.', 'Organic', 'easy'),

(4, 'In flame test, potassium gives:',
 'Violet color', 'Brick red', 'Green', 'Yellow', 'A',
 'K⁺ gives violet (lilac) flame.', 'Analytical/Inorganic', 'easy'),

(4, 'The compound that undergoes haloform reaction is:',
 'Acetaldehyde', 'Acetone', 'Ethyl methyl ketone', 'All of the above', 'D',
 'Compounds with CH₃CO– or CH₃CH(OH)– group give haloform with X₂/NaOH.', 'Organic', 'medium'),

(4, 'The process used for concentration of sulphide ores is:',
 'Froth flotation', 'Gravity separation', 'Magnetic separation', 'Leaching', 'A',
 'Sulphide ores are preferentially wetted by oil → froth flotation.', 'Inorganic', 'medium'),

(4, 'Which of the following has sp² hybridization?',
 'Ethene carbon', 'Methane carbon', 'Acetylene carbon', 'Ammonia nitrogen', 'A',
 'C=C bond in ethene: sp² hybridized carbons.', 'Organic', 'easy'),

(4, 'The emf of a cell is independent of:',
 'Size of electrodes', 'Concentration of electrolytes', 'Temperature', 'Nature of reaction', 'A',
 'E° is intensive property; electrode size does not affect potential.', 'Electrochemistry', 'medium'),

(4, 'Which compound is used in perfume industry?',
 'Esters', 'Aldehydes', 'Ketones', 'All of the above', 'D',
 'Many esters (fruity), aldehydes (floral), and some ketones have pleasant odors.', 'Organic', 'easy'),

(4, 'The indicator used in strong acid vs strong base titration can be:',
 'Any (phenolphthalein, methyl orange, etc.)', 'Only phenolphthalein', 'Only methyl orange', 'Only bromothymol blue', 'A',
 'Sharp color change around pH 7 for any suitable indicator.', 'Analytical', 'easy'),

(4, 'Which of the following is a metalloid?',
 'Silicon', 'Germanium', 'Arsenic', 'All of the above', 'D',
 'Si, Ge, As show properties intermediate between metals and non-metals.', 'Inorganic', 'easy'),

(4, 'The reaction mechanism of SN2 is:',
 'One-step, backside attack, inversion of configuration', 'Two-step, carbocation intermediate', 'Two-step, retention', 'Frontside attack', 'A',
 'Bimolecular nucleophilic substitution → concerted, inversion.', 'Organic', 'medium'),

(4, 'The boiling point of water at high altitude is lower because:',
 'Atmospheric pressure is lower', 'Temperature is lower', 'Humidity is higher', 'Gravity is less', 'A',
 'Lower external pressure → lower boiling point.', 'Physical Chemistry', 'easy'),

(4, 'Which element is used in making transistors?',
 'Silicon', 'Germanium', 'Both A and B', 'Gallium', 'C',
 'Si and Ge are semiconductors used in transistors.', 'Inorganic', 'medium'),

(4, 'The compound CH₃NH₂ is:',
 'Methylamine', 'Ethylamine', 'Aniline', 'Dimethylamine', 'A',
 'CH₃NH₂ → methylamine (primary amine).', 'Organic', 'easy'),

(4, 'In conductometric titration of strong acid vs strong base, the conductance:',
 'Decreases then increases sharply', 'Increases continuously', 'Decreases continuously', 'Remains constant', 'A',
 'Initial decrease (H⁺ replaced by Na⁺), sharp increase after equivalence (excess OH⁻).', 'Analytical/Physical', 'medium'),

(4, 'Which of the following is an example of lyophobic colloid?',
 'Fe(OH)₃ sol', 'Starch sol', 'Gelatin', 'Egg albumin', 'A',
 'Lyophobic colloids (solvent-repelling) are irreversible and less stable.', 'Physical Chemistry', 'medium'),

(4, 'The IUPAC name of (CH₃)₂CHCHO is:',
 '2-Methylpropanal', 'Isobutyraldehyde', 'Both A and B', 'Propanal', 'C',
 'IUPAC: 2-methylpropanal; common: isobutyraldehyde.', 'Organic', 'medium'),

(4, 'Which process is used for purification of noble metals?',
 'Zone refining', 'Distillation', 'Electrolytic refining', 'Vapour phase refining', 'A',
 'Zone refining for ultra-pure semiconductors and noble metals.', 'Inorganic', 'medium'),

(4, 'The activation energy is:',
 'Energy required to form activated complex', 'Energy released in reaction', 'Difference between reactant and product energy', 'Heat of reaction', 'A',
 'Minimum energy barrier reactants must overcome.', 'Physical Chemistry', 'easy'),

(4, 'Which test distinguishes between phenol and alcohol?',
 'Ferric chloride test', 'Lucas test', 'Iodoform test', 'Tollens’ test', 'A',
 'Phenol gives violet color with FeCl₃; alcohols do not.', 'Organic', 'medium'),

(4, 'The salt bridge in a galvanic cell is used to:',
 'Maintain electrical neutrality', 'Increase cell potential', 'Decrease resistance', 'Both A and C', 'D',
 'Allows ion migration without mixing solutions.', 'Electrochemistry', 'easy'),

(4, 'Which of the following is a natural polymer?',
 'Cellulose', 'Nylon', 'Teflon', 'PVC', 'A',
 'Cellulose is a polysaccharide found in plants.', 'Organic', 'easy'),
 
 (4, 'The compound CH₃CH₂OH is:',
 'Ethanol', 'Methanol', 'Propanol', 'Butanol', 'A',
 'Ethyl alcohol (common name); IUPAC: ethanol.', 'Organic', 'easy'),

(4, 'Which of the following is used as a mordant in dyeing?',
 'Alum (KAl(SO₄)₂·12H₂O)', 'NaCl', 'CaCO₃', 'MgSO₄', 'A',
 'Alum helps fix dyes to fabrics by forming insoluble complexes.', 'Inorganic', 'medium'),

(4, 'The reaction 2H₂ + O₂ → 2H₂O is an example of:',
 'Combination reaction', 'Decomposition reaction', 'Displacement reaction', 'Double displacement', 'A',
 'Two reactants combine to form a single product.', 'Inorganic', 'easy'),

(4, 'Which functional group is present in amides?',
 '-CONH₂', '-COOH', '-CHO', '-NH₂', 'A',
 'Amides have the carbonyl attached to nitrogen: -CONH₂ or -CONHR.', 'Organic', 'easy'),

(4, 'In Ostwald’s process, nitric acid is prepared from:',
 'Ammonia', 'Nitrogen', 'Nitrous oxide', 'Sodium nitrate', 'A',
 '4NH₃ + 5O₂ → 4NO + 6H₂O (Pt catalyst), then NO → NO₂ → HNO₃.', 'Inorganic', 'medium'),

(4, 'The colligative property used to determine molecular weight of polymers is:',
 'Osmotic pressure', 'Boiling point elevation', 'Freezing point depression', 'Vapour pressure lowering', 'A',
 'Osmotic pressure gives accurate ΔT for large molecules at low concentrations.', 'Physical Chemistry', 'medium'),

(4, 'Which of the following shows maximum paramagnetism?',
 'Mn²⁺', 'Fe³⁺', 'Cu²⁺', 'Zn²⁺', 'B',
 'Fe³⁺ (d⁵) has 5 unpaired electrons in high-spin state.', 'Inorganic', 'hard'),

(4, 'The test for chloride ion in qualitative analysis is:',
 'White ppt with AgNO₃ soluble in NH₄OH', 'Yellow ppt with AgNO₃', 'Black ppt with AgNO₃', 'No ppt', 'A',
 'AgCl is white, dissolves in excess NH₃ forming [Ag(NH₃)₂]⁺.', 'Analytical', 'easy'),

(4, 'The compound C₆H₅COOH is:',
 'Benzoic acid', 'Phenylacetic acid', 'Benzaldehyde', 'Phenol', 'A',
 'Benzenecarboxylic acid → benzoic acid.', 'Organic', 'easy'),

(4, 'In Le Chatelier’s principle, increasing temperature in an exothermic reaction will:',
 'Favor backward reaction', 'Favor forward reaction', 'No effect', 'Stop reaction', 'A',
 'Heat is treated as a product → shift left to absorb heat.', 'Physical Chemistry', 'medium'),

(4, 'Which metal is extracted by the Mond process?',
 'Nickel', 'Iron', 'Copper', 'Aluminium', 'A',
 'Ni + 4CO → Ni(CO)₄ → Ni + 4CO (purification).', 'Inorganic', 'medium'),

(4, 'The reaction of alkene with HBr in presence of peroxide follows:',
 'Anti-Markovnikov addition', 'Markovnikov addition', 'No addition', 'Substitution', 'A',
 'Free radical mechanism → H adds to carbon with fewer H atoms.', 'Organic', 'medium'),

(4, 'The unit of specific conductance (κ) is:',
 'S cm⁻¹', 'S cm² mol⁻¹', 'ohm⁻¹ cm⁻¹', 'Both A and C', 'D',
 'Specific conductance = conductance × cell constant → S cm⁻¹.', 'Physical Chemistry', 'medium'),

(4, 'Which of the following is a non-benzenoid aromatic compound?',
 'Tropylium ion', 'Benzene', 'Pyridine', 'Furan', 'A',
 'Tropylium cation (C₇H₇⁺) is 6π-electron aromatic system.', 'Organic', 'hard'),

(4, 'The reference electrode in glass electrode pH meter is usually:',
 'Calomel electrode', 'Hydrogen electrode', 'Silver electrode', 'Copper electrode', 'A',
 'Saturated calomel electrode provides stable reference potential.', 'Analytical/Electrochemistry', 'medium'),

(4, 'The compound that does not give iodoform test is:',
 'Propanone', 'Ethanol', 'Propan-2-ol', 'Propanal', 'D',
 'Propanal (CH₃CH₂CHO) lacks CH₃CO– or CH₃CH(OH)– group.', 'Organic', 'medium'),

(4, 'Which process is used for desilverization of lead?',
 'Parkes process', 'Pattinson process', 'Cupellation', 'Both A and B', 'D',
 'Zinc forms Ag-Zn crust (Parkes); cooling separates Ag-Pb (Pattinson).', 'Inorganic', 'hard'),

(4, 'The half-life of a second-order reaction is:',
 'Inversely proportional to initial concentration', 'Independent of concentration', 'Proportional to initial concentration', 'Proportional to square of concentration', 'A',
 't₁/₂ = 1 / (k [A]₀) for second-order.', 'Physical Chemistry', 'medium'),

(4, 'Which gas is used in electric discharge tubes for producing different colors?',
 'Neon', 'Argon', 'Helium', 'All of the above', 'D',
 'Noble gases emit characteristic colors under electric discharge.', 'Inorganic', 'easy'),

(4, 'The functional group in esters is:',
 '-COOR', '-COOH', '-CONH₂', '-CHO', 'A',
 'Ester linkage: -COO- between carbonyl and alkoxy group.', 'Organic', 'easy'),

(4, 'In voltammetry, the current is proportional to:',
 'Concentration of analyte', 'Scan rate', 'Electrode area', 'All of the above', 'D',
 'Randles-Sevcik equation relates peak current to concentration, diffusion, etc.', 'Analytical/Electrochemistry', 'hard'),

(4, 'Which of the following is an example of zero-order reaction?',
 'Decomposition of NH₃ on hot tungsten', 'Hydrolysis of sucrose', 'Inversion of cane sugar', 'Decomposition of H₂O₂', 'A',
 'Rate independent of concentration when surface is saturated.', 'Physical Chemistry', 'hard'),

(4, 'The element with highest electron affinity in periodic table is:',
 'Chlorine', 'Fluorine', 'Bromine', 'Iodine', 'A',
 'Cl has slightly higher electron affinity than F due to less electron repulsion.', 'Inorganic', 'medium'),

(4, 'The compound used as tear gas is:',
 'Benzyl chloride', 'Chloroacetophenone', 'Chloropicrin', 'All of the above', 'D',
 'Common tear gases include CN (chloroacetophenone), CS, etc.', 'Organic', 'medium'),

(4, 'In the electrolysis of brine, the product at cathode is:',
 'Hydrogen gas', 'Chlorine gas', 'Sodium hydroxide', 'Oxygen gas', 'A',
 '2H₂O + 2e⁻ → H₂ + 2OH⁻ at cathode (in aqueous solution).', 'Electrochemistry', 'medium'),

(4, 'Which of the following is a heterocyclic compound?',
 'Pyridine', 'Benzene', 'Cyclohexane', 'Ethene', 'A',
 'Pyridine has nitrogen in the aromatic ring.', 'Organic', 'medium'),

(4, 'The indicator phenolphthalein is colorless in:',
 'Acidic medium', 'Basic medium', 'Neutral medium', 'Both A and C', 'A',
 'Colorless below pH 8.2, pink above.', 'Analytical', 'easy'),

(4, 'Which metal is used in thermite process?',
 'Aluminium', 'Iron', 'Copper', 'Zinc', 'A',
 'Al reduces metal oxides (e.g., Fe₂O₃ + 2Al → 2Fe + Al₂O₃).', 'Inorganic', 'medium'),

(4, 'The compound CH₃COCl is:',
 'Acetyl chloride', 'Acetic anhydride', 'Acetamide', 'Acetaldehyde', 'A',
 'Acid chloride of acetic acid.', 'Organic', 'easy');
 
 