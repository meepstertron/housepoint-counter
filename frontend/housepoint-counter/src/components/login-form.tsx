import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from '../services/auth'; // Import loginUser function
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export function LoginForm({
  className,
  setToken, // Add setToken prop
  ...props
}: React.ComponentPropsWithoutRef<"form"> & { setToken: (token: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  let useGoogle = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = await loginUser({
        username: email,
        password,
        
      });
      setToken(token);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline hidden"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <GoogleLogin width={"100%"} onSuccess={async (credentialResponse) => {
          if (credentialResponse.credential) {
            let cred = jwtDecode<{ email: string; sub: string }>(credentialResponse.credential);
            useGoogle = true;
            
            if (typeof cred.sub === 'string') {
              
              const token = await loginUser({
                username: cred.email,
                password: cred.sub,
                useGoogle: useGoogle
              });
              setToken(token);
            } else {
              console.warn("Credential sub is not a string");
            }
          } else {
            console.warn("Credential is undefined");
          }
        }} onError={() => console.error("womp womp error")}/>
      </div>
      <div className="text-center text-sm">
      </div>
    </form>
  );
}
