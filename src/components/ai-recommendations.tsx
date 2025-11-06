'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Zap,
  Users,
  Shield,
  Search,
  Smartphone,
  FileText,
  BarChart3,
  Lightbulb,
  Star,
  ArrowRight,
  Info
} from 'lucide-react';
import { AIRecommendation, UserContext, aiRecommendationEngine } from '@/lib/ai-recommendations';

interface AIRecommendationsProps {
  auditResults: any;
  userContext: UserContext;
  onImplement?: (recommendationId: string) => void;
  onDismiss?: (recommendationId: string) => void;
}

const priorityColors = {
  critical: 'border-red-500 bg-red-50 text-red-900',
  high: 'border-orange-500 bg-orange-50 text-orange-900',
  medium: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  low: 'border-blue-500 bg-blue-50 text-blue-900'
};

const typeIcons = {
  performance: TrendingUp,
  seo: Search,
  security: Shield,
  ux: Smartphone,
  content: FileText,
  technical: BarChart3,
  marketing: Users
};

const roiColors = {
  high: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  low: 'text-gray-600 bg-gray-100'
};

export default function AIRecommendations({
  auditResults,
  userContext,
  onImplement,
  onDismiss
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [implementedRecs, setImplementedRecs] = useState<string[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [auditResults, userContext]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - in real implementation, this would be an API endpoint
      const aiRecommendations = aiRecommendationEngine.generateRecommendations(
        auditResults,
        userContext,
        implementedRecs
      );
      
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedType !== 'all' && rec.type !== selectedType) return false;
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false;
    return true;
  });

  const handleImplement = (recommendationId: string) => {
    setImplementedRecs(prev => [...prev, recommendationId]);
    onImplement?.(recommendationId);
  };

  const handleDismiss = (recommendationId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    onDismiss?.(recommendationId);
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return 'text-green-600';
    if (impact >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEffortColor = (effort: number) => {
    if (effort >= 80) return 'text-red-600';
    if (effort >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
          <p className="text-gray-600">AI is analyzing your audit results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
            <p className="opacity-90">
              Intelligent suggestions tailored for your {userContext.industry} business
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="font-semibold">Priority Focus</span>
            </div>
            <p className="mt-1 text-sm opacity-90">
              {recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length} high-impact recommendations
            </p>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Quick Wins</span>
            </div>
            <p className="mt-1 text-sm opacity-90">
              {recommendations.filter(r => r.effort < 50).length} easy implementations available
            </p>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span className="font-semibold">ROI Potential</span>
            </div>
            <p className="mt-1 text-sm opacity-90">
              {recommendations.filter(r => r.roi === 'high').length} high-ROI opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="performance">Performance</option>
              <option value="seo">SEO</option>
              <option value="security">Security</option>
              <option value="ux">UX/Usability</option>
              <option value="content">Content</option>
              <option value="technical">Technical</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
            <select 
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="ml-auto flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredRecommendations.length} of {recommendations.length} recommendations
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec, index) => {
          const IconComponent = typeIcons[rec.type] || Lightbulb;
          const isExpanded = expandedRec === rec.id;
          const isImplemented = implementedRecs.includes(rec.id);
          
          return (
            <div 
              key={rec.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                isImplemented ? 'opacity-50 border-green-300' : priorityColors[rec.priority]
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${priorityColors[rec.priority]}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {rec.title}
                          {rec.industrySpecific && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Industry Specific
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600">{rec.description}</p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Impact:</span>
                        <span className={`text-sm font-semibold ${getImpactColor(rec.impact)}`}>
                          {rec.impact}/100
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Effort:</span>
                        <span className={`text-sm font-semibold ${getEffortColor(rec.effort)}`}>
                          {rec.effort}/100
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">ROI:</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roiColors[rec.roi]}`}>
                          {rec.roi.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="text-sm font-medium text-gray-900">{rec.estimatedTime}</span>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityColors[rec.priority]}`}>
                        {rec.priority === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                      
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {rec.category}
                      </span>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Why this matters</h4>
                          <p className="text-sm text-gray-700">{rec.reasoning}</p>
                        </div>
                      </div>
                    </div>

                    {/* Competitor Analysis */}
                    {rec.competitorAnalysis && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Competitive Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-blue-700">Industry Average: </span>
                            <span className="font-medium">{rec.competitorAnalysis.averageScore}</span>
                          </div>
                          <div>
                            <span className="text-blue-700">Your Position: </span>
                            <span className={`font-medium ${
                              rec.competitorAnalysis.marketPosition === 'leading' ? 'text-green-600' :
                              rec.competitorAnalysis.marketPosition === 'competitive' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {rec.competitorAnalysis.marketPosition}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">Best Practices: </span>
                            <span className="font-medium">{rec.competitorAnalysis.bestPractices.length}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4">
                        {/* Implementation Steps */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Implementation Steps</h4>
                          <ol className="space-y-2">
                            {rec.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {idx + 1}
                                </span>
                                <span className="text-sm text-gray-700">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Resources */}
                        {rec.resources.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Helpful Resources</h4>
                            <div className="space-y-2">
                              {rec.resources.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span>{resource.title}</span>
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    {resource.type}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    {isExpanded ? 'Show Less' : 'Show Details'}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      disabled={isImplemented}
                    >
                      Dismiss
                    </button>
                    
                    <button
                      onClick={() => handleImplement(rec.id)}
                      disabled={isImplemented}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isImplemented
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isImplemented ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 inline" />
                          Implemented
                        </>
                      ) : (
                        'Mark as Implemented'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Found</h3>
          <p className="text-gray-600">
            {selectedType !== 'all' || selectedPriority !== 'all' 
              ? 'Try adjusting your filters to see more recommendations.'
              : 'Great job! Your site is performing well according to our AI analysis.'
            }
          </p>
        </div>
      )}
    </div>
  );
}