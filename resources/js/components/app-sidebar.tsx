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
| DEPARTMENT CONFIGURATION
|--------------------------------------------------------------------------
*/

const departmentNames: Record<string, string> = {
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
| ROLE HELPERS
|--------------------------------------------------------------------------
*/

function normalizeRole(role: string): string {
    return role
        .toLowerCase()
        .replace(/-/g, '_')
        .replace(/\s+/g, '_');
}


function getRoleNames(user: AuthUser | null): string[] {
    return (
        user?.roles?.map((role) =>
            normalizeRole(role.name),
        ) ?? []
    );
}


function isHead(user: AuthUser | null): boolean {
    return getRoleNames(user).some((role) =>
        [
            'head',
            'department_head',
            'office_head',
        ].includes(role),
    );
}


function isSupervisor(user: AuthUser | null): boolean {
    return getRoleNames(user).some((role) =>
        [
            'supervisor',
            'department_supervisor',
        ].includes(role),
    );
}


function isAdministrator(user: AuthUser | null): boolean {
    return getRoleNames(user).some((role) =>
        [
            'admin',
            'administrator',
            'system_admin',
            'super_admin',
        ].includes(role),
    );
}


/*
|--------------------------------------------------------------------------
| DEPARTMENT NAME
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
        departmentNames[user.department.code]
    ) {
        return departmentNames[
            user.department.code
        ];
    }

    return 'LGU Operations';
}


/*
|--------------------------------------------------------------------------
| DEPARTMENT NAVIGATION
|--------------------------------------------------------------------------
|
| This is the common operational navigation.
|
| The actual department determines the data shown inside
| these modules.
|
*/

function getDepartmentNavigation(
    departmentCode: string | null,
    user: AuthUser | null,
): NavItem[] {

    const items: NavItem[] = [];


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    items.push({
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    });


    /*
    |--------------------------------------------------------------------------
    | OPERATIONS
    |--------------------------------------------------------------------------
    */

    items.push({
        title: 'Operations',
        url: '#',
        icon: ClipboardList,

        items: [

            {
                title: 'Documents',
                url: '/documents',
                icon: FileText,
            },

            {
                title: 'Requests',
                url: '/requests',
                icon: ClipboardList,
            },

            {
                title: 'Notifications',
                url: '/notifications',
                icon: Bell,
            },

        ],
    });


    /*
    |--------------------------------------------------------------------------
    | ASSETS
    |--------------------------------------------------------------------------
    |
    | Every department can have assets.
    |
    */

    items.push({
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
    });


    /*
    |--------------------------------------------------------------------------
    | MAINTENANCE
    |--------------------------------------------------------------------------
    |
    | This is our CMMS module.
    |
    */

    items.push({
        title: 'Maintenance',
        url: '#',
        icon: Wrench,

        items: [

            {
                title: 'Overview',
                url: '/maintenance',
                icon: Gauge,
            },

            {
                title: 'Requests',
                url: '/maintenance-requests',
                icon: ClipboardList,
            },

            {
                title: 'Preventive Maintenance',
                url: '/preventive-maintenance',
                icon: CalendarClock,
            },

            {
                title: 'Schedule',
                url: '/maintenance-calendar',
                icon: CalendarClock,
            },

            {
                title: 'History',
                url: '/maintenance-history',
                icon: History,
            },

        ],
    });


    /*
    |--------------------------------------------------------------------------
    | WORK
    |--------------------------------------------------------------------------
    */

    items.push({
        title: 'Work',
        url: '#',
        icon: Wrench,

        items: [

            {
                title: 'Work Orders',
                url: '/work-orders',
                icon: ClipboardList,
            },

            {
                title: 'My Work',
                url: '/work-orders/my',
                icon: UserCog,
            },

            {
                title: 'Pending',
                url: '/work-orders/pending',
                icon: Bell,
            },

            {
                title: 'Completed',
                url: '/work-orders/completed',
                icon: History,
            },

        ],
    });


    /*
    |--------------------------------------------------------------------------
    | INVENTORY
    |--------------------------------------------------------------------------
    */

    items.push({
        title: 'Inventory',
        url: '#',
        icon: Package,

        items: [

            {
                title: 'Overview',
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
    });


    /*
    |--------------------------------------------------------------------------
    | REPORTS
    |--------------------------------------------------------------------------
    */

    items.push({
        title: 'Reports',
        url: '#',
        icon: BarChart3,

        items: [

            {
                title: 'Department Reports',
                url: '/reports/department',
                icon: FileBarChart,
            },

            {
                title: 'Maintenance',
                url: '/reports/maintenance',
                icon: FileBarChart,
            },

            {
                title: 'Assets',
                url: '/reports/assets',
                icon: FileBarChart,
            },

            {
                title: 'Work Orders',
                url: '/reports/work-orders',
                icon: FileBarChart,
            },

            {
                title: 'Inventory',
                url: '/reports/inventory',
                icon: FileBarChart,
            },

            {
                title: 'Costs',
                url: '/reports/costs',
                icon: BarChart3,
            },

        ],
    });


    /*
    |--------------------------------------------------------------------------
    | HEAD
    |--------------------------------------------------------------------------
    |
    | Department Heads receive additional management navigation.
    |
    */

    if (isHead(user)) {

        items.push({
            title: 'Management',
            url: '#',
            icon: ShieldCheck,

            items: [

                {
                    title: 'Pending Approvals',
                    url: '/approvals',
                    icon: ClipboardList,
                },

                {
                    title: 'Department Activity',
                    url: '/department/activity',
                    icon: History,
                },

                {
                    title: 'Department Users',
                    url: '/department/users',
                    icon: Users,
                },

            ],
        });

    }


    /*
    |--------------------------------------------------------------------------
    | SUPERVISOR
    |--------------------------------------------------------------------------
    |
    | Supervisors receive operational management tools.
    |
    */

    if (isSupervisor(user)) {

        items.push({
            title: 'Supervision',
            url: '#',
            icon: UserCog,

            items: [

                {
                    title: 'Team Work',
                    url: '/work-orders/team',
                    icon: ClipboardList,
                },

                {
                    title: 'Pending Work',
                    url: '/work-orders/pending',
                    icon: Bell,
                },

                {
                    title: 'Team Activity',
                    url: '/department/activity',
                    icon: History,
                },

            ],
        });

    }


    /*
    |--------------------------------------------------------------------------
    | SYSTEM ADMINISTRATION
    |--------------------------------------------------------------------------
    |
    | Only system administrators see this section.
    |
    */

    if (isAdministrator(user)) {

        items.push({
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
        });

    }


    /*
    |--------------------------------------------------------------------------
    | KEEP TYPESCRIPT HAPPY
    |--------------------------------------------------------------------------
    */

    void departmentCode;

    return items;
}


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

export function AppSidebar() {

    const { auth } =
        usePage<SharedProps>().props;

    const user =
        auth?.user ?? null;


    /*
    |--------------------------------------------------------------------------
    | DEPARTMENT
    |--------------------------------------------------------------------------
    */

    const departmentName =
        getDepartmentName(user);

    const departmentCode =
        user?.department?.code ?? null;


    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    const roleNames =
        getRoleNames(user);

    const roleLabel =
        isHead(user)
            ? 'Head'
            : isSupervisor(user)
                ? 'Supervisor'
                : roleNames.length > 0
                    ? user?.roles?.[0]?.name ?? 'User'
                    : 'User';


    /*
    |--------------------------------------------------------------------------
    | NAVIGATION
    |--------------------------------------------------------------------------
    */

    const navItems =
        getDepartmentNavigation(
            departmentCode,
            user,
        );


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


                        <div className="mt-1 text-[10px] font-medium text-blue-600">
                            {roleLabel}
                        </div>

                    </div>

                </div>

            </SidebarHeader>


            {/* ========================================================== */}
            {/* CONTENT */}
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