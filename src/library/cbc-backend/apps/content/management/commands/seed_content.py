"""
Seed all previously hard-coded content (PYQ, YouTube, Social Links, FAQ)
into the database so it can be managed dynamically via the admin panel.

Run: python manage.py seed_content
"""
from django.core.management.base import BaseCommand
from apps.content.models import FAQ, PYQPaper, SocialLink, StudyMaterial, YouTubeChapter, YouTubeSubject, YouTubeVideo


PYQ_DATA = [
    # FREE
    ("Class 10 Science PYQ 2023",  "Science",     "2023",      "Class 10", 24,  True,  "https://www.cbse.gov.in/cbsenew/documents/SQP2023/Class-X-Science-SQP.pdf"),
    ("Class 10 Maths PYQ 2023",    "Mathematics", "2023",      "Class 10", 18,  True,  "https://www.cbse.gov.in/cbsenew/documents/SQP2023/Class-X-Maths-SQP.pdf"),
    ("Class 12 Physics PYQ 2023",  "Physics",     "2023",      "Class 12", 22,  True,  "https://www.cbse.gov.in/cbsenew/documents/SQP2023/Class-XII-Physics-SQP.pdf"),
    ("Class 9 Maths PYQ 2022",     "Mathematics", "2022",      "Class 9",  16,  True,  "https://cbseacademic.nic.in/web_material/SQP/ClassIX_2022_23/Maths-SQP.pdf"),
    # PAID
    ("Class 10 Science PYQ 2018–2023 (Complete Set)",    "Science",     "2018–2023", "Class 10", 120, False, ""),
    ("Class 10 Maths PYQ 2018–2023 (Complete Set)",      "Mathematics", "2018–2023", "Class 10", 108, False, ""),
    ("Class 12 Physics PYQ 2018–2023 (Complete Set)",    "Physics",     "2018–2023", "Class 12", 136, False, ""),
    ("Class 12 Chemistry PYQ 2018–2023 (Complete Set)",  "Chemistry",   "2018–2023", "Class 12", 124, False, ""),
    ("Class 11 Maths PYQ 2018–2023 (Complete Set)",      "Mathematics", "2018–2023", "Class 11", 112, False, ""),
    ("Class 9 Science PYQ 2018–2023 (Complete Set)",     "Science",     "2018–2023", "Class 9",  96,  False, ""),
]

YOUTUBE_SUBJECTS = [
    # (subject_id, name, icon, color, class_level)
    ("9-maths",  "Mathematics",   "🔢", "#2E90FA", "Class 9"),
    ("9-sci",    "Science",       "🔬", "#12B76A", "Class 9"),
    ("9-eng",    "English",       "📖", "#F79009", "Class 9"),
    ("9-hindi",  "Hindi",         "🇮🇳", "#EF4444", "Class 9"),
    ("9-sst",    "Social Science","🌍", "#8B5CF6", "Class 9"),
    ("10-maths", "Mathematics",   "🔢", "#2E90FA", "Class 10"),
    ("10-sci",   "Science",       "🔬", "#12B76A", "Class 10"),
    ("10-eng",   "English",       "📖", "#F79009", "Class 10"),
    ("10-hindi", "Hindi",         "🇮🇳", "#EF4444", "Class 10"),
    ("10-sst",   "Social Science","🌍", "#8B5CF6", "Class 10"),
    ("11-phy",   "Physics",       "⚡", "#F79009", "Class 11"),
    ("11-chem",  "Chemistry",     "🧪", "#7A5AF8", "Class 11"),
    ("11-bio",   "Biology",       "🧬", "#12B76A", "Class 11"),
    ("11-maths", "Mathematics",   "🔢", "#2E90FA", "Class 11"),
    ("11-eng",   "English",       "📖", "#F79009", "Class 11"),
    ("12-phy",   "Physics",       "⚡", "#F79009", "Class 12"),
    ("12-chem",  "Chemistry",     "🧪", "#7A5AF8", "Class 12"),
    ("12-bio",   "Biology",       "🧬", "#12B76A", "Class 12"),
    ("12-maths", "Mathematics",   "🔢", "#2E90FA", "Class 12"),
    ("12-eng",   "English",       "📖", "#F79009", "Class 12"),
]

