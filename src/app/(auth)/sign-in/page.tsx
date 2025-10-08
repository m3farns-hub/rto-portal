'use client';
import { useState } from 'react';

export default function SignInPage() {
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false); const [error,setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) window.location.href = '/dashboard';
    else setError(await res.text());
    setLoading(false);
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded bg-black text-white py-2">{loading?'Signing in…':'Sign in'}</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </main>
  );
}

