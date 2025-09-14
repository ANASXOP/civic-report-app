import React, { useState, useEffect } from 'react';
import { MapPin, List, Map, Plus, Filter, Camera, Upload, CheckCircle, Clock, AlertCircle, X, Send, Users, Star, MessageCircle, ThumbsUp, Award, TrendingUp, Shield, Phone, Mail, LogIn, LogOut, User, Eye, EyeOff, Settings, UserCheck, FileText, BarChart3 } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:5000/api';

// API Service Class
class ApiService {
  static getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getProfile() {
    return this.request('/auth/profile');
  }

  static async getIssues(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    
    return this.request(`/issues?${params.toString()}`);
  }

  static async createIssue(formData) {
    return this.request('/issues', {
      method: 'POST',
      headers: { ...this.getAuthHeader() },
      body: formData, // FormData for file upload
    });
  }

  static async updateIssue(id, updateData) {
    return this.request(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  static async assignIssue(id, adminId) {
    return this.request(`/issues/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ adminId }),
    });
  }

  static async upvoteIssue(id) {
    return this.request(`/issues/${id}/upvote`, {
      method: 'POST',
    });
  }

  static async getAdmins() {
    return this.request('/admin/admins');
  }

  static async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  static async initializeDatabase() {
    return this.request('/init', { method: 'POST' });
  }
}

const CivicReportApp = () => {
  // Authentication & User Management
  const [currentPage, setCurrentPage] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '', showPassword: false });
  const [signupForm, setSignupForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', 
    phone: '', address: '', showPassword: false, showConfirmPassword: false
  });
  
  // App states
  const [view, setView] = useState('map');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({});
  const [userVotes, setUserVotes] = useState(new Set());
  
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priority: 'all'
  });
  
  const [newIssue, setNewIssue] = useState({
    title: '',
    category: 'Roads & Transportation',
    description: '',
    location: '',
    priority: 'Medium',
    images: []
  });

  const categories = [
    { id: 'Roads & Transportation', label: 'Roads & Transportation', color: 'bg-red-500', icon: '🛣️' },
    { id: 'Water & Sanitation', label: 'Water & Sanitation', color: 'bg-blue-500', icon: '💧' },
    { id: 'Waste Management', label: 'Waste Management', color: 'bg-green-500', icon: '🗑️' },
    { id: 'Public Utilities', label: 'Public Utilities', color: 'bg-yellow-500', icon: '💡' },
    { id: 'Environmental Issues', label: 'Environmental Issues', color: 'bg-emerald-500', icon: '🌱' },
    { id: 'Public Infrastructure', label: 'Public Infrastructure', color: 'bg-orange-500', icon: '🏗️' },
    { id: 'Public Safety', label: 'Public Safety', color: 'bg-purple-500', icon: '🚨' },
    { id: 'Health & Hygiene', label: 'Health & Hygiene', color: 'bg-pink-500', icon: '🏥' }
  ];

  const statusConfig = {
    'Open': { color: 'text-red-600 bg-red-100', icon: AlertCircle, label: 'Open' },
    'In Progress': { color: 'text-yellow-600 bg-yellow-100', icon: Clock, label: 'In Progress' },
    'Resolved': { color: 'text-green-600 bg-green-100', icon: CheckCircle, label: 'Resolved' }
  };

  const priorityConfig = {
    'Low': { color: 'text-gray-600 bg-gray-100', label: 'Low' },
    'Medium': { color: 'text-blue-600 bg-blue-100', label: 'Medium' },
    'High': { color: 'text-orange-600 bg-orange-100', label: 'High' },
    'Critical': { color: 'text-red-600 bg-red-100', label: 'Critical' }
  };

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await ApiService.getProfile();
          setUser(userData);
          setIsLoggedIn(true);
          setCurrentPage(userData.role === 'superadmin' ? 'superadmin' : 
                        userData.role === 'admin' ? 'admin' : 'citizen');
          
          // Load user's voted issues
          if (userData.votedIssues) {
            setUserVotes(new Set(userData.votedIssues));
          }
        } catch (error) {
          console.error('Authentication failed:', error);
          localStorage.removeItem('token');
          setCurrentPage('auth');
        }
      }
    };

    initApp();
  }, []);

  // Load issues when user logs in or filters change
  useEffect(() => {
    if (isLoggedIn) {
      loadIssues();
      loadStats();
      if (user?.role === 'superadmin') {
        loadAdmins();
      }
    }
  }, [isLoggedIn, filters]);

  const loadIssues = async () => {
    try {
      const data = await ApiService.getIssues(filters);
      setIssues(data);
    } catch (error) {
      setError('Failed to load issues');
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await ApiService.getAdmins();
      setAdmins(data);
    } catch (error) {
      setError('Failed to load admins');
    }
  };

  const loadStats = async () => {
    try {
      const data = await ApiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Authentication functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await ApiService.login(loginForm.email, loginForm.password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      setCurrentPage(data.user.role === 'superadmin' ? 'superadmin' : 
                    data.user.role === 'admin' ? 'admin' : 'citizen');
      setLoginForm({ email: '', password: '', showPassword: false });
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const data = await ApiService.register({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        phone: signupForm.phone,
        address: signupForm.address
      });

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      setCurrentPage('citizen');
      setSignupForm({
        name: '', email: '', password: '', confirmPassword: '', 
        phone: '', address: '', showPassword: false, showConfirmPassword: false
      });
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('auth');
    setUserVotes(new Set());
    setIssues([]);
  };

  // Issue management functions
  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', newIssue.title);
      formData.append('description', newIssue.description);
      formData.append('category', newIssue.category);
      formData.append('priority', newIssue.priority);
      formData.append('location', newIssue.location);
      
      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          formData.append('lat', position.coords.latitude);
          formData.append('lng', position.coords.longitude);
        });
      }

      // Add images
      newIssue.images.forEach((image, index) => {
        formData.append('images', image);
      });

      const data = await ApiService.createIssue(formData);
      
      // Update local state
      setIssues(prev => [data.issue, ...prev]);
      setUser(prev => ({ ...prev, points: prev.points + 10 }));
      
      setNewIssue({
        title: '',
        category: 'Roads & Transportation',
        description: '',
        location: '',
        priority: 'Medium',
        images: []
      });
      setShowReportForm(false);
      alert('Issue reported successfully! You earned 10 points.');
    } catch (error) {
      setError(error.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId) => {
    if (userVotes.has(issueId)) {
      alert('You have already voted on this issue');
      return;
    }

    try {
      const data = await ApiService.upvoteIssue(issueId);
      
      setIssues(prev => prev.map(issue => 
        issue._id === issueId 
          ? { ...issue, upvotes: data.upvotes }
          : issue
      ));
      setUserVotes(prev => new Set([...prev, issueId]));
      setUser(prev => ({ ...prev, points: prev.points + 5 }));
    } catch (error) {
      alert(error.message || 'Failed to upvote issue');
    }
  };

  // Admin functions
  const assignIssueToAdmin = async (issueId, adminId) => {
    try {
      await ApiService.assignIssue(issueId, adminId);
      loadIssues(); // Reload issues to reflect changes
      const admin = admins.find(a => a._id === adminId);
      alert(`Issue assigned to ${admin.name} (${admin.department})`);
    } catch (error) {
      alert(error.message || 'Failed to assign issue');
    }
  };

  const updateIssueStatus = async (issueId, newStatus, officerName = null) => {
    try {
      const updateData = { status: newStatus };
      if (officerName) updateData.assignedOfficer = officerName;
      
      await ApiService.updateIssue(issueId, updateData);
      loadIssues(); // Reload issues to reflect changes
    } catch (error) {
      alert(error.message || 'Failed to update issue');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewIssue(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setNewIssue(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Filter issues based on user role and current filters
  const filteredIssues = issues.filter(issue => {
    const categoryMatch = filters.category === 'all' || issue.category === filters.category;
    const statusMatch = filters.status === 'all' || issue.status === filters.status;
    const priorityMatch = filters.priority === 'all' || issue.priority === filters.priority;
    
    return categoryMatch && statusMatch && priorityMatch;
  });

  // Authentication Page Component
  const AuthPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="bg-white bg-opacity-20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <MapPin className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Civic Report System</h1>
          <p className="text-blue-100">Smart India Hackathon 2025</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMode === 'login' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMode === 'signup' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={loginForm.showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {loginForm.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                  loading 
                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Demo Accounts:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Super Admin:</strong> superadmin@civic.gov / admin123</p>
                  <p><strong>PWD Admin:</strong> admin@pwd.delhi.gov / pwd123</p>
                  <p><strong>Water Admin:</strong> admin@water.delhi.gov / water123</p>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+91-XXXXXXXXXX"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={signupForm.address}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your address"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={signupForm.showPassword ? 'text' : 'password'}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                      required
                      minLength="6"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setSignupForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {signupForm.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={signupForm.showConfirmPassword ? 'text' : 'password'}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setSignupForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {signupForm.showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                  loading 
                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // Super Admin Dashboard
  const SuperAdminDashboard = () => {
    const unassignedIssues = issues.filter(i => !i.assignedAdmin && i.status === 'Open');
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Issues</p>
                <p className="text-3xl font-bold">{stats.totalIssues || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Unassigned</p>
                <p className="text-3xl font-bold">{unassignedIssues.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Admins</p>
                <p className="text-3xl font-bold">{stats.totalAdmins || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Citizens</p>
                <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Unassigned Issues</h3>
          <div className="space-y-4">
            {unassignedIssues.map(issue => (
              <div key={issue._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                    <p className="text-sm text-gray-600">{issue.category} • {issue.location}</p>
                    <p className="text-xs text-gray-500 mt-1">Priority: {issue.priority}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select 
                      onChange={(e) => e.target.value && assignIssueToAdmin(issue._id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      defaultValue=""
                    >
                      <option value="">Assign to Admin</option>
                      {admins.map(admin => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} ({admin.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {unassignedIssues.length === 0 && (
              <p className="text-gray-500 text-center py-8">All issues have been assigned!</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Admin Dashboard
  const AdminDashboard = () => {
    const myIssues = issues.filter(i => 
      i.assignedAdmin === user._id || 
      (i.assignedAdmin === null && categories.find(c => 
        c.id === i.category && 
        (user.department === 'Public Works Department' && i.category === 'Roads & Transportation' ||
         user.department === 'Water & Sanitation' && i.category === 'Water & Sanitation')
      ))
    );
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Assigned Issues</h3>
          <div className="space-y-4">
            {myIssues.map(issue => (
              <div key={issue._id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                    <p className="text-sm text-gray-600">{issue.location}</p>
                    <p className="text-xs text-gray-500 mt-1">{issue.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[issue.priority].color}`}>
                        {issue.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        Reported by: {issue.reportedBy?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={issue.status}
                      onChange={(e) => updateIssueStatus(issue._id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    {issue.status !== 'Resolved' && (
                      <input
                        type="text"
                        placeholder="Officer name"
                        onBlur={(e) => e.target.value && updateIssueStatus(issue._id, issue.status, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {myIssues.length === 0 && (
              <p className="text-gray-500 text-center py-8">No issues assigned to your department yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Citizen Dashboard (Original Interface)
  const CitizenDashboard = () => {
    const openStatusCount = stats.openIssues || 0;
    const inProgressCount = stats.inProgressIssues || 0;
    const resolvedCount = stats.resolvedIssues || 0;

    return (
      <div className="space-y-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Open Issues</p>
                <p className="text-3xl font-bold">{openStatusCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">In Progress</p>
                <p className="text-3xl font-bold">{inProgressCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Resolved</p>
                <p className="text-3xl font-bold">{resolvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Your Points</p>
                <p className="text-3xl font-bold">{user?.points || 0}</p>
              </div>
              <Star className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${
                  view === 'map' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Map View</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${
                  view === 'list' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4" />
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {view === 'map' ? (
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="h-[600px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-100">
                {/* Road Network */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
                  <rect x="0" y="150" width="800" height="8" fill="#666" />
                  <rect x="0" y="300" width="800" height="12" fill="#666" />
                  <rect x="0" y="450" width="800" height="8" fill="#666" />
                  <rect x="150" y="0" width="8" height="600" fill="#666" />
                  <rect x="300" y="0" width="12" height="600" fill="#666" />
                  <rect x="450" y="0" width="8" height="600" fill="#666" />
                  <rect x="600" y="0" width="12" height="600" fill="#666" />
                  
                  {/* Buildings */}
                  <rect x="50" y="50" width="80" height="80" fill="#e8f4f8" stroke="#b3d9e8" strokeWidth="1" rx="4" />
                  <rect x="200" y="80" width="60" height="60" fill="#f0e8f8" stroke="#d3b8e8" strokeWidth="1" rx="4" />
                  <rect x="350" y="40" width="70" height="90" fill="#e8f8e8" stroke="#b8e8b8" strokeWidth="1" rx="4" />
                  <rect x="500" y="70" width="80" height="70" fill="#f8f0e8" stroke="#e8d3b8" strokeWidth="1" rx="4" />
                </svg>
                
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-sm font-medium text-gray-800">
                  Delhi NCR - Live Issues Map
                </div>
                
                {/* Issue Markers */}
                {filteredIssues.slice(0, 10).map((issue, index) => {
                  const positions = [
                    { left: '20%', top: '25%' }, { left: '35%', top: '40%' },
                    { left: '55%', top: '30%' }, { left: '75%', top: '20%' },
                    { left: '25%', top: '70%' }, { left: '60%', top: '75%' },
                    { left: '80%', top: '60%' }, { left: '15%', top: '55%' },
                    { left: '45%', top: '65%' }, { left: '70%', top: '45%' }
                  ];
                  
                  return (
                    <div
                      key={issue._id}
                      className={`absolute w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-125 transition-all duration-300 hover:shadow-2xl z-10 ${
                        issue.priority === 'Critical' ? 'bg-red-600 animate-pulse' :
                        issue.priority === 'High' ? 'bg-orange-500' :
                        issue.priority === 'Medium' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                      style={positions[index]}
                      title={`${issue.title} - ${issue.priority} Priority`}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      {index + 1}
                    </div>
                  );
                })}
                
                <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-xs">
                  <h4 className="font-bold text-gray-800 mb-2">Priority Legend</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="text-gray-700">Critical</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">High</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Medium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredIssues.map(issue => {
              const StatusIcon = statusConfig[issue.status].icon;
              const categoryInfo = categories.find(c => c.id === issue.category);
              return (
                <div key={issue._id} className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`p-3 rounded-xl ${categoryInfo?.color} text-white`}>
                            <span className="text-2xl">{categoryInfo?.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{issue.title}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${priorityConfig[issue.priority].color}`}>
                                {issue.priority}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                              {issue.location}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>
                              <span>👤 {issue.reportedBy?.name}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">{issue.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Assigned Officer</p>
                            <p className="text-sm font-medium text-gray-800">
                              {issue.assignedOfficer || 'Not assigned'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Timeline</p>
                            <p className="text-sm font-medium text-blue-600">{issue.timeline}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <button 
                            onClick={() => handleUpvote(issue._id)}
                            className={`flex items-center space-x-2 transition-colors ${
                              userVotes.has(issue._id) 
                                ? 'text-blue-800 bg-blue-100 px-3 py-1 rounded-full' 
                                : 'text-blue-600 hover:text-blue-700'
                            }`}
                            disabled={userVotes.has(issue._id)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {issue.upvotes} {userVotes.has(issue._id) ? 'Voted' : 'Upvotes'}
                            </span>
                          </button>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{issue.comments?.length || 0} Comments</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col items-end space-y-4">
                        {issue.images && issue.images.length > 0 && (
                          <img 
                            src={`${API_BASE_URL.replace('/api', '')}/uploads/${issue.images[0]}`} 
                            alt="Issue Evidence" 
                            className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedIssue(issue)}
                          />
                        )}
                        
                        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${statusConfig[issue.status].color} shadow-sm`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-bold">{statusConfig[issue.status].label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredIssues.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No issues found matching your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main App Component
  const MainApp = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Civic Report System
                </h1>
                <p className="text-sm text-gray-600">
                  {user?.role === 'superadmin' ? 'Super Admin Dashboard' :
                   user?.role === 'admin' ? `${user.department} Admin` :
                   'Smart India Hackathon 2025 | Team Tech Titans'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full text-white">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              
              {user?.role === 'citizen' && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full flex items-center space-x-2">
                  <Star className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{user.points} Points</span>
                </div>
              )}
              
              {user?.role === 'citizen' && (
                <button
                  onClick={() => setShowReportForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Report Issue</span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentPage === 'superadmin' && <SuperAdminDashboard />}
        {currentPage === 'admin' && <AdminDashboard />}
        {currentPage === 'citizen' && <CitizenDashboard />}
      </main>

      {/* Report Issue Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Report New Issue</h2>
                    <p className="text-sm text-gray-600">Help make your community better</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitIssue} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Title *</label>
                    <input
                      type="text"
                      value={newIssue.title}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Brief, descriptive title of the issue"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      value={newIssue.category}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={loading}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level *</label>
                    <select
                      value={newIssue.priority}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={loading}
                    >
                      <option value="Low">🔵 Low Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="High">🟠 High Priority</option>
                      <option value="Critical">🔴 Critical Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description *</label>
                  <textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 transition-colors"
                    placeholder="Provide detailed information about the issue, its impact, and any relevant context"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location Details *</label>
                  <input
                    type="text"
                    value={newIssue.location}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Specific address, landmark, or area description"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Evidence</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50">
                    {newIssue.images.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {newIssue.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={URL.createObjectURL(image)} 
                                alt="Preview" 
                                className="w-full h-24 object-cover rounded-lg" 
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="additional-upload"
                          disabled={loading}
                        />
                        <label
                          htmlFor="additional-upload"
                          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add More</span>
                        </label>
                      </div>
                    ) : (
                      <div>
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">Upload photo evidence</p>
                        <p className="text-xs text-gray-500 mb-4">Supports JPG, PNG (Max 5MB each)</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="media-upload"
                          disabled={loading}
                        />
                        <label
                          htmlFor="media-upload"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-lg transition-all duration-300 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Choose Files</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-2 py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                    <span>{loading ? 'Submitting...' : 'Submit Issue Report'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              {selectedIssue.images && selectedIssue.images.length > 0 && (
                <img 
                  src={`${API_BASE_URL.replace('/api', '')}/uploads/${selectedIssue.images[0]}`} 
                  alt="Issue" 
                  className="w-full h-64 object-cover" 
                />
              )}
              <button
                onClick={() => setSelectedIssue(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedIssue.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${priorityConfig[selectedIssue.priority].color}`}>
                      {selectedIssue.priority}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{selectedIssue.description}</p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Issue Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Location:</strong> {selectedIssue.location}</p>
                        <p><strong>Category:</strong> {selectedIssue.category}</p>
                        <p><strong>Reported:</strong> {new Date(selectedIssue.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Info</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Reporter:</strong> {selectedIssue.reportedBy?.name}</p>
                        <p><strong>Phone:</strong> {selectedIssue.reportedBy?.phone}</p>
                        <p><strong>Officer:</strong> {selectedIssue.assignedOfficer || 'Not assigned'}</p>
                        <p><strong>Timeline:</strong> {selectedIssue.timeline}</p>
                      </div>
                    </div>
                  </div>

                  {user?.role === 'citizen' && (
                    <div className="flex items-center space-x-6 pt-4 border-t">
                      <button 
                        onClick={() => handleUpvote(selectedIssue._id)}
                        className={`flex items-center space-x-2 font-medium transition-colors ${
                          userVotes.has(selectedIssue._id) 
                            ? 'text-blue-800 bg-blue-100 px-3 py-1 rounded-full' 
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                        disabled={userVotes.has(selectedIssue._id)}
                      >
                        <ThumbsUp className="h-5 w-5" />
                        <span>
                          {selectedIssue.upvotes} {userVotes.has(selectedIssue._id) ? 'Voted' : 'Support This'}
                        </span>
                      </button>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MessageCircle className="h-5 w-5" />
                        <span>{selectedIssue.comments?.length || 0} Comments</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${statusConfig[selectedIssue.status].color}`}>
                  {React.createElement(statusConfig[selectedIssue.status].icon, { className: "h-4 w-4" })}
                  <span className="text-sm font-bold">{statusConfig[selectedIssue.status].label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Smart India Hackathon 2025</h3>
            <p className="text-gray-400 mb-4">Team Tech Titans | Problem Statement: SIH25031</p>
            <div className="flex justify-center space-x-6 text-sm">
              <span>🎯 Clean & Green Technology</span>
              <span>💻 Software Category</span>
              <span>🏆 Crowdsourced Civic Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // Main render logic
  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return <MainApp />;
};

export default CivicReportApp;
