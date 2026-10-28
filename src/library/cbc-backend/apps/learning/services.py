"""Business logic for video signing, quiz grading, and streak/achievement rules."""
import hashlib
import hmac
import time
from datetime import timedelta

from django.conf import settings
from django.utils import timezone


def issue_signed_playback_url(video, user) -> dict:
    """Builds a short-lived, tokenized playback URL.
    Real signing is delegated to the configured CDN provider (see
    apps.integrations); this keeps the raw asset URL and signing secret
    off the client at all times."""
    from .models import LessonProgress

    ttl = settings.VIDEO_SIGNED_URL_TTL_SECONDS
    expires_at = timezone.now() + timedelta(seconds=ttl)
    secret = (settings.VIDEO_CDN_SIGNING_SECRET or "unconfigured-signing-secret").encode()
    payload = f"{video.provider_asset_id}:{user.id}:{int(expires_at.timestamp())}".encode()
    token = hmac.new(secret, payload, hashlib.sha256).hexdigest()

    base = f"https://cdn.example.invalid/{settings.VIDEO_CDN_PROVIDER or 'unconfigured'}"
    signed_url = f"{base}/{video.provider_asset_id}?token={token}&expires={int(expires_at.timestamp())}"

    progress = LessonProgress.objects.filter(user=user, lesson=video.lesson).first()
    resume_position = progress.last_position_seconds if progress else 0

    return {
        "signed_url": signed_url,
        "expires_at": expires_at,
        "resume_position_seconds": resume_position,
    }


def grade_quiz_attempt(attempt):
    quiz = attempt.quiz
    questions = quiz.questions.prefetch_related("options").all()
    total = questions.count()
    correct = 0
    incorrect = 0
    unattempted = 0
    score = 0

    for question in questions:
        q_id_str = str(question.id)
        raw_ans = attempt.answers.get(q_id_str)
        if raw_ans is None:
            raw_ans = attempt.answers.get(question.id)

        if raw_ans is None:
            unattempted += 1
            continue

        if isinstance(raw_ans, (list, tuple)):
            given = set(str(x) for x in raw_ans if x)
        else:
            given = {str(raw_ans)} if raw_ans else set()

        if not given:
            unattempted += 1
            continue

        correct_ids = set(str(o.id) for o in question.options.filter(is_correct=True))
        if given == correct_ids and given:
            correct += 1
            score += getattr(question, "marks", 1)
        else:
            incorrect += 1

    total_count = total if total > 0 else 1
    score_percent = round((correct / total_count) * 100, 2)
    attempt.total_questions = total
    attempt.correct_answers = correct
    attempt.incorrect_answers = incorrect
    attempt.unattempted_questions = unattempted
    attempt.score = score
    attempt.score_percent = score_percent
    attempt.passed = score_percent >= quiz.passing_score_percent
    attempt.save(update_fields=[
        "total_questions", "correct_answers", "incorrect_answers",
        "unattempted_questions", "score", "score_percent", "passed"
    ])
    return attempt


def award_streak_tick(user):
    from .models import Streak

    streak, _ = Streak.objects.get_or_create(user=user)
    today = timezone.localdate()
    if streak.last_active_date == today:
        return streak
    if streak.last_active_date == today - timedelta(days=1):
        streak.current_streak_days += 1
    else:
        streak.current_streak_days = 1
    streak.longest_streak_days = max(streak.longest_streak_days, streak.current_streak_days)
    streak.last_active_date = today
    streak.save()
    return streak
