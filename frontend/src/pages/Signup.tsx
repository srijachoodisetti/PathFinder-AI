import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput, ClaySelect, ClayAlert } from '../components/ui';
import { UserPlus, ArrowLeft } from 'lucide-react';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Role conditional fields
  const [grade, setGrade] = useState('Grade 6');
  const [specialization, setSpecialization] = useState('Mathematics');
  const [childEmail, setChildEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    const payload: any = {
      email,
      password,
      full_name: fullName,
      role
    };

    if (role === 'student') {
      payload.grade = grade;
    } else if (role === 'teacher') {
      payload.subject_specialization = specialization;
      payload.classes_managed = grade; // use selected grade as default managed
    } else if (role === 'parent') {
      payload.child_email = childEmail;
    }

    try {
      await signup(payload);
      setSuccessMsg("Registration successful! Redirecting to login page...");
      setTimeout(() => {
        clearError();
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Store updates error
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher / Educator' },
    { value: 'parent', label: 'Parent / Guardian' }
  ];

  const gradeOptions = [
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 6', label: 'Grade 6' },
    { value: 'Grade 7', label: 'Grade 7' },
    { value: 'Grade 8', label: 'Grade 8' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-center items-center p-6 relative font-body">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-text/60 hover:text-text bg-white py-2 px-4 rounded-full shadow-sm border border-slate-100"
      >
        <ArrowLeft size={14} />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1.5">
          <span className="text-3xl">🌱</span>
          <h2 className="font-heading font-extrabold text-3xl text-text">Start Learning!</h2>
          <p className="text-sm text-text/60">Create your PathFinder AI account in 1 minute</p>
        </div>

        {error && <ClayAlert variant="error">{error}</ClayAlert>}
        {successMsg && <ClayAlert variant="success">{successMsg}</ClayAlert>}

        <form onSubmit={handleSubmit}>
          <ClayCard className="flex flex-col gap-4">
            <ClayInput
              label="Full Name"
              placeholder="e.g. Rajesh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <ClayInput
              label="Email Address"
              placeholder="e.g. name@domain.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <ClayInput
              label="Password"
              placeholder="Choose a password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <ClaySelect
              label="Choose Your Role"
              options={roleOptions}
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
            />

            {/* Conditional Fields based on Role selection */}
            {role === 'student' && (
              <ClaySelect
                label="Select Class / Grade"
                options={gradeOptions}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            )}

            {role === 'teacher' && (
              <>
                <ClayInput
                  label="Subject Specialization"
                  placeholder="e.g. Mathematics, Science"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />
                <ClaySelect
                  label="Primary Grade Managed"
                  options={gradeOptions}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </>
            )}

            {role === 'parent' && (
              <ClayInput
                label="Child's Email Address"
                placeholder="Enter child's email to sync dashboard"
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                required
              />
            )}

            <ClayButton
              type="submit"
              variant="primary"
              className="flex items-center justify-center gap-2 mt-2"
              disabled={isLoading}
            >
              <UserPlus size={16} />
              <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
            </ClayButton>
          </ClayCard>
        </form>

        <div className="text-center text-xs font-semibold">
          <span className="text-text/50">Already have an account? </span>
          <button onClick={() => navigate('/login')} className="text-primary hover:underline font-bold">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
