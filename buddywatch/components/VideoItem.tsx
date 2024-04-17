import { Icon } from '@iconify/react';
import Image from 'next/image';

interface VideoItemProps {
  video: Video;
  onDelete: (id: number) => Promise<void>;
}

export default function VideoItem({ video, onDelete }: VideoItemProps) {
  const formattedDate: string = new Date(video.created_at).toLocaleString(
    'fi-FI'
  );

  return (
    <li className=" my-4 flex max-w-lg rounded-lg bg-white p-4 shadow-lg">
      {video.thumbnail && (
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={128}
          height={128}
        />
      )}
      <div className="ml-4">
        <a href={video.file}>{video.title}</a>
        <p>Created: {formattedDate}</p>
        <p>{video.title}</p>
        <button className="text-red-600" onClick={() => onDelete(video.id)}>
          <Icon icon="material-symbols:delete-outline" width="24" height="24" />
        </button>
      </div>
    </li>
  );
}
