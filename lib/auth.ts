import { auth, currentUser } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return { userId: null, user: null };
  const user = await currentUser();
  return { userId, user };
}
