//// ./components/Toolbar.js

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";

export default function Toolbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-800">MyBlog</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/" current={pathname === "/"}>Home</NavLink>
              <NavLink href="/blogs" current={pathname === "/blogs"}>Blogs</NavLink>
              {session && (
                <>
                  <NavLink href="/dashboard" current={pathname === "/dashboard"}>Dashboard</NavLink>
                  <NavLink href="/blog/create" current={pathname === "/blog/create"}>Create Blog</NavLink>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <Button onClick={() => signOut()} variant="ghost">Sign Out</Button>
            ) : (
              <>
                <NavLink href="/signin" current={pathname === "/signin"}>Sign In</NavLink>
                <NavLink href="/signup" current={pathname === "/signup"}>Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, current, children }) {
  return (
    <Link 
      href={href} 
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        current 
          ? 'border-indigo-500 text-gray-900' 
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}


