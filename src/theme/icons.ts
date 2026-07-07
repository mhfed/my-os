import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/**
 * The Claude Design source uses Tabler icons (`ti ti-*`). React Native has no
 * Tabler set bundled, so the whole app maps to MaterialCommunityIcons via this
 * single re-export. Store MCI glyph names in data (`Category.icon`) and render
 * with <Icon name="coffee" .../>.
 *
 * Tabler → MCI cheatsheet used across the Finance screen:
 *   coffee→coffee · car→car · shopping-cart→cart · device-tv→television
 *   businessplan→cash-multiple · pig-money→piggy-bank · home→home
 *   arrow-down-left→arrow-bottom-left (income) · arrow-up-right→arrow-top-right (spent)
 *   chevron-left/right→chevron-left/right
 *   layout-grid→view-grid · checkbox→checkbox-marked-outline · heartbeat→heart-pulse
 *   wallet→wallet · dots→dots-horizontal
 */
export const Icon = MaterialCommunityIcons;
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;



/** Bottom tab bar definition — order matches the design (Today → More). */
export const TABS: { route: string; label: string; icon: IconName }[] = [
  { route: 'index', label: 'Home', icon: 'home' },
  { route: 'tasks', label: 'Tasks', icon: 'checkbox-marked-outline' },
  { route: 'health', label: 'Health', icon: 'heart-pulse' },
  { route: 'finance', label: 'Finance', icon: 'wallet' },
  { route: 'more', label: 'More', icon: 'dots-horizontal' },
];
