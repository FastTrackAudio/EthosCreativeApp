"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  className?: string;
  children?: React.ReactNode;
  // Add other common props here
}

export function CourseCard({ className, children, ...props }: CourseCardProps) {
  return (
    <Card
      className={cn(
        // Base styles
        "flex flex-col h-full w-full",
        // Colors and borders
        "bg-[color:var(--color-surface-elevated)]",
        "border-[color:var(--color-border)]",
        "hover:border-[color:var(--color-border-contrasted)]",
        // Shadows
        "shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow)]",
        // Transitions
        "transition-all duration-[var(--transition)]",
        // Fluid scaling
        "~min-w-[320px]/[380px] ~max-w-[380px]/[480px]",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export function CourseCardHeader({
  className,
  children,
  ...props
}: CourseCardProps) {
  return (
    <CardHeader
      className={cn(
        // Reduced vertical padding
        "~py-2/4 ~px-3/6",
        className
      )}
      {...props}
    >
      {children}
    </CardHeader>
  );
}

export function CourseCardContent({
  className,
  children,
  ...props
}: CourseCardProps) {
  return (
    <CardContent
      className={cn(
        // Reduced vertical padding
        "~py-2/4 ~px-3/6",
        "flex-1",
        className
      )}
      {...props}
    >
      {children}
    </CardContent>
  );
}

export function CourseCardTitle({
  className,
  children,
  ...props
}: CourseCardProps) {
  return (
    <CardTitle
      className={cn(
        "~text-base/xl text-[color:var(--color-text)]",
        "line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
    </CardTitle>
  );
}

export function CourseCardDescription({
  className,
  children,
  ...props
}: CourseCardProps) {
  return (
    <CardDescription
      className={cn(
        "~text-sm/base text-[color:var(--color-text-light)]",
        "line-clamp-2",
        className
      )}
      {...props}
    >
      {children}
    </CardDescription>
  );
}

export function CourseCardFooter({
  className,
  children,
  ...props
}: CourseCardProps) {
  return (
    <CardFooter
      className={cn(
        "flex flex-col sm:flex-row items-center",
        "~gap-2/3",
        "border-t border-[var(--card-border-color)]",
        "~p-3/6",
        "card-button-group", // New utility class
        className
      )}
      {...props}
    >
      {children}
    </CardFooter>
  );
}
