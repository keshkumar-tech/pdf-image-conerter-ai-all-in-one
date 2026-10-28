"""Push/Email/SMS fan-out. Actual delivery is delegated to the configured
provider abstraction in apps.integrations - this module only resolves
audience + creates in-app Notification rows + triggers delivery."""
from django.utils import timezone


def resolve_audience(campaign):
    from apps.users.models import User

    qs = User.objects.filter(is_active=True)
    if campaign.audience == "free_students":
        qs = qs.exclude(entitlements__is_active=True)
    elif campaign.audience == "premium_students":
        qs = qs.filter(entitlements__is_active=True).distinct()
    elif campaign.audience == "course_students" and campaign.audience_course:
        qs = qs.filter(enrollments__course=campaign.audience_course).distinct()
    elif campaign.audience == "streak_users":
        qs = qs.filter(streak__current_streak_days__gt=0)
    return qs


def send_campaign(campaign) -> int:
    from .models import Notification
    from apps.integrations.services import dispatch_push, dispatch_email, dispatch_sms

    recipients = resolve_audience(campaign)
    count = 0
    for user in recipients.iterator():
        Notification.objects.create(
            user=user, notification_type="promotion" if campaign.channel == "push" else "announcement",
            title=campaign.title, body=campaign.body,
        )
        if campaign.channel == "push":
            dispatch_push(user, campaign.title, campaign.body)
        elif campaign.channel == "email":
            dispatch_email(user, campaign.title, campaign.body)
        elif campaign.channel == "sms":
            dispatch_sms(user, campaign.body)
        count += 1

    campaign.status = "sent"
    campaign.sent_at = timezone.now()
    campaign.recipients_count = count
    campaign.save(update_fields=["status", "sent_at", "recipients_count"])
    return count
