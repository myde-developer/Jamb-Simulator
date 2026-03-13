-- ============================================
-- PHYSICS - 200 QUESTIONS
-- Topics: Mechanics, Waves, Electricity, Modern Physics, Heat
-- ============================================

INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty) VALUES
(3, 'A body of mass 5 kg is acted upon by a force F = 10 N. Find its acceleration.',
 '2 m/s²', '5 m/s²', '10 m/s²', '50 m/s²', 'A',
 'F = ma → a = F/m = 10/5 = 2 m/s².', 'Mechanics', 'easy'),

(3, 'Calculate the work done when a force of 20 N moves an object 5 m in the direction of the force.',
 '100 J', '25 J', '4 J', '15 J', 'A',
 'Work = Force × distance = 20 × 5 = 100 J.', 'Mechanics', 'easy'),

(3, 'A car accelerates uniformly from rest to 20 m/s in 10 seconds. Calculate its acceleration.',
 '2 m/s²', '4 m/s²', '10 m/s²', '200 m/s²', 'A',
 'a = (v-u)/t = (20-0)/10 = 2 m/s².', 'Mechanics', 'easy'),

(3, 'What is the potential energy of a 2 kg object at a height of 10 m? (g = 10 m/s²)',
 '200 J', '20 J', '100 J', '50 J', 'A',
 'PE = mgh = 2 × 10 × 10 = 200 J.', 'Mechanics', 'easy'),

(3, 'Calculate the kinetic energy of a 2 kg object moving at 3 m/s.',
 '9 J', '6 J', '3 J', '18 J', 'A',
 'KE = ½mv² = ½ × 2 × 9 = 9 J.', 'Mechanics', 'easy'),

(3, 'A force of 10 N acts on a body of mass 2 kg for 5 seconds. Calculate the impulse.',
 '50 Ns', '20 Ns', '10 Ns', '5 Ns', 'A',
 'Impulse = Force × time = 10 × 5 = 50 Ns.', 'Mechanics', 'medium'),

(3, 'Calculate the momentum of a 5 kg object moving at 4 m/s.',
 '20 kg m/s', '9 kg m/s', '1.25 kg m/s', '0.8 kg m/s', 'A',
 'Momentum = mass × velocity = 5 × 4 = 20 kg m/s.', 'Mechanics', 'easy'),

(3, 'A concave mirror has focal length 15 cm. An object is placed 25 cm from the mirror. Find the image distance.',
 '37.5 cm', '30 cm', '20 cm', '12.5 cm', 'A',
 'Mirror formula: 1/f = 1/u + 1/v. 1/15 = 1/25 + 1/v → 1/v = 1/15 - 1/25 = (5-3)/75 = 2/75 → v = 37.5 cm.', 'Optics', 'medium'),

(3, 'Calculate the critical angle for light traveling from glass (n=1.5) to air.',
 '41.8°', '48.6°', '36.2°', '52.4°', 'A',
 'sin θc = n₂/n₁ = 1/1.5 = 0.6667. θc = sin⁻¹(0.6667) = 41.8°.', 'Optics', 'medium'),

(3, 'Calculate the energy of a photon with wavelength 500 nm. (h = 6.63×10⁻³⁴ Js, c = 3×10⁸ m/s)',
 '3.98×10⁻¹⁹ J', '2.48×10⁻¹⁹ J', '4.97×10⁻¹⁹ J', '1.99×10⁻¹⁹ J', 'A',
 'E = hc/λ = (6.63×10⁻³⁴ × 3×10⁸) / (500×10⁻⁹) = (1.989×10⁻²⁵) / (5×10⁻⁷) = 3.978×10⁻¹⁹ J.', 'Modern Physics', 'medium'),

(3, 'A gas at 27°C is heated until its pressure doubles at constant volume. Find the new temperature.',
 '327°C', '54°C', '300°C', '600°C', 'A',
 'At constant volume, P₁/T₁ = P₂/T₂. T₁ = 27+273 = 300 K. P₂ = 2P₁, so T₂ = T₁ × P₂/P₁ = 300 × 2 = 600 K = 327°C.', 'Heat', 'medium'),

(3, 'Calculate the resistance of a wire of length 10 m, cross-sectional area 2×10⁻⁶ m², and resistivity 1.7×10⁻⁸ Ωm.',
 '0.085 Ω', '0.17 Ω', '0.34 Ω', '0.68 Ω', 'A',
 'R = ρL/A = (1.7×10⁻⁸ × 10) / (2×10⁻⁶) = (1.7×10⁻⁷) / (2×10⁻⁶) = 0.085 Ω.', 'Electricity', 'medium'),

(3, 'Calculate the escape velocity from the surface of the Earth. (g = 9.8 m/s², R = 6.4 × 10⁶ m)',
 '11.2 km/s', '8.4 km/s', '9.8 km/s', '7.4 km/s', 'A',
 'Escape velocity v = √(2gR) = √(2×9.8×6.4×10⁶) = √(125.44×10⁶) = √1.2544×10⁸ = 1.12×10⁴ m/s = 11.2 km/s.', 'Mechanics', 'hard'),

(3, 'A 2 kg object moving at 3 m/s collides elastically with a stationary 1 kg object. Find their velocities after collision.',
 'v₁ = 1 m/s, v₂ = 4 m/s', 'v₁ = 2 m/s, v₂ = 2 m/s', 'v₁ = 0 m/s, v₂ = 6 m/s', 'v₁ = 1.5 m/s, v₂ = 3 m/s', 'A',
 'For elastic collision: v₁ = (m₁-m₂)u₁/(m₁+m₂) = (2-1)×3/3 = 3/3 = 1 m/s. v₂ = (2m₁u₁)/(m₁+m₂) = (4×3)/3 = 12/3 = 4 m/s.', 'Mechanics', 'hard'),

(3, 'A wire of length 2 m and cross-sectional area 1×10⁻⁶ m² stretches by 0.5 mm under a force of 100 N. Calculate Young''s modulus.',
 '4×10¹¹ Pa', '2×10¹¹ Pa', '1×10¹¹ Pa', '5×10¹¹ Pa', 'A',
 'Young''s modulus = stress/strain = (F/A) / (ΔL/L) = (100/1×10⁻⁶) / (0.5×10⁻³/2) = 10⁸ / (2.5×10⁻⁴) = 10⁸ × 4000 = 4×10¹¹ Pa.', 'Mechanics', 'hard'),

(3, 'A coil of 200 turns has an area of 0.05 m² and rotates in a magnetic field of 0.5 T at 50 Hz. Find the peak induced emf.',
 '1570 V', '3140 V', '785 V', '6280 V', 'A',
 'Peak emf = N B A ω = 200 × 0.5 × 0.05 × (2π×50) = 200 × 0.5 × 0.05 × 314 = 200 × 0.5 × 15.7 = 200 × 7.85 = 1570 V.', 'Electromagnetism', 'hard'),

(3, 'What is the frequency of a wave with period 0.02 seconds?',
 '50 Hz', '20 Hz', '100 Hz', '500 Hz', 'A',
 'f = 1/T = 1/0.02 = 50 Hz.', 'Waves', 'easy'),

(3, 'Calculate the wavelength of a wave with frequency 500 Hz and speed 340 m/s.',
 '0.68 m', '1.47 m', '680 m', '170000 m', 'A',
 'λ = v/f = 340/500 = 0.68 m.', 'Waves', 'medium'),

(3, 'What is the speed of sound in air at room temperature?',
 '340 m/s', '3×10⁸ m/s', '1000 m/s', '1500 m/s', 'A',
 'Sound travels at approximately 340 m/s in air.', 'Waves', 'easy'),

