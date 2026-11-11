import crypto from 'node:crypto';
import { IdGeneratorPort } from '../../application/ports/id-generator.port.js';

export class UuidGenerator implements IdGeneratorPort {
  generate(): string {
    return crypto.randomUUID();
  }
}
