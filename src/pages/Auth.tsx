import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useSupabaseAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const title = useMemo(() => (mode === "signin" ? "Log in" : "Create your account"), [mode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate("/", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) return setError(error.message);
    navigate("/", { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>{mode === "signin" ? "Login" : "Sign up"} — Community Garden</title>
        <meta name="description" content="Log in or sign up to manage your garden. Admins can clear the garden." />
        <link rel="canonical" href="/auth" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : mode === "signin" ? "Log in" : "Create account"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                {mode === "signin" ? (
                  <>
                    <span>Don’t have an account? </span>
                    <button className="underline" onClick={() => setMode("signup")}>Sign up</button>
                  </>
                ) : (
                  <>
                    <span>Already have an account? </span>
                    <button className="underline" onClick={() => setMode("signin")}>Log in</button>
                  </>
                )}
              </div>

              <div className="mt-6 text-center">
                <Link to="/" className="underline">Back to garden</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Auth;
