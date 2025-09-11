export class Sprint0ReportGenerator {
  generateMarkdownReport(analysis: any, changeRequest: any): string {
    return `# Sprint 0 EA Review Report

## Change Request: ${changeRequest.title}

**Date**: ${new Date().toISOString().split('T')[0]}  
**Status**: Draft for Team Review

---

## 1. Solution Discovery & Reusability

### Reusable Components Identified

${this.formatReusableComponents(analysis.solutionDiscovery.reusableComponents)}

### Recommendations
${analysis.solutionDiscovery.recommendations.map((r: string) => `- ${r}`).join('\n')}

**Team Action Required**: Review identified components and confirm integration approach during Sprint 0.

---

## 2. Architectural Alignment & Ambiguity

### Potential Ambiguities
${this.formatAmbiguities(analysis.architecturalAlignment.ambiguities)}

### Non-Compliance Areas
${this.formatNonCompliance(analysis.architecturalAlignment.nonCompliance)}

**Team Action Required**: Document mitigation strategies for each identified issue in Sprint 0.

---

## 3. Data & Integration Strategy

### Proposed Data Model

**Entities**:
${analysis.dataIntegration.proposedModel.entities.map((e: string) => `- ${e}`).join('\n')}

**Relationships**:
${analysis.dataIntegration.proposedModel.relationships.map((r: string) => `- ${r}`).join('\n')}

### Data Flow Diagram

\`\`\`mermaid
graph LR
    subgraph Ingestion
        ${analysis.dataIntegration.dataFlow.ingestion.map((i: string) => `I${i.replace(/\s/g, '')}[${i}]`).join('\n        ')}
    end
    
    subgraph Transformation
        ${analysis.dataIntegration.dataFlow.transformation.map((t: string) => `T${t.replace(/\s/g, '')}[${t}]`).join('\n        ')}
    end
    
    subgraph Consumption
        ${analysis.dataIntegration.dataFlow.consumption.map((c: string) => `C${c.replace(/\s/g, '')}[${c}]`).join('\n        ')}
    end
    
    Ingestion --> Transformation
    Transformation --> Consumption
\`\`\`

### Integration Points
${this.formatIntegrationPoints(analysis.dataIntegration.integrationPoints)}

**Team Action Required**: Validate data model and finalize integration approach.

---

## 4. Operational Ownership

**Proposed Owner**: ${analysis.operationalOwnership.proposedOwner}  
**Support Model**: ${analysis.operationalOwnership.supportModel}

### Maintenance Plan
${this.formatMaintenancePlan(analysis.operationalOwnership.maintenancePlan)}

### Alignment Gaps
${analysis.operationalOwnership.alignmentGaps.map((g: string) => `- ⚠️ ${g}`).join('\n')}

**Team Action Required**: Confirm ownership and address alignment gaps.

---

## 5. Technical Debt & Simplification

### Current Technical Debt
${this.formatTechnicalDebt(analysis.technicalDebt.currentDebt)}

### Mitigation Plan
${analysis.technicalDebt.mitigationPlan.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}

### Simplification Opportunities
${this.formatSimplificationOpportunities(analysis.technicalDebt.simplificationOpportunities)}

**Team Action Required**: Prioritize debt reduction activities for Sprint 0.

---

## 6. Business Value & Key Metrics

### Business Objectives Alignment
${this.formatBusinessObjectives(analysis.businessValue.objectives)}

### Key Performance Indicators (KPIs)
${this.formatKPIs(analysis.businessValue.kpis)}

### Return on Investment
- **Costs**: ${analysis.businessValue.roi.costs}
- **Benefits**: ${analysis.businessValue.roi.benefits}
- **Payback Period**: ${analysis.businessValue.roi.paybackPeriod}

**Team Action Required**: Validate KPIs and measurement methods.

---

## 7. Future Scalability & Evolution

### Anticipated Bottlenecks
${this.formatBottlenecks(analysis.scalability.bottlenecks)}

### Evolution Roadmap
${this.formatEvolutionPlan(analysis.scalability.evolutionPlan)}

### Scaling Recommendations
${analysis.scalability.recommendations.map((r: string) => `- ${r}`).join('\n')}

**Team Action Required**: Review scaling strategy and incorporate into sprint planning.

---

## Sprint 0 Checklist

- [ ] Review and confirm reusable components
- [ ] Document architectural ambiguity mitigations
- [ ] Validate data model and integration strategy
- [ ] Confirm operational ownership and support model
- [ ] Prioritize technical debt items
- [ ] Finalize KPIs and measurement approach
- [ ] Approve scalability roadmap

## Next Steps

1. Team to review this document in Sprint 0 planning session
2. Update sections marked with "Team Action Required"
3. Create JIRA tickets for identified action items
4. Schedule architecture review board meeting if needed
5. Finalize Sprint 0 deliverables

---

*This document is generated as a first draft by the EA Analysis Agent. Team validation and updates required.*`;
  }
  
  private formatReusableComponents(components: any[]): string {
    if (!components || components.length === 0) {
      return 'No reusable components identified. Consider building from scratch.';
    }
    
    return components.map(c => 
      `| **${c.name}** | ${c.type} | ${c.relevance} | Integration Effort: ${c.integrationEffort} |`
    ).join('\n');
  }
  
  private formatAmbiguities(ambiguities: any[]): string {
    if (!ambiguities || ambiguities.length === 0) {
      return 'No architectural ambiguities identified.';
    }
    
    return ambiguities.map(a => 
      `- **${a.area}** (${a.severity} severity)\n  - Issue: ${a.description}\n  - Mitigation: ${a.mitigation}`
    ).join('\n\n');
  }
  
  private formatNonCompliance(nonCompliance: any[]): string {
    if (!nonCompliance || nonCompliance.length === 0) {
      return '✅ All architectural standards are met.';
    }
    
    return nonCompliance.map(n => 
      `- **${n.standard}**\n  - Violation: ${n.violation}\n  - Impact: ${n.impact}\n  - Remediation: ${n.remediation}`
    ).join('\n\n');
  }
  
  private formatIntegrationPoints(points: any[]): string {
    return points.map(p => 
      `- **${p.system}**: ${p.method} (${p.dataFormat})`
    ).join('\n');
  }
  
  private formatMaintenancePlan(plan: any): string {
    return `**Activities**:\n${plan.activities.map((a: string) => `- ${a}`).join('\n')}\n\n` +
           `**Frequency**: ${plan.frequency}\n` +
           `**Resources**: ${plan.resources}`;
  }
  
  private formatTechnicalDebt(debt: any[]): string {
    return debt.map(d => 
      `- **${d.component}**: ${d.type} - Impact: ${d.impact}`
    ).join('\n');
  }
  
  private formatSimplificationOpportunities(opportunities: any[]): string {
    return opportunities.map(o => 
      `- **${o.area}**\n  - Current: ${o.current}\n  - Proposed: ${o.proposed}\n  - Benefit: ${o.benefit}`
    ).join('\n\n');
  }
  
  private formatBusinessObjectives(objectives: any[]): string {
    return objectives.map(o => 
      `- **${o.objective}**\n  - Contribution: ${o.contribution}\n  - Measurement: ${o.measurement}`
    ).join('\n\n');
  }
  
  private formatKPIs(kpis: any[]): string {
    return '| KPI | Baseline | Target | Frequency |\n' +
           '|-----|----------|--------|-----------||\n' +
           kpis.map(k => 
             `| ${k.name} | ${k.baseline} | ${k.target} | ${k.frequency} |`
           ).join('\n');
  }
  
  private formatBottlenecks(bottlenecks: any[]): string {
    return bottlenecks.map(b => 
      `- **${b.component}**: ${b.limitation}\n  - Impact: ${b.impact}\n  - Threshold: ${b.threshold}`
    ).join('\n\n');
  }
  
  private formatEvolutionPlan(plan: any[]): string {
    return plan.map(p => 
      `### ${p.phase} (${p.timeline})\n${p.changes.map((c: string) => `- ${c}`).join('\n')}`
    ).join('\n\n');
  }
}