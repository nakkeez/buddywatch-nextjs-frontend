'use client';

import { ReactNode, Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import VideoItem from '@/components/VideoItem';

export default function VideoPage() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[] | null>(null);
  const { data: session } = useSession();

  const fetchVideos = async () => {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/videos/`,
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${session?.user.access}`,
        },
      }
    );
    const serverResponse = await response.json();
    console.log(serverResponse);
    if (response.ok) {
      setVideos(serverResponse);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const deleteVideo = async (id: number) => {
    try {
      const response: Response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/videos/delete/${id}`,
        {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${session?.user.access}`,
          },
        }
      );
      const serverResponse = await response.json();
      if (response.status === 204) {
        toast.success('Video deleted successfully!');
        fetchVideos();
        console.log(videos);
      } else {
        toast.error('Failed to delete video');
        console.error('Failed to delete video:', serverResponse);
      }
    } catch (error) {
      toast.error('Failed to delete video');
      console.error('Error deleting video:', error);
    }
  };

  const videoItems = videos
    ? videos.map((video: Video, index: number) => (
        <VideoItem key={index} video={video} onDelete={deleteVideo} />
      ))
    : null;

  return (
    <main className="h-screen p-8">
      <ul>{videoItems}</ul>
    </main>
  );
}
