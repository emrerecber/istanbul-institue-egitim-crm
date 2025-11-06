'use client';

import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  FileText,
  Shield,
  Search,
  Smartphone,
  Zap
} from 'lucide-react';
import { useWebSocket, AuditProgressData } from '@/lib/websocket-manager';
import { useTranslation } from '@/context/language-context';

interface AuditProgressTrackerProps {
  auditId: string;
  onComplete?: (results: any) => void;
  onError?: (error: string) => void;
}

interface ProgressStep {
  id: string;
  name: string;
  description: string;
  icon: any;
  estimatedTime: number; // in seconds
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  details?: string;
  subSteps?: string[];
}

const AUDIT_STEPS: ProgressStep[] = [
  {
    id: 'initialization',
    name: 'Initialization',
    description: 'Setting up audit environment and validating URL',
    icon: Play,
    estimatedTime: 5,
    status: 'pending',
    progress: 0,
    subSteps: ['URL validation', 'Environment setup', 'Resource allocation']
  },
  {
    id: 'performance',
    name: 'Performance Analysis',
    description: 'Analyzing Core Web Vitals and loading performance',
    icon: TrendingUp,
    estimatedTime: 30,
    status: 'pending',
    progress: 0,
    subSteps: ['FCP measurement', 'LCP analysis', 'CLS calculation', 'FID testing', 'TTFB check']
  },
  {
    id: 'seo',
    name: 'SEO Audit',
    description: 'Checking search engine optimization factors',
    icon: Search,
    estimatedTime: 20,
    status: 'pending',
    progress: 0,
    subSteps: ['Meta tags analysis', 'Heading structure', 'Schema markup', 'Internal linking', 'Robots.txt']
  },
  {
    id: 'security',
    name: 'Security Scan',
    description: 'Evaluating security headers and HTTPS configuration',
    icon: Shield,
    estimatedTime: 15,
    status: 'pending',
    progress: 0,
    subSteps: ['HTTPS verification', 'Security headers', 'SSL certificate', 'Content security policy']
  },
  {
    id: 'usability',
    name: 'Usability Check',
    description: 'Testing mobile responsiveness and accessibility',
    icon: Smartphone,
    estimatedTime: 25,
    status: 'pending',
    progress: 0,
    subSteps: ['Mobile optimization', 'Touch targets', 'Accessibility scan', 'Color contrast', 'Keyboard navigation']
  },
  {
    id: 'content',
    name: 'Content Analysis',
    description: 'Analyzing content quality and readability',
    icon: FileText,
    estimatedTime: 10,
    status: 'pending',
    progress: 0,
    subSteps: ['Readability score', 'Content structure', 'Image optimization', 'Text length analysis']
  },
  {
    id: 'finalization',
    name: 'Report Generation',
    description: 'Compiling results and generating recommendations',
    icon: Zap,
    estimatedTime: 15,
    status: 'pending',
    progress: 0,
    subSteps: ['Data compilation', 'Score calculation', 'Recommendation engine', 'Report formatting', 'PDF generation']
  }
];

