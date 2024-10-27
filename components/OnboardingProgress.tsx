import React from "react";
import { Progress } from "@/components/ui/progress";

export function OnboardingProgress({ userId }: { userId: string }) {
  // This is a placeholder. You'll need to implement the actual onboarding progress logic.
  const progress = 75; // Example progress value

  return (
    <div>
      <Progress value={progress} className="w-full" />
      <p className="mt-2">You're {progress}% through the onboarding process!</p>
    </div>
  );
}