(3, 'Which of these is a scalar quantity?',
 'Mass', 'Velocity', 'Force', 'Acceleration', 'A',
 'Mass has magnitude only, no direction.', 'Mechanics', 'easy')
 (3, 'A projectile is launched at 30° to the horizontal with speed 20 m/s. What is the time of flight? (g = 10 m/s²)',
 '2 s', '√3 s', '4 s', '2√3 s', 'A',
 'Time of flight T = (2u sinθ)/g = (2 × 20 × sin30°)/10 = (40 × 0.5)/10 = 20/10 = 2 s.', 'Mechanics', 'medium'),

(3, 'The dimensional formula for impulse is the same as that of:',
 'Momentum', 'Force', 'Energy', 'Power', 'A',
 'Impulse = change in momentum = kg m/s = [MLT⁻¹], same as momentum.', 'Mechanics', 'medium'),

(3, 'A body falls freely from rest. After 4 seconds, its velocity is (g = 10 m/s²):',
 '40 m/s', '20 m/s', '10 m/s', '5 m/s', 'A',
 'v = u + gt = 0 + 10 × 4 = 40 m/s.', 'Mechanics', 'easy'),

(3, 'The unit of electric potential is:',
 'Volt', 'Ampere', 'Ohm', 'Coulomb', 'A',
 'Potential difference = work done per unit charge → J/C = volt.', 'Electricity', 'easy'),

(3, 'In which medium does sound travel fastest?',
 'Steel', 'Water', 'Air', 'Vacuum', 'A',
 'Sound is a mechanical wave; solids transmit it fastest due to high elasticity and density.', 'Waves', 'easy'),

(3, 'A convex lens has focal length 20 cm. An object is placed 30 cm from the lens. Find the image distance.',
 '60 cm', '12 cm', '15 cm', '40 cm', 'A',
 'Lens formula: 1/f = 1/v - 1/u. 1/20 = 1/v - 1/(-30) → 1/v = 1/20 - 1/30 = (3-2)/60 = 1/60 → v = 60 cm.', 'Optics', 'medium'),

(3, 'The de Broglie wavelength of an electron accelerated through 100 V is approximately:',
 '1.23 Å', '12.3 Å', '0.123 Å', '123 Å', 'A',
 'λ = h / √(2m e V) ≈ 12.27 / √V Å → √100 = 10 → λ ≈ 12.27/10 = 1.227 Å ≈ 1.23 Å.', 'Modern Physics', 'hard'),

(3, 'A Carnot engine operates between 600 K and 300 K. Its efficiency is:',
 '50%', '25%', '33.3%', '66.7%', 'A',
 'η = 1 - (T₂/T₁) = 1 - (300/600) = 1 - 0.5 = 0.5 = 50%.', 'Heat', 'medium'),

(3, 'Two resistors of 4 Ω and 6 Ω are connected in parallel. Equivalent resistance is:',
 '2.4 Ω', '10 Ω', '24 Ω', '2 Ω', 'A',
 '1/R = 1/4 + 1/6 = (3+2)/12 = 5/12 → R = 12/5 = 2.4 Ω.', 'Electricity', 'medium'),

(3, 'The SI unit of power is:',
 'Watt', 'Joule', 'Newton', 'Pascal', 'A',
 'Power = work/time → J/s = watt.', 'Mechanics', 'easy'),

(3, 'A wave has amplitude 0.1 m and frequency 50 Hz. If speed is 200 m/s, find maximum particle velocity.',
 '31.4 m/s', '10 m/s', '62.8 m/s', '15.7 m/s', 'A',
 'v_max = A ω = A × 2πf = 0.1 × 2π × 50 = 0.1 × 314 ≈ 31.4 m/s.', 'Waves', 'medium'),

(3, 'The specific heat capacity of water is:',
 '4186 J/kg·K', '2100 J/kg·K', '900 J/kg·K', '460 J/kg·K', 'A',
 'Standard value for water is 4186 J/kg·K (or approximately 4200 J/kg·K).', 'Heat', 'easy'),

(3, 'In a nuclear reaction, the mass defect is converted into:',
 'Energy', 'Momentum', 'Charge', 'Volume', 'A',
 'E = mc² → mass defect Δm produces energy.', 'Modern Physics', 'easy'),

(3, 'A body is projected vertically upward with speed 20 m/s. Time to reach maximum height is (g = 10 m/s²):',
 '2 s', '4 s', '1 s', '3 s', 'A',
 'At max height, v = 0 → 0 = u - gt → t = u/g = 20/10 = 2 s.', 'Mechanics', 'easy'),

(3, 'The refractive index of a medium is 1.5. Speed of light in that medium is:',
 '2 × 10⁸ m/s', '3 × 10⁸ m/s', '1.5 × 10⁸ m/s', '4 × 10⁸ m/s', 'A',
 'n = c/v → v = c/n = 3×10⁸ / 1.5 = 2×10⁸ m/s.', 'Optics', 'medium'),

(3, 'Kirchhoff’s first law is based on conservation of:',
 'Charge', 'Energy', 'Momentum', 'Mass', 'A',
 'Sum of currents entering = sum leaving a junction (charge conservation).', 'Electricity', 'easy'),

(3, 'The boiling point of water increases when:',
 'Pressure increases', 'Pressure decreases', 'Temperature decreases', 'Volume increases', 'A',
 'Higher pressure raises boiling point (e.g., pressure cooker).', 'Heat', 'easy'),

(3, 'A spring of force constant 200 N/m is stretched by 0.1 m. Potential energy stored is:',
 '1 J', '2 J', '0.5 J', '4 J', 'A',
 'PE = ½ k x² = ½ × 200 × (0.1)² = ½ × 200 × 0.01 = 1 J.', 'Mechanics', 'medium'),

(3, 'The unit of magnetic flux is:',
 'Weber', 'Tesla', 'Henry', 'Gauss', 'A',
 'Magnetic flux Φ = B · A → unit weber (Wb).', 'Electromagnetism', 'easy'),

(3, 'Which phenomenon proves the wave nature of light?',
 'Photoelectric effect', 'Diffraction', 'Compton effect', 'Pair production', 'B',
 'Diffraction and interference show wave behavior.', 'Modern Physics', 'medium'),

(3, 'A transistor is used primarily as:',
 'Amplifier or switch', 'Rectifier', 'Oscillator', 'Modulator', 'A',
 'Bipolar junction transistors amplify current or act as electronic switches.', 'Modern Physics/Electronics', 'medium'),

(3, 'The heat required to change 1 kg of ice at 0°C to water at 0°C is:',
 '336 kJ', '2260 kJ', '420 kJ', '84 kJ', 'A',
 'Latent heat of fusion of ice = 336 kJ/kg or 3.36 × 10⁵ J/kg.', 'Heat', 'medium'),

(3, 'In SHM, the acceleration is maximum at:',
 'Extreme position', 'Mean position', 'Halfway between mean and extreme', 'Everywhere same', 'A',
 'a = -ω²x → maximum magnitude when |x| is maximum (amplitude).', 'Waves', 'medium'),

(3, 'The power dissipated in a 10 Ω resistor carrying 2 A current is:',
 '40 W', '20 W', '5 W', '80 W', 'A',
 'P = I²R = 4 × 10 = 40 W.', 'Electricity', 'easy'),

(3, 'The range of a projectile is maximum when angle of projection is:',
 '45°', '30°', '60°', '90°', 'A',
 'R = (u² sin2θ)/g → maximum when sin2θ = 1 → 2θ = 90° → θ = 45°.', 'Mechanics', 'medium'),

(3, 'The SI unit of electric field intensity is:',
 'N/C or V/m', 'N/m', 'C/m²', 'J/C', 'A',
 'E = F/q = N/C = V/m.', 'Electricity', 'easy'),

(3, 'Which color of light has the highest frequency?',
 'Violet', 'Red', 'Green', 'Yellow', 'A',
 'Violet has shortest wavelength → highest frequency in visible spectrum.', 'Waves/Optics', 'easy'),

(3, 'The binding energy per nucleon is maximum for:',
 'Iron-56', 'Uranium-235', 'Hydrogen-1', 'Helium-4', 'A',
 'Iron-56 has the highest binding energy per nucleon → most stable nucleus.', 'Modern Physics', 'medium'),

