import fullLight from "./logo.svg";
import fullDark from "./logo-dark.svg";
import iconLight from "./logo-icon.svg";
import auth from "./auth-logo.svg";

export const LogoFullLight = fullLight;
export const LogoFullDark = fullDark;
export const LogoIconLight = iconLight;
export const LogoIconDark = iconLight; // Using same icon as fallback
export const LogoAuth = auth;

export const Logos = {
  FullLight: fullLight,
  FullDark: fullDark,
  IconLight: iconLight,
  IconDark: iconLight, // Fallback
  Auth: auth,
  // Backward compatibility
  Full: fullLight,
  Icon: iconLight,
};
