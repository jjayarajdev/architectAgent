export interface RepoConfig {
  url: string;
  branch: string;
  path_filters: string[];
  monorepo: boolean;
}

export interface Requirement {
  summary: string;
  type: 'feature' | 'bugfix' | 'refactor' | 'security' | 'performance';
  drivers?: string[];
  acceptance_criteria?: string[];
  non_functional?: {
    security?: string[];
    performance?: {
      p95_ms?: number;
      concurrency?: number;
    };
    availability_slo?: string;
  };
  constraints?: string[];
  deadline?: string;
}

export interface AnalysisContext {
  target_envs?: string[];
  architecture_style?: string;
  domain_owners?: string[];
  compliance?: string[];
  cloud?: string;
  ci_cd?: string;
  risk_tolerance?: 'low' | 'medium' | 'high';
}

export interface Documentation {
  roots?: string[];
  formats?: string[];
  primary_diagram_style?: 'C4' | 'UML' | 'ArchiMate';
}

export interface AnalysisScope {
  code_depth?: 'shallow' | 'standard' | 'deep';
  history_window?: string;
  include_open_prs?: boolean;
  include_issues_labels?: string[];
}

export interface OutputConfig {
  deliverables?: string[];
  format?: string[];
  repo_write_back?: {
    pull_request?: boolean;
    pr_branch?: string;
  };
}

export interface EAInput {
  repo: RepoConfig;
  requirement: Requirement;
  context: AnalysisContext;
  documentation: Documentation;
  analysis_scope: AnalysisScope;
  outputs: OutputConfig;
}

export interface ImpactedComponent {
  component: string;
  type: 'service' | 'api' | 'database' | 'infrastructure' | 'library' | 'config';
  file_paths: string[];
  change: 'create' | 'modify' | 'delete' | 'refactor';
  confidence: 'high' | 'medium' | 'low';
  description?: string;
}

export interface AsIsArchitecture {
  c4_l2_summary?: string;
  c4_l3_components?: Array<{
    name: string;
    type: string;
    description: string;
    technology?: string;
  }>;
  data_flows?: Array<{
    from: string;
    to: string;
    protocol?: string;
    description?: string;
  }>;
  interfaces?: Array<{
    name: string;
    type: string;
    path?: string;
    methods?: string[];
  }>;
  slos?: Record<string, string>;
  citations?: Array<{
    file: string;
    line_start?: number;
    line_end?: number;
    content?: string;
  }>;
}

export interface Risk {
  id: string;
  category: string;
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigations: string[];
}

export interface ImpactAnalysis {
  dependencies: string[];
  risks: Risk[];
  effort_bucket: 'S' | 'M' | 'L' | 'XL';
  test_areas: string[];
  rollout_strategy?: string;
  rollback_strategy?: string;
}