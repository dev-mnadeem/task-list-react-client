import { createTheme } from "@mui/material/styles";

/**
 * One palette, one type scale, one radius.
 *
 * Colours are named by role rather than by hue so a component never reaches for
 * a raw hex. The accents are the only saturated colours on the page: everything
 * structural is drawn from the slate ramp.
 */
export const palette = {
  canvas: "#F5F6FA",
  surface: "#FFFFFF",
  border: "#E4E7EF",
  borderStrong: "#CBD2E0",
  ink: "#101828",
  inkMuted: "#5B6478",
  inkFaint: "#8A93A6",
  brand: "#4B49D6",
  brandDark: "#3A38B8",
  brandSoft: "#EEEEFB",
  success: "#127A48",
  successSoft: "#E3F5EC",
  warning: "#A35A07",
  warningSoft: "#FDF0DF",
  danger: "#B3261E",
  dangerSoft: "#FCEBEA",
  info: "#0F5F96",
  infoSoft: "#E4F1FA",
};

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const RADIUS = 12;

const IS_TEST = process.env.NODE_ENV === "test";

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
    // A real scale: 30 / 20 / 16 / 14 / 13 / 12, each with its own weight and
    // tracking rather than browser defaults.
    h1: {
      fontSize: "1.875rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "1.25rem",
      fontWeight: 650,
      letterSpacing: "-0.01em",
      lineHeight: 1.3,
    },
    h3: { fontSize: "1rem", fontWeight: 650, lineHeight: 1.4 },
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
          "& fieldset": { borderColor: palette.border },
          "&:hover fieldset": { borderColor: palette.borderStrong },
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
    // turned off under Jest.
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
