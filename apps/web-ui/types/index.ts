export interface AnalysisInput {
  repository: {
    url: string;
    branch: string;
  };
  changeRequest: {
    title: string;
    description: string;
    type: string;
    functionalAreas: string[];
    businessObjectives: string[];
    constraints: string[];
    timeline: string;
  };
  context: {
    architectureStyle: string;
    cloudPlatform: string;
    supportModel: string;
    compliance: string[];
  };
}

export interface AnalysisOutput {
  repository: {
    url: string;
    branch: string;
  };
  changeRequest: {
    title: string;
    description: string;
    functionalAreas: string[];
    businessObjectives: string[];
    constraints: string[];
    timeline: string;
  };
  context: {
    architectureStyle: string;
    cloudPlatform: string;
    supportModel: string;
    compliance: string[];
  };
  metrics?: {
    complianceScore: number;
    roi: number;
    riskCount: number;
    technicalDebt: number;
  };
  analysis?: {
    solutionDiscovery?: any;
    architecturalAlignment?: any;
    dataIntegration?: any;
    operationalOwnership?: any;
    technicalDebt?: any;
    businessValue?: any;
    scalability?: any;
    risks?: any;
    implementation?: any;
  };
  artifacts?: {
    sprint0Review: string;
    executiveSummary: string;
    technicalArchitecture: string;
    riskMatrix: string;
    implementationRoadmap: string;
  };
  diagrams?: {
    systemArchitecture: string;
    dataFlow: string;
    deploymentTopology: string;
    componentDiagram: string;
  };
}