import { Building2, ClipboardList, LayoutGrid } from 'lucide-react';

import { Link, usePage } from '@inertiajs/react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { type NavItem } from '@/types';

import AppLogo from './app-logo';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Department {
    id: number;
    name: string;
    code: string;
}

interface Role {
    id: number;
    name: string;
}

interface AuthUser {
    id: number;
    name: string;
    department_id: number | null;
    department?: Department | null;
    roles?: Role[];
}

interface SharedProps {
    auth: {
        user: AuthUser | null;
    };
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getDepartmentName(user: AuthUser | null): string {
    if (!user) {
        return 'LGU Operations';
    }

    if (user.department?.name) {
        return user.department.name;
    }

    return 'LGU Operations';
}

function getRoleLabel(user: AuthUser | null): string {
    if (!user?.roles || user.roles.length === 0) {
        return 'User';
    }

    return user.roles[0].name;
}

/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

function getNavigation(): NavItem[] {
    return [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        },

        {
            title: 'Requests',
            url: '#',
            icon: ClipboardList,
            items: [
                {
                    title: 'All Requests',
                    url: '/operations/requests',
                    icon: ClipboardList,
                },
                {
                    title: 'My Requests',
                    url: '/operations/requests/my',
                    icon: ClipboardList,
                },
                {
                    title: 'Pending',
                    url: '/operations/requests/pending',
                    icon: ClipboardList,
                },
                {
                    title: 'Completed',
                    url: '/operations/requests/completed',
                    icon: ClipboardList,
                },
            ],
        },
    ];
}

/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

export function AppSidebar() {
    const { auth } = usePage<SharedProps>().props;

    const user = auth?.user ?? null;

    const departmentName = getDepartmentName(user);

    const departmentCode = user?.department?.code ?? null;

    const roleLabel = getRoleLabel(user);

    const navItems = getNavigation();

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* ========================================================== */}
            {/* HEADER */}
            {/* ========================================================== */}

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* ====================================================== */}
                {/* DEPARTMENT */}
                {/* ====================================================== */}

                <div className="px-2 pb-2">
                    {/* Expanded Sidebar */}

                    <div className="group-data-[collapsible=icon]:hidden">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Department</div>

                            <div className="mt-0.5 truncate text-xs font-semibold text-slate-700">{departmentName}</div>

                            {departmentCode && <div className="mt-0.5 text-[10px] font-medium text-slate-400">{departmentCode}</div>}

                            <div className="mt-1 text-[10px] font-medium text-blue-600">{roleLabel}</div>
                        </div>
                    </div>

                    {/* Collapsed Sidebar */}

                    <div className="hidden justify-center group-data-[collapsible=icon]:flex">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
                            title={`${departmentName} — ${roleLabel}`}
                        >
                            <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            {/* ========================================================== */}
            {/* CONTENT */}
            {/* ========================================================== */}

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            {/* ========================================================== */}
            {/* FOOTER */}
            {/* ========================================================== */}

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
