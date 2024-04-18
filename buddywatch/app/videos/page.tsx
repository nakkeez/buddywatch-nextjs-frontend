'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Circles } from 'react-loader-spinner';
import VideoItem from '@/components/VideoItem';
import { downloadFile } from '@/utils/downloadFile';

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

  const downloadVideo = async (id: number) => {
    try {
      const response: Response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/videos/download/${id}`,
        {
          method: 'GET',
          headers: {
            authorization: `Bearer ${session?.user.access}`,
          },
        }
      );

      if (response.ok) {
        const blob: Blob = await response.blob();
        // Set default name
        let fileName: string = 'download.webm';
        // Get name of the file from header
        const contentDisposition: string | null = response.headers.get(
          'Content-Disposition'
        );
        if (contentDisposition) {
          const fileNameMatch: RegExpMatchArray | null =
            contentDisposition.match(/filename="?(.+)"?/);
          if (fileNameMatch && fileNameMatch.length > 1)
            fileName = fileNameMatch[1];
        }
        // Remove path from file name
        fileName = fileName.replace(/^.*[\\/]/, '');

        downloadFile(blob, fileName);
        toast.success('Download started successfully!');
      } else {
        toast.error('Failed to download video');
        console.log('Failed to download video');
      }
    } catch (error) {
      toast.error('Failed to delete video');
      console.error('Error while downloading video:', error);
    }
  };

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
      console.error('Error while deleting video:', error);
    }
  };

  const videoItems = videos
    ? videos.map((video: Video) => (
        <VideoItem
          key={video.id}
          video={video}
          onDelete={deleteVideo}
          onDownload={downloadVideo}
        />
      ))
    : null;

  return (
    <section className="h-screen p-8">
      <ul>
        {loading ? (
          <div
            className={
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform'
            }
          >
            <Circles width={100} height={100} color={'#0EA5E9'} />
          </div>
        ) : (
          videoItems
        )}
      </ul>
    </section>
  );
}
