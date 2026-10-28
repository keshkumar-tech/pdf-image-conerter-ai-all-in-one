from django.contrib import admin
from .models import (FAQ, HandwrittenNotesChapter, HandwrittenNotesPDF, HandwrittenNotesSubject,
                     ImpQuestionChapter, ImpQuestionPDF, ImpQuestionSubject,
                     PYQPaper, SocialLink, StudyMaterial,
                     YouTubeChapter, YouTubeSubject, YouTubeVideo)

admin.site.register(PYQPaper)
admin.site.register(StudyMaterial)
admin.site.register(YouTubeSubject)
admin.site.register(YouTubeChapter)
admin.site.register(YouTubeVideo)
admin.site.register(SocialLink)
admin.site.register(FAQ)
admin.site.register(HandwrittenNotesSubject)
admin.site.register(HandwrittenNotesChapter)
admin.site.register(HandwrittenNotesPDF)
admin.site.register(ImpQuestionSubject)
admin.site.register(ImpQuestionChapter)
admin.site.register(ImpQuestionPDF)
