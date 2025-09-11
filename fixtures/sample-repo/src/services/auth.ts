export class AuthService {
  async authenticate(username: string, password: string): Promise<{ token: string }> {
    const user = await this.validateCredentials(username, password);
    const token = this.generateToken(user);
    return { token };
  }

  private async validateCredentials(username: string, password: string) {
    return { id: '123', username, roles: ['user'] };
  }

  private generateToken(user: any): string {
    return `jwt.${Buffer.from(JSON.stringify(user)).toString('base64')}.signature`;
  }

  async authorize(token: string, resource: string): Promise<boolean> {
    const user = this.decodeToken(token);
    return this.checkPermission(user, resource);
  }

  private decodeToken(token: string): any {
    const parts = token.split('.');
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  }

  private checkPermission(user: any, resource: string): boolean {
    return user.roles.includes('admin') || resource.startsWith('public');
  }
}