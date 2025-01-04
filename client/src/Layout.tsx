// import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";
import { useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react'
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Bars3Icon, ChevronRightIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <div>
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 xl:hidden">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                />

                <div className="fixed inset-0 flex">
                    <DialogPanel
                    transition
                    className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                    >
                    <TransitionChild>
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                        <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                            <span className="sr-only">Close sidebar</span>
                            <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                        </button>
                        </div>
                    </TransitionChild>
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-1 ring-white/10">
                        <div className="flex h-16 shrink-0 items-center">
                        <img
                            alt="Your Company"
                            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                            className="h-8 w-auto"
                        />
                        </div>
                        <AppSidebar />
                    </div>
                    </DialogPanel>
                </div>
                </Dialog>

                {/* Static sidebar for desktop */}
                <div className="bg-gray-900 hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 ring-1 ring-white/5">
                    <div className="flex h-16 shrink-0 items-center">
                    <img
                        alt="Your Company"
                        src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                        className="h-8 w-auto"
                    />
                    </div>
                    <AppSidebar />
                </div>
                </div>

                <div className="xl:pl-72">
                    <main className="bg-gray-900">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}
