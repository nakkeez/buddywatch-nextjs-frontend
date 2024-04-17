'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Circles } from 'react-loader-spinner';
import VideoItem from '@/components/VideoItem';

export default function VideoPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [videos, setVideos] = useState<Video[] | null>(null);
  const { data: session, status } = useSession();

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
      setLoading(false);
    } else {
      toast.error('Fetching videos from the server failed.');
    }
  };

  useEffect(() => {
    if (status === 'authenticated') fetchVideos();
  }, [status]);

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

      if (response.ok) {
        toast.success('Video deleted successfully!');
        fetchVideos();
      } else {
        toast.error('Failed to delete video');
        console.log('Failed to delete video');
      }
    } catch (error) {
      toast.error('Failed to delete video');
      console.error('Error deleting video:', error);
    }
  };

  const videoItems = videos
    ? videos.map((video: Video) => (
        <VideoItem key={video.id} video={video} onDelete={deleteVideo} />
      ))
    : null;

  return (
    <main className="h-screen p-8">
      <ul>
        {loading ? (
          <div className={'flex h-screen justify-center'}>
            <Circles width={100} height={100} color={'#0EA5E9'} />{' '}
          </div>
        ) : (
          videoItems
        )}
      </ul>
    </main>
  );
}
