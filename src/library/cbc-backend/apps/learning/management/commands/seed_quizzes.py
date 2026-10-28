"""
Seed Class 10 Quizzes for 5 main subjects:
1. Mathematics
2. Science
3. English
4. Hindi
5. Social Science

Each quiz has 10 high-quality, syllabus-based Class 10 MCQ questions (4 options, 1 correct).
Run: python manage.py seed_quizzes
"""
from django.core.management.base import BaseCommand
from apps.learning.models import Quiz, QuizQuestion, QuizOption

MATH_QUIZ = {
    "title": "Class 10 Mathematics — Foundation & Board MCQ Quiz",
    "subject": "Mathematics",
    "class_level": "Class 10",
    "topic": "Real Numbers, Polynomials & Linear Equations",
    "difficulty": "Easy",
    "time_limit_seconds": 600,
    "passing_score_percent": 40,
    "marks_per_question": 1,
    "total_marks": 10,
    "description": "Test your fundamental understanding of Class 10 Mathematics including Real Numbers, Polynomials, and Linear Equations.",
    "instructions": "1. All 10 questions are compulsory.\n2. Each question carries 1 mark.\n3. Exactly one option is correct.\n4. No negative marking.\n5. Back navigation is disabled once you move forward.\n6. Submit before the timer expires.",
    "allow_back_navigation": False,
    "is_free": True,
    "is_published": True,
    "sort_order": 1,
    "questions": [
        {
            "prompt": "What is the HCF of two consecutive natural numbers?",
            "explanation": "The highest common factor (HCF) of any two consecutive natural numbers (like 4 and 5, or 14 and 15) is always 1 because they are co-prime.",
            "marks": 1,
            "order": 1,
            "options": [
                ("0", False),
                ("1", True),
                ("2", False),
                ("Their product", False),
            ],
        },
        {
            "prompt": "The decimal expansion of the rational number 23 / (2³ × 5²) will terminate after how many decimal places?",
            "explanation": "The highest power of 2 and 5 in the denominator is max(3, 2) = 3. Therefore, the decimal expansion terminates after 3 decimal places.",
            "marks": 1,
            "order": 2,
            "options": [
                ("1 decimal place", False),
                ("2 decimal places", False),
                ("3 decimal places", True),
                ("4 decimal places", False),
            ],
        },
        {
            "prompt": "What is the degree of a quadratic polynomial ax² + bx + c (where a ≠ 0)?",
            "explanation": "A quadratic polynomial is a polynomial of degree 2, meaning the highest power of the variable is 2.",
            "marks": 1,
            "order": 3,
            "options": [
                ("1", False),
                ("2", True),
                ("3", False),
                ("0", False),
            ],
        },
        {
            "prompt": "If α and β are the zeroes of the quadratic polynomial P(x) = x² - 5x + 6, then what is the value of α + β?",
            "explanation": "For quadratic polynomial ax² + bx + c, sum of zeroes (α + β) = -b/a = -(-5)/1 = 5.",
            "marks": 1,
            "order": 4,
            "options": [
                ("-5", False),
                ("5", True),
                ("6", False),
                ("-6", False),
            ],
        },
        {
            "prompt": "The pair of linear equations x + 2y = 4 and 2x + 4y = 8 has how many solutions?",
            "explanation": "Here a1/a2 = 1/2, b1/b2 = 2/4 = 1/2, c1/c2 = 4/8 = 1/2. Since a1/a2 = b1/b2 = c1/c2, the lines are coincident and have infinitely many solutions.",
            "marks": 1,
            "order": 5,
            "options": [
                ("Exactly one unique solution", False),
                ("Exactly two solutions", False),
                ("Infinitely many solutions", True),
                ("No solution", False),
            ],
        },
        {
            "prompt": "What is the discriminant of the quadratic equation 2x² - 4x + 3 = 0?",
            "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8.",
            "marks": 1,
            "order": 6,
            "options": [
                ("-8", True),
                ("8", False),
                ("40", False),
                ("16", False),
            ],
        },
        {
            "prompt": "What is the 10th term of the Arithmetic Progression (AP): 2, 7, 12, ...?",
            "explanation": "First term a = 2, common difference d = 7 - 2 = 5. nth term a_n = a + (n - 1)d. a_10 = 2 + 9(5) = 47.",
            "marks": 1,
            "order": 7,
            "options": [
                ("45", False),
                ("47", True),
                ("50", False),
                ("52", False),
            ],
        },
        {
            "prompt": "The distance of the point P(3, 4) from the origin (0, 0) is:",
            "explanation": "Distance from origin = √(x² + y²) = √(3² + 4²) = √(9 + 16) = √25 = 5 units.",
            "marks": 1,
            "order": 8,
            "options": [
                ("3 units", False),
                ("4 units", False),
                ("5 units", True),
                ("7 units", False),
            ],
        },
        {
            "prompt": "What is the value of sin²(30°) + cos²(30°)?",
            "explanation": "By the fundamental trigonometric identity, sin²θ + cos²θ = 1 for any acute angle θ.",
            "marks": 1,
            "order": 9,
            "options": [
                ("0", False),
                ("1/2", False),
                ("1", True),
                ("2", False),
            ],
        },
        {
            "prompt": "If the perimeter and area of a circle are numerically equal, then what is the radius of the circle?",
            "explanation": "Perimeter = 2πr, Area = πr². Setting 2πr = πr² gives r = 2 units (since r > 0).",
            "marks": 1,
            "order": 10,
            "options": [
                ("2 units", True),
                ("π units", False),
                ("4 units", False),
                ("7 units", False),
            ],
        },
    ],
}
SCIENCE_QUIZ = {
    "title": "Class 10 Science — Essential Concepts MCQ Quiz",
    "subject": "Science",
    "class_level": "Class 10",
    "topic": "Chemical Reactions, Acids & Bases, Life Processes, Light",
    "difficulty": "Easy",
    "time_limit_seconds": 600,
    "passing_score_percent": 40,
    "marks_per_question": 1,
    "total_marks": 10,
    "description": "Essential Class 10 Science quiz covering Chemical Reactions, Acids & Bases, Life Processes, and Light Reflection & Refraction.",
    "instructions": "1. All 10 questions are compulsory.\n2. Each question carries 1 mark.\n3. Exactly one option is correct.\n4. No negative marking.\n5. Answer each question carefully before proceeding.\n6. Timer runs continuously once confirmed.",
    "allow_back_navigation": False,
    "is_free": True,
    "is_published": True,
    "sort_order": 2,
    "questions": [
        {
            "prompt": "What type of chemical reaction occurs when quicklime (CaO) reacts with water to form slaked lime Ca(OH)₂?",
            "explanation": "Two reactants (CaO and H₂O) combine to form a single product Ca(OH)₂ with release of heat, which is a combination (and exothermic) reaction.",
            "marks": 1,
            "order": 1,
            "options": [
                ("Decomposition reaction", False),
                ("Combination reaction", True),
                ("Displacement reaction", False),
                ("Double displacement reaction", False),
            ],
        },
        {
            "prompt": "Which acid is naturally present in curd / sour milk?",
            "explanation": "Lactic acid is the natural organic acid present in curd and sour milk, produced by Lactobacillus bacteria.",
            "marks": 1,
            "order": 2,
            "options": [
                ("Citric acid", False),
                ("Acetic acid", False),
                ("Lactic acid", True),
                ("Tartaric acid", False),
            ],
        },
        {
            "prompt": "What is the pH value of pure neutral water at 25°C?",
            "explanation": "On the pH scale, neutral solutions like pure distilled water have a pH of exactly 7 at 25°C.",
            "marks": 1,
            "order": 3,
            "options": [
                ("0", False),
                ("7", True),
                ("14", False),
                ("1", False),
            ],
        },
        {
            "prompt": "Which of the following metals is liquid at room temperature?",
            "explanation": "Mercury (Hg) is the only metal that exists in liquid state at normal room temperature.",
            "marks": 1,
            "order": 4,
            "options": [
                ("Sodium", False),
                ("Mercury", True),
                ("Iron", False),
                ("Aluminium", False),
            ],
        },
        {
            "prompt": "The breakdown of pyruvate to give carbon dioxide, water and energy takes place in which cellular organelle?",
            "explanation": "The aerobic breakdown of pyruvate into CO₂, H₂O, and ATP takes place in the mitochondria of the cell.",
            "marks": 1,
            "order": 5,
            "options": [
                ("Cytoplasm", False),
                ("Mitochondria", True),
                ("Chloroplast", False),
                ("Nucleus", False),
            ],
        },
        {
            "prompt": "Which blood vessels carry oxygenated blood from the lungs back to the left atrium of the heart?",
            "explanation": "Pulmonary veins are the unique veins that carry oxygen-rich blood from the lungs into the left atrium of the heart.",
            "marks": 1,
            "order": 6,
            "options": [
                ("Pulmonary veins", True),
                ("Pulmonary arteries", False),
                ("Vena Cava", False),
                ("Renal arteries", False),
            ],
        },
        {
            "prompt": "In human males, which hormone is responsible for the regulation of sperm production and secondary sexual characteristics?",
            "explanation": "Testosterone is produced by the testes in males and controls sperm formation and male secondary sexual characteristics.",
            "marks": 1,
            "order": 7,
            "options": [
                ("Estrogen", False),
                ("Testosterone", True),
                ("Insulin", False),
                ("Thyroxine", False),
            ],
        },
        {
            "prompt": "The SI unit of electric current is:",
            "explanation": "The SI unit of electric current is the Ampere (A), named after André-Marie Ampère.",
            "marks": 1,
            "order": 8,
            "options": [
                ("Volt", False),
                ("Ohm", False),
                ("Ampere", True),
                ("Watt", False),
            ],
        },
        {
            "prompt": "What is the focal length of a spherical mirror whose radius of curvature is 30 cm?",
            "explanation": "The focal length f of a spherical mirror is half of its radius of curvature R: f = R / 2 = 30 / 2 = 15 cm.",
            "marks": 1,
            "order": 9,
            "options": [
                ("60 cm", False),
                ("15 cm", True),
                ("30 cm", False),
                ("10 cm", False),
            ],
        },
        {
            "prompt": "The phenomenon of splitting of white light into its seven constituent colors through a glass prism is called:",
            "explanation": "Dispersion of light is the splitting of white light into its component colors (VIBGYOR) due to differing refractive indices for each wavelength.",
            "marks": 1,
            "order": 10,
            "options": [
                ("Reflection", False),
                ("Refraction", False),
                ("Dispersion", True),
                ("Total internal reflection", False),
            ],
        },
    ],
}
ENGLISH_QUIZ = {
    "title": "Class 10 English — First Flight Literature & Grammar Quiz",
    "subject": "English",
    "class_level": "Class 10",
    "topic": "First Flight Prose, Poetry & Essential English Grammar",
    "difficulty": "Easy",
    "time_limit_seconds": 600,
    "passing_score_percent": 40,
    "marks_per_question": 1,
    "total_marks": 10,
    "description": "Test your knowledge of CBSE/NCERT Class 10 English literature (First Flight) and essential English grammar.",
    "instructions": "1. All 10 questions are compulsory.\n2. Each question carries 1 mark.\n3. Exactly one option is correct.\n4. No negative marking.\n5. Manage your time carefully.\n6. Confirm before beginning.",
    "allow_back_navigation": False,
    "is_free": True,
    "is_published": True,
    "sort_order": 3,
    "questions": [
        {
            "prompt": "In the story 'A Letter to God', what destroyed Lencho's ripe corn field?",
            "explanation": "A sudden heavy hailstorm swept over Lencho's valley for an hour, completely destroying his corn field and flowers.",
            "marks": 1,
            "order": 1,
            "options": [
                ("Heavy flood", False),
                ("Hailstorm", True),
                ("Swarm of locusts", False),
                ("Severe drought", False),
            ],
        },
        {
            "prompt": "How much money did Lencho ask God for in his letter?",
            "explanation": "Lencho wrote to God requesting 100 pesos to re-sow his field and sustain his family until the harvest.",
            "marks": 1,
            "order": 2,
            "options": [
                ("50 pesos", False),
                ("70 pesos", False),
                ("100 pesos", True),
                ("500 pesos", False),
            ],
        },
        {
            "prompt": "Who is the poet of the famous poems 'Dust of Snow' and 'Fire and Ice'?",
            "explanation": "Both 'Dust of Snow' and 'Fire and Ice' were composed by the celebrated American poet Robert Frost.",
            "marks": 1,
            "order": 3,
            "options": [
                ("Robert Frost", True),
                ("William Wordsworth", False),
                ("Walt Whitman", False),
                ("Leslie Norris", False),
            ],
        },
        {
            "prompt": "In 'Nelson Mandela: Long Walk to Freedom', what was the historic date of the inauguration of South Africa's democracy?",
            "explanation": "The historic inauguration ceremony took place on 10th May 1994 at the Union Buildings in Pretoria.",
            "marks": 1,
            "order": 4,
            "options": [
                ("10th May 1994", True),
                ("15th August 1947", False),
                ("26th January 1950", False),
                ("10th April 1990", False),
            ],
        },
        {
            "prompt": "What affectionate name did Anne Frank give to her diary in 'From the Diary of Anne Frank'?",
            "explanation": "Anne Frank called her diary 'Kitty' and treated it as a patient, confidante friend.",
            "marks": 1,
            "order": 5,
            "options": [
                ("Tommy", False),
                ("Kitty", True),
                ("Daisy", False),
                ("Polly", False),
            ],
        },
        {
            "prompt": "Choose the correct past participle form of the irregular verb 'freeze':",
            "explanation": "The principal parts of the irregular verb are: freeze (base), froze (past), and frozen (past participle).",
            "marks": 1,
            "order": 6,
            "options": [
                ("Freezed", False),
                ("Froze", False),
                ("Frozen", True),
                ("Freezing", False),
            ],
        },
        {
            "prompt": "Identify the antonym of the word 'Courage':",
            "explanation": "'Cowardice' signifies lack of bravery or courage, making it the antonym.",
            "marks": 1,
            "order": 7,
            "options": [
                ("Bravery", False),
                ("Valour", False),
                ("Cowardice", True),
                ("Strength", False),
            ],
        },
        {
            "prompt": "Fill in the blank with the appropriate modal: 'We _____ obey traffic rules to keep our roads safe.'",
            "explanation": "'Must' expresses moral and legal duty/obligation.",
            "marks": 1,
            "order": 8,
            "options": [
                ("must", True),
                ("might", False),
                ("could", False),
                ("would", False),
            ],
        },
        {
            "prompt": "What is the synonym of the word 'Pensive'?",
            "explanation": "'Pensive' means engaged in serious or deep contemplation (Thoughtful).",
            "marks": 1,
            "order": 9,
            "options": [
                ("Thoughtful", True),
                ("Angry", False),
                ("Cheerful", False),
                ("Careless", False),
            ],
        },
        {
            "prompt": "Which poetic device is used in the line 'Has given my heart / A change of mood'?",
            "explanation": "The repetition of the consonant 'h' sound in 'Has given my heart' is Alliteration.",
            "marks": 1,
            "order": 10,
            "options": [
                ("Alliteration", True),
                ("Simile", False),
                ("Hyperbole", False),
                ("Oxymoron", False),
            ],
        },
    ],
}
HINDI_QUIZ = {
    "title": "कक्षा 10 हिंदी — क्षितिज एवं व्याकरण अभ्यास क्विज़",
    "subject": "Hindi",
    "class_level": "Class 10",
    "topic": "क्षितिज (पद, पाठ) एवं हिंदी व्याकरण (संधि, समास, वाच्य, रस)",
    "difficulty": "Easy",
    "time_limit_seconds": 600,
    "passing_score_percent": 40,
    "marks_per_question": 1,
    "total_marks": 10,
    "description": "कक्षा 10 हिंदी (क्षितिज/कृतिका एवं व्याकरण) का अभ्यास टेस्ट। पद, वाच्य, रस और पाठ आधारित महत्वपूर्ण प्रश्न।",
    "instructions": "1. सभी 10 प्रश्न अनिवार्य हैं।\n2. प्रत्येक प्रश्न 1 अंक का है।\n3. प्रत्येक प्रश्न के 4 विकल्प हैं, जिनमें से केवल एक सही है।\n4. कोई नकारात्मक अंकन नहीं है।\n5. समय सीमा 10 मिनट है।",
    "allow_back_navigation": False,
    "is_free": True,
    "is_published": True,
    "sort_order": 4,
    "questions": [
        {
            "prompt": "'सूरदास के पद' में गोपियों ने 'बड़भागी' (भाग्यशाली) कहकर किस पर व्यंग्य किया है?",
            "explanation": "गोपियों ने उद्धव को व्यंग्य में 'अति बड़भागी' कहा क्योंकि वे प्रेम के सागर कृष्ण के पास रहकर भी प्रेम के बंधन से अछूते रहे।",
            "marks": 1,
            "order": 1,
            "options": [
                ("कृष्ण पर", False),
                ("उद्धव पर", True),
                ("बलराम पर", False),
                ("अक्रूर पर", False),
            ],
        },
        {
            "prompt": "'नेताजी का चश्मा' कहानी के लेखक कौन हैं?",
            "explanation": "'नेताजी का चश्मा' देशभक्ति की भावना से परिपूर्ण प्रसिद्ध कहानी है जिसके लेखक स्वयं प्रकाश हैं।",
            "marks": 1,
            "order": 2,
            "options": [
                ("स्वयं प्रकाश", True),
                ("रामवृक्ष बेनीपुरी", False),
                ("यशपाल", False),
                ("मन्नू भंडारी", False),
            ],
        },
        {
            "prompt": "'बालगोबिन भगत' किसके आदर्शों और गीतों पर चलते थे?",
            "explanation": "बालगोबिन भगत कबीर को 'साहब' मानते थे, उन्हीं के गीतों को गाते और उन्हीं के आदेशों पर चलते थे।",
            "marks": 1,
            "order": 3,
            "options": [
                ("तुलसीदास", False),
                ("कबीरदास", True),
                ("सूरदास", False),
                ("मीराबाई", False),
            ],
        },
        {
            "prompt": "रचना के आधार पर वाक्य के कितने भेद होते हैं?",
            "explanation": "रचना की दृष्टि से वाक्य के तीन भेद होते हैं: 1. सरल वाक्य, 2. संयुक्त वाक्य, और 3. मिश्र वाक्य।",
            "marks": 1,
            "order": 4,
            "options": [
                ("दो", False),
                ("तीन", True),
                ("चार", False),
                ("आठ", False),
            ],
        },
        {
            "prompt": "'दशानन' (दस हैं आनन जिसके - रावण) में कौन-सा समास है?",
            "explanation": "दशानन में दोनों पद मिलकर किसी तीसरे पद (रावण) की ओर संकेत करते हैं, अतः यहाँ बहुव्रीहि समास है।",
            "marks": 1,
            "order": 5,
            "options": [
                ("तत्पुरुष समास", False),
                ("द्विगु समास", False),
                ("बहुव्रीहि समास", True),
                ("द्वंद्व समास", False),
            ],
        },
        {
            "prompt": "'सूर्योदय' शब्द का सही संधि-विच्छेद क्या है?",
            "explanation": "सूर्य + उदय = सूर्योदय (गुण स्वर संधि, जहाँ अ + उ मिलकर ओ बनते हैं)।",
            "marks": 1,
            "order": 6,
            "options": [
                ("सूर्य + उदय", True),
                ("सूर्यो + दय", False),
                ("सूर + उदय", False),
                ("सूर्या + उदय", False),
            ],
        },
        {
            "prompt": "काव्य में 'शृंगार रस' का स्थायी भाव क्या है?",
            "explanation": "शृंगार रस को रसराज माना जाता है और इसका स्थायी भाव 'रति' (प्रेम) होता है।",
            "marks": 1,
            "order": 7,
            "options": [
                ("शोक", False),
                ("रति (प्रेम)", True),
                ("हास", False),
                ("उत्साह", False),
            ],
        },
        {
            "prompt": "'उत्साह' कविता में कवि सूर्यकांत त्रिपाठी 'निराला' ने किसे संबोधित किया है?",
            "explanation": "'उत्साह' एक आह्वान गीत है जिसमें कवि निराला ने क्रांति और नवचेतना के प्रतीक 'बादल' को संबोधित किया है।",
            "marks": 1,
            "order": 8,
            "options": [
                ("पवन को", False),
                ("बादल को", True),
                ("सूरज को", False),
                ("वर्षा को", False),
            ],
        },
        {
            "prompt": "'आँखों का तारा होना' मुहावरे का सही अर्थ क्या है?",
            "explanation": "'आँखों का तारा होना' का प्रचलित अर्थ अत्यंत प्रिय या लाडला होना है।",
            "marks": 1,
            "order": 9,
            "options": [
                ("बहुत प्यारा होना", True),
                ("बहुत दूर होना", False),
                ("कम दिखाई देना", False),
                ("घमंडी होना", False),
            ],
        },
        {
            "prompt": "\"राम पत्र लिखता है।\" — इस वाक्य में कौन-सा वाच्य है?",
            "explanation": "इस वाक्य में कर्ता (राम) प्रधान है और क्रिया कर्ता के लिंग-वचन के अनुसार है, अतः यह कर्तृवाच्य है।",
            "marks": 1,
            "order": 10,
            "options": [
                ("कर्मवाच्य", False),
                ("भाववाच्य", False),
                ("कर्तृवाच्य", True),
                ("इनमें से कोई नहीं", False),
            ],
        },
    ],
}
SST_QUIZ = {
    "title": "Class 10 Social Science — Core Fundamentals MCQ Quiz",
    "subject": "Social Science",
    "class_level": "Class 10",
    "topic": "Nationalism in India, Resources, Federalism, Development",
    "difficulty": "Easy",
    "time_limit_seconds": 600,
    "passing_score_percent": 40,
    "marks_per_question": 1,
    "total_marks": 10,
    "description": "Comprehensive Class 10 Social Science test covering key concepts of History, Geography, Democratic Politics, and Economics.",
    "instructions": "1. All 10 questions are compulsory.\n2. Each question carries 1 mark.\n3. Exactly one option is correct.\n4. No negative marking.\n5. Answer calmly and review results at completion.",
    "allow_back_navigation": False,
    "is_free": True,
    "is_published": True,
    "sort_order": 5,
    "questions": [
        {
            "prompt": "In which year did the infamous Jallianwala Bagh massacre take place in Amritsar?",
            "explanation": "The tragic Jallianwala Bagh massacre occurred on 13th April 1919 (Baisakhi day) when General Dyer ordered troops to fire upon peaceful protesters.",
            "marks": 1,
            "order": 1,
            "options": [
                ("1917", False),
                ("1919", True),
                ("1921", False),
                ("1929", False),
            ],
        },
        {
            "prompt": "Who wrote the famous book 'Hind Swaraj' published in 1909?",
            "explanation": "'Hind Swaraj' (Indian Home Rule) was written in 1909 by Mahatma Gandhi emphasizing self-reliance and non-cooperation.",
            "marks": 1,
            "order": 2,
            "options": [
                ("Jawaharlal Nehru", False),
                ("Mahatma Gandhi", True),
                ("Subhas Chandra Bose", False),
                ("Bal Gangadhar Tilak", False),
            ],
        },
        {
            "prompt": "Black soil (also known as Regur soil) is most ideal for the cultivation of which major cash crop?",
            "explanation": "Black soil has high moisture retentiveness and is famously ideal for cultivating cotton.",
            "marks": 1,
            "order": 3,
            "options": [
                ("Cotton", True),
                ("Tea", False),
                ("Jute", False),
                ("Wheat", False),
            ],
        },
        {
            "prompt": "Which type of natural resource is solar energy?",
            "explanation": "Solar energy is inexhaustible and replenished continuously by nature, making it a renewable resource.",
            "marks": 1,
            "order": 4,
            "options": [
                ("Non-renewable resource", False),
                ("Renewable resource", True),
                ("Non-recyclable resource", False),
                ("Exhaustible resource", False),
            ],
        },
        {
            "prompt": "What is the capital city of Belgium, chosen as the headquarters of the European Union?",
            "explanation": "Brussels is the capital of Belgium and serves as the official headquarters of the European Union.",
            "marks": 1,
            "order": 5,
            "options": [
                ("Paris", False),
                ("Berlin", False),
                ("Brussels", True),
                ("Amsterdam", False),
            ],
        },
        {
            "prompt": "Which tier of government in India has exclusive power to make laws on subjects in the 'Union List'?",
            "explanation": "Only the Central / Union Government has the authority to legislate on subjects in the Union List (such as defense, foreign affairs, currency).",
            "marks": 1,
            "order": 6,
            "options": [
                ("State Government alone", False),
                ("Central / Union Government", True),
                ("Local Panchayat", False),
                ("Both State and Union equally", False),
            ],
        },
        {
            "prompt": "Which international organization publishes the annual Human Development Report (HDR)?",
            "explanation": "The Human Development Report is prepared and published by the United Nations Development Programme (UNDP).",
            "marks": 1,
            "order": 7,
            "options": [
                ("World Bank", False),
                ("United Nations Development Programme (UNDP)", True),
                ("International Monetary Fund (IMF)", False),
                ("World Health Organization (WHO)", False),
            ],
        },
        {
            "prompt": "What is the primary indicator used by the World Bank to classify countries into rich and low-income categories?",
            "explanation": "The World Bank classifies countries based on Per Capita Income (average income per capita per year) in US dollars.",
            "marks": 1,
            "order": 8,
            "options": [
                ("Total Population", False),
                ("Per Capita Income", True),
                ("Literacy Rate", False),
                ("Life Expectancy", False),
            ],
        },
        {
            "prompt": "In which economic sector do activities like dairy farming, agriculture, and fishing fall?",
            "explanation": "Activities that produce goods directly from natural resources belong to the Primary Sector.",
            "marks": 1,
            "order": 9,
            "options": [
                ("Primary Sector", True),
                ("Secondary Sector", False),
                ("Tertiary Sector", False),
                ("Quaternary Sector", False),
            ],
        },
        {
            "prompt": "Which major national movement was launched by Mahatma Gandhi with the historic Dandi March in 1930?",
            "explanation": "The Civil Disobedience Movement was initiated on 12th March 1930 with the famous Dandi March to break the Salt Law.",
            "marks": 1,
            "order": 10,
            "options": [
                ("Non-Cooperation Movement", False),
                ("Civil Disobedience Movement", True),
                ("Quit India Movement", False),
                ("Champaran Satyagraha", False),
            ],
        },
    ],
}

