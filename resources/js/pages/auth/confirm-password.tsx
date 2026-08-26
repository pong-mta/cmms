import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPassword() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        /*
        |--------------------------------------------------------------------------
        | KEEP EXISTING FUNCTIONALITY
        |--------------------------------------------------------------------------
        */

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Confirm Password | CMMS">
                <meta
                    name="description"
                    content="Confirm your password to continue accessing the Computerized Maintenance Management System."
                />
            </Head>

            <div className="h-screen w-full overflow-hidden bg-slate-100">

                {/* ================================================== */}
                {/* HEADER */}
                {/* ================================================== */}

                <header className="h-[74px] border-b border-slate-200 bg-white">

                    <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-6">

                        {/* GOVERNMENT BRANDING */}

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

                                <img
                                    src="/images/estancia-logo.png"
                                    alt="Municipality of Estancia"
                                    className="h-full w-full object-contain"
                                />

                            </div>

                            <div>

                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Republic of the Philippines
                                </p>

                                <h1 className="text-sm font-bold uppercase tracking-wide text-slate-800 sm:text-base">
                                    Municipality of Estancia
                                </h1>

                                <p className="text-[10px] text-slate-500">
                                    Province of Iloilo
                                </p>

                            </div>

                        </div>

                        {/* CMMS BRANDING */}

                        <div className="hidden items-center gap-3 sm:flex">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <Wrench className="h-4 w-4" />
                            </div>

                            <div className="text-right">

                                <p className="text-xs font-bold text-slate-800">
                                    CMMS
                                </p>

                                <p className="text-[10px] text-slate-400">
                                    Maintenance Management
                                </p>

                            </div>

                        </div>

                    </div>

                </header>

                {/* ================================================== */}
                {/* MAIN */}
                {/* ================================================== */}

                <main className="flex h-[calc(100vh-74px)] items-center justify-center overflow-hidden px-4 py-4 sm:px-6">

                    <div className="grid max-h-full w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[1.05fr_0.95fr]">

                        {/* ================================================== */}
                        {/* LEFT PANEL */}
                        {/* ================================================== */}

                        <section className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">

                            {/* DECORATION */}

                            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-blue-400/10" />

                            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-blue-400/10" />

                            <div className="absolute right-10 top-24 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl" />

                            <div className="relative">

                                {/* LOGO */}

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-2xl xl:h-20 xl:w-20">

                                    <img
                                        src="/images/estancia-logo.png"
                                        alt="Municipality of Estancia"
                                        className="h-full w-full object-contain"
                                    />

                                </div>

                                {/* LABEL */}

                                <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.25em] text-blue-400 xl:mt-10 xl:text-[10px]">
                                    Municipal Operations
                                </p>

                                {/* TITLE */}

                                <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">

                                    Protected
                                    <span className="block text-blue-400">
                                        CMMS Area
                                    </span>

                                </h2>

                                {/* DESCRIPTION */}

                                <p className="mt-4 max-w-md text-xs leading-6 text-slate-300 xl:mt-6 xl:text-sm xl:leading-7">
                                    You're accessing a protected area
                                    of the Municipality of Estancia's
                                    Computerized Maintenance Management
                                    System.
                                </p>

                                {/* SECURITY FEATURES */}

                                <div className="mt-7 space-y-3 xl:mt-9 xl:space-y-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Protected municipal data
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <LockKeyhole className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Password verification required
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Secure system access
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* LEFT FOOTER */}

                            <div className="relative">

                                <div className="flex items-center gap-2 text-xs text-slate-400">

                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />

                                    <span>
                                        Secure municipal access
                                    </span>

                                </div>

                                <p className="mt-2 text-[9px] text-slate-500">
                                    Municipality of Estancia • Iloilo
                                </p>

                            </div>

                        </section>

                        {/* ================================================== */}
                        {/* FORM PANEL */}
                        {/* ================================================== */}

                        <section className="flex min-h-0 items-center overflow-hidden p-6 sm:p-8 lg:p-9 xl:p-10">

                            <div className="w-full">

                                {/* MOBILE LOGO */}

                                <div className="mb-5 flex justify-center lg:hidden">

                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1 shadow-md ring-1 ring-slate-200">

                                        <img
                                            src="/images/estancia-logo.png"
                                            alt="Municipality of Estancia"
                                            className="h-full w-full object-contain"
                                        />

                                    </div>

                                </div>

                                {/* ICON */}

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                    <LockKeyhole className="h-5 w-5" />

                                </div>

                                {/* TITLE */}

                                <div className="mt-4 text-center lg:text-left">

                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-700">
                                        Security Verification
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 xl:text-3xl">
                                        Confirm your password
                                    </h2>

                                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500 xl:text-sm xl:leading-6">
                                        This is a secure area of the
                                        application. Please confirm
                                        your password before continuing.
                                    </p>

                                </div>

                                {/* FORM */}

                                <form
                                    onSubmit={submit}
                                    className="mt-5 space-y-4"
                                >

                                    {/* PASSWORD */}

                                    <div>

                                        <Label
                                            htmlFor="password"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            Password
                                        </Label>

                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            value={data.password}
                                            autoFocus
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />

                                        <InputError
                                            message={
                                                errors.password
                                            }
                                            className="mt-1.5"
                                        />

                                    </div>

                                    {/* SECURITY NOTICE */}

                                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

                                        <div className="flex gap-3">

                                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                                            <div>

                                                <p className="text-xs font-semibold text-blue-900">
                                                    Secure confirmation
                                                </p>

                                                <p className="mt-0.5 text-[10px] leading-5 text-blue-700">
                                                    Your password is required
                                                    to access this protected
                                                    area of CMMS.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* BUTTON */}

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-11 w-full rounded-xl bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                                    >

                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            <>
                                                Confirm Password
                                            </>
                                        )}

                                    </Button>

                                </form>

                                {/* BACK */}

                                <div className="mt-6 border-t border-slate-100 pt-5 text-center">

                                    <TextLink
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />

                                        Back to dashboard
                                    </TextLink>

                                </div>

                                {/* FOOTER */}

                                <div className="mt-5 text-center">

                                    <p className="text-[8px] uppercase tracking-[0.16em] text-slate-400">
                                        Computerized Maintenance
                                        Management System
                                    </p>

                                    <p className="mt-1 text-[9px] text-slate-400">
                                        Municipality of Estancia • Iloilo
                                    </p>

                                </div>

                            </div>

                        </section>

                    </div>

                </main>

            </div>
        </>
    );
}