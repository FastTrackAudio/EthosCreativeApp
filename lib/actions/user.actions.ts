"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db"; // Assuming you're using Prisma for database operations

export const getKindeUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    // Fetch users from your database (assuming you're storing Kinde user data)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      avatar: user.profileImage || `https://avatar.vercel.sh/${user.id}`,
    }));

    const sortedUsers = userIds.map((id) =>
      formattedUsers.find((user) => user.id === id)
    );

    return JSON.parse(JSON.stringify(sortedUsers));
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
  }
};
