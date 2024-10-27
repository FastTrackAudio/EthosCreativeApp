// /app/your-page/page.tsx
"use client";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import KindeIntegration from "@/components/kindeintegration";
import { RoomProvider } from "@liveblocks/react";

export default async function YourPage() {
  const { getUser } = await getKindeServerSession();
  const user = getUser();

  return (
    <RoomProvider
      id="liveblocks-room" // Unique room ID for Liveblocks
      initialPresence={{}}
    >
      <KindeIntegration
        user={
          user
            ? { name: user.name, avatar: user.avatar, email: user.email }
            : null
        }
      />
    </RoomProvider>
  );
}
