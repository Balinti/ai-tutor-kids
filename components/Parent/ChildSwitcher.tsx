"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getGradeLabel } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  grade: number;
}

interface ChildSwitcherProps {
  children: Child[];
  currentChildId: string;
  basePath?: string;
}

export function ChildSwitcher({
  children,
  currentChildId,
  basePath = "/parent/children",
}: ChildSwitcherProps) {
  const router = useRouter();

  const currentChild = children.find((c) => c.id === currentChildId);

  if (children.length <= 1) {
    return currentChild ? (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {getInitials(currentChild.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{currentChild.name}</p>
          <p className="text-xs text-muted-foreground">
            {getGradeLabel(currentChild.grade)}
          </p>
        </div>
      </div>
    ) : null;
  }

  return (
    <Select
      value={currentChildId}
      onValueChange={(value) => router.push(`${basePath}/${value}`)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          {currentChild && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(currentChild.name)}
                </AvatarFallback>
              </Avatar>
              <span>{currentChild.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {children.map((child) => (
          <SelectItem key={child.id} value={child.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(child.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{child.name}</span>
                <span className="text-xs text-muted-foreground">
                  {getGradeLabel(child.grade)}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
