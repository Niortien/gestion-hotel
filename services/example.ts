// Exemple de service API
// import { z } from 'zod'

// export const UserSchema = z.object({
//   id: z.number(),
//   name: z.string(),
//   email: z.string().email(),
// })
// export type User = z.infer<typeof UserSchema>

// export async function getUser(id: number): Promise<User> {
//   const res = await fetch(`/api/users/${id}`)
//   if (!res.ok) throw new Error('Failed to fetch user')
//   return UserSchema.parse(await res.json())
// }
