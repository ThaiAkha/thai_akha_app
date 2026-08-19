// Helper to parse leading emoji/icon from chat option label
export const parseLabel = (label: string) => {
  const firstSpaceIndex = label.indexOf(' ');
  if (firstSpaceIndex > 0) {
    const icon = label.slice(0, firstSpaceIndex).trim();
    const text = label.slice(firstSpaceIndex + 1).trim();
    // Validate if the first token is a symbol, emoji, or non-alphanumeric character
    const isIcon = /[\p{Emoji}\u2700-\u27BF\uE000-\uF8FF\uD83C\uDC00-\uD83D\uDFFF\u2011-\u26FF\uD83C-\uDBFF]/u.test(icon) || icon.length <= 3;
    if (isIcon) {
      return { icon, text };
    }
  }
  return { icon: null, text: label };
};
