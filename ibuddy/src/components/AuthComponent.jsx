import { useState, useEffect } from 'react';
import { signInWithEmail, createUserWithEmail } from '../firebase';
import { generateRandomNickname } from '../utils/nickname';
import { createUserProfile, getUserProfile } from '../utils/userManagement';

const AuthComponent = ({ onAuthSuccess, onGuestMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;
      
      if (isLogin) {
        const result = await signInWithEmail(email, password);
        if (!result.success) throw new Error(result.error);
        userCredential = { user: result.user };
      } else {
        const result = await createUserWithEmail(email, password);
        if (!result.success) throw new Error(result.error);
        userCredential = { user: result.user };
        
        // Create user profile on signup
        const nickname = generateRandomNickname();
        await createUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          nickname: nickname,
          loginMethod: 'email'
        });
      }

      // Get user profile information
      const userProfile = await getUserProfile(userCredential.user.uid);
      
      onAuthSuccess({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        nickname: userProfile?.nickname || generateRandomNickname(),
        isAnonymous: false,
        loginMethod: 'email'
      });

    } catch (error) {
      console.error('Email auth error:', error);
      
      let errorMessage = 'An error occurred during authentication.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email not registered.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. (minimum 6 characters)';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Simulate online users count (same as ChatComponent)
  useEffect(() => {
    // Simulate random online users between 5-50
    const updateOnlineUsers = () => {
      setOnlineUsers(Math.floor(Math.random() * 46) + 5);
    };

    updateOnlineUsers(); // Initial count
    const interval = setInterval(updateOnlineUsers, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);





  return (
    <>
      <div className="auth-gate" style={{ flex: 1 }}>
        <div className="auth-container">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ 
              marginTop: '1rem',
              color: '#58a6ff',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}>ibuddy</h1>
          </div>
        
          <div className="side-section">
            {/* Email/Password Form */}
            <div style={{ marginBottom: '1rem', width: '100%' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    backgroundColor: isLogin ? '#58a6ff' : 'transparent',
                    color: isLogin ? 'white' : '#58a6ff',
                    border: '1px solid #58a6ff',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    minWidth: '80px'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    backgroundColor: !isLogin ? '#58a6ff' : 'transparent',
                    color: !isLogin ? 'white' : '#58a6ff',
                    border: '1px solid #58a6ff',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    minWidth: '80px'
                  }}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    fontSize: '1rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    fontSize: '1rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  style={{
                    backgroundColor: loading || !email || !password ? '#333' : '#58a6ff',
                    color: 'white',
                    padding: '0.8rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    width: '100%'
                  }}
                >
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
              </form>

              {error && (
                <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                  {error}
                </p>
              )}
            </div>

            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#666' }}>
              or
            </div>

            {/* SSO Buttons */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.8rem', 
              marginBottom: '1rem',
              width: '100%',
              maxWidth: '320px',
              margin: '0 auto'
            }}>
              <img src="./sso/apple.svg" alt="Apple" style={{ width: '100%', maxWidth: '320px', height: '48px', cursor: 'pointer' }} />
              <img src="./sso/google.svg" alt="Google" style={{ width: '100%', maxWidth: '320px', height: '48px', cursor: 'pointer' }} />
              <img src="./sso/fb.svg" alt="Facebook" style={{ width: '100%', maxWidth: '320px', height: '48px', cursor: 'pointer' }} />
            </div>

            {/* Demo Mode Button */}
            {onGuestMode && (
              <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <button 
                  onClick={onGuestMode}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#58a6ff',
                    padding: '0.8rem 1.2rem',
                    border: '1px solid #58a6ff',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#58a6ff';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#58a6ff';
                  }}
                >
                  Try Demo Mode
                </button>
                
                {/* Online Users Counter */}
                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    backgroundColor: '#58a6ff',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transform: 'translateY(0px)'
                  }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#00ff00', 
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }}></span>
                    {onlineUsers} online
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AuthComponent;