import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    CheckCircle2,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import {
    FormEventHandler,
    useState,
} from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPassword() {
    const [password, setPassword] =
        useState('');

    const [passwordConfirmation, setPasswordConfirmation] =
        useState('');

    const [processing, setProcessing] =
        useState(false);

    const [error, setError] =
        useState('');

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit: FormEventHandler =
        async (e) => {
            e.preventDefault();

            setError('');

            /*
            |--------------------------------------------------------------------------
            | GET RESET TOKEN
            |--------------------------------------------------------------------------
            */

            const resetToken =
                sessionStorage.getItem(
                    'reset_token',
                );

            if (!resetToken) {
                setError(
                    'Your password reset session has expired. Please request a new verification code.',
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | VALIDATE PASSWORD
            |--------------------------------------------------------------------------
            */

            if (password.length < 8) {
                setError(
                    'Password must be at least 8 characters.',
                );

                return;
            }

            if (
                password !==
                passwordConfirmation
            ) {
                setError(
                    'Password confirmation does not match.',
                );

                return;
            }

            setProcessing(true);

            try {
                /*
                |--------------------------------------------------------------------------
                | RESET PASSWORD API
                |--------------------------------------------------------------------------
                */

                await axios.post(
                    '/api/forgot-password/reset',
                    {
                        reset_token:
                            resetToken,

                        password:
                            password,

                        password_confirmation:
                            passwordConfirmation,
                    },
                );

                /*
                |--------------------------------------------------------------------------
                | CLEAR RESET SESSION
                |--------------------------------------------------------------------------
                */

                sessionStorage.removeItem(
                    'reset_token',
                );

                sessionStorage.removeItem(
                    'reset_user_id',
                );

                sessionStorage.removeItem(
                    'reset_phone',
                );

                sessionStorage.removeItem(
                    'password_reset_token',
                );

                sessionStorage.removeItem(
                    'password_reset_user_id',
                );

                /*
                |--------------------------------------------------------------------------
                | GO TO LOGIN
                |--------------------------------------------------------------------------
                */

                window.location.href =
                    '/login?reset=success';

            } catch (error: any) {

                if (
                    axios.isAxiosError(
                        error,
                    )
                ) {
                    const response =
                        error.response;

                    /*
                    |--------------------------------------------------------------------------
                    | VALIDATION ERROR
                    |--------------------------------------------------------------------------
                    */

                    if (
                        response?.status ===
                        422
                    ) {
                        setError(
                            response.data
                                ?.errors
                                ?.password?.[0] ||
                                response.data
                                    ?.errors
                                    ?.password_confirmation?.[0] ||
                                response.data
                                    ?.message ||
                                'Unable to reset your password.',
                        );

                        return;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | INVALID / EXPIRED TOKEN
                    |--------------------------------------------------------------------------
                    */

                    if (
                        response?.status ===
                        401
                    ) {
                        setError(
                            'Your password reset session is invalid or has expired. Please request a new verification code.',
                        );

                        sessionStorage.removeItem(
                            'reset_token',
                        );

                        return;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | OTHER API ERROR
                    |--------------------------------------------------------------------------
                    */

                    setError(
                        response?.data
                            ?.message ||
                            'Unable to reset your password. Please try again.',
                    );

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | UNKNOWN ERROR
                |--------------------------------------------------------------------------
                */

                setError(
                    'Unable to reset your password. Please try again.',
                );

            } finally {
                setProcessing(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Reset Password | CMMS">
                <meta
                    name="description"
                    content="Create a new password for your CMMS account."
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

                                    Account
                                    <span className="block text-blue-400">
                                        Recovery
                                    </span>

                                </h2>

                                {/* DESCRIPTION */}

                                <p className="mt-4 max-w-md text-xs leading-6 text-slate-300 xl:mt-6 xl:text-sm xl:leading-7">
                                    Create a new secure password
                                    for your Computerized
                                    Maintenance Management
                                    System account.
                                </p>

                                {/* SECURITY FEATURES */}

                                <div className="mt-7 space-y-3 xl:mt-9 xl:space-y-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Secure password recovery
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <KeyRound className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Verified mobile account
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Protected municipal access
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* LEFT FOOTER */}

                            <div className="relative">

                                <div className="flex items-center gap-2 text-xs text-slate-400">

                                    <LockKeyhole className="h-4 w-4 text-emerald-400" />

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
                        {/* RIGHT PANEL */}
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

                                    <KeyRound className="h-5 w-5" />

                                </div>

                                {/* TITLE */}

                                <div className="mt-4 text-center lg:text-left">

                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-700">
                                        Account Recovery
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 xl:text-3xl">
                                        Create new password
                                    </h2>

                                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500 xl:text-sm xl:leading-6">
                                        Your mobile number has been
                                        verified. Create a new password
                                        for your CMMS account.
                                    </p>

                                </div>

                                {/* ERROR */}

                                {error && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                                        <p className="text-xs leading-5 text-red-700">
                                            {error}
                                        </p>

                                    </div>
                                )}

                                {/* FORM */}

                                <form
                                    onSubmit={submit}
                                    className="mt-5 space-y-4"
                                >

                                    {/* NEW PASSWORD */}

                                    <div>

                                        <Label
                                            htmlFor="password"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            New Password
                                        </Label>

                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            autoFocus
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            placeholder="Enter new password"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />

                                    </div>

                                    {/* CONFIRM PASSWORD */}

                                    <div>

                                        <Label
                                            htmlFor="password_confirmation"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            Confirm New Password
                                        </Label>

                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={
                                                passwordConfirmation
                                            }
                                            onChange={(e) =>
                                                setPasswordConfirmation(
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            placeholder="Confirm new password"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />

                                    </div>

                                    {/* PASSWORD REQUIREMENTS */}

                                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

                                        <div className="flex gap-3">

                                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                                            <div>

                                                <p className="text-xs font-semibold text-blue-900">
                                                    Password requirements
                                                </p>

                                                <p className="mt-0.5 text-[10px] leading-5 text-blue-700">
                                                    Use at least 8 characters
                                                    and make sure both
                                                    passwords match.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* PASSWORD STATUS */}

                                    <div className="grid grid-cols-2 gap-2">

                                        <div
                                            className={`rounded-lg border px-3 py-2 text-[10px] ${
                                                password.length >= 8
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 bg-slate-50 text-slate-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">

                                                <CheckCircle2 className="h-3.5 w-3.5" />

                                                <span>
                                                    8+ characters
                                                </span>

                                            </div>
                                        </div>

                                        <div
                                            className={`rounded-lg border px-3 py-2 text-[10px] ${
                                                password.length > 0 &&
                                                password ===
                                                    passwordConfirmation
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 bg-slate-50 text-slate-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">

                                                <CheckCircle2 className="h-3.5 w-3.5" />

                                                <span>
                                                    Passwords match
                                                </span>

                                            </div>
                                        </div>

                                    </div>

                                    {/* SUBMIT */}

                                    <Button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            password.length <
                                                8 ||
                                            password !==
                                                passwordConfirmation
                                        }
                                        className="h-11 w-full rounded-xl bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />

                                                Updating password...
                                            </>
                                        ) : (
                                            <>
                                                Set New Password
                                            </>
                                        )}

                                    </Button>

                                </form>

                                {/* BACK TO LOGIN */}

                                <div className="mt-5 border-t border-slate-100 pt-5 text-center">

                                    <TextLink
                                        href={route(
                                            'login',
                                        )}
                                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700"
                                    >

                                        <ArrowLeft className="h-3.5 w-3.5" />

                                        Back to login

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