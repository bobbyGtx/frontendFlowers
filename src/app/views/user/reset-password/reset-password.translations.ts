import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {ResetPasswordTranslationType} from '../../../../assets/types/translations/reset-password-translation.type';
import {DialogBoxType} from '../../../../assets/types/dialog-box.type';

export const resetPasswordTranslations: { [key in AppLanguages]:  ResetPasswordTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader: 'Восстановление пароля',
    emailPlaceholder:'Электроная почта',
    emailHint:'Введите Ваш E-Mail адрес',
    resetPassButtonCaption:'Отправить письмо',
    resetPassButtonRepeatCaption:'Отправить повторно',
    loginText:'Перейти на',
    loginLink:'страницу входа',
    devResetPassBeginText:'Перейти на',
    devResetPassLinkText:'страницу изменения пароля',
    mainImageAlt:'Цветок'
  },
  [AppLanguages.en]: {
    pageHeader: 'Password recovery',
    emailPlaceholder: 'Email address',
    emailHint: 'Enter your e-mail address',
    resetPassButtonCaption: 'Send email',
    resetPassButtonRepeatCaption: 'Send again',
    loginText: 'Go to',
    loginLink: 'login page',
    devResetPassBeginText: 'Go to',
    devResetPassLinkText: 'password change page',
    mainImageAlt: 'Flower'
  },
  [AppLanguages.de]: {
    pageHeader: 'Passwort wiederherstellen',
    emailPlaceholder: 'E-Mail-Adresse',
    emailHint: 'Geben Sie Ihre E-Mail-Adresse ein',
    resetPassButtonCaption: 'E-Mail senden',
    resetPassButtonRepeatCaption: 'Erneut senden',
    loginText: 'Zur',
    loginLink: 'Anmeldeseite',
    devResetPassBeginText: 'Zur',
    devResetPassLinkText: 'Passwortänderungsseite',
    mainImageAlt: 'Blume'
  }
};
export const resetPasswordDialogTranslations: { [key in AppLanguages]: DialogBoxType } = {
  [AppLanguages.ru]: {
    title:'Письмо отправлено',
    content:'<div class="additional-title">Вы запустили процедуру сброса пароля.</div>' +
      '<div class="message-string">На указанный адрес электронной почты было отправлено письмо, содержащее ссылку для установки нового пароля.</div>\n' +
      '<div class="message-string">Если письмо не пришло в течение <u>нескольких минут</u>, пожалуйста, проверьте папку «Спам». В случае отсутствия письма, Вы можете повторить отправку через некоторое время.</div>',
  },
  [AppLanguages.en]: {
    title: 'Email sent',
    content:
      '<div class="additional-title">You have initiated the password reset process.</div>' +
      '<div class="message-string">An email containing a link to set a new password has been sent to the specified email address.</div>' +
      '<div class="message-string">If the email does not arrive within <u>a few minutes</u>, please check your Spam folder. If the email is still missing, you can resend the request after some time.</div>',
  },
  [AppLanguages.de]: {
    title: 'E-Mail gesendet',
    content:
      '<div class="additional-title">Sie haben den Vorgang zum Zurücksetzen des Passworts gestartet.</div>' +
      '<div class="message-string">An die angegebene E-Mail-Adresse wurde eine Nachricht mit einem Link zur Vergabe eines neuen Passworts gesendet.</div>' +
      '<div class="message-string">Falls die E-Mail innerhalb von <u>einigen Minuten</u> nicht ankommt, überprüfen Sie bitte Ihren Spam-Ordner. Sollte die E-Mail weiterhin fehlen, können Sie die Anfrage nach einiger Zeit erneut senden.</div>',
  },
};
