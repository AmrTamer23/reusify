"use client";

import { useForm } from "@tanstack/react-form";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth.client";

function FieldError({ errors }: { errors: string[] }) {
  return errors.length > 0 ? (
    <p className="text-sm text-red-500 mt-1">{errors.join(", ")}</p>
  ) : null;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string>("");
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setShowRegistrationSuccess(true);
    }
  }, [searchParams]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        setServerError("");
        await authClient.signIn
          .email({
            email: value.email,
            password: value.password,
          })
          .then((res) => {
            if (res.error?.status) {
              throw new Error(res.error.message);
            }
            router.push("/");
          })
          .catch((error) => {
            setServerError(
              error instanceof Error ? error.message : "Login failed"
            );
          });
      } catch (error) {
        setServerError(error instanceof Error ? error.message : "Login failed");
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Sign in to your account
          </CardTitle>
          <CardDescription>
            Enter your email and password to sign in
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
            {showRegistrationSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <AlertDescription className="text-green-700">
                  Account created successfully! Please sign in.
                </AlertDescription>
              </Alert>
            )}

            {serverError && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Email is required" : undefined,
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
                    !value ? "Password is required" : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      type="password"
                      placeholder="Enter your password"
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
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              )}
            </form.Subscribe>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
