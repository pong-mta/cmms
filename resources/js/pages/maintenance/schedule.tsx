import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    Wrench,
} from 'lucide-react';

import {
    useMemo,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface Asset {
    id: number;
    asset_code: string;
    name: string;
    department_id?: number | null;
    department?: Department | null;
}

interface Department {
    id: number;
    name: string;
    code: string;
}

interface MaintenanceType {
    id: number;
    name: string;
    code: string;
}

interface AssignedUser {
    id: number;
    name: string;
}

interface MaintenanceRecord {
    id: number;
    maintenance_code: string;

    asset?: Asset | null;
    maintenance_type?: MaintenanceType | null;
    department?: Department | null;
    assignedTo?: AssignedUser | null;

    scheduled_date?: string | null;

    problem?: string | null;

    status:
        | 'pending'
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'cancelled';

    priority:
        | 'low'
        | 'normal'
        | 'high'
        | 'critical';
}

interface PreventiveMaintenanceSchedule {
    id: number;

    asset_id: number;

    title: string;

    description?: string | null;

    frequency_type: string;
    frequency_value: number;

    start_date: string;
    next_due_date: string;

    last_completed_at?: string | null;

    status:
        | 'active'
        | 'paused'
        | 'completed'
        | 'cancelled';

    notes?: string | null;

    asset?: Asset | null;

    assignedTo?: AssignedUser | null;
}

interface Props {
    records: MaintenanceRecord[];
    preventiveSchedules: PreventiveMaintenanceSchedule[];
}

interface CalendarEvent {
    id: string;
    date: string;

    title: string;

    type:
        | 'maintenance'
        | 'preventive';

    status: string;

    subtitle: string;

    href: string;
}


/*
|--------------------------------------------------------------------------
| BREADCRUMBS
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Maintenance',
        href: '/maintenance',
    },
    {
        title: 'Maintenance Schedule',
        href: '/maintenance/schedule',
    },
];


/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

function dateKey(
    value: string,
): string {

    return value.substring(0, 10);
}


function parseDate(
    value: string,
): Date {

    return new Date(
        `${dateKey(value)}T00:00:00`,
    );
}


function formatDate(
    value: string,
): string {

    return parseDate(value).toLocaleDateString(
        'en-PH',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );
}


function formatMonth(
    value: Date,
): string {

    return value.toLocaleDateString(
        'en-US',
        {
            month: 'long',
            year: 'numeric',
        },
    );
}


function isSameDay(
    first: Date,
    second: Date,
): boolean {

    return (
        first.getFullYear() ===
            second.getFullYear() &&
        first.getMonth() ===
            second.getMonth() &&
        first.getDate() ===
            second.getDate()
    );
}


function startOfMonth(
    value: Date,
): Date {

    return new Date(
        value.getFullYear(),
        value.getMonth(),
        1,
    );
}


function endOfMonth(
    value: Date,
): Date {

    return new Date(
        value.getFullYear(),
        value.getMonth() + 1,
        0,
    );
}


/*
|--------------------------------------------------------------------------
| EVENT STATUS
|--------------------------------------------------------------------------
*/

function maintenanceStatusClass(
    status: string,
): string {

    switch (status) {

        case 'scheduled':
            return 'bg-blue-50 text-blue-700 border-blue-100';

        case 'in_progress':
            return 'bg-amber-50 text-amber-700 border-amber-100';

        case 'completed':
            return 'bg-emerald-50 text-emerald-700 border-emerald-100';

        case 'pending':
            return 'bg-slate-100 text-slate-600 border-slate-200';

        case 'cancelled':
            return 'bg-red-50 text-red-700 border-red-100';

        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
}


function preventiveStatusClass(
    date: string,
): string {

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0,
    );

    const dueDate = parseDate(date);

    if (dueDate < today) {
        return 'bg-red-50 text-red-700 border-red-100';
    }

    if (isSameDay(dueDate, today)) {
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }

    return 'bg-blue-50 text-blue-700 border-blue-100';
}


function preventiveLabel(
    date: string,
): string {

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0,
    );

    const dueDate = parseDate(date);

    if (dueDate < today) {
        return 'Overdue';
    }

    if (isSameDay(dueDate, today)) {
        return 'Due Today';
    }

    return 'Upcoming';
}


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function MaintenanceSchedule({
    records,
    preventiveSchedules,
}: Props) {

    const [currentMonth, setCurrentMonth] =
        useState(
            startOfMonth(new Date()),
        );

    const [selectedDate, setSelectedDate] =
        useState<string | null>(null);


    /*
    |--------------------------------------------------------------------------
    | BUILD EVENTS
    |--------------------------------------------------------------------------
    */

    const events = useMemo<CalendarEvent[]>(
        () => {

            const maintenanceEvents =
                records
                    .filter(
                        (record) =>
                            record.scheduled_date &&
                            record.status !==
                                'cancelled',
                    )
                    .map(
                        (record) => ({
                            id:
                                `maintenance-${record.id}`,

                            date:
                                dateKey(
                                    record.scheduled_date!,
                                ),

                            title:
                                record
                                    .maintenance_type
                                    ?.name ??
                                record.maintenance_code,

                            type:
                                'maintenance',

                            status:
                                record.status,

                            subtitle:
                                record.asset
                                    ? `${record.asset.name} • ${record.asset.asset_code}`
                                    : record.maintenance_code,

                            href:
                                `/maintenance/${record.id}`,
                        }),
                    );


            const preventiveEvents =
                preventiveSchedules
                    .filter(
                        (schedule) =>
                            schedule.status ===
                            'active',
                    )
                    .filter(
                        (schedule) =>
                            schedule.next_due_date,
                    )
                    .map(
                        (schedule) => ({
                            id:
                                `preventive-${schedule.id}`,

                            date:
                                dateKey(
                                    schedule.next_due_date,
                                ),

                            title:
                                schedule.title,

                            type:
                                'preventive',

                            status:
                                preventiveLabel(
                                    schedule.next_due_date,
                                ),

                            subtitle:
                                schedule.asset
                                    ? `${schedule.asset.name} • ${schedule.asset.asset_code}`
                                    : 'Preventive Maintenance',

                            href:
                                `/preventive-maintenance/${schedule.id}/history`,
                        }),
                    );


            return [
                ...maintenanceEvents,
                ...preventiveEvents,
            ].sort(
                (a, b) =>
                    a.date.localeCompare(
                        b.date,
                    ),
            );

        },
        [
            records,
            preventiveSchedules,
        ],
    );


    /*
    |--------------------------------------------------------------------------
    | MONTH DAYS
    |--------------------------------------------------------------------------
    */

    const calendarDays = useMemo(() => {

        const firstDay =
            startOfMonth(
                currentMonth,
            );

        const lastDay =
            endOfMonth(
                currentMonth,
            );

        const startWeekday =
            firstDay.getDay();

        const totalDays =
            lastDay.getDate();

        const days: Array<
            Date | null
        > = [];

        for (
            let index = 0;
            index < startWeekday;
            index++
        ) {
            days.push(null);
        }

        for (
            let day = 1;
            day <= totalDays;
            day++
        ) {

            days.push(
                new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day,
                ),
            );

        }

        while (
            days.length % 7 !==
            0
        ) {
            days.push(null);
        }

        return days;

    }, [currentMonth]);


    /*
    |--------------------------------------------------------------------------
    | SELECTED EVENTS
    |--------------------------------------------------------------------------
    */

    const selectedEvents =
        selectedDate
            ? events.filter(
                  (event) =>
                      event.date ===
                      selectedDate,
              )
            : [];


    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    const overdueCount =
        preventiveSchedules.filter(
            (schedule) => {

                if (
                    schedule.status !==
                    'active'
                ) {
                    return false;
                }

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0,
                );

                return (
                    parseDate(
                        schedule.next_due_date,
                    ) < today
                );
            },
        ).length;


    const dueTodayCount =
        preventiveSchedules.filter(
            (schedule) => {

                if (
                    schedule.status !==
                    'active'
                ) {
                    return false;
                }

                return isSameDay(
                    parseDate(
                        schedule.next_due_date,
                    ),
                    new Date(),
                );
            },
        ).length;


    const maintenanceCount =
        records.filter(
            (record) =>
                record.scheduled_date &&
                record.status !==
                    'cancelled',
        ).length;


    /*
    |--------------------------------------------------------------------------
    | NAVIGATION
    |--------------------------------------------------------------------------
    */

    const previousMonth = () => {

        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1,
            ),
        );

        setSelectedDate(null);
    };


    const nextMonth = () => {

        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1,
            ),
        );

        setSelectedDate(null);
    };


    const goToday = () => {

        const today =
            new Date();

        setCurrentMonth(
            startOfMonth(today),
        );

        setSelectedDate(
            dateKey(
                today.toISOString(),
            ),
        );
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            <Head title="Maintenance Schedule | CMMS" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* ==========================================================
                    HEADER
                ========================================================== */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                            <CalendarDays className="h-5 w-5" />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Maintenance Schedule
                            </h1>

                            <p className="mt-0.5 text-sm text-slate-500">
                                View scheduled maintenance and upcoming preventive maintenance.
                            </p>

                        </div>

                    </div>


                    <Link
                        href="/preventive-maintenance"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >

                        <Wrench className="h-4 w-4" />

                        Preventive Maintenance

                    </Link>

                </div>


                {/* ==========================================================
                    SUMMARY
                ========================================================== */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <SummaryCard
                        label="Scheduled Maintenance"
                        value={
                            maintenanceCount
                        }
                        icon={
                            <Wrench className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="PM Due Today"
                        value={
                            dueTodayCount
                        }
                        icon={
                            <Clock className="h-4 w-4" />
                        }
                    />

                    <SummaryCard
                        label="PM Overdue"
                        value={
                            overdueCount
                        }
                        icon={
                            <CalendarDays className="h-4 w-4" />
                        }
                    />

                </div>


                {/* ==========================================================
                    CALENDAR
                ========================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* ------------------------------------------------------
                        CALENDAR HEADER
                    ------------------------------------------------------ */}

                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                        <div>

                            <h2 className="text-sm font-bold text-slate-900">
                                {formatMonth(
                                    currentMonth,
                                )}
                            </h2>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                                Click a date to view scheduled work.
                            </p>

                        </div>


                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={
                                    goToday
                                }
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Today
                            </button>

                            <button
                                type="button"
                                onClick={
                                    previousMonth
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                                title="Previous month"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                onClick={
                                    nextMonth
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                                title="Next month"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>

                        </div>

                    </div>


                    {/* ------------------------------------------------------
                        LEGEND
                    ------------------------------------------------------ */}

                    <div className="flex flex-wrap gap-4 border-b border-slate-100 px-5 py-3 sm:px-6">

                        <Legend
                            label="Maintenance Record"
                            className="bg-blue-50 text-blue-700"
                        />

                        <Legend
                            label="PM Upcoming"
                            className="bg-blue-50 text-blue-700"
                        />

                        <Legend
                            label="PM Due Today"
                            className="bg-amber-50 text-amber-700"
                        />

                        <Legend
                            label="PM Overdue"
                            className="bg-red-50 text-red-700"
                        />

                    </div>


                    {/* ------------------------------------------------------
                        WEEKDAYS
                    ------------------------------------------------------ */}

                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">

                        {[
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat',
                        ].map(
                            (day) => (

                                <div
                                    key={
                                        day
                                    }
                                    className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                >
                                    {day}
                                </div>

                            ),
                        )}

                    </div>


                    {/* ------------------------------------------------------
                        DAYS
                    ------------------------------------------------------ */}

                    <div className="grid grid-cols-7">

                        {calendarDays.map(
                            (
                                day,
                                index,
                            ) => {

                                if (
                                    !day
                                ) {

                                    return (
                                        <div
                                            key={
                                                `empty-${index}`
                                            }
                                            className="min-h-[125px] border-b border-r border-slate-100 bg-slate-50/30"
                                        />
                                    );

                                }


                                const key =
                                    `${day.getFullYear()}-${String(
                                        day.getMonth() + 1,
                                    ).padStart(
                                        2,
                                        '0',
                                    )}-${String(
                                        day.getDate(),
                                    ).padStart(
                                        2,
                                        '0',
                                    )}`;


                                const dayEvents =
                                    events.filter(
                                        (
                                            event,
                                        ) =>
                                            event.date ===
                                            key,
                                    );


                                const today =
                                    isSameDay(
                                        day,
                                        new Date(),
                                    );


                                const selected =
                                    selectedDate ===
                                    key;


                                return (

                                    <button
                                        type="button"
                                        key={
                                            key
                                        }
                                        onClick={() =>
                                            setSelectedDate(
                                                key,
                                            )
                                        }
                                        className={`min-h-[125px] border-b border-r border-slate-100 p-2 text-left align-top transition hover:bg-slate-50 ${
                                            selected
                                                ? 'bg-blue-50/50'
                                                : 'bg-white'
                                        }`}
                                    >

                                        {/* DATE */}

                                        <div className="flex items-center justify-between">

                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                                    today
                                                        ? 'bg-blue-700 text-white'
                                                        : 'text-slate-600'
                                                }`}
                                            >
                                                {
                                                    day.getDate()
                                                }
                                            </span>

                                            {dayEvents.length >
                                                0 && (

                                                <span className="text-[9px] font-semibold text-slate-400">
                                                    {
                                                        dayEvents.length
                                                    }
                                                </span>

                                            )}

                                        </div>


                                        {/* EVENTS */}

                                        <div className="mt-2 space-y-1">

                                            {dayEvents
                                                .slice(
                                                    0,
                                                    3,
                                                )
                                                .map(
                                                    (
                                                        event,
                                                    ) => (

                                                        <div
                                                            key={
                                                                event.id
                                                            }
                                                            className={`rounded-lg border px-2 py-1.5 ${event.type === 'preventive'
                                                                    ? preventiveStatusClass(
                                                                          event.date,
                                                                      )
                                                                    : maintenanceStatusClass(
                                                                          event.status,
                                                                      )
                                                            }`}
                                                        >

                                                            <div className="flex items-center gap-1.5">

                                                                {event.type ===
                                                                'preventive' ? (
                                                                    <CalendarDays className="h-3 w-3 shrink-0" />
                                                                ) : (
                                                                    <Wrench className="h-3 w-3 shrink-0" />
                                                                )}

                                                                <span className="truncate text-[9px] font-bold">
                                                                    {
                                                                        event.title
                                                                    }
                                                                </span>

                                                            </div>

                                                            <p className="mt-0.5 truncate text-[8px] opacity-75">
                                                                {
                                                                    event.subtitle
                                                                }
                                                            </p>

                                                        </div>

                                                    ),
                                                )}

                                            {dayEvents.length >
                                                3 && (

                                                <p className="px-1 text-[9px] font-semibold text-slate-400">
                                                    +
                                                    {
                                                        dayEvents.length -
                                                        3
                                                    }{' '}
                                                    more
                                                </p>

                                            )}

                                        </div>

                                    </button>

                                );

                            },
                        )}

                    </div>

                </section>


                {/* ==========================================================
                    SELECTED DATE
                ========================================================== */}

                {selectedDate && (

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                    <CalendarDays className="h-4 w-4" />

                                </div>

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        {formatDate(
                                            selectedDate,
                                        )}
                                    </h2>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Scheduled maintenance for this date.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {selectedEvents.length ===
                        0 ? (

                            <div className="px-6 py-12 text-center">

                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">

                                    <CalendarDays className="h-5 w-5" />

                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No maintenance scheduled
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    There are no maintenance activities on this date.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100">

                                {selectedEvents.map(
                                    (
                                        event,
                                    ) => (

                                        <div
                                            key={
                                                event.id
                                            }
                                            className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                        >

                                            <div className="flex items-start gap-3">

                                                <div
                                                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                        event.type ===
                                                        'preventive'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-amber-50 text-amber-700'
                                                    }`}
                                                >

                                                    {event.type ===
                                                    'preventive' ? (
                                                        <CalendarDays className="h-4 w-4" />
                                                    ) : (
                                                        <Wrench className="h-4 w-4" />
                                                    )}

                                                </div>


                                                <div>

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="text-sm font-bold text-slate-800">
                                                            {
                                                                event.title
                                                            }
                                                        </h3>

                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                                                                event.type ===
                                                                'preventive'
                                                                    ? preventiveStatusClass(
                                                                          event.date,
                                                                      )
                                                                    : maintenanceStatusClass(
                                                                          event.status,
                                                                      )
                                                            }`}
                                                        >
                                                            {event.status
                                                                .replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )
                                                                .replace(
                                                                    /\b\w/g,
                                                                    (
                                                                        letter,
                                                                    ) =>
                                                                        letter.toUpperCase(),
                                                                )}
                                                        </span>

                                                    </div>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            event.subtitle
                                                        }
                                                    </p>

                                                </div>

                                            </div>


                                            <Link
                                                href={
                                                    event.href
                                                }
                                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                            >

                                                <Eye className="h-3.5 w-3.5" />

                                                {event.type ===
                                                'preventive'
                                                    ? 'View PM'
                                                    : 'View Record'}

                                            </Link>

                                        </div>

                                    ),
                                )}

                            </div>

                        )}

                    </section>

                )}

            </div>

        </AppLayout>
    );
}


/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

function SummaryCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {

    return (

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                    {value}
                </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                {icon}

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| LEGEND
|--------------------------------------------------------------------------
*/

function Legend({
    label,
    className,
}: {
    label: string;
    className: string;
}) {

    return (

        <div className="flex items-center gap-2">

            <span
                className={`h-2.5 w-2.5 rounded-full ${className}`}
            />

            <span className="text-[10px] font-medium text-slate-500">
                {label}
            </span>

        </div>
    );
}