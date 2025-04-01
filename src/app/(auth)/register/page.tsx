"use client";

import { useForm } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth.client";

function FieldError({ errors }: { errors: string[] }) {
  return errors.length > 0 ? (
    <p className="text-sm text-red-500 mt-1">{errors.join(", ")}</p>
  ) : null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        setServerError("");

        if (value.password !== value.confirmPassword) {
          setServerError("Passwords do not match");
          return;
        }

        await authClient.signUp
          .email({
            name: value.name,
            email: value.email,
            password: value.password,
          })
          .then((res) => {
            if (res.error?.status) {
              throw new Error(res.error.message);
            }
            router.push("/login?registered=true");
          })
          .catch((error) => {
            setServerError(
              error instanceof Error ? error.message : "Registration failed"
            );
          });
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : "Registration failed"
        );
      }
    },
  });

  useEffect(() => {
    // Check for authenticated user and redirect if found
    const checkAuth = async () => {
      try {
        // Check if there's a session token cookie to detect authentication
        const hasCookie = document.cookie.includes("reusify.session_token");
        if (hasCookie) {
          router.push("/");
          return;
        }
      } catch (error) {
        // Continue to the registration page if there's an error
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <span className="text-[10vw] text-primary text-center font-bold font-serif">
            R
          </span>
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Name is required"
                      : value.length < 2
                      ? "Name is too short"
                      : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name}>Full Name</Label>
                    <Input
                      id={field.name}
                      type="text"
                      placeholder="Enter your name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError
                      errors={
                        field.state.meta.errors?.map(
                          (error) => error?.toString() ?? ""
                        ) ?? []
                      }
                    />
                  </>
                )}
              </form.Field>
            </div>

            <div className="space-y-2">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return "Email is required";
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                      return "Invalid email format";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError
                      errors={
                        field.state.meta.errors?.map(
                          (error) => error?.toString() ?? ""
                        ) ?? []
                      }
                    />
                  </>
                )}
              </form.Field>
            </div>

            <div className="space-y-2">
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Password is required"
                      : value.length < 8
                      ? "Password must be at least 8 characters"
                      : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      type="password"
                      placeholder="Create a password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError
                      errors={
                        field.state.meta.errors?.map(
                          (error) => error?.toString() ?? ""
                        ) ?? []
                      }
                    />
                  </>
                )}
              </form.Field>
            </div>

            <div className="space-y-2">
              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Please confirm your password" : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name}>Confirm Password</Label>
                    <Input
                      id={field.name}
                      type="password"
                      placeholder="Confirm your password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError
                      errors={
                        field.state.meta.errors?.map(
                          (error) => error?.toString() ?? ""
                        ) ?? []
                      }
                    />
                  </>
                )}
              </form.Field>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              )}
            </form.Subscribe>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
