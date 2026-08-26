import {
    Archive,
    BarChart3,
    Bell,
    Boxes,
    Building2,
    CalendarClock,
    ClipboardList,
    FileBarChart,
    FileText,
    Gauge,
    History,
    LayoutGrid,
    Package,
    Settings,
    ShieldCheck,
    Truck,
    UserCog,
    Users,
    Wrench,
} from 'lucide-react';

import { Link } from '@inertiajs/react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { type NavItem } from '@/types';

import AppLogo from './app-logo';


/*
|--------------------------------------------------------------------------
| MAIN NAVIGATION
|--------------------------------------------------------------------------
*/

const mainNavItems: NavItem[] = [

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },


    /*
    |--------------------------------------------------------------------------
    | ASSET MANAGEMENT
    |--------------------------------------------------------------------------
    */

    {
        title: 'Assets',
        url: '#',
        icon: Boxes,
        items: [

            {
                title: 'All Assets',
                url: '/assets',
                icon: Archive,
            },

            {
                title: 'Register Asset',
                url: '/assets/create',
                icon: Package,
            },

            {
                title: 'Asset Categories',
                url: '/asset-categories',
                icon: ClipboardList,
            },

            {
                title: 'Asset Locations',
                url: '/asset-locations',
                icon: Building2,
            },

            {
                title: 'Asset History',
                url: '/assets/history',
                icon: History,
            },

        ],
    },


    /*
    |--------------------------------------------------------------------------
    | MAINTENANCE
    |--------------------------------------------------------------------------
    */

    {
        title: 'Maintenance',
        url: '#',
        icon: Wrench,
        items: [

            {
                title: 'Maintenance Overview',
                url: '/maintenance',
                icon: Gauge,
            },

            {
                title: 'Preventive Maintenance',
                url: '/maintenance/preventive',
                icon: CalendarClock,
            },

            {
                title: 'Maintenance Schedule',
                url: '/maintenance/schedule',
                icon: CalendarClock,
            },

            {
                title: 'Maintenance History',
                url: '/maintenance/history',
                icon: History,
            },

        ],
    },


    /*
    |--------------------------------------------------------------------------
    | WORK ORDERS
    |--------------------------------------------------------------------------
    */

    {
        title: 'Work Orders',
        url: '#',
        icon: ClipboardList,
        items: [

            {
                title: 'All Work Orders',
                url: '/work-orders',
                icon: ClipboardList,
            },

            {
                title: 'Create Work Order',
                url: '/work-orders/create',
                icon: FileText,
            },

            {
                title: 'My Work Orders',
                url: '/work-orders/my',
                icon: UserCog,
            },

            {
                title: 'Pending Approval',
                url: '/work-orders/pending',
                icon: Bell,
            },

            {
                title: 'Completed',
                url: '/work-orders/completed',
                icon: History,
            },

        ],
    },


    /*
    |--------------------------------------------------------------------------
    | SERVICE REQUESTS
    |--------------------------------------------------------------------------
    */

    {
        title: 'Requests',
        url: '#',
        icon: FileText,
        items: [

            {
                title: 'All Requests',
                url: '/requests',
            },

            {
                title: 'New Request',
                url: '/requests/create',
            },

            {
                title: 'My Requests',
                url: '/requests/my',
            },

            {
                title: 'Pending Requests',
                url: '/requests/pending',
            },

        ],
    },


    /*
    |--------------------------------------------------------------------------
    | INVENTORY
    |--------------------------------------------------------------------------
    */

    {
        title: 'Inventory',
        url: '#',
        icon: Package,
        items: [

            {
                title: 'Inventory Overview',
                url: '/inventory',
                icon: Boxes,
            },

            {
                title: 'Parts & Supplies',
                url: '/inventory/items',
                icon: Package,
            },

            {
                title: 'Stock Movement',
                url: '/inventory/movements',
                icon: History,
            },

            {
                title: 'Low Stock',
                url: '/inventory/low-stock',
                icon: Bell,
            },

            {
                title: 'Suppliers',
                url: '/suppliers',
                icon: Truck,
            },

        ],
    },


    /*
    |--------------------------------------------------------------------------
    | REPORTS
    |--------------------------------------------------------------------------
    */

    {
        title: 'Reports',
        url: '#',
        icon: BarChart3,
        items: [

            {
                title: 'Maintenance Reports',
                url: '/reports/maintenance',
                icon: FileBarChart,
            },

            {
                title: 'Asset Reports',
                url: '/reports/assets',
                icon: FileBarChart,
            },

            {
                title: 'Work Order Reports',
                url: '/reports/work-orders',
                icon: FileBarChart,
            },

            {
                title: 'Inventory Reports',
                url: '/reports/inventory',
                icon: FileBarChart,
            },

            {
                title: 'Cost Reports',
                url: '/reports/costs',
                icon: BarChart3,
            },

        ],
    },


    /*
    |--------------------------------------------------------------------------
    | ADMINISTRATION
    |--------------------------------------------------------------------------
    */

    {
        title: 'Administration',
        url: '#',
        icon: ShieldCheck,
        items: [

            {
                title: 'Users',
                url: '/admin/users',
                icon: Users,
            },

            {
                title: 'Departments',
                url: '/admin/departments',
                icon: Building2,
            },

            {
                title: 'Locations',
                url: '/admin/locations',
                icon: Building2,
            },

            {
                title: 'Roles & Permissions',
                url: '/admin/roles',
                icon: UserCog,
            },

            {
                title: 'Settings',
                url: '/admin/settings',
                icon: Settings,
            },

        ],
    },

];


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

export function AppSidebar() {

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
        >

            {/* ========================================================== */}
            {/* HEADER */}
            {/* ========================================================== */}

            <SidebarHeader>

                <SidebarMenu>

                    <SidebarMenuItem>

                        <SidebarMenuButton
                            size="lg"
                            asChild
                        >

                            <Link
                                href="/dashboard"
                                prefetch
                            >

                                <AppLogo />

                            </Link>

                        </SidebarMenuButton>

                    </SidebarMenuItem>

                </SidebarMenu>

            </SidebarHeader>


            {/* ========================================================== */}
            {/* MAIN */}
            {/* ========================================================== */}

            <SidebarContent>

                <NavMain
                    items={mainNavItems}
                />

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