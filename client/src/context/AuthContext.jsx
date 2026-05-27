import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load session from sessionStorage on mount
  useEffect(() => {
    try {
      const sessionData = sessionStorage.getItem('auth_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session && session.isAuthenticated && session.token && session.user) {
          setIsAuthenticated(true);
          setToken(session.token);
          
          // Reconstruct user object with compatibility fields
          const baseUser = session.user;
          const compatibleUser = {
            ...baseUser,
            _id: baseUser.userId,
            name: `${baseUser.firstName} ${baseUser.lastName}`,
            profile: baseUser.profileData,
          };
          setUser(compatibleUser);
        }
      }
    } catch (err) {
      console.error('Error loading session from sessionStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update sessionStorage session when auth state changes
  const saveSession = (newToken, newUser) => {
    if (newToken && newUser) {
      const sessionObj = {
        isAuthenticated: true,
        token: newToken,
        user: {
          userId: newUser.userId || newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          profileData: newUser.profileData || newUser.profile || {},
        }
      };
      sessionStorage.setItem('auth_session', JSON.stringify(sessionObj));
      
      // Also write back mock_user_session for compatibility
      const compatibleUser = {
        ...sessionObj.user,
        _id: sessionObj.user.userId,
        name: `${sessionObj.user.firstName} ${sessionObj.user.lastName}`,
        profile: sessionObj.user.profileData,
      };
      
      sessionStorage.setItem('mock_user_session', JSON.stringify(compatibleUser));
      setIsAuthenticated(true);
      setToken(newToken);
      setUser(compatibleUser);
    }
  };

  // Mock sign-in logic check matching roles
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate small delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Retrieve mock user database from localStorage
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const matched = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (matched) {
        // Build user profile structure
        const firstName = matched.firstName || matched.name?.split(' ')[0] || 'User';
        const lastName = matched.lastName || matched.name?.split(' ').slice(1).join(' ') || '';
        
        const userObj = {
          userId: matched._id || matched.userId,
          firstName,
          lastName,
          email: matched.email,
          role: matched.role,
          profileData: matched.profile || matched.profileData || {},
        };

        const fakeToken = 'mock_jwt_token_' + userObj.userId;
        saveSession(fakeToken, userObj);
        return userObj;
      } else {
        throw new Error('User not found with these credentials in the registry.');
      }
    } catch (err) {
      console.error('Login simulation failed:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Onboard new user
  const signup = async (userData) => {
    setLoading(true);
    try {
      // Retrieve or init mock database
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('An account with this email address already exists.');
      }

      // Generate a mock unique ID
      const newUserId = 'u_' + Math.random().toString(36).substring(2, 11);
      
      // Create user record for storage
      const storeUser = {
        _id: newUserId,
        userId: newUserId,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        profile: userData.profileData,
        profileData: userData.profileData,
        verificationHash: userData.verificationHash,
        createdAt: new Date().toISOString(),
      };

      // Push to simulation DB
      mockUsers.push(storeUser);
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));

      // Save state and serialize session
      saveSession(userData.token, storeUser);
      return storeUser;
    } catch (err) {
      console.error('Signup simulation failed:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout Action
  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('auth_session');
    sessionStorage.removeItem('mock_user_session');
    sessionStorage.setItem('logged_out', 'true');
    
    // Redirect to public homepage
    navigate('/');
  };

  // Direct state updates for context compatibility
  const updateUserData = (updatedUser) => {
    if (updatedUser) {
      const formatted = {
        ...updatedUser,
        userId: updatedUser.userId || updatedUser._id,
        firstName: updatedUser.firstName || updatedUser.name?.split(' ')[0] || '',
        lastName: updatedUser.lastName || updatedUser.name?.split(' ').slice(1).join(' ') || '',
        profileData: updatedUser.profileData || updatedUser.profile || {},
        _id: updatedUser.userId || updatedUser._id,
        name: updatedUser.name || `${updatedUser.firstName} ${updatedUser.lastName}`,
        profile: updatedUser.profileData || updatedUser.profile || {},
      };
      
      const sessionObj = {
        isAuthenticated: true,
        token: token,
        user: {
          userId: formatted.userId,
          firstName: formatted.firstName,
          lastName: formatted.lastName,
          email: formatted.email,
          role: formatted.role,
          profileData: formatted.profileData,
        }
      };
      sessionStorage.setItem('auth_session', JSON.stringify(sessionObj));
      sessionStorage.setItem('mock_user_session', JSON.stringify(formatted));
      setUser(formatted);
    }
  };

  const value = {
    isAuthenticated,
    token,
    user,
    setUser: updateUserData,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
