
import {LoginTranslationType} from '../../../../assets/types/translations/login-translation.type';
import {AppLanguages} from '../../../../assets/enums/app-languages.enum';

export const loginTranslations: { [key in AppLanguages]:  LoginTranslationType } = {
  [AppLanguages.ru]: {
    pageHeader: 'Войти в личный кабинет',
    emailPlaceholder:'Электроная почта',
    emailHint:'Введите Ваш E-Mail адрес',
    passwordPlaceholder:'Пароль',
    passwordHint:'Введите пароль',
    rememberMeTitle:'Запомнить меня',
    resetPasswordLink:'Забыли пароль?',
    loginButtonCaption:'Войти',
    registerText:'Нет аккаунта? ',
    registerLink:'Зарегистрируйтесь!',
    mainImageAlt:'Цветок'
  },
  [AppLanguages.en]: {
    pageHeader: 'Sign in to your account',
    emailPlaceholder: 'Email address',
    emailHint: 'Enter your e-mail address',
    passwordPlaceholder: 'Password',
    passwordHint: 'Enter your password',
    rememberMeTitle: 'Remember me',
    resetPasswordLink: 'Forgot your password?',
    loginButtonCaption: 'Sign in',
    registerText: 'No account? ',
    registerLink: 'Sign up!',
    mainImageAlt: 'Flower'
  },
  [AppLanguages.de]: {
    pageHeader: 'Anmeldung',
    emailPlaceholder: 'E-Mail-Adresse',
    emailHint: 'Geben Sie Ihre E-Mail-Adresse ein',
    passwordPlaceholder: 'Passwort',
    passwordHint: 'Geben Sie Ihr Passwort ein',
    rememberMeTitle: 'Angemeldet bleiben',
    resetPasswordLink: 'Passwort vergessen?',
    loginButtonCaption: 'Anmelden',
    registerText: 'Noch kein Konto? ',
    registerLink: 'Jetzt registrieren!',
    mainImageAlt: 'Blume'
  }
};
