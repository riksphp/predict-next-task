import daisyui from 'daisyui';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Rubik',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Inter',
          'Helvetica',
          'Arial',
          'Apple Color Emoji',
          'Segoe UI Emoji',
        ],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'cupcake', 'corporate', 'bumblebee', 'business', 'emerald', 'winter'],
    darkTheme: 'business',
    logs: false,
  },
};
