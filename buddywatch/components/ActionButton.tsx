interface Props {
  onClick?: () => void;
  bgColor?: string;
  buttonText?: string;
  icon?: any;
}

export default function ActionButton({
  onClick,
  bgColor,
  buttonText,
  icon,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-36 items-center justify-center rounded-lg ${bgColor} py-2 font-bold text-white ${onClick ? 'hover:bg-sky-700' : ''}`}
    >
      {icon}
      <span>{buttonText}</span>
    </button>
  );
}
