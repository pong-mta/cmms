import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Building2, CheckCircle2, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    phone: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        phone: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | Keep using Laravel's WEB login route.
        | Do not change this to /api/login.
        |
        */

        post(route('login'), {
            onFinish: () => {
                reset('password');
            },
        });
    };

    return (
        <>
            <Head title="Login | CMMS">
                <meta name="description" content="Login to the Computerized Maintenance Management System of the Municipality of Estancia, Iloilo." />
            </Head>

            <div className="h-screen w-full overflow-hidden bg-slate-100">
                {/* ================================================== */}
                {/* GOVERNMENT HEADER */}
                {/* ================================================== */}

                <header className="h-[74px] border-b border-slate-200 bg-white">
                    <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-6">
                        {/* Government Branding */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                                <img src="/images/estancia-logo.png" alt="Municipality of Estancia" className="h-full w-full object-contain" />
                            </div>

                            <div>
                                <p className="text-[9px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Republic of the Philippines</p>

                                <h1 className="text-sm font-bold tracking-wide text-slate-800 uppercase sm:text-base">Municipality of Estancia</h1>

                                <p className="text-[10px] text-slate-500">Province of Iloilo</p>
                            </div>
                        </div>

                        {/* LGU Operations Branding */}
                        <div className="hidden items-center gap-3 sm:flex">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <Building2 className="h-4 w-4" />
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-800">ESTANCIA LGU</p>

                                <p className="text-[10px] text-slate-400">Municipal Operations</p>
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
                            {/* Background Decoration */}

                            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full border border-blue-400/10" />

                            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-blue-400/10" />

                            <div className="absolute top-24 right-10 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl" />

                            <div className="relative">
                                {/* Logo */}

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-2xl xl:h-20 xl:w-20">
                                    <img src="/images/estancia-logo.png" alt="Municipality of Estancia" className="h-full w-full object-contain" />
                                </div>

                                <p className="mt-7 text-[9px] font-semibold tracking-[0.25em] text-blue-400 uppercase xl:mt-10 xl:text-[10px]">
                                    Municipal Operations
                                </p>

                                <h2 className="mt-2 text-3xl leading-tight font-bold tracking-tight xl:text-4xl">
                                    Computerized
                                    <span className="block text-blue-400">Maintenance</span>
                                    <span className="block">Management</span>
                                </h2>

                                <p className="mt-4 max-w-md text-xs leading-6 text-slate-300 xl:mt-6 xl:text-sm xl:leading-7">
                                    A centralized platform for managing municipal assets, equipment, maintenance activities, work orders, and service
                                    records.
                                </p>

                                {/* Features */}

                                <div className="mt-6 space-y-3 xl:mt-8 xl:space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">Asset & Equipment Management</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">Preventive Maintenance</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">Work Order Management</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom */}

                            <div className="relative">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />

                                    <span>Secure municipal access</span>
                                </div>

                                <p className="mt-2 text-[9px] text-slate-500">Municipality of Estancia • Iloilo</p>
                            </div>
                        </section>

                        {/* ================================================== */}
                        {/* LOGIN PANEL */}
                        {/* ================================================== */}

                        <section className="flex min-h-0 items-center overflow-hidden p-6 sm:p-8 lg:p-9 xl:p-10">
                            <div className="w-full">
                                {/* Mobile Logo */}

                                <div className="mb-5 flex justify-center lg:hidden">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1 shadow-md ring-1 ring-slate-200">
                                        <img
                                            src="/images/estancia-logo.png"
                                            alt="Municipality of Estancia"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                </div>

                                {/* TITLE */}

                                <div className="mb-6 text-center lg:text-left">
                                    <div className="mb-3 flex items-center justify-center gap-2 lg:justify-start">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                            <Building2 className="h-4 w-4" />
                                        </div>

                                        <p className="text-[9px] font-bold tracking-[0.2em] text-blue-700 uppercase">CMMS Portal</p>
                                    </div>

                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>

                                    <p className="mt-1.5 text-sm text-slate-500">Sign in to your municipal account</p>
                                </div>

                                {/* STATUS */}

                                {status && (
                                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
                                        {status}
                                    </div>
                                )}

                                {/* FORM */}

                                <form onSubmit={submit} className="space-y-4">
                                    {/* PHONE */}

                                    <div>
                                        <Label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Mobile Number
                                        </Label>

                                        <Input
                                            id="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            required
                                            autoFocus
                                            autoComplete="tel"
                                            maxLength={11}
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                            disabled={processing}
                                            placeholder="09123456789"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />

                                        <InputError message={errors.phone} className="mt-1.5" />
                                    </div>

                                    {/* PASSWORD */}

                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                                                Password
                                            </Label>

                                            {canResetPassword && (
                                                <TextLink
                                                    href={route('password.request')}
                                                    className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>

                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            disabled={processing}
                                            placeholder="Enter your password"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />

                                        <InputError message={errors.password} className="mt-1.5" />
                                    </div>

                                    {/* REMEMBER */}

                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            disabled={processing}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                                        />

                                        <span className="text-xs text-slate-500">Remember me</span>
                                    </label>

                                    {/* LOGIN BUTTON */}

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="group h-11 w-full rounded-xl bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 hover:shadow-blue-700/30"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign in to CMMS
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* REGISTER */}

                                <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                                    <p className="text-xs text-slate-500">Don't have a municipal account?</p>

                                    <TextLink
                                        href={route('register')}
                                        className="mt-1.5 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800"
                                    >
                                        Create an account
                                    </TextLink>
                                </div>

                                {/* SECURITY */}

                                <div className="mt-5 flex items-center justify-center gap-2 text-[9px] tracking-[0.14em] text-slate-400 uppercase">
                                    <LockKeyhole className="h-3 w-3" />

                                    <span>Secure Municipal System</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
