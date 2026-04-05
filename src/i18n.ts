import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const LANGUAGES = [
  { label: 'English', value: 'en', rtl: false },
  { label: 'हिंदी (Hindi)', value: 'hi', rtl: false },
  { label: 'বাংলা (Bengali)', value: 'bn', rtl: false },
  { label: 'తెలుగు (Telugu)', value: 'te', rtl: false },
  { label: 'मराठी (Marathi)', value: 'mr', rtl: false },
  { label: 'தமிழ் (Tamil)', value: 'ta', rtl: false },
  { label: 'اردو (Urdu)', value: 'ur', rtl: true },
  { label: 'ગુજરાતી (Gujarati)', value: 'gu', rtl: false },
  { label: 'ಕನ್ನಡ (Kannada)', value: 'kn', rtl: false },
  { label: 'ଓଡ଼ିଆ (Odia)', value: 'or', rtl: false },
  { label: 'മലയാളം (Malayalam)', value: 'ml', rtl: false },
  { label: 'ਪੰਜਾਬੀ (Punjabi)', value: 'pa', rtl: false },
  { label: 'অসমীয়া (Assamese)', value: 'as', rtl: false },
  { label: 'मैथिली (Maithili)', value: 'mai', rtl: false },
  { label: 'संथाली (Santali)', value: 'sat', rtl: false },
  { label: 'कॉशुर (Kashmiri)', value: 'ks', rtl: true },
  { label: 'नेपाली (Nepali)', value: 'ne', rtl: false },
  { label: 'कोंकणी (Konkani)', value: 'kok', rtl: false },
  { label: 'सिंधी (Sindhi)', value: 'sd', rtl: false },
  { label: 'डोगरी (Dogri)', value: 'doi', rtl: false },
  { label: 'মণিপুরী (Manipuri)', value: 'mni', rtl: false },
  { label: 'बोड़ो (Bodo)', value: 'brx', rtl: false },
];

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import te from "./locales/te.json";
import mr from "./locales/mr.json";
import ta from "./locales/ta.json";
import ur from "./locales/ur.json";
import gu from "./locales/gu.json";
import kn from "./locales/kn.json";
import or from "./locales/or.json";
import ml from "./locales/ml.json";
import pa from "./locales/pa.json";
import as from "./locales/as.json";
import mai from "./locales/mai.json";
import sat from "./locales/sat.json";
import ks from "./locales/ks.json";
import ne from "./locales/ne.json";
import kok from "./locales/kok.json";
import sd from "./locales/sd.json";
import doi from "./locales/doi.json";
import mni from "./locales/mni.json";
import brx from "./locales/brx.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  te: { translation: te },
  mr: { translation: mr },
  ta: { translation: ta },
  ur: { translation: ur },
  gu: { translation: gu },
  kn: { translation: kn },
  or: { translation: or },
  ml: { translation: ml },
  pa: { translation: pa },
  as: { translation: as },
  mai: { translation: mai },
  sat: { translation: sat },
  ks: { translation: ks },
  ne: { translation: ne },
  kok: { translation: kok },
  sd: { translation: sd },
  doi: { translation: doi },
  mni: { translation: mni },
  brx: { translation: brx },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang', // Persists selected language using key "lang"
    },
  });

export default i18n;
