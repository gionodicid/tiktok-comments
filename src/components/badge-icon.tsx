"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface BadgeIconProps extends LucideProps {
  name: string;
}

export function BadgeIcon({ name, ...props }: BadgeIconProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
