import 'bootstrap';
import i18next from 'i18next/dist/cjs/i18next.js';
import * as yup from 'yup';
import createApp from './App.js';
import resources from './locales';

export default () => {
  i18next.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    console.log(i18next.t('validationErrors.required'));
    yup.setLocale({
      mixed: {
        required: i18next.t('validationErrors.required'),
      },
      string: {
        url: i18next.t('validationErrors.url'),
      },
    });
    const app = createApp();
    app.setControllers();
    app.getNewPosts();
  });
};
