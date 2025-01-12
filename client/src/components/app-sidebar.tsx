import { Calendar, Home, Inbox, MessageCircle, Search, Settings } from "lucide-react";
import { useParams } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from 'react'

function classNames(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(' ')
}

export function AppSidebar() {
    const { agentId } = useParams();
    const [billingData, setBillingData] = useState<any>(null);
    const { user } = useUser();
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const initializeLayout = async () => {
            try {
                // Your initialization code here
                initBillingMutation.mutate();
            } catch (error) {
                console.error('Failed to initialize layout:', error);
            }
        };

        initializeLayout();
    }, [user]);

    useEffect(() => {
        console.log('Current items:', items); // Log whenever items changes
    }, [items]);

    const initBillingMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("No user found");

            const res = await fetch(`/api/${agentId}/get-billing`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    url: window.location.href
                }),
            });
            const billingData = await res.json();
            if (billingData) {
                console.log("Billing data:", billingData);
                return billingData;
            } else {
                throw new Error('Failed to initialize session');
            }
        },
        onSuccess: (data) => {
            setBillingData(data);
            // Set items after getting billing data
            setItems([
                {
                    title: "Billing Portal",
                    url: data.portalLink,
                    icon: Calendar,
                    current: false
                },
            ]);
            console.log("Session initialized:", items);
        },
    });

    return (
        <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
                <ul role="list" className="-mx-2 space-y-1">
                {items.map((item) => (
                    <li key={item.title}>
                    <a
                        href={`${item.url}`}
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
