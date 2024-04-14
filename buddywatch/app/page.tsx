import WebcamView from '@/components/WebcamView';
// import { useSession, getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';

export default async function HomePage() {
  // const session = await getServerSession();
  // console.log('session: ' + session?.user);
  // const { data: session, status } = useSession();
  // console.log(session);
  // console.log(status);
  // if (status === 'loading') {
  //   return <p>Loading...</p>;
  // }
  //
  // if (status === 'unauthenticated') {
  //   return <p>Access Denied</p>;
  // }

  return (
    <main className="flex h-screen flex-col items-center p-24">
      <WebcamView />
    </main>
  );
}
