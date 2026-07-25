import { redirect } from 'next/navigation';

export default function HomePage() {
  // redirect to chat until we get real home page
  redirect('/chat');
}
