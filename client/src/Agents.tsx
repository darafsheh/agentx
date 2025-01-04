import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import {
    ArrowPathIcon,
    Bars3Icon,
    ChevronRightIcon,
    CloudArrowUpIcon,
    FingerPrintIcon,
    LockClosedIcon,
    XMarkIcon,
    Cog6ToothIcon,
    ServerIcon,
  } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { BoltIcon, CalendarDaysIcon, UsersIcon } from '@heroicons/react/24/outline'
import "./App.css";

type Agent = {
    id: string;
    name: string;
};

function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(' ')
}

function Agents() {
    const { isSignedIn } = useUser();
    console.log(isSignedIn);

    const navigate = useNavigate();
    const { data: agents, isLoading } = useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const res = await fetch("/api/agents");
            const data = await res.json();
            return data.agents as Agent[];
        },
    });

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Pricing', href: '#pricing' }
      ];
    const footerNavigation = {
    social: [
        {
        name: 'X',
        href: '#',
        icon: (props:React.SVGProps<SVGSVGElement>) => (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
            </svg>
        ),
        },
        {
        name: 'YouTube',
        href: '#',
        icon: (props:React.SVGProps<SVGSVGElement>) => (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
                fillRule="evenodd"
                d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                clipRule="evenodd"
            />
            </svg>
        ),
        },
    ],
    }

    const tiers = [
    {
        name: 'Pricing Details',
        id: 'tier-premium',
        href: '#',
        price: { monthly: '$29', annually: '$299' },
        description: '',
        features: [
        '+10,000 reports on crypto projects',
        'Daily alpha on porject updates',
        'Access to private alpha channel',
        'Alpha requests for new coins',
        'Automated report updates',
        ],
        mostPopular: false,
    }
    ]

    const ourAgents = [
    {
        name: 'Atlas',
        role: 'Crypto Researcher',
        imageUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
        location: 'Active',
    },
    {
        name: 'Nova',
        role: 'X Infludener',
        imageUrl:
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
        location: 'Coming Soon',
        },
    // More people...
    ]

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="bg-gray-900">
        <header className="absolute inset-x-0 top-0 z-50">
            <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
            <div className="flex md:flex-1">
                <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Agent X</span>
                <img
                    alt=""
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                />
                </a>
            </div>
            <div className="flex md:hidden">
                <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
                >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
                </button>
            </div>
            <div className="hidden md:flex md:gap-x-12">
                {navigation.map((item) => (
                <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white">
                    {item.name}
                </a>
                ))}
            </div>
            <div className="hidden md:flex md:flex-1 md:justify-end">
                <SignedOut>
                    <p className="text-sm/6 font-semibold text-white">
                        <SignInButton mode="modal" />
                    </p>
                </SignedOut>
                <SignedIn>
                    <div className="ml-3 flex">
                        <div className="text-sm/6 font-semibold text-white mr-3">
                            <UserButton />
                        </div>
                        <a href="/chat" className="text-sm/6 font-semibold text-white">Dashboard →</a>
                    </div>
                </SignedIn>
            </div>
            </nav>
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="md:hidden">
            <div className="fixed inset-0 z-50" />
            <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div className="flex items-center justify-between">
                <a href="#" className="-m-1.5 p-1.5">
                    <span className="sr-only">Agent X</span>
                    <img
                    alt=""
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                    />
                </a>
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-m-2.5 rounded-md p-2.5 text-gray-700"
                >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
                </div>
                <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                        <a
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                        {item.name}
                        </a>
                    ))}
                    </div>
                    <div className="py-6">
                    <SignedOut>
                        <p className="text-sm/6 font-semibold text-gray-900">
                            <SignInButton mode="modal" />
                        </p>
                    </SignedOut>
                    <SignedIn>
                        <div className="ml-3">
                            <div className="text-sm/6 font-semibold text-gray-900">
                                <UserButton />
                            </div>
                            <a href="/chat" className="text-sm/6 font-semibold text-gray-900">Dashboard →</a>
                        </div>
                    </SignedIn>
                    </div>
                </div>
                </div>
            </DialogPanel>
            </Dialog>
        </header>
        <main>
          {/* Hero section */}
          <div className="relative isolate overflow-hidden">
            <svg
              aria-hidden="true"
              className="absolute inset-0 -z-10 size-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
            >
              <defs>
                <pattern
                  x="50%"
                  y={-1}
                  id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
                  width={200}
                  height={200}
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M.5 200V.5H200" fill="none" />
                </pattern>
              </defs>
              <svg x="50%" y={-1} className="overflow-visible fill-gray-800/20">
                <path
                  d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                  strokeWidth={0}
                />
              </svg>
              <rect fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" width="100%" height="100%" strokeWidth={0} />
            </svg>
            <div
              aria-hidden="true"
              className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
            >
              <div
                style={{
                  clipPath:
                    'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                }}
                className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
              />
            </div>
            <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 sm:pb-16 lg:flex lg:px-8 lg:py-40">
              <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:pt-8">
                <div className="mt-24 sm:mt-32 lg:mt-16 text-left">
                  <a href="#" className="inline-flex space-x-6">
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm/6 font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                      What's new
                    </span>
                    <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-300">
                      <span>Just shipped v1.0</span>
                      <ChevronRightIcon aria-hidden="true" className="size-5 text-gray-500" />
                    </span>
                  </a>
                </div>
                <h1 className="mt-10 text-pretty text-5xl font-semibold tracking-tight text-white sm:text-7xl text-left">
                  Crypto AI Agent
                </h1>
                <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8 text-left">
                  Get real-time market analysis, the latest alpha, and actionable insights—delivered by your personal AI agent, designed to keep you informed on crypto markets.
                </p>
                <SignedOut>
                    <div className="mt-10 flex items-center gap-x-6">
                        <SignUpButton mode="modal">
                        <button className="rounded-md bg-indigo-500 px-3.5 py-2.5 pr-20 pl-20 text-md font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
                            Get started
                        </button>
                        </SignUpButton>
                    {/* <a href="#" className="text-sm/6 font-semibold text-white">
                        Learn more <span aria-hidden="true">→</span>
                        </a> */}
                    </div>
                </SignedOut>
                <SignedIn>
                    <div className="mt-5">
                        {isLoading ? (
                            <div>Loading agents...</div>
                        ) : (
                            <div className="mt-10 flex items-center gap-x-6">
                                {agents?.map((agent) => (
                                    <Button  key={agent.id} onClick={() => { navigate(`/${agent.id}`);}} className="rounded-md bg-green-400 px-3.5 py-2.5 pr-20 pl-20 text-md font-semibold text-white shadow-sm hover:bg-green-500	 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
                                        Chat with Agent X →
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </SignedIn>
              </div>
              {/* <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
                <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                  <img
                    alt="App screenshot"
                    src="https://tailwindui.com/plus/img/component-images/dark-project-app-screenshot.png"
                    width={2432}
                    height={1442}
                    className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
                  />
                </div>
              </div> */}
              <div>

              </div>
            </div>
          </div>
        </main>

        {/* Pricing */}
        <div id="pricing" className="mx-auto max-w-7xl px-6 lg:px-8 mt-24">
            <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base/7 font-semibold text-indigo-400">Pricing</h2>
            <p className="mt-5 text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Pay as you go
            </p>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-center text-lg font-medium text-gray-400 sm:text-xl/8">
            Simply pay for your AI agent's usage
            </p>
            <div className="mt-3 flex justify-center">
            </div>
            <div className="isolate mx-auto mt-5 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-1">
            {tiers.map((tier) => (
                <div
                key={tier.id}
                className={classNames(
                    tier.mostPopular ? 'bg-white/5 ring-2 ring-indigo-500' : 'ring-1 ring-white/10',
                    'rounded-3xl p-8 xl:p-10',
                )}
                >
                <div className="flex items-center justify-between gap-x-4">
                    <h3 id={tier.id} className="text-lg/8 font-semibold text-white">
                    {tier.name}
                    </h3>
                    {tier.mostPopular ? (
                    <p className="rounded-full bg-indigo-500 px-2.5 py-1 text-xs/5 font-semibold text-white">
                        Most popular
                    </p>
                    ) : null}
                </div>
                <p className="mt-4 text-sm/6 text-gray-300">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-semibold tracking-tight text-white">$5</span>
                    <span className="text-sm/6 font-semibold text-gray-300">/Coin Report</span>
                    <span className="text-sm pl-1 tracking-tight text-gray-400">(Billed Weekly)</span>
                </p>
                {/* <a className={classNames(
                    tier.mostPopular
                        ? 'bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500'
                        : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white',
                    'mt-6 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    )}
                >
                    Get started
                </a> */}
                <SignedOut>
                    <div className="mt-10 flex items-center gap-x-6">
                        <SignUpButton mode="modal">
                            <button className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
                                Get started
                            </button>
                        </SignUpButton>
                </div>
                </SignedOut>
                <SignedIn>
                    <div className="mt-5">
                        {isLoading ? (
                            <div>Loading agents...</div>
                        ) : (
                            <div className="mt-10 flex items-center gap-x-6">
                                {agents?.map((agent) => (
                                    <Button  key={agent.id} onClick={() => { navigate(`/${agent.id}`);}} className="rounded-md bg-green-400 px-3.5 py-2.5 pr-10 pl-10 text-md font-semibold text-white shadow-sm hover:bg-green-500	 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
                                        Chat with Agent X →
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </SignedIn>
                <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-300 xl:mt-10">
                    {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                        <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-white" />
                        {feature}
                    </li>
                    ))}
                </ul>
                </div>
            ))}
            </div>
        </div>

        {/* Footer */}
        <footer className="mx-auto mt-20 max-w-7xl px-6 lg:px-8">
          <div className="border-t border-white/10 py-12 md:flex md:items-center md:justify-between">
            <div className="flex justify-center gap-x-6 md:order-2">
              {footerNavigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-6" />
                </a>
              ))}
            </div>
            <p className="mt-8 text-center text-sm/6 text-gray-400 md:order-1 md:mt-0">
              &copy; 2024 Agent X, Inc. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

    );
}

export default Agents;
