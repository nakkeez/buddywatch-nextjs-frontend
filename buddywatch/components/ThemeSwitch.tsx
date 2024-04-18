import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState<boolean>(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Render the button after the component has mounted to prevent errors during hydration
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
