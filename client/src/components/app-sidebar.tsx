import { Calendar, Home, Inbox, MessageCircle, Search, Settings } from "lucide-react";
import { useParams } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';


// import {
//     Sidebar,
//     SidebarContent,
//     SidebarGroup,
//     SidebarGroupContent,
//     SidebarGroupLabel,
//     SidebarMenu,
//     SidebarMenuButton,
//     SidebarMenuItem,
//     SidebarTrigger,
// } from "@/components/ui/sidebar";

// Menu items.
const items = [
    {
        title: "Chat",
        url: "",
        icon: MessageCircle,
        current: false
    },
    {
        title: "Character Overview",
        url: "character",
        icon: Calendar,
        current: false
    },
];

function classNames(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(' ')
  }

export function AppSidebar() {
    const { agentId } = useParams();

    return (
        <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
                <ul role="list" className="-mx-2 space-y-1">
                {items.map((item) => (
                    <li key={item.title}>
                    <a
                        href={`/${agentId}/${item.url}`}
                        className={classNames(
                        item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                        )}
                    >
                        <item.icon aria-hidden="true" className="size-6 shrink-0" />
                        {item.title}
                    </a>
                    </li>
                ))}
                </ul>
            </li>
            <li className="-mx-6 mt-auto">
                <SignedIn>
                    <div className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white hover:bg-gray-800">
                            <UserButton />
                            <span aria-hidden="true">Name</span>
                    </div>
                </SignedIn>
            </li>
            </ul>
        </nav>
    );
}
