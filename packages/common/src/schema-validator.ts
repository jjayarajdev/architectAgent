import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EAInput } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class SchemaValidator {
  private ajv: Ajv;
  private validateFn: any;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    
    const schemaPath = path.resolve(__dirname, '../../../schemas/input.schema.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    this.validateFn = this.ajv.compile(schema);
  }

  validate(data: unknown): { valid: boolean; errors?: string[] } {
    const valid = this.validateFn(data);
    
    if (!valid) {
      const errors = this.validateFn.errors?.map((err: any) => {
        return `${err.instancePath} ${err.message}`;
      }) || [];
      return { valid: false, errors };
    }
    
    return { valid: true };
  }

  validateInput(input: unknown): EAInput {
    const result = this.validate(input);
    
    if (!result.valid) {
      throw new Error(`Input validation failed:\n${result.errors?.join('\n')}`);
    }
    
    return input as EAInput;
  }
}

export const schemaValidator = new SchemaValidator();