(3, 'A body of mass 10 kg is lifted 5 m vertically. Work done against gravity is (g = 10 m/s²):',
 '500 J', '50 J', '100 J', '1000 J', 'A',
 'W = mgh = 10 × 10 × 5 = 500 J.', 'Mechanics', 'easy'),

(3, 'The principle of conservation of energy is applied in:',
 'All isolated systems', 'Only mechanical systems', 'Only thermal systems', 'Only electrical systems', 'A',
 'Energy can neither be created nor destroyed in an isolated system.', 'Mechanics/Heat', 'easy'),

(3, 'The focal length of a plane mirror is:',
 'Infinity', 'Zero', 'Positive', 'Negative', 'A',
 'Rays remain parallel after reflection → f = ∞.', 'Optics', 'easy'),

(3, 'Ohm’s law is valid for:',
 'Ohmic conductors at constant temperature', 'All conductors', 'Semiconductors only', 'Superconductors', 'A',
 'V = IR holds for ohmic materials (metals) when temperature is constant.', 'Electricity', 'medium'),

(3, 'The wavelength of red light is approximately:',
 '700 nm', '400 nm', '550 nm', '300 nm', 'A',
 'Red has longest wavelength in visible spectrum (~620–750 nm).', 'Waves/Optics', 'easy'),

(3, 'The efficiency of a simple machine is always:',
 'Less than 100%', 'Equal to 100%', 'Greater than 100%', 'Zero', 'A',
 'Due to friction and other losses, actual work output < work input.', 'Mechanics', 'easy'),

(3, 'The specific heat of a gas is higher at:',
 'Constant pressure', 'Constant volume', 'Both same', 'Depends on gas', 'A',
 'Cp = Cv + R → Cp > Cv.', 'Heat', 'medium'),

(3, 'In a p-n junction diode, forward bias:',
 'Reduces barrier potential', 'Increases barrier potential', 'Has no effect', 'Reverses current', 'A',
 'Forward bias lowers potential barrier → allows current flow.', 'Modern Physics', 'medium'),

(3, 'The velocity of sound in air increases with:',
 'Increase in temperature', 'Decrease in temperature', 'Increase in pressure', 'Decrease in humidity', 'A',
 'v ∝ √T (temperature in Kelvin).', 'Waves', 'medium'),

(3, 'A 220 V, 100 W bulb is connected to 110 V supply. Power consumed is:',
 '25 W', '50 W', '100 W', '200 W', 'A',
 'P = V²/R → R = V²/P = 220²/100 = 484 Ω. At 110 V: P = 110²/484 ≈ 25 W.', 'Electricity', 'medium'),

(3, 'The unit of surface tension is:',
 'N/m', 'N/m²', 'J/m²', 'Both A and C', 'D',
 'Surface tension = force/length = N/m = energy/area = J/m².', 'Mechanics', 'medium'),

(3, 'The half-life of a radioactive substance is 4 days. Fraction remaining after 12 days is:',
 '1/8', '1/4', '1/2', '1/16', 'A',
 'Number of half-lives = 12/4 = 3 → fraction left = (1/2)³ = 1/8.', 'Modern Physics', 'medium'),

(3, 'The angle between velocity and acceleration in uniform circular motion is:',
 '90°', '0°', '180°', '45°', 'A',
 'Acceleration (centripetal) is always toward center, perpendicular to tangential velocity.', 'Mechanics', 'medium'),

(3, 'Which mirror is used in car headlights?',
 'Concave', 'Convex', 'Plane', 'Parabolic', 'D',
 'Parabolic mirrors produce parallel beams when source is at focus.', 'Optics', 'medium'),

(3, 'The amount of heat required to raise temperature of 1 kg water by 1°C is:',
 '4186 J', '1 cal', '4.186 J', 'Both A and B', 'D',
 '1 calorie = 4.186 J; specific heat of water = 4186 J/kg·°C.', 'Heat', 'easy'),

(3, 'In series combination of capacitors, charge on each capacitor is:',
 'Same', 'Different', 'Zero', 'Infinite', 'A',
 'Same charge flows through series circuit.', 'Electricity', 'medium'),

(3, 'The phenomenon of splitting of light into colors is called:',
 'Dispersion', 'Diffraction', 'Interference', 'Polarization', 'A',
 'Dispersion occurs due to different speeds of different wavelengths in medium.', 'Waves/Optics', 'easy'),

(3, 'The root mean square speed of gas molecules is proportional to:',
 '√T', 'T', '1/√T', '1/T', 'A',
 'v_rms = √(3RT/M) → v_rms ∝ √T.', 'Heat', 'medium'),

(3, 'A fuse wire is made of material with:',
 'Low melting point', 'High melting point', 'High resistivity', 'Low resistivity', 'A',
 'Low melting point so it melts quickly on overload.', 'Electricity', 'easy'),

(3, 'The dimensional formula of Planck’s constant is:',
 '[ML²T⁻¹]', '[MLT⁻¹]', '[ML²T⁻²]', '[M⁰L⁰T⁰]', 'A',
 'E = hν → h = E/ν → [ML²T⁻²] / [T⁻¹] = [ML²T⁻¹].', 'Modern Physics', 'medium'),

(3, 'The centre of mass of a uniform triangular lamina lies at:',
 'Centroid', 'Orthocentre', 'Circumcentre', 'Incentre', 'A',
 'For uniform density, CM coincides with centroid.', 'Mechanics', 'medium'),

(3, 'Which of the following is a vector quantity?',
 'Electric field', 'Electric potential', 'Capacitance', 'Resistance', 'A',
 'Electric field has both magnitude and direction.', 'Electricity', 'easy'),

(3, 'The frequency of a stretched string depends on:',
 'Length, tension, linear density', 'Only length', 'Only tension', 'Only mass', 'A',
 'f = (1/(2L)) √(T/μ).', 'Waves', 'medium')
 (3, 'A satellite is in circular orbit around Earth. Its orbital velocity is:',
 '√(GM/R)', '√(2GM/R)', '√(GM/2R)', '√(gR)', 'A',
 'For circular orbit, v = √(GM/R), where R is orbital radius from center.', 'Mechanics', 'medium'),

(3, 'The dimensional formula for coefficient of viscosity is:',
 '[ML⁻¹T⁻¹]', '[MLT⁻¹]', '[MLT⁻²]', '[M⁰LT⁻¹]', 'A',
 'η = stress / velocity gradient = (F/A) / (v/d) → [MLT⁻² / L²] / [LT⁻¹ / L] = ML⁻¹T⁻¹.', 'Mechanics', 'hard'),

(3, 'In a standing wave on a string fixed at both ends, the distance between two consecutive nodes is:',
 'λ/2', 'λ', 'λ/4', '2λ', 'A',
 'Nodes are separated by λ/2 in a standing wave.', 'Waves', 'medium'),

(3, 'The power factor of a purely resistive circuit is:',
 '1', '0', '0.5', '∞', 'A',
 'In pure resistor, voltage and current are in phase → cosφ = 1.', 'Electricity', 'easy'),

(3, 'The energy released in nuclear fission is due to:',
 'Conversion of mass into energy', 'Conversion of energy into mass', 'Chemical bonding', 'Electrostatic repulsion', 'A',
 'E = Δm c², where Δm is mass defect.', 'Modern Physics', 'easy'),

(3, 'A carnot refrigerator operates between 300 K and 273 K. Its COP is:',
 '10.1', '9.1', '11.1', '8.1', 'A',
 'COP = T₂ / (T₁ - T₂) = 273 / (300 - 273) = 273 / 27 ≈ 10.11.', 'Heat', 'hard'),

(3, 'The equivalent resistance of three 6 Ω resistors connected in delta is:',
 '2 Ω', '4 Ω', '18 Ω', '9 Ω', 'A',
 'In delta, 1/R = 1/6 + 1/6 + 1/6 = 3/6 = 1/2 → R = 2 Ω.', 'Electricity', 'medium'),

