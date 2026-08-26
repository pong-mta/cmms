import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Municipality of Estancia | CMMS">
                <meta
                    name="description"
                    content="Computerized Maintenance Management System of the Municipality of Estancia, Iloilo"
                />
            </Head>

            <div className="min-h-screen bg-slate-50 text-slate-900">

                {/* Header */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

                        {/* Logo + Municipality */}
                        <div className="flex items-center gap-4">
                            <img
                                src="/images/estancia-logo.png"
                                alt="Municipality of Estancia Logo"
                                className="h-16 w-16 object-contain"
                            />

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Republic of the Philippines
                                </p>

                                <h1 className="text-lg font-bold uppercase tracking-wide text-slate-900">
                                    Municipality of Estancia
                                </h1>

                                <p className="text-sm text-slate-500">
                                    Province of Iloilo
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Log in
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <main>
                    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">

                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-10">
                            <div
                                className="h-full w-full"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px',
                                }}
                            />
                        </div>

                        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
                            <div className="grid items-center gap-14 lg:grid-cols-2">

                                {/* Left */}
                                <div>
                                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        Municipal Government of Estancia
                                    </div>

                                    <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                        Computerized
                                        <span className="block text-blue-300">
                                            Maintenance Management System
                                        </span>
                                    </h2>

                                    <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                                        A digital platform of the Municipality of
                                        Estancia, Iloilo for managing government
                                        assets, maintenance activities, work orders,
                                        equipment, vehicles, and maintenance records.
                                    </p>

                                    <div className="mt-10 flex flex-wrap gap-4">
                                        {auth.user ? (
                                            <Link
                                                href={route('dashboard')}
                                                className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-900 shadow-lg transition hover:bg-blue-50"
                                            >
                                                Go to Dashboard
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    href={route('login')}
                                                    className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-900 shadow-lg transition hover:bg-blue-50"
                                                >
                                                    Sign In
                                                </Link>

                                                <Link
                                                    href={route('register')}
                                                    className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                                                >
                                                    Create Account
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right - Logo Card */}
                                <div className="flex justify-center lg:justify-end">
                                    <div className="relative">
                                        <div className="absolute -inset-8 rounded-full bg-blue-400/20 blur-3xl" />

                                        <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/20 bg-white p-10 shadow-2xl lg:h-80 lg:w-80">
                                            <img
                                                src="/images/estancia-logo.png"
                                                alt="Municipality of Estancia"
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="bg-white py-20">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">

                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
                                    Municipal Asset Management
                                </p>

                                <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    Smarter Government Maintenance
                                </h3>

                                <p className="mt-4 text-slate-600">
                                    CMMS helps the Municipal Government of Estancia
                                    organize assets, schedule maintenance, and track
                                    maintenance activities across departments.
                                </p>
                            </div>

                            <div className="mt-14 grid gap-6 md:grid-cols-3">

                                {/* Card 1 */}
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4V5z"
                                            />
                                        </svg>
                                    </div>

                                    <h4 className="mt-5 text-lg font-bold text-slate-900">
                                        Asset Management
                                    </h4>

                                    <p className="mt-2 leading-7 text-slate-600">
                                        Maintain a centralized registry of municipal
                                        vehicles, equipment, facilities, and other
                                        government assets.
                                    </p>
                                </div>

                                {/* Card 2 */}
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>

                                    <h4 className="mt-5 text-lg font-bold text-slate-900">
                                        Preventive Maintenance
                                    </h4>

                                    <p className="mt-2 leading-7 text-slate-600">
                                        Schedule regular inspections and maintenance
                                        activities before equipment problems become
                                        costly failures.
                                    </p>
                                </div>

                                {/* Card 3 */}
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>

                                    <h4 className="mt-5 text-lg font-bold text-slate-900">
                                        Work Orders
                                    </h4>

                                    <p className="mt-2 leading-7 text-slate-600">
                                        Create, assign, monitor, and document
                                        maintenance work from request to completion.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Government Statement */}
                    <section className="bg-slate-100 py-16">
                        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">

                            <img
                                src="/images/estancia-logo.png"
                                alt="Municipality of Estancia Logo"
                                className="mx-auto h-20 w-20 object-contain"
                            />

                            <h3 className="mt-5 text-2xl font-bold text-slate-900">
                                Municipality of Estancia
                            </h3>

                            <p className="mt-1 text-slate-500">
                                Province of Iloilo
                            </p>

                            <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-600">
                                Supporting responsive, accountable, and efficient
                                municipal operations through organized asset and
                                maintenance management.
                            </p>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row lg:px-8">

                        <div className="flex items-center gap-3">
                            <img
                                src="/images/estancia-logo.png"
                                alt=""
                                className="h-9 w-9 object-contain"
                            />

                            <div>
                                <p className="font-semibold text-slate-700">
                                    Municipality of Estancia
                                </p>

                                <p>
                                    Province of Iloilo
                                </p>
                            </div>
                        </div>

                        <p>
                            © {new Date().getFullYear()} Municipal Government
                            of Estancia. All rights reserved.
                        </p>
                    </div>
                </footer>

            </div>
        </>
    );
}