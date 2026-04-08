import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/timeline(.*)',
  '/settings(.*)',
])

const isSignUpRoute = createRouteMatcher(['/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isSignUpRoute(request)) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