(3, 'The moment of inertia of a thin rod about an axis through its center and perpendicular to length is:',
 '(ML²)/12', '(ML²)/3', 'ML²', '(ML²)/2', 'A',
 'Standard formula for rod about perpendicular bisector.', 'Mechanics', 'medium'),

(3, 'The speed of electromagnetic waves in vacuum is:',
 '3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s', 'A',
 'Speed of light c = 3 × 10⁸ m/s.', 'Waves/Electromagnetism', 'easy'),

(3, 'The unit of luminous intensity is:',
 'Candela', 'Lumen', 'Lux', 'Watt', 'A',
 'SI base unit for luminous intensity is candela (cd).', 'Waves/Optics', 'easy'),

(3, 'In photoelectric effect, stopping potential depends on:',
 'Frequency of incident light', 'Intensity of light', 'Both frequency and intensity', 'Work function only', 'A',
 'Stopping potential V₀ = (hν - φ)/e → depends on frequency (ν).', 'Modern Physics', 'medium'),

(3, 'The coefficient of linear expansion for most metals is of the order of:',
 '10⁻⁵ /°C', '10⁻³ /°C', '10⁻⁶ /°C', '10⁻⁴ /°C', 'A',
 'Typical α ≈ 10⁻⁵ to 10⁻⁶ K⁻¹ for metals.', 'Heat', 'medium'),

(3, 'A body is in equilibrium under three concurrent forces. The forces must be:',
 'In a closed triangle', 'Equal in magnitude', 'Perpendicular to each other', 'Parallel', 'A',
 'Vector sum zero → they form a closed triangle (parallelogram law extended).', 'Mechanics', 'medium'),

(3, 'The time period of a simple pendulum depends on:',
 'Length and g', 'Mass of bob', 'Amplitude', 'Density of bob', 'A',
 'T = 2π √(L/g) → independent of mass and amplitude (small angle).', 'Waves', 'easy'),

(3, 'The direction of induced emf is given by:',
 'Lenz’s law', 'Fleming’s right-hand rule', 'Ampere’s law', 'Biot-Savart law', 'A',
 'Lenz’s law states induced current opposes change in flux.', 'Electromagnetism', 'medium'),

(3, 'The specific resistance (resistivity) has unit:',
 'Ω m', 'Ω', 'Ω/m', 'Ω m²', 'A',
 'ρ = R × (A/L) → unit Ω m.', 'Electricity', 'easy'),

(3, 'The critical angle for total internal reflection occurs when light travels from:',
 'Denser to rarer medium', 'Rarer to denser medium', 'Air to vacuum', 'Glass to water', 'A',
 'When i = θc, r = 90° → sin θc = 1/n (n > 1).', 'Optics', 'medium'),

(3, 'The heat capacity of a body is:',
 'Heat required to raise its temperature by 1°C', 'Specific heat × mass', 'Both A and B', 'Latent heat', 'C',
 'C = m c, where c is specific heat capacity.', 'Heat', 'easy'),

(3, 'In Young’s double-slit experiment, fringe width β is given by:',
 'λD/d', 'λd/D', 'D/d', 'λ/D', 'A',
 'β = λD/d, where D = screen distance, d = slit separation.', 'Waves/Optics', 'medium'),

(3, 'The rms value of alternating current is:',
 'I₀/√2', 'I₀ √2', 'I₀/2', 'I₀', 'A',
 'I_rms = I₀ / √2 for sinusoidal AC.', 'Electricity', 'medium'),

(3, 'The escape velocity from Moon surface is approximately:',
 '2.4 km/s', '11.2 km/s', '7.9 km/s', '1.4 km/s', 'A',
 'Moon has lower g and R → v_esc ≈ 2.38 km/s.', 'Mechanics', 'medium'),

(3, 'Which quantity remains constant in adiabatic process for ideal gas?',
 'PV^γ', 'PV', 'P/T', 'V/T', 'A',
 'For adiabatic: PV^γ = constant, where γ = Cp/Cv.', 'Heat', 'medium'),

(3, 'The magnifying power of a simple microscope is maximum when image is formed at:',
 'Least distance of distinct vision', 'Infinity', 'Focal point', 'Optical center', 'A',
 'm = 1 + D/f (normal adjustment at D = 25 cm).', 'Optics', 'medium'),

(3, 'The drift velocity of electrons in a conductor is of the order of:',
 '10⁻⁴ m/s', '10⁴ m/s', '3 × 10⁸ m/s', '10 m/s', 'A',
 'Very small compared to thermal speed (~10⁶ m/s).', 'Electricity', 'medium'),

(3, 'The half-life of a radioactive element is 10 years. After 30 years, fraction remaining is:',
 '1/8', '1/4', '1/2', '1/16', 'A',
 'n = 30/10 = 3 half-lives → fraction = (1/2)³ = 1/8.', 'Modern Physics', 'easy'),

(3, 'The angle of banking for a road is given by tanθ =',
 'v²/rg', 'rg/v²', 'v/rg', 'g/v²', 'A',
 'tanθ = v²/(rg) for no friction case.', 'Mechanics', 'medium'),

(3, 'Which of the following is a dimensionless quantity?',
 'Refractive index', 'Density', 'Velocity', 'Force', 'A',
 'n = c/v → ratio of speeds → dimensionless.', 'General Physics ', 'easy'),

(3, 'The frequency of AC mains in most countries is:',
 '50 Hz or 60 Hz', '100 Hz', '25 Hz', '400 Hz', 'A',
 'Standard power supply frequency is 50 Hz (Europe, Asia, Africa) or 60 Hz (USA).', 'Electricity', 'easy'),

(3, 'The work done in stretching a spring is stored as:',
 'Elastic potential energy', 'Kinetic energy', 'Gravitational potential energy', 'Heat energy', 'A',
 'PE = ½ k x².', 'Mechanics', 'easy'),

(3, 'The phenomenon by which light bends around obstacles is:',
 'Diffraction', 'Refraction', 'Reflection', 'Dispersion', 'A',
 'Diffraction is bending around edges or through apertures.', 'Waves', 'easy'),

(3, 'In a thermocouple, emf is produced due to:',
 'Seebeck effect', 'Peltier effect', 'Thomson effect', 'Joule effect', 'A',
 'Seebeck effect: temperature difference produces emf.', 'Heat/Electricity', 'medium'),

(3, 'The velocity ratio of a single movable pulley is:',
 '2', '1', '0.5', '4', 'A',
 'VR = distance moved by effort / distance moved by load = 2.', 'Mechanics', 'easy'),

(3, 'The unit of Planck’s constant (h) is:',
 'J s', 'J/s', 'kg m²/s', 'N m', 'A',
 'E = hν → h = E/ν → J / Hz = J s.', 'Modern Physics', 'medium'),

(3, 'The pressure inside a soap bubble is greater than outside by:',
 '4T/r', '2T/r', 'T/r', '8T/r', 'A',
 'ΔP = 4T/r for soap bubble (two surfaces).', 'Mechanics', 'medium'),

(3, 'The electromagnetic spectrum with highest frequency is:',
 'Gamma rays', 'X-rays', 'Ultraviolet', 'Infrared', 'A',
 'Gamma rays > X-rays > UV > visible > IR > microwaves > radio waves.', 'Waves', 'easy'),

(3, 'Kirchhoff’s second law is based on conservation of:',
 'Energy', 'Charge', 'Momentum', 'Mass', 'A',
 'Sum of emf = sum of voltage drops in a closed loop (energy conservation).', 'Electricity', 'medium'),

(3, 'The specific heat of an ideal gas at constant volume is:',
 'Cv = R/(γ-1)', 'Cp = γR/(γ-1)', 'Cv = (f/2)R', 'Both A and C', 'D',
 'For ideal gas, Cv = (f/2)R where f = degrees of freedom.', 'Heat', 'medium'),

