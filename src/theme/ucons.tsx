/**
 * Unicon icon registry — curated subset of @iconscout/react-native-unicons
 *
 * Each import is a single SVG component so tree-shaking keeps the bundle lean.
 * Add icons here as needed; the `names` type automatically reflects the map.
 */
import React from 'react';
import type { SvgProps } from 'react-native-svg';

// Import only the icons we need
import UilApps from '@iconscout/react-native-unicons/icons/uil-apps';
import UilBell from '@iconscout/react-native-unicons/icons/uil-bell';
import UilBill from '@iconscout/react-native-unicons/icons/uil-bill';
import UilBolt from '@iconscout/react-native-unicons/icons/uil-bolt';
import UilBook from '@iconscout/react-native-unicons/icons/uil-book';
import UilBookOpen from '@iconscout/react-native-unicons/icons/uil-book-open';
import UilCalendarAlt from '@iconscout/react-native-unicons/icons/uil-calendar-alt';
import UilChart from '@iconscout/react-native-unicons/icons/uil-chart';
import UilChartPie from '@iconscout/react-native-unicons/icons/uil-chart-pie';
import UilCheck from '@iconscout/react-native-unicons/icons/uil-check';
import UilCheckCircle from '@iconscout/react-native-unicons/icons/uil-check-circle';
import UilCheckSquare from '@iconscout/react-native-unicons/icons/uil-check-square';
import UilCircle from '@iconscout/react-native-unicons/icons/uil-circle';
import UilClipboardNotes from '@iconscout/react-native-unicons/icons/uil-clipboard-notes';
import UilClock from '@iconscout/react-native-unicons/icons/uil-clock';
import UilCoins from '@iconscout/react-native-unicons/icons/uil-coins';
import UilCreateDashboard from '@iconscout/react-native-unicons/icons/uil-create-dashboard';
import UilDashboard from '@iconscout/react-native-unicons/icons/uil-dashboard';
import UilDiamond from '@iconscout/react-native-unicons/icons/uil-diamond';
import UilDocumentInfo from '@iconscout/react-native-unicons/icons/uil-document-info';
import UilEnvelope from '@iconscout/react-native-unicons/icons/uil-envelope';
import UilFile from '@iconscout/react-native-unicons/icons/uil-file';
import UilFire from '@iconscout/react-native-unicons/icons/uil-fire';
import UilFolder from '@iconscout/react-native-unicons/icons/uil-folder';
import UilGift from '@iconscout/react-native-unicons/icons/uil-gift';
import UilGrid from '@iconscout/react-native-unicons/icons/uil-grid';
import UilGrids from '@iconscout/react-native-unicons/icons/uil-grids';
import UilHeart from '@iconscout/react-native-unicons/icons/uil-heart';
import UilHeartbeat from '@iconscout/react-native-unicons/icons/uil-heartbeat';
import UilHome from '@iconscout/react-native-unicons/icons/uil-home';
import UilLamp from '@iconscout/react-native-unicons/icons/uil-lamp';
import UilLightbulb from '@iconscout/react-native-unicons/icons/uil-lightbulb';
import UilLink from '@iconscout/react-native-unicons/icons/uil-link';
import UilLinkAlt from '@iconscout/react-native-unicons/icons/uil-link-alt';
import UilListUl from '@iconscout/react-native-unicons/icons/uil-list-ul';
import UilLocationPoint from '@iconscout/react-native-unicons/icons/uil-location-point';
import UilLock from '@iconscout/react-native-unicons/icons/uil-lock';
import UilMap from '@iconscout/react-native-unicons/icons/uil-map';
import UilMapMarker from '@iconscout/react-native-unicons/icons/uil-map-marker';
import UilMapPin from '@iconscout/react-native-unicons/icons/uil-map-pin';
import UilMedal from '@iconscout/react-native-unicons/icons/uil-medal';
import UilEllipsisH from '@iconscout/react-native-unicons/icons/uil-ellipsis-h';
import UilMessage from '@iconscout/react-native-unicons/icons/uil-message';
import UilMicrophone from '@iconscout/react-native-unicons/icons/uil-microphone';
import UilMinus from '@iconscout/react-native-unicons/icons/uil-minus';
import UilMoon from '@iconscout/react-native-unicons/icons/uil-moon';
import UilMusic from '@iconscout/react-native-unicons/icons/uil-music';
import UilNotes from '@iconscout/react-native-unicons/icons/uil-notes';
import UilPen from '@iconscout/react-native-unicons/icons/uil-pen';
import UilPhone from '@iconscout/react-native-unicons/icons/uil-phone';
import UilPlay from '@iconscout/react-native-unicons/icons/uil-play';
import UilPlus from '@iconscout/react-native-unicons/icons/uil-plus';
import UilPower from '@iconscout/react-native-unicons/icons/uil-power';
import UilQuestionCircle from '@iconscout/react-native-unicons/icons/uil-question-circle';
import UilRedo from '@iconscout/react-native-unicons/icons/uil-redo';
import UilRefresh from '@iconscout/react-native-unicons/icons/uil-refresh';
import UilRepeat from '@iconscout/react-native-unicons/icons/uil-repeat';
import UilRocket from '@iconscout/react-native-unicons/icons/uil-rocket';
import UilRotate360 from '@iconscout/react-native-unicons/icons/uil-rotate-360';
import UilSave from '@iconscout/react-native-unicons/icons/uil-save';
import UilScroll from '@iconscout/react-native-unicons/icons/uil-scroll';
import UilSearch from '@iconscout/react-native-unicons/icons/uil-search';
import UilSetting from '@iconscout/react-native-unicons/icons/uil-setting';
import UilShare from '@iconscout/react-native-unicons/icons/uil-share';
import UilShield from '@iconscout/react-native-unicons/icons/uil-shield';
import UilSignout from '@iconscout/react-native-unicons/icons/uil-signout';
import UilSlidersV from '@iconscout/react-native-unicons/icons/uil-sliders-v';
import UilSmile from '@iconscout/react-native-unicons/icons/uil-smile';
import UilSmileWink from '@iconscout/react-native-unicons/icons/uil-smile-wink';
import UilSnowflake from '@iconscout/react-native-unicons/icons/uil-snowflake';
import UilSort from '@iconscout/react-native-unicons/icons/uil-sort';
import UilStar from '@iconscout/react-native-unicons/icons/uil-star';
import UilStopwatch from '@iconscout/react-native-unicons/icons/uil-stopwatch';
import UilSun from '@iconscout/react-native-unicons/icons/uil-sun';
import UilSync from '@iconscout/react-native-unicons/icons/uil-sync';
import UilTable from '@iconscout/react-native-unicons/icons/uil-table';
import UilTag from '@iconscout/react-native-unicons/icons/uil-tag';
import UilTagAlt from '@iconscout/react-native-unicons/icons/uil-tag-alt';
import UilThumbsDown from '@iconscout/react-native-unicons/icons/uil-thumbs-down';
import UilThumbsUp from '@iconscout/react-native-unicons/icons/uil-thumbs-up';
import UilTimes from '@iconscout/react-native-unicons/icons/uil-times';
import UilToggleOff from '@iconscout/react-native-unicons/icons/uil-toggle-off';
import UilToggleOn from '@iconscout/react-native-unicons/icons/uil-toggle-on';
import UilTrash from '@iconscout/react-native-unicons/icons/uil-trash';
import UilTrashAlt from '@iconscout/react-native-unicons/icons/uil-trash-alt';
import UilTrophy from '@iconscout/react-native-unicons/icons/uil-trophy';
import UilUnlock from '@iconscout/react-native-unicons/icons/uil-unlock';
import UilUpload from '@iconscout/react-native-unicons/icons/uil-upload';
import UilUsdCircle from '@iconscout/react-native-unicons/icons/uil-usd-circle';
import UilUsdSquare from '@iconscout/react-native-unicons/icons/uil-usd-square';
import UilUser from '@iconscout/react-native-unicons/icons/uil-user';
import UilVideo from '@iconscout/react-native-unicons/icons/uil-video';
import UilVolume from '@iconscout/react-native-unicons/icons/uil-volume';
import UilWallet from '@iconscout/react-native-unicons/icons/uil-wallet';
import UilWatch from '@iconscout/react-native-unicons/icons/uil-watch';
import UilWater from '@iconscout/react-native-unicons/icons/uil-water';
import UilWifi from '@iconscout/react-native-unicons/icons/uil-wifi';
import UilWind from '@iconscout/react-native-unicons/icons/uil-wind';
import UilX from '@iconscout/react-native-unicons/icons/uil-x';
import UilXAdd from '@iconscout/react-native-unicons/icons/uil-x-add';
import UilYen from '@iconscout/react-native-unicons/icons/uil-yen';
import UilYenCircle from '@iconscout/react-native-unicons/icons/uil-yen-circle';
import UilComment from '@iconscout/react-native-unicons/icons/uil-comment';
import UilCamera from '@iconscout/react-native-unicons/icons/uil-camera';
import UilImage from '@iconscout/react-native-unicons/icons/uil-image';