export default function AuditProgressTracker({ 
  auditId, 
  onComplete, 
  onError 
}: AuditProgressTrackerProps) {
  const { t } = useTranslation();
  const ws = useWebSocket();
  
  const [steps, setSteps] = useState<ProgressStep[]>(AUDIT_STEPS);
  const [currentStep, setCurrentStep] = useState<string>('initialization');
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [status, setStatus] = useState<AuditProgressData['status']>('pending');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!auditId || !ws.isConnected()) return;

    // Subscribe to audit progress updates
    ws.subscribeToAuditProgress(auditId, (progressData: AuditProgressData) => {
      updateProgress(progressData);
    });

    // Subscribe to audit completion
    ws.on('audit_completed', (data: any) => {
      if (data.auditId === auditId) {
        handleAuditComplete(data);
      }
    });

    return () => {
      ws.unsubscribeFromAuditProgress(auditId);
    };
  }, [auditId, ws]);

  const updateProgress = (progressData: AuditProgressData) => {
    setStatus(progressData.status);
    setCurrentStep(progressData.currentStep);
    setOverallProgress(progressData.progress);
    setEstimatedTimeRemaining(progressData.estimatedTimeRemaining || null);
    setErrors(progressData.errors || []);

    if (progressData.status === 'in_progress' && !startTime) {
      setStartTime(Date.now());
    }

    // Update individual step progress
    setSteps(prevSteps => 
      prevSteps.map(step => {
        if (progressData.completedSteps.includes(step.id)) {
          return { ...step, status: 'completed' as const, progress: 100 };
        } else if (step.id === progressData.currentStep) {
          return { 
            ...step, 
            status: 'in_progress' as const, 
            progress: Math.min(progressData.progress, 100),
            details: progressData.currentStep === step.id ? 'Currently processing...' : undefined
          };
        } else if (progressData.errors?.some(error => error.includes(step.id))) {
          return { ...step, status: 'failed' as const, progress: 0 };
        }
        return step;
      })
    );
  };

  const handleAuditComplete = (data: any) => {
    setStatus('completed');
    setOverallProgress(100);
    setCurrentStep('');
    
    // Mark all steps as completed
    setSteps(prevSteps => 
      prevSteps.map(step => ({ 
        ...step, 
        status: 'completed' as const, 
        progress: 100 
      }))
    );

    onComplete?.(data.results);
  };

  const pauseAudit = () => {
    ws.send('pause_audit', { auditId });
    setIsPaused(true);
  };

  const resumeAudit = () => {
    ws.send('resume_audit', { auditId });
    setIsPaused(false);
  };

  const cancelAudit = () => {
    ws.send('cancel_audit', { auditId });
    setStatus('failed');
  };

  const retryAudit = () => {
    ws.send('retry_audit', { auditId });
    setSteps(AUDIT_STEPS);
    setCurrentStep('initialization');
    setOverallProgress(0);
    setStatus('pending');
    setStartTime(null);
    setErrors([]);
    setIsPaused(false);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (): number => {
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  };

  const getTotalEstimatedTime = (): number => {
    return steps.reduce((total, step) => total + step.estimatedTime, 0);
  };

  const getStatusColor = (stepStatus: ProgressStep['status']): string => {
    switch (stepStatus) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (stepStatus: ProgressStep['status'], isCurrentStep: boolean) => {
    switch (stepStatus) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return isCurrentStep ? Loader2 : Clock;
      case 'failed':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('audit.progress.title')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('audit.progress.subtitle')} #{auditId.slice(-8)}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {status === 'in_progress' && (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseAudit}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  {t('pause')}
                </button>
              ) : (
                <button
                  onClick={resumeAudit}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  {t('resume')}
                </button>
              )}
              
              <button
                onClick={cancelAudit}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                {t('cancel')}
              </button>
            </>
          )}

          {status === 'failed' && (
            <button
              onClick={retryAudit}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {t('retry')}
            </button>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t('overall.progress')}
          </span>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {startTime && (
              <span>
                {t('elapsed')}: {formatTime(getElapsedTime())}
              </span>
            )}
            {estimatedTimeRemaining && (
              <span>
                {t('remaining')}: {formatTime(estimatedTimeRemaining)}
              </span>
            )}
            <span className="font-medium">
              {overallProgress.toFixed(0)}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              status === 'completed' ? 'bg-green-500' :
              status === 'failed' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2">{t('errors.encountered')}:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const StatusIcon = getStatusIcon(step.status, step.id === currentStep);
          const isCurrentStep = step.id === currentStep;
          
          return (
            <div 
              key={step.id}
              className={`border rounded-lg p-4 transition-all ${
                isCurrentStep ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step Icon */}
                <div className={`p-2 rounded-lg ${getStatusColor(step.status)}`}>
                  <IconComponent className="h-5 w-5" />
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {step.name}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {step.status === 'in_progress' && isCurrentStep && (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      )}
                      <StatusIcon className={`h-4 w-4 ${
                        step.status === 'completed' ? 'text-green-600' :
                        step.status === 'failed' ? 'text-red-600' :
                        step.status === 'in_progress' ? 'text-blue-600' :
                        'text-gray-400'
                      }`} />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {step.description}
                  </p>

                  {/* Step Progress Bar */}
                  {(step.status === 'in_progress' || step.status === 'completed') && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{t('progress')}</span>
                        <span>{step.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            step.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sub-steps */}
                  {step.subSteps && isCurrentStep && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        {t('sub.steps')}:
                      </h4>
                      <div className="space-y-1">
                        {step.subSteps.map((subStep, subIndex) => (
                          <div key={subIndex} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {subStep}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step Details */}
                  {step.details && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      {step.details}
                    </div>
                  )}

                  {/* Estimated Time */}
                  <div className="mt-2 text-xs text-gray-500">
                    {t('estimated.time')}: {formatTime(step.estimatedTime)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {t('total.estimated.time')}: {formatTime(getTotalEstimatedTime())}
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'failed' ? 'bg-red-100 text-red-800' :
          status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'pending' && t('status.pending')}
          {status === 'in_progress' && (isPaused ? t('status.paused') : t('status.in.progress'))}
          {status === 'analyzing' && t('status.analyzing')}
          {status === 'completed' && t('status.completed')}
          {status === 'failed' && t('status.failed')}
        </div>
      </div>
    </div>
  );
}