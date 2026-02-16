import { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, Mail, RefreshCw } from 'lucide-react';
import { MOCK_USERS, DEV_PASSWORD } from '../config/authConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [resendStatus, setResendStatus] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setResendStatus('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Allow login for team members (email verification not enforced for internal users)
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
            console.error(err);
        }
    };

    const handleResendVerification = async () => {
        if (!auth.currentUser) {
            setError('Please try logging in first to resend verification.');
            return;
        }

        try {
            await sendEmailVerification(auth.currentUser);
            setResendStatus('Verification email sent! Please check your inbox.');
        } catch (err) {
            setError('Error sending verification email: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-nex-black relative overflow-hidden transition-colors duration-300">
            <Helmet>
                <title>Team Login | NexLayer Web</title>
            </Helmet>

            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nex-purple/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nex-cyber/10 blur-[120px] rounded-full"></div>

            <div className="glass-card p-8 md:p-12 rounded-2xl w-full max-w-md relative z-10 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold dark:text-white mb-2">Team <span className="text-nex-purple neon-text">Login</span></h2>
                    <p className="text-gray-600 dark:text-gray-400">Access the internal dashboard.</p>
                </div>

                {error && (
                    <div className="text-center mb-4 space-y-2">
                        <p className="text-red-500 text-sm bg-red-500/10 py-2 rounded border border-red-500/20">{error}</p>
                        {error.includes('verify your email') && (
                            <button
                                onClick={handleResendVerification}
                                className="text-nex-purple text-xs flex items-center gap-1 mx-auto hover:underline"
                            >
                                <RefreshCw className="w-3 h-3" /> Resend Verification Email
                            </button>
                        )}
                    </div>
                )}

                {resendStatus && (
                    <p className="text-green-500 text-sm text-center mb-4 bg-green-500/10 py-2 rounded border border-green-500/20">
                        {resendStatus}
                    </p>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg py-3 pl-10 pr-4 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all placeholder:text-gray-400"
                                placeholder="name@nexlayer.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg py-3 pl-10 pr-4 text-black dark:text-white focus:border-nex-purple focus:ring-1 focus:ring-nex-purple focus:outline-none transition-all placeholder:text-gray-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-nex-purple text-black font-bold uppercase tracking-wider rounded-lg hover:bg-nex-purple/90 hover:shadow-[0_0_15px_#A855F7] transition-all"
                    >
                        Access Dashboard
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 text-center">
                    <p className="text-xs text-gray-500 italic">"Security is the gateway to innovation."</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
