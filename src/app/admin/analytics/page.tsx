'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  FileText, 
  DollarSign,
  Activity,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

// Chart colors
const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'];

interface AnalyticsData {
  userBehavior: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    retentionRate: number;
    avgSessionDuration: number;
    pageViews: number;
  };
  packagePerformance: {
    totalSales: number;
    revenue: number;
    conversionRate: number;
    packages: Array<{
      name: string;
      sales: number;
      revenue: number;
      conversionRate: number;
    }>;
  };
  auditTrends: {
    totalAudits: number;
    completedAudits: number;
    averageScore: number;
    monthlyTrends: Array<{
      month: string;
      audits: number;
      avgScore: number;
      revenue: number;
    }>;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    arpu: number; // Average Revenue Per User
  };
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Analytics data fetch error:', error);
      // Mock data for development
      setAnalyticsData({
        userBehavior: {
          totalUsers: 1247,
          activeUsers: 892,
          newUsers: 156,
          retentionRate: 68.5,
          avgSessionDuration: 847, // seconds
          pageViews: 15623
        },
        packagePerformance: {
          totalSales: 189,
          revenue: 47250,
          conversionRate: 12.8,
          packages: [
            { name: 'Basic Audit', sales: 78, revenue: 15600, conversionRate: 15.2 },
            { name: 'Advanced Audit', sales: 64, revenue: 19200, conversionRate: 11.8 },
            { name: 'Premium Audit', sales: 31, revenue: 9300, conversionRate: 8.9 },
            { name: 'Enterprise Audit', sales: 16, revenue: 3200, conversionRate: 6.4 }
          ]
        },
        auditTrends: {
          totalAudits: 342,
          completedAudits: 298,
          averageScore: 78.6,
          monthlyTrends: [
            { month: 'Jan', audits: 45, avgScore: 75.2, revenue: 8900 },
            { month: 'Feb', audits: 52, avgScore: 76.8, revenue: 10400 },
            { month: 'Mar', audits: 48, avgScore: 78.1, revenue: 9600 },
            { month: 'Apr', audits: 61, avgScore: 79.3, revenue: 12200 },
            { month: 'May', audits: 58, avgScore: 80.2, revenue: 11600 },
            { month: 'Jun', audits: 78, avgScore: 81.5, revenue: 15600 }
          ]
        },
        revenueMetrics: {
          totalRevenue: 47250,
          monthlyRevenue: 15600,
          revenueGrowth: 18.7,
          arpu: 52.8
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Export analytics data as CSV/PDF
    const csvContent = generateCSVReport(analyticsData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = (data: AnalyticsData | null) => {
    if (!data) return '';
    
    return `Analytics Report - ${new Date().toLocaleDateString()}

USER BEHAVIOR METRICS
Total Users,${data.userBehavior.totalUsers}
Active Users,${data.userBehavior.activeUsers}
New Users,${data.userBehavior.newUsers}
Retention Rate,${data.userBehavior.retentionRate}%
Avg Session Duration,${Math.floor(data.userBehavior.avgSessionDuration / 60)} minutes
Page Views,${data.userBehavior.pageViews}

PACKAGE PERFORMANCE
Total Sales,${data.packagePerformance.totalSales}
Total Revenue,$${data.packagePerformance.revenue}
Conversion Rate,${data.packagePerformance.conversionRate}%

AUDIT TRENDS
Total Audits,${data.auditTrends.totalAudits}
Completed Audits,${data.auditTrends.completedAudits}
Average Score,${data.auditTrends.averageScore}

REVENUE METRICS
Total Revenue,$${data.revenueMetrics.totalRevenue}
Monthly Revenue,$${data.revenueMetrics.monthlyRevenue}
Revenue Growth,${data.revenueMetrics.revenueGrowth}%
ARPU,$${data.revenueMetrics.arpu}
`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive business intelligence and performance metrics</p>
          </div>
          
          <div className="flex gap-4">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            
            <button 
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'packages', label: 'Packages', icon: ShoppingCart },
            { id: 'audits', label: 'Audits', icon: FileText },
            { id: 'revenue', label: 'Revenue', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.userBehavior.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12.5% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${analyticsData.revenueMetrics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+{analyticsData.revenueMetrics.revenueGrowth}% growth</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Audits</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.auditTrends.totalAudits}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600 ml-1">{((analyticsData.auditTrends.completedAudits / analyticsData.auditTrends.totalAudits) * 100).toFixed(1)}% completion rate</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{analyticsData.packagePerformance.conversionRate}%</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600">Average across all packages</span>
                </div>
              </div>
            </div>

            {/* Revenue & Audit Trends Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.auditTrends.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Audits'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Sales Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.packagePerformance.packages}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="sales"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.packagePerformance.packages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Additional tabs would be implemented here */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Behavior Analytics</h3>
            <p className="text-gray-600">Detailed user analytics coming soon...</p>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Performance</h3>
            <p className="text-gray-600">Package analytics coming soon...</p>
          </div>
        )}

        {activeTab === 'audits' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trends</h3>
            <p className="text-gray-600">Audit analytics coming soon...</p>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
            <p className="text-gray-600">Revenue analytics coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}