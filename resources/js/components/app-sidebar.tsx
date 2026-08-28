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

import { Link, usePage } from '@inertiajs/react';

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
| ALL LGU DEPARTMENTS
|--------------------------------------------------------------------------
|
| These are the departments currently configured in the LGU system.
|
*/

const departments: Record<string, string> = {
    MAYOR: 'Office of the Municipal Mayor',
    VMAYOR: 'Office of the Municipal Vice Mayor',
    SB: 'Sangguniang Bayan',
    ADMIN: 'Municipal Administrator’s Office',
    ENGINEERING: 'Municipal Engineering Office',
    GSO: 'General Services Office',
    ACCOUNTING: 'Municipal Accounting Office',
    BUDGET: 'Municipal Budget Office',
    TREASURER: 'Municipal Treasurer’s Office',
    HRMO: 'Human Resource Management Office',
    MPDO: 'Municipal Planning and Development Office',
    MDRRMO: 'Municipal Disaster Risk Reduction and Management Office',
    HEALTH: 'Municipal Health Office',
    AGRICULTURE: 'Municipal Agriculture Office',
    ASSESSOR: 'Municipal Assessor’s Office',
    CIVIL_REGISTRAR: 'Municipal Civil Registrar’s Office',
    MSWDO: 'Municipal Social Welfare and Development Office',
    MENRO: 'Municipal Environment and Natural Resources Office',
    TOURISM: 'Municipal Tourism Office',
    INFORMATION: 'Municipal Information Office',
    LEGAL: 'Municipal Legal Office',
    BPLO: 'Business Permits and Licensing Office',
    PESO: 'Public Employment Service Office',
    ECONOMIC: 'Local Economic Enterprise Office',
    GAD: 'Gender and Development Office',
};


/*
|--------------------------------------------------------------------------
| BASE DEPARTMENT NAVIGATION
|--------------------------------------------------------------------------
|
| Every department initially receives the same core platform modules.
|
| Later we can customize these per department without rebuilding
| the sidebar architecture.
|
*/

function departmentNavItems(): NavItem[] {
    return [

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
                    title: 'Maintenance Requests',
                    url: '/maintenance-requests',
                    icon: ClipboardList,
                },

                {
                    title: 'Preventive Maintenance',
                    url: '/preventive-maintenance',
                    icon: CalendarClock,
                },

                {
                    title: 'Maintenance Schedule',
                    url: '/maintenance-calendar',
                    icon: CalendarClock,
                },

                {
                    title: 'Maintenance History',
                    url: '/maintenance-history',
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
        | REQUESTS
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
    ];
}


/*
|--------------------------------------------------------------------------
| ADMINISTRATION
|--------------------------------------------------------------------------
|
| Administration is kept separate from department operations.
|
*/

function administrationNavItems(): NavItem[] {
    return [
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
}


/*
|--------------------------------------------------------------------------
| DEPARTMENT LABEL
|--------------------------------------------------------------------------
*/

function getDepartmentName(
    user: AuthUser | null,
): string {
    if (!user) {
        return 'LGU Operations';
    }

    if (user.department?.name) {
        return user.department.name;
    }

    if (
        user.department?.code &&
        departments[user.department.code]
    ) {
        return departments[user.department.code];
    }

    return 'LGU Operations';
}


/*
|--------------------------------------------------------------------------
| ROLE CHECK
|--------------------------------------------------------------------------
*/

function hasAdminRole(
    user: AuthUser | null,
): boolean {
    if (!user?.roles) {
        return false;
    }

    return user.roles.some((role) =>
        [
            'system_admin',
            'admin',
            'administrator',
        ].includes(
            role.name.toLowerCase(),
        ),
    );
}


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

export function AppSidebar() {

    const { auth } = usePage<SharedProps>().props;

    const user = auth?.user ?? null;

    const departmentName =
        getDepartmentName(user);

    const departmentCode =
        user?.department?.code ?? null;

    const departmentItems =
        departmentNavItems();

    const adminItems =
        hasAdminRole(user)
            ? administrationNavItems()
            : [];

    const navItems: NavItem[] = [
        ...departmentItems,
        ...adminItems,
    ];


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


                {/* ====================================================== */}
                {/* DEPARTMENT */}
                {/* ====================================================== */}

                <div className="px-2 pb-2">

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">

                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Department
                        </div>

                        <div className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                            {departmentName}
                        </div>

                        {departmentCode && (
                            <div className="mt-0.5 text-[10px] font-medium text-slate-400">
                                {departmentCode}
                            </div>
                        )}

                    </div>

                </div>

            </SidebarHeader>


            {/* ========================================================== */}
            {/* MAIN */}
            {/* ========================================================== */}

            <SidebarContent>

                <NavMain
                    items={navItems}
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