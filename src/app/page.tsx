import { redirect } from 'next/navigation'

export default function Home() {
  // Ana sayfa direkt dashboard'a yönlendiriyor
  // Authentication eklenince login sayfasına yönlendirilecek
  redirect('/dashboard')
}