(3, 'A body weighs 200 N on Earth. Its weight on Moon (g_moon = g/6) is:',
 '33.3 N', '1200 N', '200 N', '0 N', 'A',
 'Weight = mg → W_moon = m(g/6) = 200/6 ≈ 33.3 N.', 'Mechanics', 'easy'),

(3, 'The resolving power of a telescope depends on:',
 'Diameter of objective lens', 'Focal length', 'Magnifying power', 'Eyepiece', 'A',
 'Higher aperture (diameter) gives better resolution (smaller Airy disk).', 'Optics', 'medium'),

(3, 'The power of a lens is 2 dioptre. Its focal length is:',
 '0.5 m', '2 m', '50 cm', 'Both A and C', 'D',
 'P = 1/f (f in meters) → f = 1/2 = 0.5 m = 50 cm.', 'Optics', 'easy'),

(3, 'In an AC circuit with only inductor, current:',
 'Lags voltage by 90°', 'Leads voltage by 90°', 'In phase', 'Lags by 180°', 'A',
 'VL = I XL, voltage leads current by 90° in pure inductor.', 'Electricity', 'medium'),

(3, 'The mass number of an atom is equal to:',
 'Number of protons + neutrons', 'Number of protons', 'Number of electrons', 'Atomic number', 'A',
 'A = Z + N (mass number = atomic number + neutron number).', 'Modern Physics', 'easy'),

(3, 'The S.I unit of thermal conductivity ha:',
 'W/m·K', 'J/kg·K', 'J/s', 'cal/cm·s·°C', 'A',
 'k = Q / (A ΔT Δt / L) → W/(m·K).', 'Heat', 'medium'),

(3, 'The centripetal force for a car on a level circular road is provided by:',
 'Friction', 'Normal force', 'Weight component', 'Engine force', 'A',
 'f = μN provides necessary centripetal force mv²/r.', 'Mechanics', 'medium'),

(3, 'Which of the following waves requires a material medium?',
 'Sound waves', 'Light waves', 'Radio waves', 'X-rays', 'A',
 'Sound is a mechanical longitudinal wave.', 'Waves', 'easy'),

(3, 'The SI unit of capacitance is:',
 'Farad', 'Coulomb', 'Volt', 'Ohm', 'A',
 'C = Q/V → farad (F) = C/V.', 'Electricity', 'easy'),

(3, 'The energy of the first excited state of hydrogen atom is:',
 '-3.4 eV', '-13.6 eV', '-1.51 eV', '0 eV', 'A',
 'E_n = -13.6 / n² eV → for n=2, E = -13.6/4 = -3.4 eV.', 'Modern Physics', 'medium'),

(3, 'The efficiency of a machine is given by:',
 'MA / VR', 'VR / MA', 'Output work / input work', 'Both A and C', 'D',
 'η = (MA / VR) × 100% = (useful work / total work) × 100%.', 'Mechanics', 'medium'),

(3, 'The phenomenon of beats occurs due to:',
 'Interference of two waves of slightly different frequencies', 'Superposition of identical waves', 'Diffraction', 'Polarization', 'A',
 'Beat frequency = |f₁ - f₂|.', 'Waves', 'medium'),

(3, 'A galvanometer can be converted into an ammeter by connecting:',
 'A low resistance in parallel', 'A high resistance in series', 'A high resistance in parallel', 'A low resistance in series', 'A',
 'Shunt (low R) in parallel to bypass most current.', 'Electricity', 'medium'),

(3, 'The temperature at which all molecular motion ceases theoretically is:',
 'Absolute zero (0 K)', '-273°C', 'Both A and B', '273 K', 'C',
 '0 K = -273.15°C → theoretical zero kinetic energy.', 'Heat', 'easy'),
(3, 'The angular momentum of a particle is conserved when:',
 'Net external torque is zero', 'Net external force is zero', 'Net external work is zero', 'Velocity is constant', 'A',
 'Conservation of angular momentum holds when τ_ext = 0 (no external torque).', 'Mechanics', 'medium'),

(3, 'The frequency of oscillation of a spring-mass system is independent of:',
 'Amplitude', 'Mass', 'Spring constant', 'Gravity', 'A',
 'f = (1/(2π)) √(k/m) → independent of amplitude for SHM.', 'Waves', 'medium'),

(3, 'In a Wheatstone bridge, the bridge is balanced when:',
 'P/Q = R/S', 'P + Q = R + S', 'P × Q = R × S', 'P/R = Q/S', 'A',
 'Balance condition: P/Q = R/S (no current through galvanometer).', 'Electricity', 'medium'),

(3, 'The binding energy of a deuteron nucleus is approximately:',
 '2.2 MeV', '28.3 MeV', '7.6 MeV', '492 MeV', 'A',
 'Deuteron (²H) binding energy ≈ 2.224 MeV.', 'Modern Physics', 'medium'),

(3, 'The coefficient of restitution e for a perfectly elastic collision is:',
 '1', '0', 'Between 0 and 1', 'Greater than 1', 'A',
 'e = relative velocity of separation / relative velocity of approach = 1 for elastic.', 'Mechanics', 'medium'),

(3, 'The speed of sound in an ideal gas is proportional to:',
 '√T', 'T', '1/√T', '√(1/T)', 'A',
 'v = √(γRT/M) → v ∝ √T.', 'Waves', 'medium'),

(3, 'The unit of magnetic moment is:',
 'A m²', 'Tesla m²', 'Weber m', 'Henry/m', 'A',
 'Magnetic moment m = I × A → ampere × meter².', 'Electromagnetism', 'easy'),

(3, 'In an isothermal process for an ideal gas, the work done is:',
 'nRT ln(V₂/V₁)', 'nCv ΔT', 'nCp ΔT', 'Zero', 'A',
 'For isothermal: ΔU = 0 → W = -Q = nRT ln(V₂/V₁).', 'Heat', 'medium'),

(3, 'The magnifying power of a compound microscope is maximum when final image is at:',
 'Least distance of distinct vision', 'Infinity', 'Focal point of eyepiece', 'Optical center', 'A',
 'm = m_objective × (1 + D/fe) for normal adjustment.', 'Optics', 'medium'),

(3, 'The resistance of a semiconductor:',
 'Increases with temperature', 'Decreases with temperature', 'Remains constant', 'Depends on voltage', 'B',
 'Semiconductors have negative temperature coefficient of resistance.', 'Electricity', 'medium'),

(3, 'The wavelength of matter waves for a particle is given by:',
 'h/p', 'p/h', 'h/mv²', 'mv/h', 'A',
 'de Broglie relation: λ = h/p = h/(mv).', 'Modern Physics', 'medium'),

(3, 'The moment of inertia of a solid sphere about its diameter is:',
 '(2/5)MR²', '(2/3)MR²', 'MR²', '(1/2)MR²', 'A',
 'Standard result for solid sphere about diameter.', 'Mechanics', 'medium'),

(3, 'In Doppler effect, when source and observer move towards each other, frequency:',
 'Increases', 'Decreases', 'Remains same', 'Becomes zero', 'A',
 'Apparent frequency increases when source and observer approach each other: f'' = f (v + v₀)/(v - vₛ) where v₀ and vₛ are speeds of observer and source respectively.', 'Waves', 'medium'),

(3, 'The SI unit of electric charge is:',
 'Coulomb', 'Ampere', 'Volt', 'Farad', 'A',
 'Coulomb (C) is base unit for charge.', 'Electricity', 'easy'),

(3, 'The latent heat of vaporization of water at 100°C is approximately:',
 '2260 kJ/kg', '336 kJ/kg', '4186 kJ/kg', '540 cal/g', 'A',
 '≈ 2257 kJ/kg or 540 cal/g.', 'Heat', 'medium'),

(3, 'The focal length of a concave lens is:',
 'Negative', 'Positive', 'Zero', 'Infinite', 'A',
 'Diverging lens → f is taken negative by convention.', 'Optics', 'easy'),