# sample chapters + videos for Class 10 Maths and Science
SAMPLE_CHAPTERS = {
    "10-maths": [
        ("Real Numbers", [
            ("Real Numbers - Introduction", "dQw4w9WgXcQ", "12:30"),
            ("Euclid's Division Lemma", "dQw4w9WgXcQ", "18:45"),
        ]),
        ("Polynomials", [
            ("Polynomials - Basics", "dQw4w9WgXcQ", "14:20"),
            ("Zeros of a Polynomial", "dQw4w9WgXcQ", "16:10"),
        ]),
        ("Linear Equations in Two Variables", [
            ("Linear Equations - Intro", "dQw4w9WgXcQ", "15:00"),
        ]),
    ],
    "10-sci": [
        ("Chemical Reactions and Equations", [
            ("Chemical Reactions - Introduction", "dQw4w9WgXcQ", "20:00"),
            ("Types of Chemical Reactions", "dQw4w9WgXcQ", "22:15"),
        ]),
        ("Acids, Bases and Salts", [
            ("Acids and Bases", "dQw4w9WgXcQ", "17:30"),
        ]),
    ],
}

SOCIAL_LINKS = [
    ("youtube",   "YouTube",   "▶️", "#FF0000", "https://youtube.com/@conceptbuilderclasses",  0),
    ("instagram", "Instagram", "📸", "#E1306C", "https://instagram.com/conceptbuilderclasses", 1),
    ("telegram",  "Telegram",  "✈️", "#229ED9", "https://t.me/conceptbuilderclasses",           2),
    ("whatsapp",  "WhatsApp",  "💬", "#25D366", "https://wa.me/919569648077",                   3),
    ("facebook",  "Facebook",  "👍", "#1877F2", "https://facebook.com/conceptbuilderclasses",  4),
    ("twitter",   "X / Twitter","🐦","#000000", "https://twitter.com/cbclasses",               5),
    ("website",   "Website",   "🌐", "#1B2B4B", "https://conceptbuilderclasses.com",            6),
]

FAQS = [
    ("What is Concept Builder Classes?",
     "Concept Builder Classes is an online learning platform focused on UP Board students (Class 9–12). We provide live classes, recorded lectures, notes, and test series taught in Hindi medium.", 0),
    ("How do I enroll in a course?",
     "Browse any course, tap on it to view details, then tap 'Enroll' or 'Buy Now'. Free courses are instantly accessible. Paid courses require a one-time payment.", 1),
    ("Are the classes available in Hindi?",
     "Yes! All courses are taught in Hindi medium, making it easy for UP Board students to understand complex topics.", 2),
    ("Can I download videos for offline viewing?",
     "Yes, purchased course videos can be downloaded for offline viewing from the Downloads tab at the bottom of the app.", 3),
    ("How do I access free courses?",
     "Tap on 'Free Courses' from the home screen. These courses are available to all registered students without any payment.", 4),
    ("What payment methods are accepted?",
     "We accept UPI, debit/credit cards, net banking, and wallets through our secure Razorpay payment gateway.", 5),
    ("Will I get a certificate after completing a course?",
     "Yes! After completing all lessons and passing the final quiz, you will receive a digital certificate that you can download and share.", 6),
    ("How do I contact support?",
     "You can reach us through the Support option in Settings, or message us directly on our WhatsApp channel for quick help.", 7),
    ("Can I switch between classes?",
     "Yes, tap the class selector pill at the top of the home screen to switch between Class 9, 10, 11, and 12 anytime.", 8),
    ("What is the CHIRAG / SHAKTI / ANTIM batch?",
     "These are our flagship UP Board preparation batches for Class 9 and 10 respectively. They include live classes, recordings, notes, chapter-wise tests, and model paper solutions.", 9),
    ("Is there a refund policy?",
     "Yes, we offer a 7-day refund policy if you're not satisfied. Contact our support team within 7 days of purchase to initiate a refund.", 10),
    ("How do I reset my password?",
     "On the Login screen, tap 'Forgot Password', enter your registered email, and follow the instructions sent to reset your password.", 11),
]


