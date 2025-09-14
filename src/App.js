import React, { useState, useEffect } from 'react';
import { MapPin, List, Map, Plus, Filter, Camera, Upload, CheckCircle, Clock, AlertCircle, X, Send, Users, Star, MessageCircle, ThumbsUp, Award, TrendingUp, Shield, Phone, Mail, LogIn, LogOut, User } from 'lucide-react';

const CivicReport = () => {
  const [view, setView] = useState('map');
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userPoints, setUserPoints] = useState(150);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userVotes, setUserVotes] = useState(new Set());
  
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: 'Large pothole causing accidents',
      category: 'Roads & Transportation',
      status: 'Open',
      location: 'Sector 15, Dwarka',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      reportedBy: 'Rahul Sharma',
      reporterContact: '+91-9876543210',
      reporterAddress: '123 Main Street, Dwarka',
      description: 'Deep pothole causing traffic issues and vehicle damage. Multiple accidents reported.',
      date: '2024-09-12',
      distance: '0.3 km',
      upvotes: 15,
      comments: 8,
      priority: 'High',
      assignedOfficer: 'PWD Officer - Amit Kumar',
      timeline: '5-7 days'
    },
    {
      id: 2,
      title: 'Water pipe burst flooding street',
      category: 'Water & Sanitation',
      status: 'In Progress',
      location: 'Block A, Janakpuri',
      coordinates: { lat: 28.6219, lng: 77.1990 },
      image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=300&h=200&fit=crop',
      reportedBy: 'Priya Gupta',
      reporterContact: '+91-9876543211',
      reporterAddress: '456 Block A, Janakpuri',
      description: 'Major water pipe burst causing street flooding and water wastage',
      date: '2024-09-10',
      distance: '0.7 km',
      upvotes: 23,
      comments: 12,
      priority: 'Critical',
      assignedOfficer: 'Water Dept - Sunita Rani',
      timeline: '2-3 days'
    },
    {
      id: 3,
      title: 'Illegal garbage dumping site',
      category: 'Waste Management',
      status: 'Resolved',
      location: 'Market Road, Uttam Nagar',
      coordinates: { lat: 28.6019, lng: 77.1890 },
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&h=200&fit=crop',
      reportedBy: 'Amit Kumar',
      reporterContact: '+91-9876543212',
      reporterAddress: '789 Market Road, Uttam Nagar',
      description: 'Large illegal garbage dumping affecting local environment and health',
      date: '2024-09-08',
      distance: '0.9 km',
      upvotes: 31,
      comments: 15,
      priority: 'Medium',
      assignedOfficer: 'Sanitation Dept - Raj Patel',
      timeline: 'Completed'
    },
    {
      id: 4,
      title: 'Multiple street lights not working',
      category: 'Public Utilities',
      status: 'Open',
      location: 'Green Park Extension',
      coordinates: { lat: 28.6259, lng: 77.2190 },
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
      reportedBy: 'Sunita Devi',
      reporterContact: '+91-9876543213',
      reporterAddress: '321 Green Park Extension',
      description: 'Entire street section without lighting, creating safety concerns for residents',
      date: '2024-09-13',
      distance: '0.5 km',
      upvotes: 18,
      comments: 6,
      priority: 'High',
      assignedOfficer: 'Electrical Dept - Mohan Singh',
      timeline: '3-4 days'
    },
    {
      id: 5,
      title: 'Air pollution from illegal burning',
      category: 'Environmental Issues',
      status: 'In Progress',
      location: 'Industrial Area Phase 1',
      coordinates: { lat: 28.6339, lng: 77.1990 },
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=300&h=200&fit=crop',
      reportedBy: 'Dr. Vikash Agarwal',
      reporterContact: '+91-9876543214',
      reporterAddress: '654 Industrial Area Phase 1',
      description: 'Illegal waste burning causing severe air pollution and health hazards',
      date: '2024-09-11',
      distance: '0.6 km',
      upvotes: 42,
      comments: 20,
      priority: 'Critical',
      assignedOfficer: 'Environmental Officer - Neha Sharma',
      timeline: '1-2 days'
    },
    {
      id: 6,
      title: 'Bus stop shelter damaged',
      category: 'Public Infrastructure',
      status: 'Open',
      location: 'Ring Road, Lajpat Nagar',
      coordinates: { lat: 28.5665, lng: 77.2433 },
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop',
      reportedBy: 'Meera Jain',
      reporterContact: '+91-9876543215',
      reporterAddress: '890 Ring Road, Lajpat Nagar',
      description: 'Bus shelter roof collapsed, benches broken, unsafe for commuters',
      date: '2024-09-14',
      distance: '1.2 km',
      upvotes: 9,
      comments: 3,
      priority: 'Medium',
      assignedOfficer: 'Public Works - Ravi Gupta',
      timeline: '7-10 days'
    },
    {
      id: 7,
      title: 'Stray dog menace in residential area',
      category: 'Public Safety',
      status: 'Open',
      location: 'Vasant Kunj Sector C',
      coordinates: { lat: 28.5245, lng: 77.1575 },
      image: 'https://images.unsplash.com/photo-1552053849-ac61327b8de8?w=300&h=200&fit=crop',
      reportedBy: 'Kiran Patel',
      reporterContact: '+91-9876543216',
      reporterAddress: '234 Vasant Kunj Sector C',
      description: 'Aggressive stray dogs threatening children and elderly residents',
      date: '2024-09-13',
      distance: '0.8 km',
      upvotes: 28,
      comments: 14,
      priority: 'High',
      assignedOfficer: 'Animal Control - Sanjay Kumar',
      timeline: '2-3 days'
    }
  ]);
  
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
    reporterName: '',
    reporterContact: '',
    reporterAddress: '',
    image: null,
    voiceNote: null,
    priority: 'Medium'
  });

  const categories = [
    { id: 'Roads & Transportation', label: 'Roads & Transportation', color: 'bg-red-500', icon: '🛣️' },
    { id: 'Water & Sanitation', label: 'Water & Sanitation', color: 'bg-blue-500', icon: '💧' },
    { id: 'Waste Management', label: 'Waste Management', color: 'bg-green-500', icon: '🗑️' },
    { id: 'Public Utilities', label: 'Public Utilities', color: 'bg-yellow-500', icon: '💡' },
    { id: 'Environmental Issues', label: 'Environmental Issues', color: 'bg-emerald-500', icon: '🌱' },
    { id: 'Public Infrastructure', label: 'Public Infrastructure', color: 'bg-orange-500', icon: '🏗️' },
    { id: 'Public Safety', label: 'Public Safety', color: 'bg-purple-500', icon: '🚨' },
    { id: 'Health & Hygiene', label: 'Health & Hygiene', color: 'bg-pink-500', icon: '🏥' },
    { id: 'Traffic & Parking', label: 'Traffic & Parking', color: 'bg-indigo-500', icon: '🚦' },
    { id: 'Noise Pollution', label: 'Noise Pollution', color: 'bg-cyan-500', icon: '🔇' }
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  const filteredIssues = issues.filter(issue => {
    return (filters.category === 'all' || issue.category === filters.category) &&
           (filters.status === 'all' || issue.status === filters.status) &&
           (filters.priority === 'all' || issue.priority === filters.priority);
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewIssue(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleLogin = () => {
    // Simulated Google login
    const userData = {
      id: 'google_123456',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    };
    setUser(userData);
    setIsLoggedIn(true);
    alert('Successfully logged in with Google!');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setUserVotes(new Set());
  };

  const handleUpvote = (issueId) => {
    if (!isLoggedIn) {
      alert('Please login to vote on issues');
      return;
    }
    
    if (userVotes.has(issueId)) {
      alert('You have already voted on this issue');
      return;
    }

    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, upvotes: issue.upvotes + 1 }
        : issue
    ));
    setUserVotes(prev => new Set([...prev, issueId]));
    setUserPoints(prev => prev + 5);
  };

  const handleSubmitIssue = (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Please login to report an issue');
      return;
    }
    
    if (!newIssue.title || !newIssue.description || !newIssue.location || !newIssue.reporterName || !newIssue.reporterContact) {
      alert('Please fill all required fields');
      return;
    }

    const issue = {
      id: issues.length + 1,
      title: newIssue.title,
      category: newIssue.category,
      status: 'Open',
      location: newIssue.location,
      coordinates: { lat: userLocation.lat + (Math.random() - 0.5) * 0.01, lng: userLocation.lng + (Math.random() - 0.5) * 0.01 },
      image: newIssue.image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      reportedBy: newIssue.reporterName,
      reporterContact: newIssue.reporterContact,
      reporterAddress: newIssue.reporterAddress,
      description: newIssue.description,
      date: new Date().toISOString().split('T')[0],
      distance: '0.1 km',
      upvotes: 1,
      comments: 0,
      priority: newIssue.priority,
      assignedOfficer: 'To be assigned',
      timeline: 'Under review'
    };

    setIssues(prev => [issue, ...prev]);
    setUserPoints(prev => prev + 10);
    setNewIssue({
      title: '',
      category: 'Roads & Transportation',
      description: '',
      location: '',
      reporterName: '',
      reporterContact: '',
      reporterAddress: '',
      image: null,
      voiceNote: null,
      priority: 'Medium'
    });
    setShowReportForm(false);
    alert('Issue reported successfully! You earned 10 points.');
  };

  const openStatusCount = issues.filter(i => i.status === 'Open').length;
  const inProgressCount = issues.filter(i => i.status === 'In Progress').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header */}
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
                <p className="text-sm text-gray-600">Smart India Hackathon 2025 | Team Tech Titans</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Authentication */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={user?.picture} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full border-2 border-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="bg-white border border-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded"></div>
                  <span className="text-sm font-medium">Login with Google</span>
                </button>
              )}
              
              {/* User Points */}
              {isLoggedIn && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full flex items-center space-x-2">
                  <Star className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{userPoints} Points</span>
                </div>
              )}
              
              <div className="bg-green-100 px-4 py-2 rounded-full flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{issues.length} Issues Tracked</span>
              </div>
              
              <button
                onClick={() => setShowReportForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Report Issue</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Stats Dashboard */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                  <p className="text-purple-100 text-sm">Active Citizens</p>
                  <p className="text-3xl font-bold">1,247</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Enhanced Filters */}
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

          <div className="mt-3 text-sm text-gray-600 flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Showing {filteredIssues.length} verified issues within 1km radius</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'map' ? (
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="h-[600px] relative overflow-hidden">
              {/* Enhanced Map with Street-like Design */}
              <div className="absolute inset-0 bg-gray-100">
                {/* Road Network */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
                  {/* Horizontal Roads */}
                  <rect x="0" y="150" width="800" height="8" fill="#666" />
                  <rect x="0" y="300" width="800" height="12" fill="#666" />
                  <rect x="0" y="450" width="800" height="8" fill="#666" />
                  
                  {/* Vertical Roads */}
                  <rect x="150" y="0" width="8" height="600" fill="#666" />
                  <rect x="300" y="0" width="12" height="600" fill="#666" />
                  <rect x="450" y="0" width="8" height="600" fill="#666" />
                  <rect x="600" y="0" width="12" height="600" fill="#666" />
                  
                  {/* Road Markings */}
                  <rect x="0" y="304" width="800" height="4" fill="#fff" strokeDasharray="20,10" stroke="#fff" strokeWidth="1" />
                  <rect x="604" y="0" width="4" height="600" fill="#fff" strokeDasharray="20,10" stroke="#fff" strokeWidth="1" />
                  
                  {/* Buildings/Areas */}
                  <rect x="50" y="50" width="80" height="80" fill="#e8f4f8" stroke="#b3d9e8" strokeWidth="1" rx="4" />
                  <rect x="200" y="80" width="60" height="60" fill="#f0e8f8" stroke="#d3b8e8" strokeWidth="1" rx="4" />
                  <rect x="350" y="40" width="70" height="90" fill="#e8f8e8" stroke="#b8e8b8" strokeWidth="1" rx="4" />
                  <rect x="500" y="70" width="80" height="70" fill="#f8f0e8" stroke="#e8d3b8" strokeWidth="1" rx="4" />
                  
                  <rect x="60" y="380" width="90" height="60" fill="#f8e8e8" stroke="#e8b8b8" strokeWidth="1" rx="4" />
                  <rect x="320" y="360" width="80" height="80" fill="#e8f4f8" stroke="#b3d9e8" strokeWidth="1" rx="4" />
                  <rect x="520" y="390" width="70" height="70" fill="#f0e8f8" stroke="#d3b8e8" strokeWidth="1" rx="4" />
                </svg>
                
                {/* Area Labels */}
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-sm font-medium text-gray-800">
                  Delhi NCR - Civic Issues Map
                </div>
                
                {/* Enhanced Issue Markers */}
                {filteredIssues.slice(0, 7).map((issue, index) => {
                  const positions = [
                    { left: '20%', top: '25%' },
                    { left: '35%', top: '40%' },
                    { left: '55%', top: '30%' },
                    { left: '75%', top: '20%' },
                    { left: '25%', top: '70%' },
                    { left: '60%', top: '75%' },
                    { left: '80%', top: '60%' }
                  ];
                  
                  return (
                    <div
                      key={issue.id}
                      className={`absolute w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-125 transition-all duration-300 hover:shadow-2xl z-10 ${
                        issue.priority === 'Critical' ? 'bg-red-600 animate-pulse' :
                        issue.priority === 'High' ? 'bg-orange-500' :
                        issue.priority === 'Medium' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                      style={positions[index]}
                      title={`${issue.title} - ${issue.priority} Priority`}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      {issue.id}
                    </div>
                  );
                })}
                
                {/* Map Legend */}
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
                <div key={issue.id} className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 overflow-hidden">
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
                              {issue.location} • {issue.distance} away
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📅 {issue.date}</span>
                              <span>👤 {issue.reportedBy}</span>
                              <span>📞 {issue.reporterContact}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">{issue.description}</p>
                        
                        {/* Enhanced Issue Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Assigned Officer</p>
                            <p className="text-sm font-medium text-gray-800">{issue.assignedOfficer}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Timeline</p>
                            <p className="text-sm font-medium text-blue-600">{issue.timeline}</p>
                          </div>
                        </div>

                        {/* Engagement Actions */}
                        <div className="flex items-center space-x-6">
                          <button 
                            onClick={() => handleUpvote(issue.id)}
                            className={`flex items-center space-x-2 transition-colors ${
                              userVotes.has(issue.id) 
                                ? 'text-blue-800 bg-blue-100 px-3 py-1 rounded-full' 
                                : 'text-blue-600 hover:text-blue-700'
                            }`}
                            disabled={userVotes.has(issue.id)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {issue.upvotes} {userVotes.has(issue.id) ? 'Voted' : 'Upvotes'}
                            </span>
                          </button>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">{issue.comments} Comments</span>
                          </div>
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
                            Follow Updates
                          </button>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col items-end space-y-4">
                        {issue.image && (
                          <img 
                            src={issue.image} 
                            alt="Issue Evidence" 
                            className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedIssue(issue)}
                          />
                        )}
                        
                        <div className={`px-4 py-2 rounded-full flex items-center space-x-2 ${statusConfig[issue.status].color} shadow-sm`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-bold">{statusConfig[issue.status].label}</span>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-lg text-xs font-medium text-white ${categoryInfo?.color} shadow-sm`}>
                          {issue.category}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Enhanced Report Issue Modal */}
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

              {!isLoggedIn && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-yellow-800 text-sm">Please login with Google to report an issue.</p>
                </div>
              )}

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
                      disabled={!isLoggedIn}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      value={newIssue.category}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={!isLoggedIn}
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
                      disabled={!isLoggedIn}
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
                    disabled={!isLoggedIn}
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
                    disabled={!isLoggedIn}
                  />
                  <p className="text-xs text-gray-500 mt-1">📍 GPS coordinates will be automatically captured</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={newIssue.reporterName}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, reporterName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Full name"
                      required
                      disabled={!isLoggedIn}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      value={newIssue.reporterContact}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, reporterContact: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+91-XXXXXXXXXX"
                      required
                      disabled={!isLoggedIn}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Address</label>
                  <input
                    type="text"
                    value={newIssue.reporterAddress}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, reporterAddress: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Your residential address (optional)"
                    disabled={!isLoggedIn}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Evidence</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50">
                    {newIssue.image ? (
                      <div className="space-y-4">
                        <img src={newIssue.image} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
                        <div className="flex space-x-3 justify-center">
                          <button
                            type="button"
                            onClick={() => setNewIssue(prev => ({ ...prev, image: null }))}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">Upload photo/video evidence</p>
                        <p className="text-xs text-gray-500 mb-4">Supports JPG, PNG, MP4 (Max 10MB)</p>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="media-upload"
                          disabled={!isLoggedIn}
                        />
                        <label
                          htmlFor="media-upload"
                          className={`${
                            isLoggedIn 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer hover:from-blue-700 hover:to-indigo-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          } px-6 py-3 rounded-lg transition-all duration-300 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl`}
                        >
                          <Upload className="h-4 w-4" />
                          <span>Choose File</span>
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
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isLoggedIn}
                    className={`flex-2 py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl ${
                      isLoggedIn
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                    <span>Submit Issue Report</span>
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
              {selectedIssue.image && (
                <img src={selectedIssue.image} alt="Issue" className="w-full h-64 object-cover" />
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
                        <p><strong>Reported:</strong> {selectedIssue.date}</p>
                        <p><strong>Distance:</strong> {selectedIssue.distance}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Info</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Reporter:</strong> {selectedIssue.reportedBy}</p>
                        <p><strong>Phone:</strong> {selectedIssue.reporterContact}</p>
                        <p><strong>Officer:</strong> {selectedIssue.assignedOfficer}</p>
                        <p><strong>Timeline:</strong> {selectedIssue.timeline}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 pt-4 border-t">
                    <button 
                      onClick={() => handleUpvote(selectedIssue.id)}
                      className={`flex items-center space-x-2 font-medium transition-colors ${
                        userVotes.has(selectedIssue.id) 
                          ? 'text-blue-800 bg-blue-100 px-3 py-1 rounded-full' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                      disabled={userVotes.has(selectedIssue.id)}
                    >
                      <ThumbsUp className="h-5 w-5" />
                      <span>
                        {selectedIssue.upvotes} {userVotes.has(selectedIssue.id) ? 'Voted' : 'Support This'}
                      </span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MessageCircle className="h-5 w-5" />
                      <span>{selectedIssue.comments} Comments</span>
                    </div>
                    <button className="text-green-600 hover:text-green-700 font-medium">
                      Follow Updates
                    </button>
                  </div>
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
};

export default CivicReport;