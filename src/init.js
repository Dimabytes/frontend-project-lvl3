import i18n from 'i18next';
import * as yup from 'yup';
import App from './App.js';
import resources from './locales';

export default () => {
  i18n.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    yup.setLocale({
      mixed: {
        required: i18n.t('validationErrors.required'),
      },
      string: {
        url: i18n.t('validationErrors.url'),
      },
    });

    const element = document.getElementById('app');
    const obj = new App(element);
    obj.setControllers();
  });
};