class Command(BaseCommand):
    help = "Seed content: PYQ, YouTube subjects/chapters/videos, Social Links, FAQ"

    def handle(self, *args, **options):
        # ── PYQ ──────────────────────────────────────────────────────────────
        self.stdout.write("Seeding PYQ papers...")
        for i, (title, subject, year, class_level, pages, is_free, pdf_url) in enumerate(PYQ_DATA):
            PYQPaper.objects.get_or_create(
                title=title, class_level=class_level,
                defaults=dict(subject=subject, year=year, pages=pages,
                              is_free=is_free, pdf_url=pdf_url, sort_order=i)
            )
        self.stdout.write(f"  {PYQPaper.objects.count()} PYQ papers")

        # ── YouTube subjects ──────────────────────────────────────────────────
        self.stdout.write("Seeding YouTube subjects...")
        subject_map = {}
        for i, (sid, name, icon, color, class_level) in enumerate(YOUTUBE_SUBJECTS):
            obj, _ = YouTubeSubject.objects.get_or_create(
                subject_id=sid,
                defaults=dict(name=name, icon=icon, color=color,
                              class_level=class_level, sort_order=i)
            )
            subject_map[sid] = obj

        self.stdout.write("Seeding sample chapters and videos...")
        for sid, chapters in SAMPLE_CHAPTERS.items():
            subj = subject_map.get(sid)
            if not subj:
                continue
            for ch_order, (ch_title, videos) in enumerate(chapters):
                chapter, _ = YouTubeChapter.objects.get_or_create(
                    subject=subj, title=ch_title,
                    defaults=dict(order=ch_order)
                )
                for v_order, (v_title, v_id, v_dur) in enumerate(videos):
                    YouTubeVideo.objects.get_or_create(
                        chapter=chapter, title=v_title,
                        defaults=dict(video_id=v_id, duration=v_dur, order=v_order)
                    )

        # ── Social Links ──────────────────────────────────────────────────────
        self.stdout.write("Seeding social links...")
        for platform, label, icon, color, url, sort_order in SOCIAL_LINKS:
            links = SocialLink.objects.filter(platform=platform)
            if links.exists():
                obj = links.first()
                # remove extra duplicates, keep only the first
                links.exclude(pk=obj.pk).delete()
                obj.label = label; obj.icon = icon; obj.color = color
                obj.url = url; obj.sort_order = sort_order
                obj.save()
            else:
                SocialLink.objects.create(
                    platform=platform, label=label, icon=icon, color=color,
                    url=url, sort_order=sort_order,
                )
        self.stdout.write(f"  {SocialLink.objects.count()} social links")

        # ── FAQ ───────────────────────────────────────────────────────────────
        self.stdout.write("Seeding FAQs...")
        for question, answer, sort_order in FAQS:
            FAQ.objects.get_or_create(
                question=question,
                defaults=dict(answer=answer, sort_order=sort_order)
            )
        self.stdout.write(f"  {FAQ.objects.count()} FAQs")

        # ── Study Materials (NCERT, Paid/Free Tests & Notes) ──────────────────
        self.stdout.write("Seeding study materials...")
        STUDY_MATERIALS = [
            # NCERT Books
            ("Class 10 Mathematics NCERT Book", "ncert", "Mathematics", "Class 10", "Official NCERT Class 10 Maths textbook in Hindi & English medium", "https://ncert.nic.in/textbook/pdf/jemh1dd.zip", 1),
            ("Class 10 Science NCERT Book", "ncert", "Science", "Class 10", "Complete NCERT Class 10 Science textbook chapters with solutions", "https://ncert.nic.in/textbook/pdf/jesc1dd.zip", 2),
            ("Class 10 Social Science NCERT Book", "ncert", "Social Science", "Class 10", "History, Geography, Democratic Politics & Economics", "", 3),
            ("Class 10 English First Flight NCERT", "ncert", "English", "Class 10", "First Flight textbook prose and poetry", "", 4),
            ("Class 10 Hindi Kshitij NCERT", "ncert", "Hindi", "Class 10", "Complete Hindi textbook chapters and poems", "", 5),
            ("Class 9 Mathematics NCERT Book", "ncert", "Mathematics", "Class 9", "Official NCERT Class 9 Maths textbook", "", 6),

            # Paid Tests
            ("Class 10 Science Pre-Board Full Mock Test", "paid-test", "Science", "Class 10", "Full 80 marks board pattern test with model answers & marking scheme", "https://cbse.gov.in/cbsenew/documents/SQP2023/Class-X-Science-SQP.pdf", 1),
            ("Class 10 Maths Standard Full Mock Paper 1", "paid-test", "Mathematics", "Class 10", "Standard mathematics board level test paper with complete step solutions", "https://cbse.gov.in/cbsenew/documents/SQP2023/Class-X-Maths-SQP.pdf", 2),
            ("Class 10 Social Science Board Model Paper", "paid-test", "Social Science", "Class 10", "Comprehensive test paper covering all 4 disciplines with map work", "", 3),
            ("Class 10 UP Board Special All-Subject Test Series", "paid-test", "All Subjects", "Class 10", "All-in-one test series prepared by expert educators", "", 4),
            ("Class 9 Science Term 2 Mock Test", "paid-test", "Science", "Class 9", "Physics, Chemistry and Biology chapter test", "", 5),

            # Paid Notes
            ("Class 10 Science Topper Handwritten Notes", "paid-notes", "Science", "Class 10", "Colored diagrams, mind maps, chemical equations and key definitions", "", 1),
            ("Class 10 Mathematics Formula & Theory Handbook", "paid-notes", "Mathematics", "Class 10", "All formulas, theorems, derivations, and solved exemplar problems", "", 2),
            ("Class 10 Social Science Quick Revision Mind Maps", "paid-notes", "Social Science", "Class 10", "Timeline charts, key dates, concepts, and economic definitions", "", 3),
            ("Class 10 English First Flight & Footprints Summary", "paid-notes", "English", "Class 10", "Detailed chapter summaries, theme analysis, and character sketches", "", 4),
            ("Class 10 Hindi Kshitij & Vyakaran Master Notes", "paid-notes", "Hindi", "Class 10", "Pad, paath explanations, sandhi, samas, and vachya complete guide", "", 5),

            # Free Notes
            ("Class 10 Real Numbers & Polynomials Formula Sheet", "free-notes", "Mathematics", "Class 10", "Quick 2-page formula reference for Real Numbers and Polynomials", "", 1),
            ("Class 10 Chemical Reactions & Equations Quick Notes", "free-notes", "Science", "Class 10", "Key reactions, balancing rules, and oxidation-reduction summary", "", 2),
            ("Class 10 Hindi Vyakaran Key Revision Rules", "free-notes", "Hindi", "Class 10", "Quick reference rules for board exam grammar", "", 3),
            ("Class 10 Light Reflection & Refraction Summary", "free-notes", "Science", "Class 10", "Ray diagrams, sign conventions, and mirror/lens formula summary", "", 4),
            ("Class 9 Motion and Force Quick Revision", "free-notes", "Science", "Class 9", "Equations of motion and Newton's laws recap sheet", "", 5),

            # Free Tests
            ("Class 10 Science Chapter 1 Practice Test", "free-test", "Science", "Class 10", "25 marks self-assessment test with answer key", "", 1),
            ("Class 10 Mathematics Diagnostic Practice Test", "free-test", "Mathematics", "Class 10", "Test your foundation in basic algebra and trigonometry", "", 2),
            ("Class 10 English Grammar Diagnostic Test", "free-test", "English", "Class 10", "Tenses, modals, reported speech and determiners test", "", 3),
            ("Class 9 Mathematics Number System Test", "free-test", "Mathematics", "Class 9", "Rational numbers, laws of exponents practice test", "", 4),
        ]
        for title, cat, subj, cl, desc, furl, sorder in STUDY_MATERIALS:
            StudyMaterial.objects.update_or_create(
                title=title, category=cat, class_level=cl,
                defaults=dict(subject=subj, description=desc, file_url=furl, sort_order=sorder, is_active=True)
            )
        self.stdout.write(f"  {StudyMaterial.objects.count()} study materials")

        self.stdout.write(self.style.SUCCESS("Content seeded successfully!"))