/**
 * Registry mapping icon names (kebab-case, without `uil-` prefix)
 * to their React component. Add an import + entry here for every new Unicon.
 */
export const uconRegistry = {
  'apps': UilApps,
  'bell': UilBell,
  'bill': UilBill,
  'bolt': UilBolt,
  'book': UilBook,
  'book-open': UilBookOpen,
  'calendar-alt': UilCalendarAlt,
  'camera': UilCamera,
  'chart': UilChart,
  'chart-pie': UilChartPie,
  'check': UilCheck,
  'check-circle': UilCheckCircle,
  'check-square': UilCheckSquare,
  'circle': UilCircle,
  'clipboard-notes': UilClipboardNotes,
  'clock': UilClock,
  'coins': UilCoins,
  'comment': UilComment,
  'create-dashboard': UilCreateDashboard,
  'dashboard': UilDashboard,
  'diamond': UilDiamond,
  'document-info': UilDocumentInfo,
  'envelope': UilEnvelope,
  'file': UilFile,
  'fire': UilFire,
  'folder': UilFolder,
  'gift': UilGift,
  'grid': UilGrid,
  'grids': UilGrids,
  'heart': UilHeart,
  'heartbeat': UilHeartbeat,
  'home': UilHome,
  'image': UilImage,
  'lamp': UilLamp,
  'lightbulb': UilLightbulb,
  'link': UilLink,
  'link-alt': UilLinkAlt,
  'list-ul': UilListUl,
  'location-point': UilLocationPoint,
  'lock': UilLock,
  'map': UilMap,
  'map-marker': UilMapMarker,
  'map-pin': UilMapPin,
  'medal': UilMedal,
  'ellipsis-h': UilEllipsisH,
  'message': UilMessage,
  'microphone': UilMicrophone,
  'minus': UilMinus,
  'moon': UilMoon,
  'music': UilMusic,
  'notes': UilNotes,
  'pen': UilPen,
  'phone': UilPhone,
  'play': UilPlay,
  'plus': UilPlus,
  'power': UilPower,
  'question-circle': UilQuestionCircle,
  'redo': UilRedo,
  'refresh': UilRefresh,
  'repeat': UilRepeat,
  'rocket': UilRocket,
  'rotate-360': UilRotate360,
  'save': UilSave,
  'scroll': UilScroll,
  'search': UilSearch,
  'setting': UilSetting,
  'share': UilShare,
  'shield': UilShield,
  'signout': UilSignout,
  'sliders-v': UilSlidersV,
  'smile': UilSmile,
  'smile-wink': UilSmileWink,
  'snowflake': UilSnowflake,
  'sort': UilSort,
  'star': UilStar,
  'stopwatch': UilStopwatch,
  'sun': UilSun,
  'sync': UilSync,
  'table': UilTable,
  'tag': UilTag,
  'tag-alt': UilTagAlt,
  'thumbs-down': UilThumbsDown,
  'thumbs-up': UilThumbsUp,
  'times': UilTimes,
  'toggle-off': UilToggleOff,
  'toggle-on': UilToggleOn,
  'trash': UilTrash,
  'trash-alt': UilTrashAlt,
  'trophy': UilTrophy,
  'unlock': UilUnlock,
  'upload': UilUpload,
  'usd-circle': UilUsdCircle,
  'usd-square': UilUsdSquare,
  'user': UilUser,
  'video': UilVideo,
  'volume': UilVolume,
  'wallet': UilWallet,
  'watch': UilWatch,
  'water': UilWater,
  'wifi': UilWifi,
  'wind': UilWind,
  'x': UilX,
  'x-add': UilXAdd,
  'yen': UilYen,
  'yen-circle': UilYenCircle,
} as const;

/** All registered icon names (infer from the map keys). */
export type UconName = keyof typeof uconRegistry;

/** Default props passed to every Unicon SVG. */
interface UconProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  name: UconName;
  size?: number;
  color?: string;
}

/**
 * Render a registered Unicon icon by name.
 *
 * ```tsx
 * <Ucon name="wallet" size={24} color="#6D5EF7" />
 * ```
 */
export function Ucon({ name, size = 24, color = 'currentColor', ...svgProps }: UconProps) {
  const Component = uconRegistry[name];
  if (!Component) return null;
  return <Component size={size} color={color} {...svgProps} />;
}