ALL_QUIZZES = [MATH_QUIZ, SCIENCE_QUIZ, ENGLISH_QUIZ, HINDI_QUIZ, SST_QUIZ]


class Command(BaseCommand):
    help = "Seed 5 Class 10 Quizzes (10 MCQ questions each = 50 total questions) for Mathematics, Science, English, Hindi, and Social Science"

    def handle(self, *args, **options):
        total_q_created = 0
        total_opt_created = 0

        for quiz_data in ALL_QUIZZES:
            questions_data = quiz_data.pop("questions", [])

            quiz, created = Quiz.objects.update_or_create(
                title=quiz_data["title"],
                class_level=quiz_data["class_level"],
                subject=quiz_data["subject"],
                defaults={
                    "topic": quiz_data["topic"],
                    "difficulty": quiz_data["difficulty"],
                    "time_limit_seconds": quiz_data["time_limit_seconds"],
                    "passing_score_percent": quiz_data["passing_score_percent"],
                    "marks_per_question": quiz_data["marks_per_question"],
                    "total_marks": quiz_data["total_marks"],
                    "description": quiz_data["description"],
                    "instructions": quiz_data["instructions"],
                    "allow_back_navigation": quiz_data["allow_back_navigation"],
                    "is_free": quiz_data["is_free"],
                    "is_published": quiz_data["is_published"],
                    "sort_order": quiz_data["sort_order"],
                },
            )
            action = "Created" if created else "Updated"
            self.stdout.write(f"[{action}] Quiz: {quiz.subject} - {quiz.class_level}")

            # Replace questions to ensure idempotency and correct order
            quiz.questions.all().delete()

            for q_info in questions_data:
                question = QuizQuestion.objects.create(
                    quiz=quiz,
                    prompt=q_info["prompt"],
                    explanation=q_info["explanation"],
                    marks=q_info["marks"],
                    order=q_info["order"],
                    question_type="mcq",
                )
                total_q_created += 1

                for opt_idx, (opt_text, is_correct) in enumerate(q_info["options"], start=1):
                    QuizOption.objects.create(
                        question=question,
                        text=opt_text,
                        is_correct=is_correct,
                        order=opt_idx,
                    )
                    total_opt_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(ALL_QUIZZES)} Quizzes, {total_q_created} Questions, and {total_opt_created} Options!"
            )
        )
