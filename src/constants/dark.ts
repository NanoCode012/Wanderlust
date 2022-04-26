import {
    ITheme,
    ThemeColors,
    ThemeGradients,
    ThemeSizes,
    ThemeSpacing,
} from './types';

import {THEME as commonTheme} from './theme';

export const COLORS: ThemeColors = {
    // default text color
    text: '#F5F8FE',

    // base colors
    /** UI color for #primary */
    primary: '#E96DCC',
    /** UI color for #secondary */
    secondary: '#859EC8', // '#8392AB',
    /** UI color for #tertiary */
    tertiary: '#E2A846',

    // non-colors
    black: '#FFFFFF',
    white: '#252F40',

    dark: '#E9ECEF',
    light: '#252F40',

    // gray variations
    /** UI color for #gray */
    gray: '#C5C7D0',

    // colors variations
    /** UI color for #danger */
    danger: '#E15454',
    /** UI color for #warning */
    warning: '#F4C024',
    /** UI color for #success */
    success: '#5ED0A0',
    /** UI color for #info */
    info: '#43BBD7',

    /** UI colors for navigation & card */
    card: '#364155',
    background: '#111A29',

    /** UI color for shadowColor */
    shadow: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.3)',

    /** UI color for input borderColor on focus */
    focus: '#E462CC',
    input: '#92A0B9',

    /** UI color for switch checked/active color */
    switchOn: '#3898F1',
    switchOff: '#102233',

    /** UI color for checkbox icon checked/active color */
    checkbox: ['#858ECB', '#5E6794'],
    checkboxIcon: '#283847',

    /** social colors */
    facebook: '#3D6FD9',
    twitter: '#55ACEE',
    dribbble: '#CD5885',

    /** icon tint color */
    icon: '#8392AB',

    /** blur tint color */
    blurTint: 'dark',

    /** product link color */
    link: '#BC5AA5',
};

export const GRADIENTS: ThemeGradients = {
    primary: ['#F381BA', '#AB62F3'],
    secondary: ['#A8B8D8', '#627594'],
    info: ['#65CAE1', '#3B8CD7'],
    success: ['#3DE1C4', '#00A2AC'],
    warning: ['#E8C23E', '#D35D5D'],
    danger: ['#E97081', '#B22626'],

    light: ['#EBEFF4', '#CED4DA'],
    dark: ['#4B5178', '#0A0D1C'],

    white: [String(COLORS.white), '#EBEFF4'],
    black: [String(COLORS.black), '#141727'],

    divider: ['rgba(255,255,255,0.3)', 'rgba(102, 116, 142, 0.6)'],
    menu: [
        'rgba(255, 255, 255, 0.2)',
        'rgba(112, 125, 149, 0.5)',
        'rgba(255, 255, 255, 0.2)',
    ],
};

export const SIZES: ThemeSizes = {
    // global sizes
    base: 8,
    text: 14,
    radius: 4,
    padding: 20,

    // font sizes
    h1: 44,
    h2: 40,
    h3: 32,
    h4: 24,
    h5: 18,
    p: 16,

    // button sizes
    buttonBorder: 1,
    buttonRadius: 8,
    socialSize: 64,
    socialRadius: 16,
    socialIconSize: 26,

    // button shadow
    shadowOffsetWidth: 0,
    shadowOffsetHeight: 7,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,

    // input sizes
    inputHeight: 46,
    inputBorder: 1,
    inputRadius: 8,
    inputPadding: 12,

    // card sizes
    cardRadius: 16,
    cardPadding: 10,

    // image sizes
    imageRadius: 14,
    avatarSize: 32,
    avatarRadius: 8,

    // switch sizes
    switchWidth: 50,
    switchHeight: 24,
    switchThumb: 20,

    // checkbox sizes
    checkboxWidth: 18,
    checkboxHeight: 18,
    checkboxRadius: 5,
    checkboxIconWidth: 10,
    checkboxIconHeight: 8,

    // product link size
    linkSize: 12,

    /** font size multiplier: for maxFontSizeMultiplier prop */
    multiplier: 2,
};

export const SPACING: ThemeSpacing = {
    /** xs: 4px */
    xs: SIZES.base * 0.5,
    /** s: 8px */
    s: SIZES.base * 1,
    /** sm: 16px */
    sm: SIZES.base * 2,
    /** m: 24px */
    m: SIZES.base * 3,
    /** md: 32px */
    md: SIZES.base * 4,
    /** l: 40px */
    l: SIZES.base * 5,
    /** xl: 48px */
    xl: SIZES.base * 6,
    /** xxl: 56px */
    xxl: SIZES.base * 7,
};

export const THEME: ITheme = {
    ...commonTheme,
    colors: COLORS,
    gradients: GRADIENTS,
    sizes: {...SIZES, ...commonTheme.sizes, ...SPACING},
};
