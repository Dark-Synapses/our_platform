from pymongo import ASCENDING, DESCENDING


async def ensure_application_indexes(db):
    await db.service_requests.create_index(
        [
            ("client_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        name="client_requests_recent",
    )

    await db.service_requests.create_index(
        [("created_at", DESCENDING)],
        name="service_requests_recent",
    )

    await db.service_request_audit.create_index(
        [
            ("request_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        name="request_audit_recent",
    )

    await db.contact_inquiries.create_index(
        [("created_at", DESCENDING)],
        name="contact_inquiries_recent",
    )

    await db.notifications.create_index(
        [
            ("recipient_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        name="recipient_notifications_recent",
    )

    await db.notifications.create_index(
        [
            ("recipient_id", ASCENDING),
            ("is_read", ASCENDING),
        ],
        name="recipient_notifications_unread",
    )
