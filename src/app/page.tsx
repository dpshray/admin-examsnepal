"use client";

import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {toast} from "sonner";
import {CircleArrowLeft} from "lucide-react";
import * as yup from "yup";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import TextInputField from "@/components/field/TextInputField";
import PasswordInputField from "@/components/field/PasswordInputField";
import authService from "@/service/auth.service";

interface LoginFormData {
    email: string;
    password: string;
}

const LoginSchema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string().required("Password is required"),
});

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginFormData>({
        resolver: yupResolver(LoginSchema),
    });

    const router = useRouter();

    const submitForm = async (data: LoginFormData) => {
        try {
            const response = await authService.login(data);

            if (response?.token) {
                localStorage.setItem("_at", response?.token);
                toast.success("Login successful");
                router.push("/exam");
            } else {
                toast.error("Login failed: invalid credentials");
            }
        } catch {
            toast.error("Login failed: an unexpected error occurred");
        }
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 p-4">
            <section
                className="w-full max-w-5xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-2xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Button asChild variant="ghost" className="w-fit text-muted-foreground mb-6 px-0">
                        <Link href="/public" className="flex items-center gap-2 text-sm" aria-label="Go back home">
                            <CircleArrowLeft size={16}/>
                            Home
                        </Link>
                    </Button>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back 👋</h1>
                    <p className="text-sm md:text-base text-muted-foreground mb-6">
                        Sign in to connect, collaborate, and grow with the HireInfluencer platform.
                    </p>

                    <form onSubmit={handleSubmit(submitForm)} className="space-y-4" aria-label="Login form" noValidate>
                        <TextInputField
                            label="Email"
                            placeholder="Enter your email"
                            error={errors.email?.message}
                            type="email"
                            autoComplete="email"
                            {...register("email")}
                        />

                        <PasswordInputField
                            label="Password"
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            autoComplete="current-password"
                            {...register("password")}
                        />

                        <div className="text-right text-sm">
                            <Link href="/forgot-password" className="text-blue-500 hover:underline"
                                  aria-label="Forgot password">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            className={cn("w-full")}
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <p className="text-sm text-center text-muted-foreground mt-6">
                        Don’t have an account?{" "}
                        <Link href="/register" className="text-blue-500 hover:underline"
                              aria-label="Sign up for an account">
                            Sign up
                        </Link>
                    </p>

                    <p className="text-xs text-center text-gray-400 mt-6 leading-relaxed select-none">
                        © 2025 D.Work, Inc. •{" "}
                        <a href="#" className="underline" tabIndex={-1} aria-disabled="true">Terms</a> •{" "}
                        <a href="#" className="underline" tabIndex={-1} aria-disabled="true">Cookies</a> •{" "}
                        <a href="#" className="underline" tabIndex={-1} aria-disabled="true">Accessibility</a> •{" "}
                        <a href="#" className="underline" tabIndex={-1} aria-disabled="true">Privacy</a>
                    </p>
                </div>

                <div className="hidden md:flex items-center justify-center bg-[#f0f2f5] dark:bg-zinc-800">
                    <Image
                        src="/images/influencer.jpg"
                        alt="Login illustration"
                        width={500}
                        height={500}
                        className="object-cover w-full h-full"
                        priority
                        loading="eager"
                    />
                </div>
            </section>
        </main>
    );
}