(3, 'The power dissipated in a circuit is maximum when:',
 'Load resistance = internal resistance', 'Load resistance = 0', 'Load resistance = ∞', 'Load resistance > internal', 'A',
 'Maximum power transfer theorem: R_L = r (source internal resistance).', 'Electricity', 'medium'),

(3, 'The rest mass energy of an electron is approximately:',
 '0.511 MeV', '931 MeV', '1.6 × 10⁻¹⁹ J', '13.6 eV', 'A',
 'm_e c² ≈ 0.511 MeV.', 'Modern Physics', 'medium'),

(3, 'The time period of a physical pendulum is T = 2π √(I/mgd), where d is:',
 'Distance from pivot to center of mass', 'Length of pendulum', 'Radius of gyration', 'Amplitude', 'A',
 'd = distance between suspension point and CM.', 'Waves/Mechanics', 'medium'),

(3, 'The direction of magnetic field due to a current-carrying wire is given by:',
 'Right-hand thumb rule', 'Left-hand rule', 'Fleming’s left-hand rule', 'Ampere’s swimming rule', 'A',
 'Thumb in direction of current, fingers curl in direction of B-field.', 'Electromagnetism', 'easy'),

(3, 'The root mean square speed of oxygen molecules at 27°C is (M_O₂ = 32 g/mol):',
 '≈ 484 m/s', '≈ 340 m/s', '≈ 600 m/s', '≈ 200 m/s', 'A',
 'v_rms = √(3RT/M) ≈ √(3 × 8.314 × 300 / 0.032) ≈ 484 m/s.', 'Heat', 'hard'),

(3, 'In a transformer, the efficiency is maximum when:',
 'Copper losses = iron losses', 'Copper losses > iron losses', 'No load condition', 'Short circuit', 'A',
 'Maximum efficiency occurs when variable losses (I²R) equal constant losses (hysteresis + eddy).', 'Electromagnetism', 'medium'),

(3, 'The unit of impulse is:',
 'kg m/s', 'N s', 'Both A and B', 'J s', 'C',
 'Impulse = F Δt = Δp = kg m/s = N s.', 'Mechanics', 'easy'),

(3, 'The phenomenon of polarization proves that light is:',
 'Transverse wave', 'Longitudinal wave', 'Mechanical wave', 'Stationary wave', 'A',
 'Only transverse waves can be polarized.', 'Waves/Optics', 'medium'),

(3, 'The capacitance of a parallel plate capacitor increases when:',
 'Area increases, distance decreases', 'Area decreases, distance increases', 'Dielectric removed', 'Voltage increased', 'A',
 'C = ε₀ A / d (or κε₀ A / d with dielectric).', 'Electricity', 'easy'),

(3, 'The energy released when 1 kg of uranium-235 undergoes fission is approximately:',
 '8 × 10¹³ J', '3 × 10⁸ J', '4.2 × 10⁷ J', '2 × 10⁶ J', 'A',
 '≈ 200 MeV per fission × number of atoms → ~8 × 10¹³ J/kg.', 'Modern Physics', 'hard'),

(3, 'The acceleration due to gravity at the center of Earth is:',
 'Zero', '9.8 m/s²', 'Half at surface', 'Double at surface', 'A',
 'Inside uniform sphere, g ∝ r → g = 0 at center.', 'Mechanics', 'medium'),

(3, 'The quality factor (Q) of a resonant circuit is:',
 'ω₀ L / R', '1 / (ω₀ L R)', 'R / ω₀ L', 'ω₀ / R', 'A',
 'Q = ω₀ L / R = 1/(ω₀ C R) = f₀ / Δf.', 'Electricity/Waves', 'medium'),

(3, 'The temperature of the Sun’s surface is approximately:',
 '5800 K', '3000 K', '15000 K', '1000 K', 'A',
 'Effective surface temperature ≈ 5772 K.', 'Heat/Modern Physics', 'medium'),

(3, 'In vector addition, the resultant is maximum when angle between vectors is:',
 '0°', '90°', '180°', '120°', 'A',
 'R_max = A + B when parallel (θ = 0°).', 'Mechanics', 'easy'),

(3, 'The speed of light in a medium of refractive index 4/3 is:',
 '2.25 × 10⁸ m/s', '3 × 10⁸ m/s', '4 × 10⁸ m/s', '1.5 × 10⁸ m/s', 'A',
 'v = c/n = 3×10⁸ / (4/3) = 2.25×10⁸ m/s.', 'Optics', 'medium'),

(3, 'The principle used in optical fibers is:',
 'Total internal reflection', 'Refraction', 'Diffraction', 'Interference', 'A',
 'Light propagates by repeated TIR inside core.', 'Optics/Waves', 'medium'),

(3, 'The SI unit of thermal conductivity is:',
 'W m⁻¹ K⁻¹', 'J kg⁻¹ K⁻¹', 'cal s⁻¹ cm⁻¹ °C⁻¹', 'Both A and C', 'A',
 'k has unit watt per meter per kelvin.', 'Heat', 'medium'),

(3, 'The torque τ = r × F. Its magnitude is maximum when angle between r and F is:',
 '90°', '0°', '180°', '45°', 'A',
 'τ = r F sinθ → max when sinθ = 1 (θ = 90°).', 'Mechanics', 'easy'),

(3, 'The de Broglie wavelength is inversely proportional to:',
 'Momentum', 'Velocity', 'Mass', 'Energy', 'A',
 'λ = h/p → λ ∝ 1/p.', 'Modern Physics', 'easy'),

(3, 'In an RLC series circuit at resonance, impedance is:',
 'R (minimum)', 'Zero', 'Maximum', 'XL - XC', 'A',
 'At resonance XL = XC → Z = R (minimum).', 'Electricity', 'medium'),

(3, 'The Stefan-Boltzmann law states that total power radiated is proportional to:',
 'T⁴', 'T', 'T²', '1/T⁴', 'A',
 'P = σ A T⁴ (blackbody radiation).', 'Heat', 'medium'),

(3, 'The angle of dip at magnetic equator is:',
 '0°', '90°', '45°', '180°', 'A',
 'Horizontal component only → dip angle = 0°.', 'Electromagnetism', 'medium'),

(3, 'The number of significant figures in 0.002340 is:',
 '4', '3', '5', '6', 'A',
 'Leading zeros not significant; trailing zero after decimal is significant → 4 sig figs.', 'General Physics ', 'easy'),

(3, 'The work-energy theorem states that work done by net force equals:',
 'Change in kinetic energy', 'Change in potential energy', 'Total energy', 'Power', 'A',
 'W_net = ΔKE.', 'Mechanics', 'easy'),

(3, 'The Doppler shift for light when source approaches observer is:',
 'Blue shift (higher frequency)', 'Red shift (lower frequency)', 'No shift', 'Depends on medium', 'A',
 'Approaching → increased frequency (blue shift).', 'Waves/Modern Physics', 'medium'),

(3, 'The unit of permittivity of free space (ε₀) is:',
 'F/m or C²/N m²', 'H/m', 'Wb/m', 'Tesla/m', 'A',
 'ε₀ = 8.85 × 10⁻¹² F/m.', 'Electricity', 'medium'),

(3, 'The radius of first Bohr orbit in hydrogen atom is approximately:',
 '0.529 Å', '5.29 Å', '52.9 Å', '0.0529 Å', 'A',
 'a₀ = 0.529 × 10⁻¹⁰ m = 0.529 Å.', 'Modern Physics', 'medium'),

(3, 'The pressure exerted by an ideal gas is proportional to:',
 'Kinetic energy per unit volume', 'Temperature only', 'Volume only', 'Mass only', 'A',
 'P = (1/3) ρ v_rms² = (2/3) (KE density).', 'Heat', 'medium'),

(3, 'A body projected horizontally from a height h reaches ground in time:',
 '√(2h/g)', '√(h/g)', '2√(h/g)', '√(h/2g)', 'A',
 'Vertical motion: h = (1/2)gt² → t = √(2h/g).', 'Mechanics', 'medium'),

