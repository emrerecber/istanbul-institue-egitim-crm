import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock database - in real implementation, this would connect to your database
const generateAnalyticsData = (days: number) => {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000));

  // Calculate based on date range
  const multiplier = days / 30; // Base calculations on 30 days

  return {
    userBehavior: {
      totalUsers: Math.floor(1247 * multiplier),
      activeUsers: Math.floor(892 * multiplier),
      newUsers: Math.floor(156 * multiplier),
      retentionRate: 68.5,
      avgSessionDuration: 847, // seconds
      pageViews: Math.floor(15623 * multiplier)
    },
    packagePerformance: {
      totalSales: Math.floor(189 * multiplier),
      revenue: Math.floor(47250 * multiplier),
      conversionRate: 12.8,
      packages: [
        { 
          name: 'Basic Audit', 
          sales: Math.floor(78 * multiplier), 
          revenue: Math.floor(15600 * multiplier), 
          conversionRate: 15.2 
        },
        { 
          name: 'Advanced Audit', 
          sales: Math.floor(64 * multiplier), 
          revenue: Math.floor(19200 * multiplier), 
          conversionRate: 11.8 
        },
        { 
          name: 'Premium Audit', 
          sales: Math.floor(31 * multiplier), 
          revenue: Math.floor(9300 * multiplier), 
          conversionRate: 8.9 
        },
        { 
          name: 'Enterprise Audit', 
          sales: Math.floor(16 * multiplier), 
          revenue: Math.floor(3200 * multiplier), 
          conversionRate: 6.4 
        }
      ]
    },
    auditTrends: {
      totalAudits: Math.floor(342 * multiplier),
      completedAudits: Math.floor(298 * multiplier),
      averageScore: 78.6,
      monthlyTrends: generateMonthlyTrends(days)
    },
    revenueMetrics: {
      totalRevenue: Math.floor(47250 * multiplier),
      monthlyRevenue: Math.floor(15600 * multiplier),
      revenueGrowth: 18.7,
      arpu: 52.8
    }
  };
};

const generateMonthlyTrends = (days: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const monthsToShow = Math.min(Math.ceil(days / 30), 12);
  
  const trends = [];
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const baseAudits = 45 + (i * 5);
    const baseScore = 75 + (i * 0.8);
    const baseRevenue = 8900 + (i * 1200);
    
    trends.push({
      month: months[monthIndex],
      audits: baseAudits + Math.floor(Math.random() * 20),
      avgScore: +(baseScore + (Math.random() * 2 - 1)).toFixed(1),
      revenue: baseRevenue + Math.floor(Math.random() * 3000)
    });
  }
  
  return trends;
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' }, 
        { status: 400 }
      );
    }

    // Generate analytics data
    const analyticsData = generateAnalyticsData(days);

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Additional endpoint for detailed user analytics
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { metric, dateRange, filters } = body;

    // Mock detailed analytics based on metric type
    let detailedData = {};

    switch (metric) {
      case 'user_behavior':
        detailedData = {
          userSessions: [
            { date: '2024-01-01', sessions: 234, avgDuration: 8.5, bounceRate: 32.1 },
            { date: '2024-01-02', sessions: 298, avgDuration: 9.2, bounceRate: 28.7 },
            // ... more daily data
          ],
          topPages: [
            { page: '/dashboard', views: 8924, avgTime: '4:32', exitRate: 15.2 },
            { page: '/packages', views: 5632, avgTime: '3:18', exitRate: 42.1 },
            { page: '/audits', views: 4156, avgTime: '6:45', exitRate: 22.8 }
          ],
          deviceBreakdown: [
            { device: 'Desktop', percentage: 65.2, sessions: 1843 },
            { device: 'Mobile', percentage: 28.7, sessions: 812 },
            { device: 'Tablet', percentage: 6.1, sessions: 172 }
          ]
        };
        break;

      case 'revenue_breakdown':
        detailedData = {
          revenueByPackage: [
            { package: 'Basic Audit', revenue: 15600, percentage: 33.0 },
            { package: 'Advanced Audit', revenue: 19200, percentage: 40.6 },
            { package: 'Premium Audit', revenue: 9300, percentage: 19.7 },
            { package: 'Enterprise Audit', revenue: 3150, percentage: 6.7 }
          ],
          revenueByRegion: [
            { region: 'Istanbul', revenue: 18450, percentage: 39.0 },
            { region: 'Ankara', revenue: 12300, percentage: 26.0 },
            { region: 'Izmir', revenue: 8925, percentage: 18.9 },
            { region: 'Other', revenue: 7575, percentage: 16.1 }
          ],
          dailyRevenue: generateDailyRevenue(dateRange)
        };
        break;

      case 'audit_analysis':
        detailedData = {
          auditsByIndustry: [
            { industry: 'E-commerce', count: 89, avgScore: 82.3 },
            { industry: 'Manufacturing', count: 67, avgScore: 76.8 },
            { industry: 'Services', count: 54, avgScore: 79.1 },
            { industry: 'Technology', count: 43, avgScore: 85.2 }
          ],
          commonIssues: [
            { issue: 'SEO Optimization', frequency: 67, severity: 'High' },
            { issue: 'Loading Speed', frequency: 54, severity: 'Medium' },
            { issue: 'Mobile Responsiveness', frequency: 43, severity: 'High' },
            { issue: 'Security Headers', frequency: 38, severity: 'Medium' }
          ],
          scoreDistribution: [
            { range: '90-100', count: 12, percentage: 4.0 },
            { range: '80-89', count: 89, percentage: 29.7 },
            { range: '70-79', count: 134, percentage: 44.7 },
            { range: '60-69', count: 56, percentage: 18.7 },
            { range: '0-59', count: 9, percentage: 3.0 }
          ]
        };
        break;

      default:
        detailedData = { error: 'Unknown metric type' };
    }

    return NextResponse.json(detailedData);

  } catch (error) {
    console.error('Detailed analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

const generateDailyRevenue = (days: number) => {
  const dailyData = [];
  const currentDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(currentDate.getTime() - (i * 24 * 60 * 60 * 1000));
    const baseRevenue = 500 + (Math.random() * 1000);
    const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1;
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(baseRevenue * weekendMultiplier),
      transactions: Math.floor((baseRevenue * weekendMultiplier) / 250) // Avg transaction $250
    });
  }
  
  return dailyData;
};