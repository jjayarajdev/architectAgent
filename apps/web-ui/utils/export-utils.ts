import { AnalysisOutput } from '@/types';

export class ExportUtils {
  static generateMarkdown(output: AnalysisOutput): string {
    const sections: string[] = [];
    
    // Title and metadata
    sections.push('# MCP EA Suite - Sprint 0 Review');
    sections.push(`\n**Generated:** ${new Date().toISOString()}`);
    sections.push(`**Repository:** ${output.repository?.url || 'N/A'}\n`);
    
    // Executive Summary from artifacts
    if (output.artifacts?.executiveSummary) {
      sections.push('## Executive Summary\n');
      sections.push(output.artifacts.executiveSummary);
      sections.push('');
    }
    
    // Key Metrics
    if (output.metrics) {
      sections.push('## Key Metrics\n');
      sections.push(`- **Compliance Score:** ${output.metrics.complianceScore}%`);
      sections.push(`- **Expected ROI:** ${output.metrics.roi || 'N/A'}`);
      sections.push(`- **Risk Count:** ${output.metrics.riskCount}`);
      sections.push(`- **Technical Debt:** ${output.metrics.technicalDebt} hours`);
      sections.push('');
    }
    
    // Sprint 0 Review from artifacts
    if (output.artifacts?.sprint0Review) {
      sections.push('## Sprint 0 EA Review\n');
      sections.push(output.artifacts.sprint0Review);
      sections.push('');
    }
    
    // Analysis Sections
    if (output.analysis) {
      sections.push('## Detailed Analysis\n');
      
      // Solution Discovery
      if (output.analysis.solutionDiscovery) {
        sections.push('### 1. Solution Discovery & Reusability\n');
        const sd = output.analysis.solutionDiscovery;
        if (sd.reusableComponents?.length > 0) {
          sections.push('**Reusable Components:**');
          sd.reusableComponents.forEach((comp: any) => {
            sections.push(`- ${comp}`);
          });
        }
        if (sd.recommendations?.length > 0) {
          sections.push('\n**Recommendations:**');
          sd.recommendations.forEach((rec: any) => {
            sections.push(`- ${rec}`);
          });
        }
        sections.push('');
      }
      
      // Architectural Alignment
      if (output.analysis.architecturalAlignment) {
        sections.push('### 2. Architectural Alignment\n');
        const aa = output.analysis.architecturalAlignment;
        sections.push(`- **Compliance Score:** ${aa.complianceScore || 'N/A'}%`);
        sections.push(`- **Violations:** ${aa.violations?.length || 0}`);
        sections.push(`- **Ambiguities:** ${aa.ambiguities?.length || 0}`);
        sections.push('');
      }
      
      // Data & Integration
      if (output.analysis.dataIntegration) {
        sections.push('### 3. Data & Integration Strategy\n');
        const di = output.analysis.dataIntegration;
        if (di.integrationPoints?.length > 0) {
          sections.push('**Integration Points:**');
          di.integrationPoints.forEach((point: any) => {
            sections.push(`- ${point.system}: ${point.method}`);
          });
        }
        sections.push('');
      }
      
      // Operational Ownership
      if (output.analysis.operationalOwnership) {
        sections.push('### 4. Operational Ownership\n');
        const oo = output.analysis.operationalOwnership;
        sections.push(`- **Proposed Owner:** ${oo.proposedOwner || 'TBD'}`);
        sections.push(`- **Support Model:** ${oo.supportModel || 'TBD'}`);
        sections.push('');
      }
      
      // Technical Debt
      if (output.analysis.technicalDebt) {
        sections.push('### 5. Technical Debt Management\n');
        const td = output.analysis.technicalDebt;
        sections.push(`- **Current Debt Items:** ${td.currentDebt?.length || 0}`);
        sections.push(`- **Total Debt Hours:** ${td.debtMetrics?.totalDebtHours || 0}`);
        sections.push('');
      }
      
      // Business Value
      if (output.analysis.businessValue) {
        sections.push('### 6. Business Value & ROI\n');
        const bv = output.analysis.businessValue;
        sections.push(`- **Expected ROI:** ${bv.roi?.expected || 'N/A'}`);
        sections.push(`- **Payback Period:** ${bv.roi?.paybackPeriod || 'N/A'}`);
        sections.push('');
      }
      
      // Scalability
      if (output.analysis.scalability) {
        sections.push('### 7. Scalability & Evolution\n');
        const sc = output.analysis.scalability;
        sections.push(`- **Bottlenecks Identified:** ${sc.bottlenecks?.length || 0}`);
        sections.push(`- **Evolution Phases:** ${sc.evolutionPlan?.length || 0}`);
        sections.push('');
      }
    }
    
    // Technical Architecture from artifacts
    if (output.artifacts?.technicalArchitecture) {
      sections.push('## Technical Architecture\n');
      sections.push(output.artifacts.technicalArchitecture);
      sections.push('');
    }
    
    // Risk Matrix from artifacts
    if (output.artifacts?.riskMatrix) {
      sections.push('## Risk Matrix\n');
      sections.push(output.artifacts.riskMatrix);
      sections.push('');
    }
    
    // Implementation Roadmap from artifacts
    if (output.artifacts?.implementationRoadmap) {
      sections.push('## Implementation Roadmap\n');
      sections.push(output.artifacts.implementationRoadmap);
      sections.push('');
    }
    
    return sections.join('\n');
  }
  
  static downloadMarkdown(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  static generateJSON(output: AnalysisOutput): string {
    return JSON.stringify(output, null, 2);
  }
  
  static downloadJSON(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}