(3, 'The lens maker’s formula is:',
 '1/f = (μ - 1)(1/R₁ - 1/R₂)', '1/f = μ/R', 'f = (μ - 1)R', '1/f = μ - 1', 'A',
 'Standard lens maker formula for thin lens in air.', 'Optics', 'medium'),

(3, 'In a p-type semiconductor, majority charge carriers are:',
 'Holes', 'Electrons', 'Protons', 'Neutrons', 'A',
 'Doped with acceptor impurities → holes dominate.', 'Modern Physics', 'medium'),

(3, 'The velocity of efflux from a small hole at depth h below free surface is:',
 '√(2gh)', '√(gh)', '2√(gh)', '√(gh/2)', 'A',
 'Torricelli’s theorem: v = √(2gh).', 'Mechanics', 'medium'),

(3, 'The quality (timbre) of musical sound depends on:',
 'Presence of overtones', 'Frequency only', 'Amplitude only', 'Speed only', 'A',
 'Harmonics/overtones determine waveform → timbre.', 'Waves', 'easy'),

(3, 'The mutual inductance has unit:',
 'Henry', 'Farad', 'Tesla', 'Weber', 'A',
 'M = Φ₂₁ / I₁ → henry (H).', 'Electromagnetism', 'medium'),

(3, 'The temperature coefficient of resistance for semiconductors is:',
 'Negative', 'Positive', 'Zero', 'Infinite', 'A',
 'Resistance decreases with increasing temperature.', 'Electricity', 'easy'),

(3, 'The energy equivalent of 1 atomic mass unit (u) is approximately:',
 '931 MeV', '9.31 MeV', '93.1 MeV', '931 eV', 'A',
 '1 u ≈ 931.494 MeV/c².', 'Modern Physics', 'medium'),

(3, 'In SHM, total energy is proportional to:',
 'Amplitude squared', 'Frequency squared', 'Mass', 'Spring constant', 'A',
 'E = ½ k A² = ½ m ω² A² → E ∝ A².', 'Waves', 'easy'),
 (3, 'The escape velocity from a planet is proportional to:',
 '√(gR)', 'gR', '√(g/R)', 'g/R', 'A',
 'v_esc = √(2gR) → v_esc ∝ √(gR).', 'Mechanics', 'medium'),

(3, 'In a damped harmonic oscillator, the amplitude decreases due to:',
 'Frictional force', 'Restoring force', 'Driving force', 'Gravitational force', 'A',
 'Energy is dissipated by damping (friction/air resistance).', 'Waves', 'medium'),

(3, 'The self-inductance of a coil is defined as:',
 'Flux linkage per unit current', 'Flux per unit current', 'Emf per unit rate of change of current', 'Both A and C', 'D',
 'L = Φ/I = -e / (dI/dt).', 'Electromagnetism', 'medium'),

(3, 'The mass defect in a nucleus is responsible for:',
 'Binding energy', 'Kinetic energy', 'Potential energy', 'Thermal energy', 'A',
 'Binding energy = Δm c².', 'Modern Physics', 'easy'),

(3, 'For a body sliding down an inclined plane, the acceleration is maximum when angle of inclination is:',
 '90°', '0°', '45°', '30°', 'A',
 'a = g sinθ → maximum when sinθ = 1 (θ = 90°, vertical free fall).', 'Mechanics', 'medium'),

(3, 'The speed of longitudinal waves in a rod is v = √(Y/ρ), where Y is:',
 'Young’s modulus', 'Bulk modulus', 'Rigidity modulus', 'Poisson’s ratio', 'A',
 'For longitudinal waves in solid rod, v = √(Y/ρ).', 'Waves', 'medium'),

(3, 'In a series LCR circuit, the current is maximum at resonance when:',
 'XL = XC', 'XL > XC', 'XL < XC', 'R = 0', 'A',
 'At resonance ωL = 1/(ωC) → impedance minimum = R.', 'Electricity', 'medium'),

(3, 'The temperature of the cosmic microwave background radiation is approximately:',
 '2.7 K', '300 K', '5800 K', '10⁶ K', 'A',
 'CMB temperature ≈ 2.725 K.', 'Modern Physics/Heat', 'medium'),

(3, 'The work done by friction on a body sliding down an incline is:',
 'Negative', 'Positive', 'Zero', 'Depends on mass', 'A',
 'Friction opposes motion → work done by friction is negative.', 'Mechanics', 'easy'),

(3, 'The unit of intensity of sound is:',
 'W/m²', 'dB', 'Hz', 'm/s', 'A',
 'Sound intensity I = power/area → W/m².', 'Waves', 'easy'),

(3, 'In a nuclear fusion reaction, two light nuclei combine to form a heavier nucleus with:',
 'Release of energy', 'Absorption of energy', 'No energy change', 'Mass increase', 'A',
 'Fusion releases energy for nuclei lighter than iron.', 'Modern Physics', 'easy'),

(3, 'The coefficient of thermal expansion for liquids is generally:',
 'Greater than for solids', 'Less than for solids', 'Equal to solids', 'Zero', 'A',
 'Liquids expand more than solids for the same temperature rise.', 'Heat', 'medium'),

(3, 'The torque required to rotate a flywheel is maximum when:',
 'Angular acceleration is maximum', 'Angular velocity is maximum', 'Moment of inertia is minimum', 'Power is minimum', 'A',
 'τ = I α → torque ∝ angular acceleration.', 'Mechanics', 'medium'),

(3, 'The phenomenon of mirage is due to:',
 'Total internal reflection', 'Refraction', 'Dispersion', 'Diffraction', 'A',
 'Mirage occurs by TIR in layers of air with varying refractive index.', 'Optics', 'medium'),

(3, 'The Q-factor of a series resonant circuit is:',
 'ω₀ L / R', 'R / ω₀ L', '1 / (ω₀ L R)', 'ω₀ R / L', 'A',
 'Q = ω₀ L / R = f₀ / bandwidth.', 'Electricity', 'medium'),

(3, 'The average kinetic energy of a gas molecule is:',
 '(3/2) kT', '(1/2) kT', 'kT', '3 kT', 'A',
 'KE_avg = (3/2) kT per molecule (translational).', 'Heat', 'medium'),

(3, 'The image formed by a plane mirror is:',
 'Virtual, erect, same size', 'Real, inverted, same size', 'Virtual, inverted, diminished', 'Real, erect, magnified', 'A',
 'Plane mirror always forms virtual, erect, laterally inverted image of same size.', 'Optics', 'easy'),

(3, 'The direction of force on a current-carrying conductor in a magnetic field is given by:',
 'Fleming’s left-hand rule', 'Fleming’s right-hand rule', 'Right-hand thumb rule', 'Left-hand thumb rule', 'A',
 'Left-hand rule for motor effect (force).', 'Electromagnetism', 'easy'),

(3, 'The range of electromagnetic waves from radio to gamma rays is called:',
 'Electromagnetic spectrum', 'Visible spectrum', 'Acoustic spectrum', 'Mechanical spectrum', 'A',
 'EM spectrum spans radio waves to gamma rays.', 'Waves', 'easy'),

(3, 'The pressure coefficient of a gas at constant volume is:',
 '1/T', '1/V', '1/P', 'γ/T', 'A',
 'At constant volume, P ∝ T → dP/P = dT/T → coefficient = 1/T.', 'Heat', 'hard'),

(3, 'The angular velocity ω of a rotating body is related to linear velocity v by:',
 'v = ω r', 'ω = v r', 'v = ω / r', 'ω = v / r²', 'A',
 'v = r ω (tangential speed).', 'Mechanics', 'easy'),

(3, 'In Young’s experiment, if slit separation is increased, fringe width:',
 'Decreases', 'Increases', 'Remains same', 'Becomes zero', 'A',
 'Fringe width β = λD/d; d = slit separation, but wider slits reduce coherence and contrast, though formula uses separation.', 'Waves/Optics', 'medium'),

