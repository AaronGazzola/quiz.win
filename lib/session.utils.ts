import { cache } from 'react'
import { auth } from './auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { configuration } from '@/configuration'

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(configuration.paths.signIn)
  }

  return { user: session.user, session }
})
