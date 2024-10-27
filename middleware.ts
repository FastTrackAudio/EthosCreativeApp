import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth({
  // Specify the pages that don't require authentication
  publicRoutes: ["/", "/api/auth/login", "/api/auth/register"],
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

