import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { AppSidebar } from "@/components/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const user = await User.findOne({ clerkUserId: userId }).lean();
  const githubConnected = user?.githubConnected ?? false;
  const lastSyncAt = user?.lastSyncAt ? user.lastSyncAt.toISOString() : null;

  return (
    <div className="flex flex-1">
      <AppSidebar githubConnected={githubConnected} lastSyncAt={lastSyncAt} />
      <div className="flex-1 px-8 py-6">{children}</div>
    </div>
  );
}
