import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import { setLocale } from 'yup';
import createApp from './App.js';
import resources from './locales';

export default () => {
  i18n.init({
    lng: 'en',
    resources,
  }).then(() => {
    setLocale({
      mixed: {
        required: i18n.t('validationErrors.required'),
      },
      string: {
        url: i18n.t('validationErrors.url'),
      },
    });

    const element = document.getElementById('app');
    console.log(element);
    const app = createApp(element);
    app.setControllers();
    app.getNewPosts();
  });
};
