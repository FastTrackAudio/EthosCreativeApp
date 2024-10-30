type UserRole = "USER" | "ADMIN" | "BETA_TESTER";

interface FeatureFlag {
  name: string;
  enabled: boolean;
  requiredRoles: UserRole[];
}

const featureFlags: { [key: string]: FeatureFlag } = {
  MY_COURSES: {
    name: "My Courses",
    enabled: process.env.NEXT_PUBLIC_FEATURE_MY_COURSES === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  PROJECTS: {
    name: "Projects",
    enabled: process.env.NEXT_PUBLIC_FEATURE_PROJECTS === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  MESSAGES: {
    name: "Messages",
    enabled: process.env.NEXT_PUBLIC_FEATURE_MESSAGES === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  PROFILE: {
    name: "Profile",
    enabled: process.env.NEXT_PUBLIC_FEATURE_PROFILE === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  TEXT_EDITOR: {
    name: "Text Editor",
    enabled: process.env.NEXT_PUBLIC_FEATURE_TEXT_EDITOR === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  INDIE_LAND: {
    name: "IndieLand",
    enabled: process.env.NEXT_PUBLIC_FEATURE_INDIE_LAND === "true",
    requiredRoles: ["USER", "ADMIN", "BETA_TESTER"],
  },
  MAKER_MATCH: {
    name: "MakerMatch",
    enabled: process.env.NEXT_PUBLIC_FEATURE_MAKER_MATCH === "true",
    requiredRoles: ["USER", "ADMIN", "BETA_TESTER"],
  },
  MENTOR_ON_CALL: {
    name: "Mentor On Call",
    enabled: process.env.NEXT_PUBLIC_FEATURE_MENTOR_ON_CALL === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  TRACKING: {
    name: "Tracking",
    enabled: process.env.NEXT_PUBLIC_FEATURE_TRACKING === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  QUIZZES: {
    name: "Quizzes",
    enabled: process.env.NEXT_PUBLIC_FEATURE_QUIZZES === "true",
    requiredRoles: ["USER", "ADMIN"],
  },
  ADMIN: {
    name: "Admin",
    enabled: process.env.NEXT_PUBLIC_FEATURE_ADMIN === "true",
    requiredRoles: ["ADMIN"],
  },
};

export function getUserRoles(user: any): UserRole[] {
  const roles: UserRole[] = ["USER"];

  if (user?.permissions?.toUpperCase() === "ADMIN") {
    roles.push("ADMIN");
  }

  if (user?.permissions?.toUpperCase() === "BETA_TESTER") {
    roles.push("BETA_TESTER");
  }

  return roles;
}

export function isFeatureEnabled(
  featureName: string,
  userRoles: UserRole[]
): boolean {
  const feature = featureFlags[featureName];
  if (!feature) return false;
  if (!feature.enabled) return false;
  return feature.requiredRoles.some((role) => userRoles.includes(role));
}

export { featureFlags };
