import { createTheme } from "@mui/material/styles";

/**
 * One palette, one type scale, one radius.
 *
 * Colours are named by role rather than by hue so a component never reaches for
 * a raw hex. A vault is paper, ledger green and brass: a warm paper canvas,
 * deep pine for anything you can act on, and brass for the mark and the one
 * "magic" control. Every text pairing clears WCAG AA (4.5:1); `inputBorder`
 * clears the 3:1 that form-field outlines need.
 */
export const palette = {
  canvas: "#F4F1EA",
  surface: "#FFFFFF",
  hover: "#FAF8F3",
  neutralSoft: "#ECE9E1",
  border: "#E2DED3",
  borderStrong: "#C2BBA9",
  inputBorder: "#878173",
  ink: "#17211E",
  inkMuted: "#4A5550",
  inkFaint: "#5F6A65",
  brand: "#1D5A4B",
  brandDark: "#14443A",
  brandSoft: "#E2EDE7",
  brass: "#9C6A1C",
  brassLight: "#F0D49A",
  success: "#2B6E45",
  successSoft: "#E1F0E6",
  warning: "#8A4F00",
  warningSoft: "#FBEEDC",
  danger: "#AE2A20",
  dangerSoft: "#FBE9E7",
  info: "#1E5B87",
  infoSoft: "#E3EEF6",
};

const SANS =
  '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

/** Headings and figures; loaded from Google Fonts in index.html. */
export const DISPLAY = `"Bricolage Grotesque", ${SANS}`;

export const RADIUS = 12;

const IS_TEST = import.meta.env.MODE === "test";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.brand, dark: palette.brandDark, contrastText: "#fff" },
    success: { main: palette.success },
    warning: { main: palette.warning },
    error: { main: palette.danger },
    info: { main: palette.info },
    background: { default: palette.canvas, paper: palette.surface },
    text: { primary: palette.ink, secondary: palette.inkMuted },
    divider: palette.border,
    custom: palette,
  },
  shape: { borderRadius: RADIUS },
  typography: {
    fontFamily: SANS,
    // A real scale: 32 / 21 / 17 / 15 / 13 / 12, each with its own weight and
    // tracking rather than browser defaults.
    h1: {
      fontFamily: DISPLAY,
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.025em",
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: DISPLAY,
      fontSize: "1.3125rem",
      fontWeight: 650,
      letterSpacing: "-0.015em",
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: DISPLAY,
      fontSize: "1.0625rem",
      fontWeight: 650,
      lineHeight: 1.4,
    },
    subtitle1: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.45 },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 600, color: palette.inkMuted },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.55, color: palette.inkMuted },
    caption: { fontSize: "0.75rem", lineHeight: 1.4, color: palette.inkFaint },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: palette.inkFaint,
    },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: palette.canvas, color: palette.ink },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${palette.border}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16, minHeight: 40 },
        sizeSmall: { minHeight: 32, paddingInline: 12, fontSize: "0.8125rem" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: palette.surface,
          "& fieldset": { borderColor: palette.inputBorder },
          "&:hover fieldset": { borderColor: palette.ink },
        },
        input: { fontSize: "0.9375rem" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 7, fontWeight: 600, fontSize: "0.75rem" },
        sizeSmall: { height: 22 },
      },
    },
    MuiTooltip: {
      defaultProps: IS_TEST
        ? { enterDelay: 0, leaveDelay: 0, TransitionProps: { timeout: 0 } }
        : {},
      styleOverrides: {
        tooltip: { fontSize: "0.75rem", borderRadius: 8, padding: "6px 10px" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 9 } },
    },
    // Ripples and transitions fire outside React's act() in jsdom and drown the
    // test output in warnings. They are a browser affordance, so they are only
    // turned off under test.
    MuiButtonBase: {
      defaultProps: { disableRipple: IS_TEST },
    },
    MuiMenu: {
      defaultProps: IS_TEST ? { transitionDuration: 0 } : {},
    },
    MuiDialog: {
      defaultProps: IS_TEST ? { transitionDuration: 0 } : {},
    },
  },
});

export default theme;
