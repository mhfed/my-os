/**
 * Type declarations for @iconscout/react-native-unicons
 *
 * Each icon is a standalone React component imported by path:
 *   import UilWallet from '@iconscout/react-native-unicons/icons/uil-wallet'
 *
 * The library ships as JS only (no .d.ts files), so we declare the module
 * pattern globally so TypeScript doesn't complain about missing types.
 */
declare module '@iconscout/react-native-unicons/icons/*' {
  import type { SvgProps } from 'react-native-svg';
  import type { FC } from 'react';

  interface UniconProps extends SvgProps {
    size?: number | string;
    color?: string;
  }

  const IconComponent: FC<UniconProps>;
  export default IconComponent;
}
