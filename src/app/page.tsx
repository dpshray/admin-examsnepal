"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import TextInputField from "@/components/field/TextInputField";
import PasswordInputField from "@/components/field/PasswordInputField";
import authService from "@/service/auth.service";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
        router.push("/dashboard");
      } else {
        toast.error("Login failed: invalid credentials");
      }
    } catch (error: any) {
      toast.error(
        error?.error ||
          error?.message ||
          "Login failed: an unexpected error occurred",
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 p-4">
      <section className="w-full max-w-5xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-2xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome Back 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6">
            Sign in to manage exams, students and content on ExamsNepal.
          </p>

          <form
            onSubmit={handleSubmit(submitForm)}
            className="space-y-4"
            aria-label="Login form"
            noValidate
          >
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

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-6 select-none">
            © 2025 D.Work, Inc.
          </p>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center gap-4 bg-[#f0f2f5] dark:bg-zinc-800 p-12 text-center">
          <Image
            src="/logo.svg"
            alt="ExamsNepal logo"
            width={220}
            height={220}
            className="h-auto w-56"
            priority
          />
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
      </section>
    </main>
  );
}
