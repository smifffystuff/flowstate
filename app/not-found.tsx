import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 text-center gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      </div>
      <Link href="/dashboard" className={buttonVariants()}>
        Go to Dashboard
      </Link>
    </div>
  )
}
