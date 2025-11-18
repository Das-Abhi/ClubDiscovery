"""
Sentry Error Tracking Configuration for Backend
"""
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration


def init_sentry():
    """Initialize Sentry for error tracking and performance monitoring"""
    sentry_dsn = os.getenv("SENTRY_DSN")
    environment = os.getenv("ENVIRONMENT", "development")

    if sentry_dsn and environment in ["production", "staging"]:
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=environment,

            # Performance Monitoring
            traces_sample_rate=0.1,  # Capture 10% of transactions

            # Profiling
            profiles_sample_rate=0.1,  # Sample 10% of profiling data

            # Integrations
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                SqlalchemyIntegration(),
                RedisIntegration(),
            ],

            # Release tracking
            release=os.getenv("SENTRY_RELEASE", "1.0.0"),

            # Additional options
            send_default_pii=False,  # Don't send PII (Personally Identifiable Information)
            attach_stacktrace=True,

            # Before send callback to filter events
            before_send=before_send_filter,
        )

        print(f"✅ Sentry initialized for {environment}")
    else:
        print("ℹ️  Sentry not initialized (DSN not provided or not in production/staging)")


def before_send_filter(event, hint):
    """Filter events before sending to Sentry"""

    # Don't send events in development
    if os.getenv("ENVIRONMENT") == "development":
        return None

    # Filter out health check errors
    if event.get("request", {}).get("url", "").endswith("/health"):
        return None

    # Filter out specific exceptions
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]

        # Don't report expected errors
        if exc_type.__name__ in [
            "HTTPException",  # FastAPI HTTP exceptions
            "ValidationError",  # Pydantic validation errors (expected)
        ]:
            # Only report server errors (500+)
            if hasattr(exc_value, "status_code") and exc_value.status_code < 500:
                return None

    return event


def capture_exception(error: Exception, context: dict = None):
    """Capture an exception with optional context"""
    if context:
        with sentry_sdk.push_scope() as scope:
            for key, value in context.items():
                scope.set_context(key, value)
            sentry_sdk.capture_exception(error)
    else:
        sentry_sdk.capture_exception(error)


def capture_message(message: str, level: str = "info", context: dict = None):
    """Capture a message with optional context"""
    if context:
        with sentry_sdk.push_scope() as scope:
            for key, value in context.items():
                scope.set_context(key, value)
            sentry_sdk.capture_message(message, level=level)
    else:
        sentry_sdk.capture_message(message, level=level)
