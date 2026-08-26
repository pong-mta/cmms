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
    useEffect,
    useRef,
    useState,
} from 'react';

export default function VerifyForgotPassword() {
    const [userId, setUserId] =
        useState<string>('');

    const [phone, setPhone] =
        useState<string>('');

    const [otp, setOtp] = useState<string[]>([
        '',
        '',
        '',
        '',
        '',
        '',
    ]);

    const [processing, setProcessing] =
        useState(false);

    const [resending, setResending] =
        useState(false);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    const [countdown, setCountdown] =
        useState(300);

    const inputs = useRef<
        Array<HTMLInputElement | null>
    >([]);

    /*
    |--------------------------------------------------------------------------
    | LOAD RECOVERY SESSION
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const params =
            new URLSearchParams(
                window.location.search,
            );

        const queryUserId =
            params.get('user_id') ||
            sessionStorage.getItem(
                'forgot_password_user_id',
            );

        const queryPhone =
            params.get('phone') ||
            sessionStorage.getItem(
                'forgot_password_phone',
            );

        const queryExpiresAt =
            params.get('otp_expires_at') ||
            sessionStorage.getItem(
                'forgot_password_otp_expires_at',
            );

        if (queryUserId) {
            setUserId(queryUserId);

            sessionStorage.setItem(
                'forgot_password_user_id',
                queryUserId,
            );
        }

        if (queryPhone) {
            setPhone(queryPhone);

            sessionStorage.setItem(
                'forgot_password_phone',
                queryPhone,
            );
        }

        if (queryExpiresAt) {
            const remaining = Math.max(
                0,
                Math.floor(
                    Number(queryExpiresAt) -
                        Date.now() / 1000,
                ),
            );

            setCountdown(
                remaining,
            );
        } else {
            /*
            |--------------------------------------------------------------------------
            | DEFAULT 5 MINUTES
            |--------------------------------------------------------------------------
            */

            const expiresAt =
                Math.floor(
                    Date.now() / 1000,
                ) + 300;

            sessionStorage.setItem(
                'forgot_password_otp_expires_at',
                String(expiresAt),
            );

            setCountdown(300);
        }

        setTimeout(() => {
            inputs.current[0]?.focus();
        }, 200);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | COUNTDOWN
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (countdown <= 0) {
            return;
        }

        const timer =
            window.setInterval(() => {
                setCountdown(
                    (value) =>
                        value > 0
                            ? value - 1
                            : 0,
                );
            }, 1000);

        return () =>
            window.clearInterval(
                timer,
            );
    }, [countdown]);

    /*
    |--------------------------------------------------------------------------
    | OTP INPUT
    |--------------------------------------------------------------------------
    */

    const handleOtpChange = (
        index: number,
        value: string,
    ) => {
        const digits =
            value.replace(
                /\D/g,
                '',
            );

        /*
        |--------------------------------------------------------------------------
        | CLEAR
        |--------------------------------------------------------------------------
        */

        if (!digits) {
            const newOtp = [...otp];

            newOtp[index] = '';

            setOtp(newOtp);
            setError('');

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | PASTE 6 DIGITS
        |--------------------------------------------------------------------------
        */

        if (digits.length > 1) {
            const pasted = digits
                .slice(0, 6)
                .split('');

            const newOtp = [
                '',
                '',
                '',
                '',
                '',
                '',
            ];

            pasted.forEach(
                (digit, i) => {
                    newOtp[i] = digit;
                },
            );

            setOtp(newOtp);
            setError('');

            const nextIndex = Math.min(
                pasted.length,
                5,
            );

            setTimeout(() => {
                inputs.current[
                    nextIndex
                ]?.focus();
            }, 50);

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | SINGLE DIGIT
        |--------------------------------------------------------------------------
        */

        const newOtp = [...otp];

        newOtp[index] =
            digits.slice(-1);

        setOtp(newOtp);
        setError('');

        if (index < 5) {
            inputs.current[
                index + 1
            ]?.focus();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | KEYBOARD
    |--------------------------------------------------------------------------
    */

    const handleKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (
            event.key === 'Backspace' &&
            !otp[index] &&
            index > 0
        ) {
            inputs.current[
                index - 1
            ]?.focus();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | VERIFY OTP
    |--------------------------------------------------------------------------
    */

    const verify = async () => {
        const code =
            otp.join('');

        setError('');
        setSuccess('');

        /*
        |--------------------------------------------------------------------------
        | VALIDATE CODE
        |--------------------------------------------------------------------------
        */

        if (code.length !== 6) {
            setError(
                'Please enter the complete 6-digit verification code.',
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATE USER
        |--------------------------------------------------------------------------
        */

        if (!userId) {
            setError(
                'Your password recovery session is invalid. Please start again.',
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK TIMER
        |--------------------------------------------------------------------------
        */

        if (countdown <= 0) {
            setError(
                'This verification code has expired. Please request a new code.',
            );

            return;
        }

        setProcessing(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | VERIFY
            |--------------------------------------------------------------------------
            */

            const response =
                await axios.post(
                    '/api/forgot-password/verify',
                    {
                        user_id:
                            Number(
                                userId,
                            ),

                        otp: code,
                    },
                );

            /*
            |--------------------------------------------------------------------------
            | GET RESET TOKEN
            |--------------------------------------------------------------------------
            */

            const resetToken =
                response.data
                    ?.reset_token;

            if (!resetToken) {
                throw new Error(
                    'Reset token was not returned by the server.',
                );
            }

            /*
            |--------------------------------------------------------------------------
            | SAVE RESET TOKEN
            |--------------------------------------------------------------------------
            */

            sessionStorage.setItem(
                'reset_token',
                resetToken,
            );

            /*
            |--------------------------------------------------------------------------
            | SAVE USER ID
            |--------------------------------------------------------------------------
            */

            sessionStorage.setItem(
                'reset_user_id',
                String(
                    response.data
                        ?.user_id ||
                        userId,
                ),
            );

            /*
            |--------------------------------------------------------------------------
            | SAVE PHONE
            |--------------------------------------------------------------------------
            */

            if (phone) {
                sessionStorage.setItem(
                    'reset_phone',
                    phone,
                );
            }

            /*
            |--------------------------------------------------------------------------
            | REMOVE OLD TOKEN KEY
            |--------------------------------------------------------------------------
            */

            sessionStorage.removeItem(
                'password_reset_token',
            );

            sessionStorage.removeItem(
                'password_reset_user_id',
            );

            /*
            |--------------------------------------------------------------------------
            | REMOVE OTP SESSION
            |--------------------------------------------------------------------------
            */

            sessionStorage.removeItem(
                'forgot_password_otp_expires_at',
            );

            sessionStorage.removeItem(
                'forgot_password_user_id',
            );

            sessionStorage.removeItem(
                'forgot_password_phone',
            );

            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            setSuccess(
                'Verification successful. Redirecting...',
            );

            /*
            |--------------------------------------------------------------------------
            | RESET PASSWORD PAGE
            |--------------------------------------------------------------------------
            */

            window.setTimeout(() => {
                window.location.href =
                    '/reset-password';
            }, 700);

        } catch (error: any) {

            /*
            |--------------------------------------------------------------------------
            | API ERROR
            |--------------------------------------------------------------------------
            */

            const message =
                error?.response?.data
                    ?.message ||
                error?.message ||
                'Invalid verification code. Please try again.';

            setError(message);

            /*
            |--------------------------------------------------------------------------
            | CLEAR INPUT
            |--------------------------------------------------------------------------
            */

            setOtp([
                '',
                '',
                '',
                '',
                '',
                '',
            ]);

            window.setTimeout(() => {
                inputs.current[0]?.focus();
            }, 100);

        } finally {
            setProcessing(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RESEND OTP
    |--------------------------------------------------------------------------
    */

    const resendOtp = async () => {
        /*
        |--------------------------------------------------------------------------
        | ONLY AFTER TIMER EXPIRES
        |--------------------------------------------------------------------------
        */

        if (
            !userId ||
            resending ||
            countdown > 0
        ) {
            return;
        }

        setResending(true);
        setError('');
        setSuccess('');

        try {
            const response =
                await axios.post(
                    '/api/forgot-password/resend',
                    {
                        user_id:
                            Number(
                                userId,
                            ),
                    },
                );

            /*
            |--------------------------------------------------------------------------
            | EXPIRATION
            |--------------------------------------------------------------------------
            */

            const expiresIn =
                Number(
                    response.data
                        ?.otp_expires_in ||
                        300,
                );

            const expiresAt =
                Number(
                    response.data
                        ?.otp_expires_at ||
                        Math.floor(
                            Date.now() /
                                1000,
                        ) +
                            expiresIn,
                );

            /*
            |--------------------------------------------------------------------------
            | SAVE EXPIRATION
            |--------------------------------------------------------------------------
            */

            sessionStorage.setItem(
                'forgot_password_otp_expires_at',
                String(expiresAt),
            );

            /*
            |--------------------------------------------------------------------------
            | RESET TIMER
            |--------------------------------------------------------------------------
            */

            setCountdown(
                expiresIn,
            );

            /*
            |--------------------------------------------------------------------------
            | CLEAR OTP
            |--------------------------------------------------------------------------
            */

            setOtp([
                '',
                '',
                '',
                '',
                '',
                '',
            ]);

            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            setSuccess(
                'A new verification code has been sent to your mobile number.',
            );

            setTimeout(() => {
                inputs.current[0]?.focus();
            }, 100);

        } catch (error: any) {
            const retryAfter =
                error?.response?.data
                    ?.retry_after;

            if (retryAfter) {
                setCountdown(
                    Number(
                        retryAfter,
                    ),
                );
            }

            setError(
                error?.response?.data
                    ?.message ||
                    'Unable to resend the verification code.',
            );

        } finally {
            setResending(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | BACK
    |--------------------------------------------------------------------------
    */

    const goBack = () => {
        /*
        |--------------------------------------------------------------------------
        | DO NOT ABUSE ACTIVE OTP
        |--------------------------------------------------------------------------
        */

        if (countdown > 0) {
            setError(
                'Your current verification code is still active. Please complete verification before starting another recovery request.',
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CLEAR SESSION
        |--------------------------------------------------------------------------
        */

        sessionStorage.removeItem(
            'forgot_password_user_id',
        );

        sessionStorage.removeItem(
            'forgot_password_phone',
        );

        sessionStorage.removeItem(
            'forgot_password_otp_expires_at',
        );

        window.location.href =
            '/forgot-password';
    };

    /*
    |--------------------------------------------------------------------------
    | TIMER
    |--------------------------------------------------------------------------
    */

    const minutes =
        Math.floor(
            countdown / 60,
        )
            .toString()
            .padStart(2, '0');

    const seconds = (
        countdown % 60
    )
        .toString()
        .padStart(2, '0');

    const formattedTime =
        `${minutes}:${seconds}`;

    /*
    |--------------------------------------------------------------------------
    | MASK PHONE
    |--------------------------------------------------------------------------
    */

    const maskedPhone = phone
        ? `${phone.slice(
              0,
              4,
          )}****${phone.slice(-3)}`
        : 'your mobile number';

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Verify Recovery Code | CMMS">
                <meta
                    name="description"
                    content="Verify your mobile number to recover your CMMS account."
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

                    <div className="grid max-h-full w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[1fr_1fr]">

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

                                <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.25em] text-blue-400 xl:mt-10 xl:text-[10px]">
                                    Municipal Operations
                                </p>

                                <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">

                                    Secure
                                    <span className="block text-blue-400">
                                        Verification
                                    </span>

                                </h2>

                                <p className="mt-4 max-w-md text-xs leading-6 text-slate-300 xl:mt-6 xl:text-sm xl:leading-7">
                                    Verify your registered mobile
                                    number before creating a new
                                    password for your CMMS account.
                                </p>

                                {/* FEATURES */}

                                <div className="mt-7 space-y-3 xl:mt-9 xl:space-y-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Secure OTP verification
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <KeyRound className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            One-time recovery code
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                        </div>

                                        <span className="text-[11px] text-slate-300 xl:text-xs">
                                            Protected account recovery
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* FOOTER */}

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
                        {/* OTP PANEL */}
                        {/* ================================================== */}

                        <section className="flex min-h-0 items-center overflow-hidden p-6 sm:p-8 lg:p-10">

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

                                <div className="flex justify-center lg:justify-start">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                                        <ShieldCheck className="h-6 w-6" />

                                    </div>

                                </div>

                                {/* TITLE */}

                                <div className="mt-4 text-center lg:text-left">

                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-700">
                                        Password Recovery
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 xl:text-3xl">
                                        Verify your mobile
                                    </h2>

                                    <p className="mt-2 text-xs leading-5 text-slate-500 xl:text-sm xl:leading-6">
                                        Enter the 6-digit verification
                                        code sent to
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {maskedPhone}
                                    </p>

                                </div>

                                {/* ERROR */}

                                {error && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">

                                        <p className="text-xs leading-5 text-red-700">
                                            {error}
                                        </p>

                                    </div>
                                )}

                                {/* SUCCESS */}

                                {success && (
                                    <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />

                                        <span className="text-xs text-emerald-700">
                                            {success}
                                        </span>

                                    </div>
                                )}

                                {/* OTP INPUTS */}

                                <div className="mt-7 flex justify-center gap-2 sm:gap-3">

                                    {otp.map(
                                        (
                                            value,
                                            index,
                                        ) => (
                                            <input
                                                key={
                                                    index
                                                }
                                                ref={(
                                                    element,
                                                ) => {
                                                    inputs.current[
                                                        index
                                                    ] =
                                                        element;
                                                }}
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete={
                                                    index ===
                                                    0
                                                        ? 'one-time-code'
                                                        : 'off'
                                                }
                                                maxLength={
                                                    1
                                                }
                                                value={
                                                    value
                                                }
                                                disabled={
                                                    processing
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    handleOtpChange(
                                                        index,
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                onKeyDown={(
                                                    event,
                                                ) =>
                                                    handleKeyDown(
                                                        index,
                                                        event,
                                                    )
                                                }
                                                className="h-12 w-10 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-12"
                                            />
                                        ),
                                    )}

                                </div>

                                {/* TIMER */}

                                <div className="mt-5 text-center">

                                    {countdown >
                                    0 ? (
                                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5">

                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                                            <p className="text-xs text-slate-500">
                                                Code expires in{' '}

                                                <span className="font-bold text-blue-700">
                                                    {
                                                        formattedTime
                                                    }
                                                </span>
                                            </p>

                                        </div>
                                    ) : (
                                        <div className="inline-flex rounded-full bg-red-50 px-4 py-1.5">

                                            <p className="text-xs font-medium text-red-600">
                                                Verification code expired.
                                            </p>

                                        </div>
                                    )}

                                </div>

                                {/* VERIFY BUTTON */}

                                <button
                                    type="button"
                                    onClick={
                                        verify
                                    }
                                    disabled={
                                        processing ||
                                        otp.join(
                                            '',
                                        ).length !==
                                            6 ||
                                        countdown <=
                                            0
                                    }
                                    className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {processing ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />

                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Verify Recovery Code
                                        </>
                                    )}

                                </button>

                                {/* RESEND */}

                                <div className="mt-5 text-center">

                                    {countdown >
                                    0 ? (
                                        <p className="text-xs leading-5 text-slate-400">
                                            Didn't receive the code?
                                            <br />
                                            You can request another
                                            code when the timer expires.
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={
                                                resendOtp
                                            }
                                            disabled={
                                                resending
                                            }
                                            className="text-xs font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-50"
                                        >

                                            {resending ? (
                                                <>
                                                    <LoaderCircle className="mr-1 inline h-3 w-3 animate-spin" />

                                                    Sending...
                                                </>
                                            ) : (
                                                'Resend verification code'
                                            )}

                                        </button>
                                    )}

                                </div>

                                {/* BACK */}

                                <div className="mt-6 border-t border-slate-100 pt-5 text-center">

                                    <button
                                        type="button"
                                        onClick={
                                            goBack
                                        }
                                        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                                    >

                                        <ArrowLeft className="h-3.5 w-3.5" />

                                        Back to password recovery

                                    </button>

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