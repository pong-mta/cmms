import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Building2,
    CheckCircle2,
    ChevronDown,
    LoaderCircle,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Department {
    id: number;
    name: string;
    code: string;
}

interface RegisterForm {
    name: string;
    phone: string;
    department_id: string;
    password: string;
    password_confirmation: string;
}

interface ApiErrors {
    name?: string;
    phone?: string;
    department_id?: string;
    password?: string;
    password_confirmation?: string;
}

export default function Register() {
    const [data, setData] = useState<RegisterForm>({
        name: '',
        phone: '',
        department_id: '',
        password: '',
        password_confirmation: '',
    });

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<ApiErrors>({});
    const [generalError, setGeneralError] = useState('');

    /*
    |--------------------------------------------------------------------------
    | LOAD DEPARTMENTS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await axios.get('/api/departments');

                setDepartments(response.data);
            } catch (error) {
                console.error(
                    'Failed to load departments:',
                    error,
                );

                setGeneralError(
                    'Unable to load departments. Please refresh the page.',
                );
            } finally {
                setLoadingDepartments(false);
            }
        };

        loadDepartments();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | REGISTER
    |--------------------------------------------------------------------------
    */

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        setProcessing(true);
        setErrors({});
        setGeneralError('');

        try {
            const response = await axios.post('/api/register', {
                name: data.name,
                phone: data.phone,
                department_id: Number(data.department_id),
                password: data.password,
                password_confirmation:
                    data.password_confirmation,
            });

            const userId = response.data.user_id;
            const phone = response.data.phone;

            sessionStorage.setItem(
                'otp_user_id',
                String(userId),
            );

            sessionStorage.setItem(
                'otp_phone',
                phone,
            );

            window.location.href =
                `/verify-otp?user_id=${userId}&phone=${encodeURIComponent(phone)}`;

        } catch (error: any) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 422
            ) {
                const validationErrors =
                    error.response.data.errors;

                if (validationErrors) {
                    setErrors({
                        name:
                            validationErrors.name?.[0],
                        phone:
                            validationErrors.phone?.[0],
                        department_id:
                            validationErrors.department_id?.[0],
                        password:
                            validationErrors.password?.[0],
                        password_confirmation:
                            validationErrors
                                .password_confirmation?.[0],
                    });
                } else {
                    setGeneralError(
                        error.response.data.message ||
                            'Please check your information.',
                    );
                }

                return;
            }

            if (
                axios.isAxiosError(error) &&
                error.response?.data?.message
            ) {
                setGeneralError(
                    error.response.data.message,
                );

                return;
            }

            setGeneralError(
                'Something went wrong. Please try again.',
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title="Create Account | CMMS">
                <meta
                    name="description"
                    content="Create an account for the Computerized Maintenance Management System of the Municipality of Estancia, Iloilo."
                />
            </Head>

            <div className="min-h-screen bg-slate-100">

                {/* ================================================== */}
                {/* HEADER */}
                {/* ================================================== */}

                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-6">

                        {/* Government Branding */}
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

                        {/* CMMS Label */}
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

                <main className="px-4 py-8 sm:px-6 lg:py-12">

                    <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[0.9fr_1.1fr]">

                        {/* ================================================== */}
                        {/* LEFT INFORMATION PANEL */}
                        {/* ================================================== */}

                        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">

                            {/* Background Shapes */}
                            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-blue-400/10" />

                            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-blue-400/10" />

                            <div className="absolute right-10 top-24 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl" />

                            <div className="relative">

                                {/* Logo */}
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-2xl">
                                    <img
                                        src="/images/estancia-logo.png"
                                        alt="Municipality of Estancia"
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-400">
                                    Municipal Operations
                                </p>

                                <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight">
                                    Computerized
                                    <span className="block text-blue-400">
                                        Maintenance
                                    </span>
                                    <span className="block">
                                        Management
                                    </span>
                                </h2>

                                <p className="mt-6 max-w-sm text-sm leading-7 text-slate-300">
                                    A centralized platform for managing
                                    municipal assets, equipment,
                                    maintenance activities, work orders,
                                    and service records.
                                </p>

                                {/* Features */}
                                <div className="mt-10 space-y-4">

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-xs text-slate-300">
                                            Asset & Equipment Management
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-xs text-slate-300">
                                            Preventive Maintenance
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-xs text-slate-300">
                                            Work Order Management
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* Bottom */}
                            <div className="relative mt-12">

                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />

                                    <span>
                                        Secure municipal access
                                    </span>
                                </div>

                                <p className="mt-3 text-[10px] text-slate-500">
                                    Municipality of Estancia • Iloilo
                                </p>

                            </div>

                        </section>

                        {/* ================================================== */}
                        {/* RIGHT REGISTER FORM */}
                        {/* ================================================== */}

                        <section className="p-6 sm:p-8 lg:p-10">

                            {/* Form Header */}
                            <div className="mb-7">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                        <Building2 className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                                            CMMS Account
                                        </p>

                                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                            Create Account
                                        </h2>
                                    </div>

                                </div>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Register your municipal account to
                                    access the maintenance management
                                    system.
                                </p>

                                <div className="mt-6 h-px bg-slate-100" />
                            </div>

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                            >

                                {/* ERROR */}

                                {generalError && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                                        <span>
                                            {generalError}
                                        </span>
                                    </div>
                                )}

                                {/* NAME */}

                                <div>
                                    <Label
                                        htmlFor="name"
                                        className="mb-2 block text-xs font-semibold text-slate-700"
                                    >
                                        Full Name
                                    </Label>

                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                name: e.target.value,
                                            })
                                        }
                                        disabled={processing}
                                        placeholder="Juan Dela Cruz"
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />

                                    <InputError
                                        message={errors.name}
                                    />
                                </div>

                                {/* PHONE */}

                                <div>
                                    <Label
                                        htmlFor="phone"
                                        className="mb-2 block text-xs font-semibold text-slate-700"
                                    >
                                        Mobile Number
                                    </Label>

                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        autoComplete="tel"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                phone: e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            })
                                        }
                                        disabled={processing}
                                        placeholder="09123456789"
                                        maxLength={11}
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />

                                    <InputError
                                        message={errors.phone}
                                    />
                                </div>

                                {/* DEPARTMENT */}

                                <div>
                                    <Label
                                        htmlFor="department_id"
                                        className="mb-2 block text-xs font-semibold text-slate-700"
                                    >
                                        Department / Office
                                    </Label>

                                    <div className="relative">

                                        <select
                                            id="department_id"
                                            required
                                            value={data.department_id}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    department_id:
                                                        e.target.value,
                                                })
                                            }
                                            disabled={
                                                processing ||
                                                loadingDepartments
                                            }
                                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <option value="">
                                                {loadingDepartments
                                                    ? 'Loading departments...'
                                                    : 'Select department / office'}
                                            </option>

                                            {departments.map(
                                                (department) => (
                                                    <option
                                                        key={
                                                            department.id
                                                        }
                                                        value={
                                                            department.id
                                                        }
                                                    >
                                                        {
                                                            department.name
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    </div>

                                    <InputError
                                        message={
                                            errors.department_id
                                        }
                                    />
                                </div>

                                {/* PASSWORDS */}

                                <div className="grid gap-4 sm:grid-cols-2">

                                    <div>
                                        <Label
                                            htmlFor="password"
                                            className="mb-2 block text-xs font-semibold text-slate-700"
                                        >
                                            Password
                                        </Label>

                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    password:
                                                        e.target.value,
                                                })
                                            }
                                            disabled={processing}
                                            placeholder="••••••••"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />

                                        <InputError
                                            message={
                                                errors.password
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="mb-2 block text-xs font-semibold text-slate-700"
                                        >
                                            Confirm Password
                                        </Label>

                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={
                                                data.password_confirmation
                                            }
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    password_confirmation:
                                                        e.target.value,
                                                })
                                            }
                                            disabled={processing}
                                            placeholder="••••••••"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                        />

                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                </div>

                                {/* OTP NOTICE */}

                                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-blue-900">
                                            Mobile verification required
                                        </p>

                                        <p className="mt-0.5 text-[11px] leading-5 text-blue-700">
                                            Your mobile number will be
                                            verified through OTP after
                                            registration.
                                        </p>
                                    </div>

                                </div>

                                {/* BUTTON */}

                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        loadingDepartments ||
                                        departments.length === 0
                                    }
                                    className="h-11 w-full rounded-xl bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 hover:shadow-blue-700/30"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create CMMS Account'
                                    )}
                                </Button>

                            </form>

                            {/* LOGIN */}

                            <div className="mt-7 text-center text-sm text-slate-500">

                                Already have an account?{' '}

                                <TextLink
                                    href={route('login')}
                                    className="font-semibold text-blue-700 hover:text-blue-800"
                                >
                                    Sign in
                                </TextLink>

                            </div>

                            {/* Footer Info */}

                            <div className="mt-8 border-t border-slate-100 pt-5 text-center">
                                <p className="text-[10px] leading-5 text-slate-400">
                                    Computerized Maintenance Management System
                                    <br />
                                    Municipality of Estancia, Iloilo
                                </p>
                            </div>

                        </section>

                    </div>

                </main>

                {/* Bottom Footer */}

                <footer className="border-t border-slate-200 bg-white py-4 text-center">
                    <p className="text-[10px] text-slate-400">
                        © {new Date().getFullYear()} Municipal Government of
                        Estancia, Iloilo • CMMS
                    </p>
                </footer>

            </div>
        </>
    );
}