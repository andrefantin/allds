import { put } from '@vercel/blob'
import { getBlobUrl } from './blob'
import type { PlatformUser } from '@/types'

const USERS_KEY = '_registry/users.json'

export async function getUsers(): Promise<PlatformUser[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []
  try {
    const res = await fetch(getBlobUrl(USERS_KEY), { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function saveUsers(users: PlatformUser[]): Promise<void> {
  await put(USERS_KEY, JSON.stringify(users), { access: 'public', addRandomSuffix: false })
}

export async function createUser(user: PlatformUser): Promise<void> {
  const users = await getUsers()
  if (users.find((u) => u.email === user.email)) throw new Error('User already exists')
  await saveUsers([...users, user])
}

export async function deleteUser(email: string): Promise<void> {
  const users = await getUsers()
  await saveUsers(users.filter((u) => u.email !== email))
}
