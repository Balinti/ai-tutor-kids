"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface AppHeaderProps {
  user?: {
    email: string;
    full_name?: string;
  } | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const isMarketing = pathname === "/" || pathname === "/pricing";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            W
          </div>
          <span className="font-semibold">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isMarketing && (
            <>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  Pricing
                </Button>
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/parent">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/logout">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user.full_name || user.email)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
