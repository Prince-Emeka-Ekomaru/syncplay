# Multi-Language Support

The syncplay eSports website now supports 6 languages:

## Supported Languages

1. **English (en)** 🇬🇧 - Default language
2. **Nigerian Pidgin (pcm)** 🇳🇬 - Nigerian Pidgin English
3. **Yoruba (yo)** 🇳🇬 - Yoruba language
4. **Hausa (ha)** 🇳🇬 - Hausa language
5. **Igbo (ig)** 🇳🇬 - Igbo language
6. **French (fr)** 🇫🇷 - French language

## How It Works

### Language Context

The language system is built using React Context API:

- **LanguageContext** (`src/contexts/LanguageContext.js`) - Manages the current language state
- **LanguageProvider** - Wraps the entire app to provide language context to all components

### Translations

All translations are stored in `src/translations/translations.js`:

```javascript
export const translations = {
  en: { /* English translations */ },
  pcm: { /* Pidgin translations */ },
  yo: { /* Yoruba translations */ },
  ha: { /* Hausa translations */ },
  ig: { /* Igbo translations */ },
  fr: { /* French translations */ }
};
```

### Using Translations in Components

To use translations in any component:

```javascript
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';

const MyComponent = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  
  return <h1>{t.heroTitle}</h1>;
};
```

### Language Selector

The language selector is integrated into the navigation bar on the left side:

- Click the language selector to open a dropdown
- Select any language to switch
- The current language is highlighted with a red accent
- All text on the page updates immediately

### Adding New Translations

To add translations for a new section:

1. Open `src/translations/translations.js`
2. Add the new translation key to each language object:

```javascript
export const translations = {
  en: {
    // ... existing translations
    newKey: 'New English text',
  },
  pcm: {
    // ... existing translations
    newKey: 'New Pidgin text',
  },
  // ... repeat for all languages
};
```

3. Use the translation in your component:

```javascript
<p>{t.newKey}</p>
```

### Adding New Languages

To add a completely new language:

1. Add the translations to `src/translations/translations.js`:

```javascript
export const translations = {
  // ... existing languages
  es: { // Spanish example
    heroTitle: '¡VE A JUGAR CON SYNCPLAY!',
    // ... all other translations
  }
};
```

2. Add the language to the languages array:

```javascript
export const languages = [
  // ... existing languages
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];
```

## Current Translated Sections

The following sections are currently translated:

- **Navbar**: Menu items, buttons
- **Hero Section**: Title, subtitle, call-to-action buttons
- **What We Do**: Section title, description, feature cards
- **Who We Are**: Section title, descriptions, stats labels
- **Latest News**: Section title, button labels
- **Contact**: Section title, description, button

## Translation Keys Reference

### Navbar
- `join` - "JOIN SYNCPLAY" button
- `events` - "EVENTS" button
- `players` - "PLAYERS" link
- `compare` - "COMPARE" link
- `news` - "NEWS" link
- `contact` - "CONTACT" link

### Hero Section
- `heroTitle` - Main hero title
- `heroSubtitle` - Hero subtitle/description
- `joinTournaments` - "JOIN TOURNAMENTS" button
- `viewEvents` - "VIEW EVENTS" button
- `explore` - "EXPLORE" scroll indicator

### What We Do
- `whatWeDo` - Section title
- `whatWeDoDesc` - Section description
- `regularTournaments` - Feature card title
- `regularTournamentsDesc` - Feature card description
- `weekendCup` - Feature card title
- `weekendCupDesc` - Feature card description
- `archive` - Feature card title
- `archiveDesc` - Feature card description
- `learnMore` - "Learn More" link
- `comingSoon` - "eBasketball Coming Soon!" banner
- `comingSoonDesc` - Banner description

### Who We Are
- `whoWeAre` - Section title
- `whoWeAreDesc1` - First paragraph
- `whoWeAreDesc2` - Second paragraph
- `professionalPlayers` - Stat label
- `tournamentsHosted` - Stat label
- `communityMembers` - Stat label
- `yearFounded` - Stat label
- `discoverSyncplay` - "DISCOVER SYNCPLAY" button

### News
- `latestNews` - Section title
- `latestNewsDesc` - Section description
- `readMore` - "Read More" link
- `viewAllNews` - "VIEW ALL NEWS" button

### Contact
- `stillQuestions` - Section title
- `contactDesc` - Section description
- `getInTouch` - "GET IN TOUCH" button

## Notes

- The language preference is currently session-based (resets on page refresh)
- To persist language preference, you can add localStorage:

```javascript
// In LanguageContext.js
const [currentLanguage, setCurrentLanguage] = useState(
  localStorage.getItem('language') || 'en'
);

const changeLanguage = (langCode) => {
  setCurrentLanguage(langCode);
  localStorage.setItem('language', langCode);
};
```

- All translations maintain the brand voice and tone
- Nigerian languages (Pidgin, Yoruba, Hausa, Igbo) are professionally translated to maintain cultural authenticity

