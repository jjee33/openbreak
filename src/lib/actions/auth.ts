'use server'

import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signIn, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export type RegisterState = {
  error?: string
}

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const orgName = formData.get('orgName') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!orgName || !name || !email || !password) {
    return { error: 'All fields are required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  try {
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return { error: 'An account with this email already exists' }
    }

    let slug = slugify(orgName)
    const slugExists = await db.organization.findUnique({ where: { slug } })
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'ORG_ADMIN',
        },
      })

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
        },
      })

      await tx.orgMember.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: 'ADMIN',
        },
      })
    })
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }

  let shouldRedirect = false
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    shouldRedirect = true
  } catch {
    return { error: 'Account created but sign-in failed. Please log in.' }
  }

  if (shouldRedirect) redirect('/dashboard')
  return {}
}

export async function logout() {
  await signOut({ redirect: false })
  redirect('/login')
}
