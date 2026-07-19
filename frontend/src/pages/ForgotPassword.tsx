import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton, ClayInput, ClayAlert } from '../components/ui';
import { ArrowLeft, Send } from 'lucide-react';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset instructions have been sent to your email!");
    } catch (err: any) {
      const errorMsg = err.message || "Something went wrong. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-center items-center p-6 relative font-body">
      <button
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-text/60 hover:text-text bg-white py-2 px-4 rounded-full shadow-sm border border-slate-100"
      >
        <ArrowLeft size={14} />
        <span>Return to Login</span>
      </button>

      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1.5">
          <span className="text-3xl">🔑</span>
          <h2 className="font-heading font-extrabold text-3xl text-text">Reset Password</h2>
          <p className="text-sm text-text/60">We'll email you instructions to reset it</p>
        </div>

        {error && <ClayAlert variant="error">{error}</ClayAlert>}
        {message && <ClayAlert variant="success">{message}</ClayAlert>}

        <form onSubmit={handleSubmit}>
          <ClayCard className="flex flex-col gap-4">
            <ClayInput
              label="Email Address"
              placeholder="Your Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <ClayButton
              type="submit"
              variant="primary"
              className="flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              <Send size={16} />
              <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
            </ClayButton>
          </ClayCard>
        </form>
      </div>
    </div>
  );
};
