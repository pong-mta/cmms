import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { type NavItem } from '@/types';

import {
    Link,
    usePage,
} from '@inertiajs/react';

import {
    ChevronRight,
} from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';


export function NavMain({
    items = [],
}: {
    items: NavItem[];
}) {
    const page = usePage();

    /*
    |--------------------------------------------------------------------------
    | CURRENT URL
    |--------------------------------------------------------------------------
    */

    const currentUrl = page.url;


    /*
    |--------------------------------------------------------------------------
    | CHECK ROUTE ACTIVE
    |--------------------------------------------------------------------------
    |
    | Supports:
    |
    | /assets
    | /assets/123
    | /assets/123/edit
    |
    */

    const isRouteActive = (
        url: string,
    ): boolean => {

        if (!url || url === '#') {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | REMOVE QUERY STRING
        |--------------------------------------------------------------------------
        */

        const cleanCurrentUrl =
            currentUrl.split('?')[0];

        const cleanUrl =
            url.split('?')[0];

        /*
        |--------------------------------------------------------------------------
        | EXACT MATCH
        |--------------------------------------------------------------------------
        */

        if (
            cleanCurrentUrl ===
            cleanUrl
        ) {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | CHILD ROUTE
        |--------------------------------------------------------------------------
        */

        return cleanCurrentUrl.startsWith(
            `${cleanUrl}/`,
        );
    };


    /*
    |--------------------------------------------------------------------------
    | CHECK CHILD ACTIVE
    |--------------------------------------------------------------------------
    */

    const hasActiveChild = (
        item: NavItem,
    ): boolean => {

        return (
            item.items?.some(
                (child) =>
                    isRouteActive(
                        child.url,
                    ),
            ) ?? false
        );
    };


    return (
        <SidebarGroup className="px-2 py-0">

            {/* ========================================================== */}
            {/* SECTION LABEL */}
            {/* ========================================================== */}

            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                CMMS
            </SidebarGroupLabel>


            {/* ========================================================== */}
            {/* MENU */}
            {/* ========================================================== */}

            <SidebarMenu>

                {items.map(
                    (item) => {

                        /*
                        |--------------------------------------------------------------------------
                        | HAS CHILDREN
                        |--------------------------------------------------------------------------
                        */

                        const hasChildren =
                            Array.isArray(
                                item.items,
                            ) &&
                            item.items.length >
                                0;


                        /*
                        |--------------------------------------------------------------------------
                        | ACTIVE STATES
                        |--------------------------------------------------------------------------
                        */

                        const isActive =
                            isRouteActive(
                                item.url,
                            );

                        const childIsActive =
                            hasActiveChild(
                                item,
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | SIMPLE MENU ITEM
                        |--------------------------------------------------------------------------
                        */

                        if (!hasChildren) {

                            return (
                                <SidebarMenuItem
                                    key={
                                        item.title
                                    }
                                >

                                    <SidebarMenuButton
                                        asChild
                                        isActive={
                                            isActive
                                        }
                                        tooltip={
                                            item.title
                                        }
                                    >

                                        <Link
                                            href={
                                                item.url
                                            }
                                            prefetch
                                        >

                                            {item.icon && (
                                                <item.icon />
                                            )}

                                            <span>
                                                {
                                                    item.title
                                                }
                                            </span>

                                        </Link>

                                    </SidebarMenuButton>

                                </SidebarMenuItem>
                            );
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | PARENT MENU
                        |--------------------------------------------------------------------------
                        */

                        return (
                            <Collapsible
                                key={
                                    item.title
                                }
                                asChild
                                defaultOpen={
                                    childIsActive
                                }
                                className="group/collapsible"
                            >

                                <SidebarMenuItem>

                                    {/* ================================================== */}
                                    {/* PARENT BUTTON */}
                                    {/* ================================================== */}

                                    <CollapsibleTrigger
                                        asChild
                                    >

                                        <SidebarMenuButton
                                            tooltip={
                                                item.title
                                            }
                                            isActive={
                                                childIsActive
                                            }
                                        >

                                            {item.icon && (
                                                <item.icon />
                                            )}

                                            <span>
                                                {
                                                    item.title
                                                }
                                            </span>

                                            <ChevronRight
                                                className="
                                                    ml-auto
                                                    transition-transform
                                                    duration-200
                                                    group-data-[state=open]/collapsible:rotate-90
                                                "
                                            />

                                        </SidebarMenuButton>

                                    </CollapsibleTrigger>


                                    {/* ================================================== */}
                                    {/* CHILDREN */}
                                    {/* ================================================== */}

                                    <CollapsibleContent>

                                        <SidebarMenu className="ml-3 border-l border-slate-200 pl-2">

                                            {item.items?.map(
                                                (
                                                    child,
                                                ) => {

                                                    const childActive =
                                                        isRouteActive(
                                                            child.url,
                                                        );

                                                    return (
                                                        <SidebarMenuItem
                                                            key={
                                                                child.title
                                                            }
                                                        >

                                                            <SidebarMenuButton
                                                                asChild
                                                                size="sm"
                                                                isActive={
                                                                    childActive
                                                                }
                                                                tooltip={
                                                                    child.title
                                                                }
                                                            >

                                                                <Link
                                                                    href={
                                                                        child.url
                                                                    }
                                                                    prefetch
                                                                >

                                                                    {child.icon && (
                                                                        <child.icon />
                                                                    )}

                                                                    <span>
                                                                        {
                                                                            child.title
                                                                        }
                                                                    </span>

                                                                </Link>

                                                            </SidebarMenuButton>

                                                        </SidebarMenuItem>
                                                    );
                                                },
                                            )}

                                        </SidebarMenu>

                                    </CollapsibleContent>

                                </SidebarMenuItem>

                            </Collapsible>
                        );
                    },
                )}

            </SidebarMenu>

        </SidebarGroup>
    );
}