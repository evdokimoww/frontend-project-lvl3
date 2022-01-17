import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import app from './app';

const i18nInstance = i18next.createInstance();

app(i18nInstance);
