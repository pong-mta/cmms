import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowRight,
    CheckCircle2,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import {
    FormEventHandler,
    useEffect,
    useState,
} from 'react';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({
    status,
}: ForgotPasswordProps) {
    const [phone, setPhone] = useState('');

    const [processing, setProcessing] =
        useState(false);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    /*
    |--------------------------------------------------------------------------
    | EXISTING RECOVERY SESSION
    |--------------------------------------------------------------------------
    */

    const [existingSession, setExistingSession] =
        useState(false);

    const [existingUserId, setExistingUserId] =
        useState('');

    const [existingPhone, setExistingPhone] =
        useState('');

    const [existingExpiresAt, setExistingExpiresAt] =
        useState<number | null>(null);

    const [existingSecondsLeft, setExistingSecondsLeft] =
        useState(0);

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING SESSION
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const storedUserId =
            sessionStorage.getItem(
                'forgot_password_user_id',
            );

        const storedPhone =
            sessionStorage.getItem(
                'forgot_password_phone',
            );

        const storedExpiresAt =
            sessionStorage.getItem(
                'forgot_password_otp_expires_at',
            );

        if (
            storedUserId &&
            storedPhone &&
            storedExpiresAt
        ) {
            const expiresAt =
                Number(storedExpiresAt);

            const remaining = Math.max(
                0,
                Math.floor(
                    expiresAt -
                        Date.now() / 1000,
                ),
            );

            /*
            |--------------------------------------------------------------------------
            | EXISTING ACTIVE SESSION
            |--------------------------------------------------------------------------
            */

            if (remaining > 0) {
                setExistingSession(true);

                setExistingUserId(
                    storedUserId,
                );

                setExistingPhone(
                    storedPhone,
                );

                setExistingExpiresAt(
                    expiresAt,
                );

                setExistingSecondsLeft(
                    remaining,
                );

                setPhone(
                    storedPhone,
                );
            }
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | EXISTING SESSION TIMER
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !existingSession ||
            !existingExpiresAt
        ) {
            return;
        }

        const timer =
            window.setInterval(() => {
                const remaining =
                    Math.max(
                        0,
                        Math.floor(
                            existingExpiresAt -
                                Date.now() /
                                    1000,
                        ),
                    );

                setExistingSecondsLeft(
                    remaining,
                );

                /*
                |--------------------------------------------------------------------------
                | SESSION EXPIRED
                |--------------------------------------------------------------------------
                */

                if (remaining <= 0) {
                    setExistingSession(
                        false,
                    );

                    setExistingUserId(
                        '',
                    );

                    setExistingPhone(
                        '',
                    );

                    setExistingExpiresAt(
                        null,
                    );

                    sessionStorage.removeItem(
                        'forgot_password_user_id',
                    );

                    sessionStorage.removeItem(
                        'forgot_password_phone',
                    );

                    sessionStorage.removeItem(
                        'forgot_password_otp_expires_at',
                    );
                }
            }, 1000);

        return () =>
            window.clearInterval(
                timer,
            );
    }, [
        existingSession,
        existingExpiresAt,
    ]);

    /*
    |--------------------------------------------------------------------------
    | FORMAT EXISTING TIMER
    |--------------------------------------------------------------------------
    */

    const existingMinutes =
        Math.floor(
            existingSecondsLeft /
                60,
        )
            .toString()
            .padStart(2, '0');

    const existingSeconds = (
        existingSecondsLeft %
        60
    )
        .toString()
        .padStart(2, '0');

    /*
    |--------------------------------------------------------------------------
    | PHONE FORMAT
    |--------------------------------------------------------------------------
    */

    const handlePhoneChange = (
        value: string,
    ) => {
        const cleaned = value
            .replace(/\D/g, '')
            .slice(0, 11);

        setPhone(cleaned);

        setError('');
        setSuccess('');
    };

    /*
    |--------------------------------------------------------------------------
    | GO TO EXISTING VERIFICATION
    |--------------------------------------------------------------------------
    */

    const continueToVerification = () => {
        if (!existingUserId) {
            return;
        }

        const targetPhone =
            existingPhone || phone;

        window.location.href =
            `/forgot-password/verify?user_id=${encodeURIComponent(
                existingUserId,
            )}&phone=${encodeURIComponent(
                targetPhone,
            )}`;
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit: FormEventHandler =
        async (event) => {
            event.preventDefault();

            setError('');
            setSuccess('');

            /*
            |--------------------------------------------------------------------------
            | VALIDATE PHONE
            |--------------------------------------------------------------------------
            */

            if (
                !/^09[0-9]{9}$/.test(
                    phone,
                )
            ) {
                setError(
                    'Mobile number must be exactly 11 digits and start with 09.',
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | EXISTING ACTIVE SESSION
            |--------------------------------------------------------------------------
            |
            | Don't make another API request.
            |
            */

            if (
                existingSession &&
                existingUserId
            ) {
                continueToVerification();

                return;
            }

            setProcessing(true);

            try {
                const response =
                    await axios.post(
                        '/api/forgot-password',
                        {
                            phone,
                        },
                    );

                /*
                |--------------------------------------------------------------------------
                | RESPONSE DATA
                |--------------------------------------------------------------------------
                */

                const userId =
                    response.data
                        ?.user_id;

                const responsePhone =
                    response.data
                        ?.phone ||
                    phone;

                const expiresAt =
                    response.data
                        ?.otp_expires_at;

                /*
                |--------------------------------------------------------------------------
                | SAVE SESSION
                |--------------------------------------------------------------------------
                */

                if (userId) {
                    sessionStorage.setItem(
                        'forgot_password_user_id',
                        String(userId),
                    );
                }

                sessionStorage.setItem(
                    'forgot_password_phone',
                    responsePhone,
                );

                if (expiresAt) {
                    sessionStorage.setItem(
                        'forgot_password_otp_expires_at',
                        String(
                            expiresAt,
                        ),
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | GO TO VERIFICATION
                |--------------------------------------------------------------------------
                */

                if (userId) {
                    window.location.href =
                        `/forgot-password/verify?user_id=${encodeURIComponent(
                            String(
                                userId,
                            ),
                        )}&phone=${encodeURIComponent(
                            responsePhone,
                        )}`;

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | GENERIC RESPONSE
                |--------------------------------------------------------------------------
                */

                setSuccess(
                    response.data
                        ?.message ||
                        'If the mobile number is registered, a verification code has been sent.',
                );
            } catch (error: any) {
                const response =
                    error?.response;

                /*
                |--------------------------------------------------------------------------
                | ACTIVE RECOVERY SESSION
                |--------------------------------------------------------------------------
                |
                | Backend returns 429 when an OTP already exists.
                |
                */

                if (
                    response?.status ===
                        429 &&
                    response.data
                        ?.user_id
                ) {
                    const userId =
                        String(
                            response
                                .data
                                .user_id,
                        );

                    const responsePhone =
                        response
                            .data
                            ?.phone ||
                        phone;

                    const expiresAt =
                        response
                            .data
                            ?.otp_expires_at;

                    /*
                    |--------------------------------------------------------------------------
                    | SAVE EXISTING SESSION
                    |--------------------------------------------------------------------------
                    */

                    sessionStorage.setItem(
                        'forgot_password_user_id',
                        userId,
                    );

                    sessionStorage.setItem(
                        'forgot_password_phone',
                        responsePhone,
                    );

                    if (
                        expiresAt
                    ) {
                        sessionStorage.setItem(
                            'forgot_password_otp_expires_at',
                            String(
                                expiresAt,
                            ),
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | UPDATE UI
                    |--------------------------------------------------------------------------
                    */

                    setExistingSession(
                        true,
                    );

                    setExistingUserId(
                        userId,
                    );

                    setExistingPhone(
                        responsePhone,
                    );

                    if (
                        expiresAt
                    ) {
                        const remaining =
                            Math.max(
                                0,
                                Math.floor(
                                    Number(
                                        expiresAt,
                                    ) -
                                        Date.now() /
                                            1000,
                                ),
                            );

                        setExistingExpiresAt(
                            Number(
                                expiresAt,
                            ),
                        );

                        setExistingSecondsLeft(
                            remaining,
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | IMPORTANT
                    |--------------------------------------------------------------------------
                    |
                    | Don't show duplicate red messages.
                    | Show ONE message and let the user
                    | continue to the existing OTP.
                    |
                    */

                    setError('');

                    setSuccess(
                        'A password recovery request is already active. Please use the current verification code.',
                    );

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | VALIDATION ERROR
                |--------------------------------------------------------------------------
                */

                if (
                    response?.status ===
                    422
                ) {
                    const message =
                        response
                            .data
                            ?.message;

                    setError(
                        message ||
                            'Please check your mobile number.',
                    );

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | TOO MANY REQUESTS
                |--------------------------------------------------------------------------
                */

                if (
                    response?.status ===
                    429
                ) {
                    setError(
                        response
                            .data
                            ?.message ||
                            'Too many requests. Please try again later.',
                    );

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | SERVER ERROR
                |--------------------------------------------------------------------------
                */

                setError(
                    response
                        ?.data
                        ?.message ||
                        'Unable to process your request. Please try again.',
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
            <Head title="Forgot Password | CMMS">
                <meta
                    name="description"
                    content="Recover your CMMS account password using your registered mobile number."
                />
            </Head>

            <div className="h-screen w-full overflow-hidden bg-slate-100">

                {/* ================================================== */}
                {/* HEADER */}
                {/* ================================================== */}

                <header className="h-[74px] border-b border-slate-200 bg-white">

                    <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-6">

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

                        {/* CMMS Branding */}

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

                            {/* Decorative Circles */}

                            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-blue-400/10" />

                            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-blue-400/10" />

                            <div className="absolute right-10 top-24 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl" />

                            <div className="relative">

                                {/* Logo */}

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-2xl xl:h-20 xl:w-20">

                                    <img
                                        src="/images/estancia-logo.png"
                                        alt="Municipality of Estancia"
                                        className="h-full w-full object-contain"
                                    />

                                </div>

                                <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.25em] text-blue-400 xl:mt-10 xl:text-[10px]">
                                    Municipal Operations
                                </p>

                                <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">

                                    Account
                                    <span className="block text-blue-400">
                                        Recovery
                                    </span>

                                </h2>

                                <p className="mt-4 max-w-md text-xs leading-6 text-slate-300 xl:mt-6 xl:text-sm xl:leading-7">
                                    Recover access to your
                                    Computerized Maintenance
                                    Management System account
                                    using your registered mobile
                                    number.
                                </p>

                                {/* FEATURES */}

                                <div className="mt-7 space-y-3 xl:mt-9 xl:space-y-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Secure account recovery
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <KeyRound className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            One-time verification code
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Registered mobile verification
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* Bottom */}

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

                                {/* Icon */}

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                    <KeyRound className="h-5 w-5" />

                                </div>

                                {/* TITLE */}

                                <div className="mt-4">

                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-700">
                                        CMMS Account Recovery
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 xl:text-3xl">
                                        Forgot your password?
                                    </h2>

                                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500 xl:text-sm xl:leading-6">
                                        Enter your registered mobile
                                        number and we'll send you a
                                        verification code.
                                    </p>

                                </div>

                                {/* SUCCESS */}

                                {success && (
                                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

                                        <div className="flex items-start gap-3">

                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                                            <p className="text-xs leading-5 text-emerald-700">
                                                {success}
                                            </p>

                                        </div>

                                    </div>
                                )}

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
                                    className="mt-5"
                                >

                                    {/* PHONE */}

                                    <div>

                                        <label
                                            htmlFor="phone"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            Registered Mobile Number
                                        </label>

                                        <input
                                            id="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            maxLength={11}
                                            autoFocus
                                            value={phone}
                                            disabled={processing}
                                            onChange={(event) =>
                                                handlePhoneChange(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="09XXXXXXXXX"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                                        />

                                    </div>

                                    {/* SECURITY */}

                                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

                                        <div className="flex gap-3">

                                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                                            <div>

                                                <p className="text-xs font-semibold text-blue-900">
                                                    Secure verification
                                                </p>

                                                <p className="mt-0.5 text-[10px] leading-5 text-blue-600">
                                                    A one-time verification
                                                    code will be sent to
                                                    your registered mobile
                                                    number.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* BUTTON */}

                                    {existingSession ? (

                                        <button
                                            type="button"
                                            onClick={
                                                continueToVerification
                                            }
                                            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                                        >

                                            Continue to verification

                                            <ArrowRight className="h-4 w-4" />

                                        </button>

                                    ) : (

                                        <button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                phone.length !== 11
                                            }
                                            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            {processing ? (
                                                <>
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />

                                                    Sending verification code...
                                                </>
                                            ) : (
                                                <>
                                                    Continue

                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}

                                        </button>

                                    )}

                                </form>

                                {/* ACTIVE OTP */}

                                {existingSession &&
                                    existingSecondsLeft >
                                        0 && (

                                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">

                                        <p className="text-[10px] text-slate-400">
                                            Current verification code
                                            expires in
                                        </p>

                                        <p className="mt-1 text-sm font-bold tabular-nums text-blue-700">
                                            {existingMinutes}
                                            :
                                            {existingSeconds}
                                        </p>

                                    </div>

                                )}

                                {/* BACK TO LOGIN */}

                                <div className="mt-5 border-t border-slate-100 pt-4 text-center">

                                    <a
                                        href="/login"
                                        className="text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
                                    >
                                        ← Back to login
                                    </a>

                                </div>

                                {/* FOOTER */}

                                <p className="mt-4 text-center text-[8px] uppercase tracking-[0.18em] text-slate-300">
                                    Municipal Government of Estancia
                                </p>

                            </div>

                        </section>

                    </div>

                </main>

            </div>
        </>
    );
}