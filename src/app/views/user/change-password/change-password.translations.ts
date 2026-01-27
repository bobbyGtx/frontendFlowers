import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {ChangePasswordTranslationType} from '../../../../assets/types/translations/change-password-translation.type';
import {DialogBoxType} from '../../../../assets/types/dialog-box.type';

export const changePasswordTranslations: { [key in AppLanguages]:  ChangePasswordTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader: 'Создание нового пароля',
    passwordPlaceholder:'Пароль',
    passwordHint:'Придумайте пароль (минимум 6 символов)',
    passwordRepeatPlaceholder:'Повторите пароль',
    passwordRepeatHint:'Введите пароль повторно',
    savePasswordBtn:'Сохранить пароль',
    authText:'Перейти на',
    authLink:'страницу входа',
    mainImageAlt:'Цветок'
  },
  [AppLanguages.en]: {
    pageHeader: 'Create a new password',
    passwordPlaceholder: 'Password',
    passwordHint: 'Create a password (minimum 6 characters)',
    passwordRepeatPlaceholder: 'Repeat password',
    passwordRepeatHint: 'Re-enter the password',
    savePasswordBtn: 'Save password',
    authText: 'Go to',
    authLink: 'login page',
    mainImageAlt: 'Flower'
  },
  [AppLanguages.de]: {
    pageHeader: 'Neues Passwort erstellen',
    passwordPlaceholder: 'Passwort',
    passwordHint: 'Erstellen Sie ein Passwort (mindestens 6 Zeichen)',
    passwordRepeatPlaceholder: 'Passwort wiederholen',
    passwordRepeatHint: 'Geben Sie das Passwort erneut ein',
    savePasswordBtn: 'Passwort speichern',
    authText: 'Zur',
    authLink: 'Anmeldeseite',
    mainImageAlt: 'Blume'
  }
};
export const changePasswordDialogTranslations: { [key in AppLanguages]: DialogBoxType } = {
  [AppLanguages.ru]: {
    title:'Пароль изменен',
    content:'<div class="additional-title">Новый пароль успешно сохранен.</div>' +
      '<div class="message-string">Вы можете использовать новый пароль для входа в свою учетную запись.</div>\n',
  },
  [AppLanguages.en]: {
    title: 'Password changed',
    content:
      '<div class="additional-title">Your new password has been saved successfully.</div>' +
      '<div class="message-string">You can now use the new password to sign in to your account.</div>',
  },
  [AppLanguages.de]: {
    title: 'Passwort geändert',
    content:
      '<div class="additional-title">Das neue Passwort wurde erfolgreich gespeichert.</div>' +
      '<div class="message-string">Sie können sich nun mit dem neuen Passwort in Ihr Konto einloggen.</div>',
  },
};