(3, 'The unit of electromotive force (emf) is:',
 'Volt', 'Ampere', 'Ohm', 'Joule', 'A',
 'Emf = work done per unit charge → volt.', 'Electricity', 'easy'),

(3, 'The half-life of carbon-14 is approximately:',
 '5730 years', '12 years', '4.5 billion years', '8 days', 'A',
 '¹⁴C half-life ≈ 5730 years (used in radiocarbon dating).', 'Modern Physics', 'medium'),

(3, 'The bulk modulus is defined as:',
 '-ΔP / (ΔV/V)', 'ΔV / ΔP', 'F/A divided by ΔL/L', 'Shear stress / shear strain', 'A',
 'B = - (ΔP) / (ΔV/V) (negative sign for compression).', 'Mechanics', 'medium'),

(3, 'The speed of sound increases most rapidly with increase in:',
 'Temperature', 'Pressure', 'Humidity', 'Density', 'A',
 'v ∝ √T (main dependence).', 'Waves', 'medium'),

(3, 'In a step-up transformer, the output voltage is higher because:',
 'Number of turns in secondary > primary', 'Number of turns in primary > secondary', 'Core is laminated', 'Frequency is high', 'A',
 'Vs/Vp = Ns/Np → step-up when Ns > Np.', 'Electromagnetism', 'easy'),

(3, 'The photoelectric threshold frequency corresponds to:',
 'Work function φ = h ν₀', 'Maximum KE of electrons', 'Stopping potential', 'Saturation current', 'A',
 'ν₀ = φ / h (minimum frequency for emission).', 'Modern Physics', 'medium'),

(3, 'The thermal resistance of a material is:',
 'L / (k A)', 'k A / L', 'L / k', 'A / k', 'A',
 'R_th = L / (k A) analogous to electrical resistance.', 'Heat', 'medium'),

(3, 'The condition for stable equilibrium is:',
 'Potential energy minimum', 'Potential energy maximum', 'Kinetic energy zero', 'Torque zero only', 'A',
 'Stable equilibrium at minimum PE.', 'Mechanics', 'medium'),

(3, 'The colour of sky is blue due to:',
 'Rayleigh scattering', 'Mie scattering', 'Raman scattering', 'Compton scattering', 'A',
 'Shorter wavelengths (blue) scattered more by atmosphere.', 'Waves/Optics', 'easy'),

(3, 'The power factor in an AC circuit is:',
 'cos φ', 'sin φ', 'tan φ', '1 / cos φ', 'A',
 'Power factor = cos φ = real power / apparent power.', 'Electricity', 'medium'),

(3, 'The radius of nucleus is proportional to:',
 'A^(1/3)', 'A', '√A', 'A^(2/3)', 'A',
 'R = R₀ A^(1/3) (volume ∝ A, radius ∝ cube root).', 'Modern Physics', 'medium'),

(3, 'The velocity of a transverse wave on a string is:',
 '√(T/μ)', '√(T μ)', 'T / μ', 'μ / T', 'A',
 'v = √(T/μ) where T = tension, μ = linear mass density.', 'Waves', 'medium'),

(3, 'The SI unit of magnetic flux density is:',
 'Tesla', 'Weber', 'Gauss', 'Henry', 'A',
 'B = tesla (Wb/m²).', 'Electromagnetism', 'easy'),

(3, 'The process of converting AC to DC is called:',
 'Rectification', 'Amplification', 'Modulation', 'Demodulation', 'A',
 'Rectifier converts AC to pulsating DC.', 'Electricity', 'easy'),

(3, 'The energy gap in silicon semiconductor is approximately:',
 '1.1 eV', '0.7 eV', '3.0 eV', '0.1 eV', 'A',
 'Eg(Si) ≈ 1.12 eV at room temperature.', 'Modern Physics', 'medium'),

(3, 'The time constant of an RC circuit is:',
 'RC', 'R/C', 'C/R', '√(RC)', 'A',
 'τ = RC (time to charge to 63% of final value).', 'Electricity', 'medium'),

(3, 'The principle of conservation of linear momentum applies when:',
 'No external force acts', 'No external torque acts', 'Energy is conserved', 'Velocity is constant', 'A',
 'ΣF_ext = 0 → momentum conserved.', 'Mechanics', 'easy'),

(3, 'The wavelength of X-rays is of the order of:',
 '10⁻¹⁰ m', '10⁻⁶ m', '10⁻² m', '10⁻¹⁵ m', 'A',
 'X-rays: 0.01 to 10 nm (10⁻¹¹ to 10⁻⁹ m).', 'Waves/Modern Physics', 'medium'),

(3, 'The efficiency of Carnot engine depends on:',
 'Temperature of source and sink', 'Working substance', 'Volume change', 'Pressure change', 'A',
 'η = 1 - T₂/T₁ (independent of working substance).', 'Heat', 'medium'),

(3, 'The focal length of human eye lens is changed by:',
 'Ciliary muscles', 'Iris', 'Cornea', 'Retina', 'A',
 'Accommodation by ciliary muscles changing lens curvature.', 'Optics', 'easy'),

(3, 'The direction of induced current in a loop is such that it opposes:',
 'Change in magnetic flux', 'Increase in flux only', 'Decrease in flux only', 'Direction of original current', 'A',
 'Lenz’s law: opposes the cause (change in flux).', 'Electromagnetism', 'medium'),

(3, 'The specific heat at constant pressure Cp is greater than Cv because:',
 'Work is done against external pressure', 'Internal energy changes', 'Temperature remains constant', 'Volume remains constant', 'A',
 'Cp = Cv + R (extra work for expansion at constant P).', 'Heat', 'medium'),

(3, 'The unit of gravitational constant G is:',
 'N m² kg⁻²', 'm³ kg⁻¹ s⁻²', 'Both A and B', 'kg m s⁻²', 'C',
 'G = 6.67430 × 10⁻¹¹ N m² kg⁻² = m³ kg⁻¹ s⁻².', 'Mechanics', 'medium'),

(3, 'The phenomenon of superfluidity is observed in:',
 'Liquid helium below 2.17 K', 'Water at 0°C', 'Mercury at -39°C', 'Nitrogen at 77 K', 'A',
 'Helium-II shows zero viscosity below lambda point.', 'Heat/Modern Physics', 'hard'),

(3, 'The number of spectral lines when electron jumps from n=5 to n=2 in hydrogen atom is:',
 '6', '10', '15', '3', 'A',
 'Number of lines = (n₂ - n₁)(n₂ - n₁ + 1)/2 = (5-2)(4)/2 = 6.', 'Modern Physics', 'medium'),

(3, 'The force between two parallel current-carrying wires is attractive when currents are:',
 'In same direction', 'In opposite direction', 'Zero', 'Alternating', 'A',
 'Parallel currents in same direction attract (Ampere’s force law).', 'Electromagnetism', 'medium'),

(3, 'The root mean square value of sinusoidal voltage V = Vm sin ωt is:',
 'Vm / √2', 'Vm √2', 'Vm / 2', 'Vm', 'A',
 'V_rms = Vm / √2 ≈ 0.707 Vm.', 'Electricity', 'medium'),

(3, 'The dimensional formula of surface tension is:',
 '[MT⁻²]', '[MLT⁻²]', '[ML⁰T⁻²]', '[M⁰LT⁻¹]', 'A',
 'Surface tension γ = F/L = [MLT⁻²]/L = MT⁻².', 'Mechanics', 'medium'),

(3, 'The critical velocity for laminar to turbulent flow in a pipe is given by:',
 'Reynolds number', 'Bernoulli’s equation', 'Poiseuille’s law', 'Stokes’ law', 'A',
 'Transition at Re ≈ 2000–4000 (critical Re).', 'Mechanics', 'medium'),

(3, 'The loudness of sound is measured in:',
 'Decibel (dB)', 'Hertz (Hz)', 'Watt/m²', 'Pascal', 'A',
 'Sound intensity level = 10 log(I/I₀) in dB.', 'Waves', 'easy');