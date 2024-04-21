import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';

/**
 * Component that toggles between light and dark mode.
 * Mode is only set on client side after the component is mounted to
 * prevent flashing of the theme.
 *
 * @returns {React.JSX.Element | null} The theme switch button if mounted, otherwise null
 */
export default function ThemeSwitch(): React.JSX.Element | null {
  const [mounted, setMounted] = useState<boolean>(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isLightMode: boolean = resolvedTheme === 'light';

  return (
    <button
      aria-label={`Toggle ${isLightMode ? 'Dark' : 'Light'} Mode`}
      type="button"
      className="mr-1.5 rounded-full p-2 hover:bg-gray-300 hover:text-black"
      onClick={() => setTheme(isLightMode ? 'dark' : 'light')}
    >
      <Icon
        icon={isLightMode ? 'solar:moon-linear' : 'solar:sun-linear'}
        width="32"
        height="32"
        className={`theme-switch-icon ${isLightMode ? 'light-mode-icon' : 'dark-mode-icon'}`}
      />
    </button>
  );
}
