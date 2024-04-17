interface VideoItemProps {
  video: Video;
  onDelete: (id: number) => Promise<void>;
}

export default function VideoItem({ video, onDelete }: VideoItemProps) {
  return (
    <li className="max-w-lg rounded bg-white p-4 shadow-lg">
      <a href={video.file}>{video.title}</a>
      <p>Created: {video.created_at}</p>
      <p>{video.title}</p>
    </li>
  );
}
