import tripadvisor from './tripadvisor.svg';
import facebook from './facebook.svg';
import instagram from './instagram.svg';
import youtube from './youtube.svg';
import whatsapp from './whatsapp.svg';
import line from './line.svg';
import pinterest from './pinterest.svg';
import messenger from './facebook-messenger.svg';
import maps from './marker.svg';
import x from './x.svg';

export const SocialIcons = {
  tripadvisor,
  facebook,
  instagram,
  youtube,
  whatsapp,
  line,
  pinterest,
  messenger,
  maps,
  x,
} as const;

export type SocialIconKey = keyof typeof SocialIcons;
