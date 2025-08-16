# Admin Panel - Language Selector

## Overview

The admin panel includes a fully functional language selector in the header that supports multiple languages with a modern, accessible interface.

## Features

### Language Selector Component (`LanguageSelector.tsx`)

- **Multi-language Support**: Supports English (🇺🇸), Uzbek (🇺🇿), and Russian (🇷🇺)
- **Click-to-Open**: Dropdown opens on click instead of hover for better mobile experience
- **Accessibility**: Full ARIA support with proper labels and keyboard navigation
- **Smooth Animations**: Custom CSS animations for smooth transitions
- **Auto-close**: Closes when clicking outside the dropdown
- **Visual Feedback**: Shows current language with flag and name
- **Persistent Storage**: Language preference is saved in localStorage

### Supported Languages

1. **English (en)** - 🇺🇸
2. **Uzbek (uz)** - 🇺🇿  
3. **Russian (ru)** - 🇷🇺

## Implementation Details

### Components

- **Header.tsx**: Contains the language selector in the top-right corner
- **LanguageSelector.tsx**: Main language selector component with dropdown functionality
- **i18n.ts**: Internationalization configuration using react-i18next

### Key Features

- **State Management**: Uses React hooks for dropdown state
- **Click Outside Detection**: Automatically closes dropdown when clicking outside
- **Focus Management**: Proper focus handling for accessibility
- **Responsive Design**: Works on both desktop and mobile devices
- **Emoji Support**: Uses flag emojis for visual language identification

### Styling

- **Dark Theme**: Matches the admin panel's dark color scheme
- **Hover Effects**: Smooth color transitions on hover
- **Focus States**: Clear focus indicators for accessibility
- **Animations**: Custom CSS animations for smooth dropdown transitions

## Usage

The language selector is automatically included in the header and requires no additional setup. Users can:

1. Click on the language selector button
2. Choose their preferred language from the dropdown
3. The interface will immediately switch to the selected language
4. The preference is saved and will persist across sessions

## Technical Stack

- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe implementation
- **react-i18next**: Internationalization library
- **Tailwind CSS**: Styling framework
- **Iconify**: Icon library for chevron and check icons

## File Structure

```
admin/src/
├── components/
│   ├── Header.tsx              # Header with language selector
│   └── LanguageSelector.tsx    # Main language selector component
├── locales/
│   ├── en.json                 # English translations
│   ├── ru.json                 # Russian translations
│   └── uz.json                 # Uzbek translations
├── i18n.ts                     # i18n configuration
└── index.css                   # Custom animations
```

## Customization

To add more languages:

1. Add the language code and translations to the locale files
2. Update the `languages` array in `LanguageSelector.tsx`
3. Add the corresponding flag emoji
4. Update the i18n configuration if needed

## Accessibility

The language selector follows WCAG guidelines with:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast color scheme

