import {AppLanguages} from '../../../../assets/enums/app-languages.enum';
import {SignupTranslationType} from '../../../../assets/types/translations/signup-translation.type';
import {DialogBoxType} from '../../../../assets/types/dialog-box.type';

export const signupTranslations: { [key in AppLanguages]:  SignupTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader: 'Регистрация на сайте',
    emailPlaceholder:'Электроная почта',
    emailHint:'Введите Ваш E-Mail адрес',
    emailHintBusy:'Этот E-Mail адрес занят!',
    passwordPlaceholder:'Пароль',
    passwordHint:'Придумайте пароль (минимум 6 символов)',
    passwordRepeatPlaceholder:'Повторите пароль',
    passwordRepeatHint:'Введите пароль повторно',
    uABeginText:'Я принимаю',
    uANextText:' и даю ',
    userAgreementLink:'условия пользовательского соглашения',
    processingPersonalDataLink:'согласие на обработку персональных данных',
    registerButtonCaption:'Зарегистрироваться',
    loginText:'Уже есть аккаунт? ',
    loginLink:'Войдите!',
    mainImageAlt:'Цветок'
  },
  [AppLanguages.en]: {
    pageHeader: 'Create an account',
    emailPlaceholder: 'Email address',
    emailHint: 'Enter your e-mail address',
    emailHintBusy: 'This e-mail address is already in use!',
    passwordPlaceholder: 'Password',
    passwordHint: 'Create a password (minimum 6 characters)',
    passwordRepeatPlaceholder: 'Repeat password',
    passwordRepeatHint: 'Re-enter the password',
    uABeginText: 'I accept the',
    uANextText: ' and give my ',
    userAgreementLink: 'terms of the user agreement',
    processingPersonalDataLink: 'consent to the processing of personal data',
    registerButtonCaption: 'Sign up',
    loginText: 'Already have an account? ',
    loginLink: 'Sign in!',
    mainImageAlt: 'Flower'
  },
  [AppLanguages.de]: {
    pageHeader: 'Registrierung',
    emailPlaceholder: 'E-Mail-Adresse',
    emailHint: 'Geben Sie Ihre E-Mail-Adresse ein',
    emailHintBusy: 'Diese E-Mail-Adresse ist bereits vergeben!',
    passwordPlaceholder: 'Passwort',
    passwordHint: 'Erstellen Sie ein Passwort (mindestens 6 Zeichen)',
    passwordRepeatPlaceholder: 'Passwort wiederholen',
    passwordRepeatHint: 'Geben Sie das Passwort erneut ein',
    uABeginText: 'Ich akzeptiere die',
    uANextText: ' und erteile meine ',
    userAgreementLink: 'Nutzungsbedingungen',
    processingPersonalDataLink: 'Einwilligung zur Verarbeitung personenbezogener Daten',
    registerButtonCaption: 'Registrieren',
    loginText: 'Bereits registriert? ',
    loginLink: 'Anmelden!',
    mainImageAlt: 'Blume'
  }
};

export const signupDialogTranslations: { [key in AppLanguages]: DialogBoxType } = {
  [AppLanguages.ru]: {
    title:'Регистрация успешно завершена',
    content:'<div class="additional-title">Вы можете войти в систему!</div>' +
      '<div class="message-string">На указанный адрес электронной почты было отправлено письмо, содержащее ссылку для подтверждения адреса электронной почты.</div>\n' +
      '<div class="message-string">Если письмо не пришло в течение <u>нескольких минут</u>, пожалуйста, проверьте папку «<b>Спам</b>».</div>',
  },
  [AppLanguages.en]: {
    title: 'Registration completed successfully',
    content:
      '<div class="additional-title">You can now sign in!</div>' +
      '<div class="message-string">An email containing a link to confirm your email address has been sent to the specified email address.</div>' +
      '<div class="message-string">If the email does not arrive within <u>a few minutes</u>, please check your <b>Spam</b> folder.</div>',
  },
  [AppLanguages.de]: {
    title: 'Registrierung erfolgreich abgeschlossen',
    content:
      '<div class="additional-title">Sie können sich jetzt anmelden!</div>' +
      '<div class="message-string">An die angegebene E-Mail-Adresse wurde eine Nachricht mit einem Link zur Bestätigung der E-Mail-Adresse gesendet.</div>' +
      '<div class="message-string">Falls die E-Mail innerhalb von <u>einigen Minuten</u> nicht ankommt, überprüfen Sie bitte Ihren <b>Spam</b>-Ordner.</div>',
  },
};
