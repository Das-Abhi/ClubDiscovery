"""
Email service for sending notifications
"""
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings


class EmailService:
    """Service for sending emails"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_USER or "noreply@clubcompass.com"

    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """
        Send an email using SMTP

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email content

        Returns:
            True if email sent successfully, False otherwise
        """
        # Skip email sending if SMTP not configured
        if not self.smtp_user or not self.smtp_password:
            print(f"[Email Service] SMTP not configured. Skipping email to {to_email}")
            print(f"[Email Service] Subject: {subject}")
            print(f"[Email Service] Content: {html_content[:200]}...")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Attach HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            print(f"[Email Service] Email sent successfully to {to_email}")
            return True

        except Exception as e:
            print(f"[Email Service] Failed to send email to {to_email}: {str(e)}")
            return False

    def send_verification_email(self, to_email: str, full_name: str, verification_token: str) -> bool:
        """
        Send email verification email

        Args:
            to_email: User email address
            full_name: User's full name
            verification_token: Verification token

        Returns:
            True if email sent successfully
        """
        verification_url = f"{settings.ALLOWED_ORIGINS[0]}/auth/verify-email?token={verification_token}"

        subject = "Verify Your ClubCompass Email"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #000000 0%, #8B0000 100%);
                          color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #8B0000;
                          color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ClubCompass</h1>
                    <p>Welcome to BMSCE Club Discovery Platform</p>
                </div>
                <div class="content">
                    <h2>Hi {full_name},</h2>
                    <p>Thank you for registering with ClubCompass! To complete your registration,
                       please verify your email address by clicking the button below:</p>

                    <div style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </div>

                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">{verification_url}</p>

                    <p><strong>This link will expire in 24 hours.</strong></p>

                    <p>If you didn't create an account with ClubCompass, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 ClubCompass - BMS College of Engineering</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self._send_email(to_email, subject, html_content)

    def send_password_reset_email(self, to_email: str, full_name: str, reset_token: str) -> bool:
        """
        Send password reset email

        Args:
            to_email: User email address
            full_name: User's full name
            reset_token: Password reset token

        Returns:
            True if email sent successfully
        """
        reset_url = f"{settings.ALLOWED_ORIGINS[0]}/auth/reset-password?token={reset_token}"

        subject = "Reset Your ClubCompass Password"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #000000 0%, #8B0000 100%);
                          color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #8B0000;
                          color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px;
                           margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ClubCompass</h1>
                    <p>Password Reset Request</p>
                </div>
                <div class="content">
                    <h2>Hi {full_name},</h2>
                    <p>We received a request to reset your password. Click the button below to
                       create a new password:</p>

                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </div>

                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">{reset_url}</p>

                    <p><strong>This link will expire in 1 hour.</strong></p>

                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong><br>
                        If you didn't request a password reset, please ignore this email.
                        Your password will remain unchanged.
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2024 ClubCompass - BMS College of Engineering</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self._send_email(to_email, subject, html_content)

    def send_welcome_email(self, to_email: str, full_name: str) -> bool:
        """
        Send welcome email after email verification

        Args:
            to_email: User email address
            full_name: User's full name

        Returns:
            True if email sent successfully
        """
        subject = "Welcome to ClubCompass!"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #000000 0%, #8B0000 100%);
                          color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #8B0000;
                          color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to ClubCompass!</h1>
                    <p>Your Journey Begins Here</p>
                </div>
                <div class="content">
                    <h2>Hi {full_name},</h2>
                    <p>Congratulations! Your email has been verified and your account is now active.</p>

                    <h3>What you can do now:</h3>

                    <div class="feature">
                        📚 <strong>Browse Clubs:</strong> Explore 60+ clubs across co-curricular,
                        extra-curricular, and department categories.
                    </div>

                    <div class="feature">
                        🎯 <strong>Take Assessment:</strong> Get personalized club recommendations
                        based on your interests and goals.
                    </div>

                    <div class="feature">
                        ✨ <strong>Join Clubs:</strong> Connect with clubs that match your passions
                        and build your profile.
                    </div>

                    <div style="text-align: center;">
                        <a href="{settings.ALLOWED_ORIGINS[0]}" class="button">Start Exploring</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2024 ClubCompass - BMS College of Engineering</p>
                </div>
            </div>
        </body>
        </html>
        """

        return self._send_email(to_email, subject, html_content)

    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def get_token_expiry(hours: int = 1) -> datetime:
        """
        Get token expiry datetime

        Args:
            hours: Number of hours until expiry (default: 1)

        Returns:
            Expiry datetime
        """
        return datetime.utcnow() + timedelta(hours=hours)


# Create email service instance
email_service = EmailService()
