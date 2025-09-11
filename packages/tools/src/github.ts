import { Octokit } from '@octokit/rest';
import { MCPTool } from '@ea-mcp/common';
import { logger } from '@ea-mcp/common';

export class GitHubTool {
  private octokit: Octokit | null = null;
  
  constructor(private token?: string) {
    if (token) {
      this.octokit = new Octokit({ auth: token });
    }
  }

  static getToolDefinitions(): MCPTool[] {
    return [
      {
        name: 'github.read',
        description: 'Read files, list commits, issues, PRs from GitHub',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            path: { type: 'string' },
            ref: { type: 'string' }
          },
          required: ['owner', 'repo']
        }
      },
      {
        name: 'github.pr.create',
        description: 'Create or update a pull request',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            head: { type: 'string' },
            base: { type: 'string' },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          },
          required: ['owner', 'repo', 'title', 'head', 'base']
        }
      }
    ];
  }

  async readFile(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    if (!this.octokit) {
      logger.warn('GitHub token not configured, returning mock data');
      return `// Mock content for ${path}\n// TODO: Configure GITHUB_TOKEN`;
    }

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if ('content' in data && typeof data.content === 'string') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      
      throw new Error('Not a file');
    } catch (error) {
      logger.error(`Failed to read file ${path}: ${error}`);
      throw error;
    }
  }

  async listFiles(owner: string, repo: string, path: string = '', ref?: string): Promise<string[]> {
    if (!this.octokit) {
      logger.warn('GitHub token not configured, returning mock data');
      return ['mock-file1.ts', 'mock-file2.ts'];
    }

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(data)) {
        return data.map(item => item.path);
      }
      
      return [];
    } catch (error) {
      logger.error(`Failed to list files: ${error}`);
      throw error;
    }
  }

  async createPullRequest(params: {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base: string;
    files?: Array<{ path: string; content: string }>;
  }): Promise<{ number: number; url: string }> {
    if (!this.octokit) {
      logger.warn('GitHub token not configured, returning mock PR');
      return { number: 999, url: 'https://github.com/mock/pr/999' };
    }

    try {
      if (params.files && params.files.length > 0) {
        const { data: ref } = await this.octokit.git.getRef({
          owner: params.owner,
          repo: params.repo,
          ref: `heads/${params.base}`
        });

        const { data: commit } = await this.octokit.git.getCommit({
          owner: params.owner,
          repo: params.repo,
          commit_sha: ref.object.sha
        });

        const blobs = await Promise.all(
          params.files.map(file =>
            this.octokit!.git.createBlob({
              owner: params.owner,
              repo: params.repo,
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64'
            })
          )
        );

        const tree = await this.octokit.git.createTree({
          owner: params.owner,
          repo: params.repo,
          base_tree: commit.tree.sha,
          tree: params.files.map((file, i) => ({
            path: file.path,
            mode: '100644',
            type: 'blob',
            sha: blobs[i].data.sha
          }))
        });

        const newCommit = await this.octokit.git.createCommit({
          owner: params.owner,
          repo: params.repo,
          message: `EA Analysis: ${params.title}`,
          tree: tree.data.sha,
          parents: [ref.object.sha]
        });

        await this.octokit.git.createRef({
          owner: params.owner,
          repo: params.repo,
          ref: `refs/heads/${params.head}`,
          sha: newCommit.data.sha
        });
      }

      const { data: pr } = await this.octokit.pulls.create({
        owner: params.owner,
        repo: params.repo,
        title: params.title,
        body: params.body,
        head: params.head,
        base: params.base
      });

      return { number: pr.number, url: pr.html_url };
    } catch (error) {
      logger.error(`Failed to create PR: ${error}`);
      throw error;
    }
  }

  async getIssues(owner: string, repo: string, labels?: string[]): Promise<any[]> {
    if (!this.octokit) {
      return [];
    }

    try {
      const { data } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        labels: labels?.join(','),
        state: 'open'
      });
      
      return data;
    } catch (error) {
      logger.error(`Failed to get issues: ${error}`);
      return [];
    }
  }
}