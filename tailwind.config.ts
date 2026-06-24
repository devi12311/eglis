import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        "caravan-cream": "#F2EFE4",
        "deep-walnut": "#43342B",
        "burnt-earth": "#C72A00",
        "utility-grey": "#E0E0E0",
        // Core surfaces / text
        background: "#fbf9f9",
        "on-background": "#1b1c1c",
        surface: "#fbf9f9",
        "surface-bright": "#fbf9f9",
        "surface-dim": "#dbdad9",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#484740",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f3",
        "surface-container": "#efeded",
        "surface-container-high": "#e9e8e7",
        "surface-container-highest": "#e4e2e2",
        "surface-variant": "#e4e2e2",
        "surface-tint": "#605f56",
        // Inverse
        "inverse-surface": "#303031",
        "inverse-on-surface": "#f2f0f0",
        "inverse-primary": "#c9c7bc",
        // Outline
        outline: "#79776f",
        "outline-variant": "#c9c6bd",
        // Primary
        primary: "#605f56",
        "on-primary": "#ffffff",
        "primary-container": "#f2efe4",
        "on-primary-container": "#6d6c64",
        "primary-fixed": "#e5e2d8",
        "primary-fixed-dim": "#c9c7bc",
        "on-primary-fixed": "#1c1c15",
        "on-primary-fixed-variant": "#48473f",
        // Secondary
        secondary: "#5f5e5e",
        "on-secondary": "#ffffff",
        "secondary-container": "#e2dfde",
        "on-secondary-container": "#636262",
        "secondary-fixed": "#e5e2e1",
        "secondary-fixed-dim": "#c8c6c5",
        "on-secondary-fixed": "#1c1b1b",
        "on-secondary-fixed-variant": "#474746",
        // Tertiary
        tertiary: "#6d5b51",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#ffebe1",
        "on-tertiary-container": "#7b685e",
        "tertiary-fixed": "#f6ded0",
        "tertiary-fixed-dim": "#d9c2b5",
        "on-tertiary-fixed": "#251911",
        "on-tertiary-fixed-variant": "#54433a",
        // Error
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      spacing: {
        "section-gap": "120px",
        "container-max": "1280px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        gutter: "24px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px"
      },
      fontFamily: {
        // Legacy aliases (kept so existing classNames keep working)
        display: ["var(--font-chivo)", "Arial", "sans-serif"],
        body: ["var(--font-hanken)", "Arial", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        // Semantic aliases (mockup)
        "display-xl": ["var(--font-chivo)", "Arial", "sans-serif"],
        "display-xl-mobile": ["var(--font-chivo)", "Arial", "sans-serif"],
        "headline-lg": ["var(--font-chivo)", "Arial", "sans-serif"],
        "headline-lg-mobile": ["var(--font-chivo)", "Arial", "sans-serif"],
        button: ["var(--font-chivo)", "Arial", "sans-serif"],
        subheading: ["var(--font-hanken)", "Arial", "sans-serif"],
        "body-lg": ["var(--font-hanken)", "Arial", "sans-serif"],
        "body-md": ["var(--font-hanken)", "Arial", "sans-serif"],
        "label-caps": ["var(--font-jetbrains)", "monospace"]
      },
      fontSize: {
        "display-xl": ["80px", { lineHeight: "88px", letterSpacing: "-0.04em", fontWeight: "800" }],
        "display-xl-mobile": ["48px", { lineHeight: "52px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["32px", { lineHeight: "38px", fontWeight: "700" }],
        subheading: ["20px", { lineHeight: "28px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "30px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "500" }],
        button: ["14px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" }]
      },
      boxShadow: {
        hard: "4px 4px 0 #1b1c1c",
        "hard-sm": "2px 2px 0 #1b1c1c",
        "hard-earth": "2px 2px 0 #C72A00",
        "nav-top": "0 -2px 0 0 #1b1c1c"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      maxWidth: {
        content: "1280px",
        "container-max": "1280px"
      }
    }
  },
  plugins: []
};

export default config;
