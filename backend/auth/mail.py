import os
import smtplib
from email.mime.text import MIMEText

SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')


def send_verification_code(to_email: str, code: str):
    subject = 'Код подтверждения BuildAPK'
    body = (
        f'Ваш код подтверждения: {code}\n\n'
        f'Введите его в личном кабинете BuildAPK, чтобы завершить регистрацию.\n'
        f'Код действителен 15 минут.'
    )
    msg = MIMEText(body, 'plain', 'utf-8')
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to_email

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())
