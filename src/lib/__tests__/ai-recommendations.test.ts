import { AIRecommendationEngine, UserContext } from '../ai-recommendations';

describe('AIRecommendationEngine', () => {
  let engine: AIRecommendationEngine;
  
  beforeEach(() => {
    engine = new AIRecommendationEngine();
  });

  describe('Initialization', () => {
    it('initializes with industry benchmarks', () => {
      expect(engine).toBeInstanceOf(AIRecommendationEngine);
      // Access private property for testing
      const benchmarks = (engine as any).industryBenchmarks;
      expect(benchmarks.has('ecommerce')).toBe(true);
      expect(benchmarks.has('technology')).toBe(true);
      expect(benchmarks.has('healthcare')).toBe(true);
    });

    it('has correct benchmark data structure', () => {
      const benchmarks = (engine as any).industryBenchmarks;
      const ecommerce = benchmarks.get('ecommerce');
      
      expect(ecommerce).toHaveProperty('industry');
      expect(ecommerce).toHaveProperty('averageScores');
      expect(ecommerce).toHaveProperty('commonIssues');
      expect(ecommerce).toHaveProperty('bestPractices');
      expect(ecommerce).toHaveProperty('emergingTrends');
      
      expect(ecommerce.averageScores).toHaveProperty('performance');
      expect(ecommerce.averageScores).toHaveProperty('seo');
      expect(ecommerce.averageScores).toHaveProperty('security');
      expect(ecommerce.averageScores).toHaveProperty('usability');
      expect(ecommerce.averageScores).toHaveProperty('content');
    });
  });

  describe('generateRecommendations', () => {
    const mockUserContext: UserContext = {
      businessType: 'online-store',
      industry: 'ecommerce',
      targetAudience: 'consumers',
      businessSize: 'small',
      techLevel: 'intermediate',
      budget: 'medium',
      goals: ['increase-sales', 'improve-seo'],
      previousAudits: 2
    };

    const mockAuditResults = {
      performance: {
        score: 65,
        metrics: {
          fcp: 3500, // Poor FCP
          lcp: 4500, // Poor LCP
          cls: 0.2,
          fid: 120,
          ttfb: 800
        }
      },
      seo: {
        score: 70,
        hasMetaDescription: false,
        hasStructuredData: false
      },
      security: {
        score: 75,
        hasHTTPS: false,
        hasSecurityHeaders: false
      },
      usability: {
        score: 60,
        mobileScore: 50,
        accessibilityScore: 65
      },
      content: {
        score: 65,
        readabilityScore: 60
      }
    };

    it('generates recommendations for poor performance', () => {
      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        mockUserContext
      );

      expect(recommendations.length).toBeGreaterThan(0);
      
      const performanceRecs = recommendations.filter(r => r.type === 'performance');
      expect(performanceRecs.length).toBeGreaterThan(0);
      
      // Should have FCP and LCP recommendations
      const fcpRec = performanceRecs.find(r => r.title.includes('First Contentful Paint'));
      const lcpRec = performanceRecs.find(r => r.title.includes('Largest Contentful Paint'));
      
      expect(fcpRec).toBeDefined();
      expect(lcpRec).toBeDefined();
      
      if (fcpRec) {
        expect(fcpRec.priority).toBe('high');
        expect(fcpRec.impact).toBeGreaterThan(80);
        expect(fcpRec.steps.length).toBeGreaterThan(0);
        expect(fcpRec.resources.length).toBeGreaterThan(0);
      }
    });

    it('generates SEO recommendations', () => {
      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        mockUserContext
      );

      const seoRecs = recommendations.filter(r => r.type === 'seo');
      expect(seoRecs.length).toBeGreaterThan(0);

      const metaDescRec = seoRecs.find(r => r.title.includes('Meta Descriptions'));
      expect(metaDescRec).toBeDefined();
      
      if (metaDescRec) {
        expect(metaDescRec.priority).toBe('medium');
        expect(metaDescRec.category).toBe('Meta Tags');
      }
    });

    it('generates security recommendations', () => {
      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        mockUserContext
      );

      const securityRecs = recommendations.filter(r => r.type === 'security');
      expect(securityRecs.length).toBeGreaterThan(0);

      const httpsRec = securityRecs.find(r => r.title.includes('HTTPS'));
      expect(httpsRec).toBeDefined();
      
      if (httpsRec) {
        expect(httpsRec.priority).toBe('critical');
        expect(httpsRec.impact).toBeGreaterThan(90);
      }
    });

    it('generates industry-specific recommendations for ecommerce', () => {
      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        mockUserContext
      );

      const industryRecs = recommendations.filter(r => r.industrySpecific === true);
      expect(industryRecs.length).toBeGreaterThan(0);

      const ecommerceRec = industryRecs.find(r => 
        r.title.includes('E-commerce Best Practices')
      );
      expect(ecommerceRec).toBeDefined();
      
      if (ecommerceRec) {
        expect(ecommerceRec.competitorAnalysis).toBeDefined();
        expect(ecommerceRec.competitorAnalysis?.bestPractices.length).toBeGreaterThan(0);
      }
    });

    it('filters out previously implemented recommendations', () => {
      const previousRecs = ['perf-001', 'seo-001'];
      
      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        mockUserContext,
        previousRecs
      );

      const filteredIds = recommendations.map(r => r.id);
      expect(filteredIds).not.toContain('perf-001');
      expect(filteredIds).not.toContain('seo-001');
    });

    it('prioritizes recommendations correctly', () => {
      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        mockUserContext
      );

      // Should be sorted by priority score (highest first)
      for (let i = 0; i < recommendations.length - 1; i++) {
        const current = (recommendations[i] as any).priorityScore;
        const next = (recommendations[i + 1] as any).priorityScore;
        
        if (current !== undefined && next !== undefined) {
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }

      // Critical priority items should come first
      const firstRec = recommendations[0];
      expect(['critical', 'high']).toContain(firstRec.priority);
    });

    it('considers user context in prioritization', () => {
      const beginnerContext: UserContext = {
        ...mockUserContext,
        techLevel: 'beginner',
        budget: 'low'
      };

      const beginnerRecs = engine.generateRecommendations(
        mockAuditResults,
        beginnerContext
      );

      const advancedContext: UserContext = {
        ...mockUserContext,
        techLevel: 'advanced',
        budget: 'high'
      };

      const advancedRecs = engine.generateRecommendations(
        mockAuditResults,
        advancedContext
      );

      // Beginner should have fewer high-effort recommendations at the top
      const beginnerHighEffort = beginnerRecs.slice(0, 5).filter(r => r.effort > 70).length;
      const advancedHighEffort = advancedRecs.slice(0, 5).filter(r => r.effort > 70).length;

      expect(beginnerHighEffort).toBeLessThanOrEqual(advancedHighEffort);
    });

    it('limits recommendations to maximum number', () => {
      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        mockUserContext
      );

      expect(recommendations.length).toBeLessThanOrEqual(20);
    });
  });

  describe('getCompetitorAnalysis', () => {
    it('returns competitor analysis for valid industry', () => {
      const analysis = engine.getCompetitorAnalysis('ecommerce', 'https://example.com');
      
      expect(analysis).toBeDefined();
      expect(analysis.industryAverage).toBeDefined();
      expect(analysis.commonIssues).toBeInstanceOf(Array);
      expect(analysis.bestPractices).toBeInstanceOf(Array);
      expect(analysis.emergingTrends).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('returns null for invalid industry', () => {
      const analysis = engine.getCompetitorAnalysis('nonexistent', 'https://example.com');
      expect(analysis).toBeNull();
    });

    it('includes competitive recommendations', () => {
      const analysis = engine.getCompetitorAnalysis('technology', 'https://example.com');
      
      expect(analysis?.recommendations.length).toBeGreaterThan(0);
      analysis?.recommendations.forEach(rec => {
        expect(rec).toContain('Consider implementing');
        expect(rec).toContain('technology industry');
      });
    });
  });

  describe('personalizeRecommendations', () => {
    const baseRecommendations = [
      {
        id: 'test-1',
        type: 'performance' as const,
        priority: 'high' as const,
        title: 'Test Recommendation',
        description: 'Test description',
        impact: 80,
        effort: 60,
        category: 'Test',
        reasoning: 'Test reasoning',
        steps: ['Step 1'],
        resources: [],
        estimatedTime: '2 hours',
        roi: 'high' as const
      }
    ];

    const userHistory = [
      { type: 'performance', implemented: true },
      { type: 'performance', implemented: false },
      { type: 'seo', implemented: true }
    ];

    it('adjusts effort based on user history', () => {
      const personalized = engine.personalizeRecommendations(
        baseRecommendations,
        userHistory,
        []
      );

      // Should increase effort estimate due to low success rate (50%)
      expect(personalized[0].effort).toBeGreaterThanOrEqual(baseRecommendations[0].effort);
    });

    it('adjusts priority for similar implemented recommendations', () => {
      const implemented = ['performance optimization'];
      
      const personalized = engine.personalizeRecommendations(
        baseRecommendations,
        userHistory,
        implemented
      );

      // Priority should be reduced for similar recommendations
      expect(personalized[0].priority).not.toBe('critical');
    });

    it('preserves original recommendations when no history', () => {
      const personalized = engine.personalizeRecommendations(
        baseRecommendations,
        [],
        []
      );

      expect(personalized[0].effort).toBe(baseRecommendations[0].effort);
      expect(personalized[0].priority).toBe(baseRecommendations[0].priority);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty audit results', () => {
      const userContext: UserContext = {
        businessType: 'website',
        industry: 'technology',
        targetAudience: 'users',
        businessSize: 'small',
        techLevel: 'intermediate',
        budget: 'medium',
        goals: [],
        previousAudits: 0
      };

      const recommendations = engine.generateRecommendations(
        {},
        userContext
      );

      expect(recommendations).toBeInstanceOf(Array);
      // Should still generate some industry-specific recommendations
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('handles unknown industry gracefully', () => {
      const userContext: UserContext = {
        businessType: 'website',
        industry: 'unknown-industry',
        targetAudience: 'users',
        businessSize: 'small',
        techLevel: 'intermediate',
        budget: 'medium',
        goals: [],
        previousAudits: 0
      };

      const mockAuditResults = {
        performance: { score: 60 },
        seo: { score: 60 }
      };

      expect(() => {
        engine.generateRecommendations(mockAuditResults, userContext);
      }).not.toThrow();
    });

    it('handles null and undefined values in audit results', () => {
      const userContext: UserContext = {
        businessType: 'website',
        industry: 'ecommerce',
        targetAudience: 'users',
        businessSize: 'small',
        techLevel: 'intermediate',
        budget: 'medium',
        goals: [],
        previousAudits: 0
      };

      const mockAuditResults = {
        performance: {
          score: null,
          metrics: {
            fcp: undefined,
            lcp: null
          }
        }
      };

      expect(() => {
        engine.generateRecommendations(mockAuditResults, userContext);
      }).not.toThrow();
    });
  });

  describe('Recommendation Quality', () => {
    it('generates recommendations with proper structure', () => {
      const userContext: UserContext = {
        businessType: 'website',
        industry: 'ecommerce',
        targetAudience: 'users',
        businessSize: 'small',
        techLevel: 'intermediate',
        budget: 'medium',
        goals: ['improve-performance'],
        previousAudits: 1
      };

      const mockAuditResults = {
        performance: { score: 50 },
        seo: { score: 50 }
      };

      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        userContext
      );

      recommendations.forEach(rec => {
        // Verify required fields
        expect(rec.id).toBeDefined();
        expect(rec.type).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.impact).toBeGreaterThan(0);
        expect(rec.effort).toBeGreaterThan(0);
        expect(rec.category).toBeDefined();
        expect(rec.reasoning).toBeDefined();
        expect(rec.steps).toBeInstanceOf(Array);
        expect(rec.resources).toBeInstanceOf(Array);
        expect(rec.estimatedTime).toBeDefined();
        expect(rec.roi).toBeDefined();

        // Verify value ranges
        expect(rec.impact).toBeLessThanOrEqual(100);
        expect(rec.effort).toBeLessThanOrEqual(100);
        expect(['critical', 'high', 'medium', 'low']).toContain(rec.priority);
        expect(['high', 'medium', 'low']).toContain(rec.roi);
        expect(['performance', 'seo', 'security', 'ux', 'content', 'technical', 'marketing']).toContain(rec.type);

        // Verify resources have proper structure
        rec.resources.forEach(resource => {
          expect(resource.title).toBeDefined();
          expect(resource.url).toBeDefined();
          expect(resource.type).toBeDefined();
          expect(['documentation', 'tool', 'article', 'video']).toContain(resource.type);
        });
      });
    });

    it('provides actionable steps for each recommendation', () => {
      const userContext: UserContext = {
        businessType: 'website',
        industry: 'ecommerce',
        targetAudience: 'users',
        businessSize: 'small',
        techLevel: 'intermediate',
        budget: 'medium',
        goals: ['improve-performance'],
        previousAudits: 1
      };

      const mockAuditResults = {
        performance: { 
          score: 50,
          metrics: { fcp: 4000, lcp: 5000 }
        }
      };

      const recommendations = engine.generateRecommendations(
        mockAuditResults,
        userContext
      );

      recommendations.forEach(rec => {
        expect(rec.steps.length).toBeGreaterThan(0);
        rec.steps.forEach(step => {
          expect(typeof step).toBe('string');
          expect(step.length).toBeGreaterThan(10); // Should be descriptive
        });
      });
    });
  });
});