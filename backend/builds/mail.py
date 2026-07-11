import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')


def _send(to_email: str, subject: str, html: str, text: str):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'BuildAPK <{SMTP_USER}>'
    msg['To'] = to_email
    msg.attach(MIMEText(text, 'plain', 'utf-8'))
    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())


def _layout(preheader: str, body_html: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background-color:#0a0a0a;border:1px solid rgba(239,68,68,0.2);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px 32px;text-align:center;border-bottom:1px solid rgba(239,68,68,0.15);">
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">
                Build<span style="color:#ef4444;">APK</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              {body_html}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(239,68,68,0.1);text-align:center;">
              <p style="margin:0;font-size:12px;color:#6b7280;">
                Это письмо отправлено автоматически, отвечать на него не нужно.<br>
                © BuildAPK — превращаем сайты в Android-приложения.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_build_ready_email(to_email: str, app_name: str, dashboard_url: str):
    icon_circle = """
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 24px auto;">
        <div style="width:32px;height:32px;border-radius:50%;background:#22c55e;"></div>
      </div>
    """
    body_html = f"""
      <div style="text-align:center;">
        {icon_circle}
        <h1 style="margin:0 0 12px 0;font-size:20px;color:#ffffff;font-weight:700;">Приложение готово!</h1>
        <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#9ca3af;">
          Сборка «<span style="color:#ffffff;font-weight:600;">{app_name}</span>» успешно завершена.
          APK-файл уже доступен для скачивания в вашем личном кабинете.
        </p>
        <a href="{dashboard_url}" style="display:inline-block;background-color:#ef4444;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 32px;border-radius:8px;">
          Скачать APK
        </a>
      </div>
    """
    html = _layout(f'Приложение «{app_name}» готово к скачиванию', body_html)
    text = (
        f'Приложение "{app_name}" успешно собрано!\n\n'
        f'Скачать APK можно в личном кабинете: {dashboard_url}'
    )
    _send(to_email, f'«{app_name}» готово к скачиванию — BuildAPK', html, text)


def send_build_failed_email(to_email: str, app_name: str, dashboard_url: str, error_message: str):
    icon_circle = """
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(239,68,68,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 24px auto;">
        <div style="width:32px;height:32px;border-radius:50%;background:#ef4444;"></div>
      </div>
    """
    safe_error = (error_message or 'Неизвестная ошибка сборки')[:300]
    body_html = f"""
      <div style="text-align:center;">
        {icon_circle}
        <h1 style="margin:0 0 12px 0;font-size:20px;color:#ffffff;font-weight:700;">Не удалось собрать приложение</h1>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#9ca3af;">
          При сборке «<span style="color:#ffffff;font-weight:600;">{app_name}</span>» произошла ошибка.
        </p>
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:left;">
          <p style="margin:0;font-size:12px;color:#f87171;font-family:monospace;word-break:break-word;">{safe_error}</p>
        </div>
        <a href="{dashboard_url}" style="display:inline-block;background-color:#ef4444;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 32px;border-radius:8px;">
          Попробовать снова
        </a>
      </div>
    """
    html = _layout(f'Ошибка сборки «{app_name}»', body_html)
    text = (
        f'При сборке "{app_name}" произошла ошибка: {safe_error}\n\n'
        f'Личный кабинет: {dashboard_url}'
    )
    _send(to_email, f'Ошибка сборки «{app_name}» — BuildAPK', html, text)
