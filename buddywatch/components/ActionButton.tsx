import { Tooltip } from 'react-tooltip';
import React from 'react';
import { Icon } from '@iconify/react';

interface Props {
  onClick?: () => void;
  bgColor?: string;
  icon: string;
  tooltipId: string;
  tooltipText: string;
}

/**
 * Component that displays an action button.
 * @param onClick The function to call when the button is clicked
 * @param bgColor The background color of the button
 * @param icon The icon to display in the button
 * @param tooltipId The id of the tooltip element to anchor it to the button
 * @param tooltipText The text to display in the tooltip
 * @returns {React.JSX.Element} The action button component
 */
export default function ActionButton({
  onClick,
  bgColor,
  icon,
  tooltipId,
  tooltipText,
}: Props): React.JSX.Element {
  return (
    <div id={tooltipId}>
      <Tooltip
        anchorSelect={`#${tooltipId}`}
        content={tooltipText}
        place="bottom"
        className="z-10"
      />
      <button
        onClick={onClick}
        className={`w-24 rounded-lg ${bgColor} py-2 font-bold text-white ${bgColor !== 'bg-gray-500' ? 'hover:brightness-125' : ''}`}
      >
        <span
          className={`flex h-full w-full items-center justify-center ${bgColor !== 'bg-gray-500' ? 'transition-all duration-100 hover:scale-125' : ''}`}
        >
          <Icon icon={icon ? icon : ''} width="36" height="36" />
        </span>
      </button>
    </div>
  );
}
