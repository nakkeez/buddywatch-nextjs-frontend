import { Tooltip } from 'react-tooltip';
import React from 'react';
import { Icon } from '@iconify/react';

interface Props {
  onClick?: () => void;
  bgColor?: string;
  buttonText?: string;
  icon: string;
  tooltipId: string;
  tooltipText: string;
}

export default function ActionButton({
  onClick,
  bgColor,
  buttonText,
  icon,
  tooltipId,
  tooltipText,
}: Props) {
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
          {buttonText}
        </span>
      </button>
    </div>
  );
}
