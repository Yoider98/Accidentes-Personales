import jwt, { type SignOptions } from 'jsonwebtoken';
import { TokenPayload, TokenServicePort } from '../../application/ports/token-service.port.js';
import { ValidationException } from '../../domain/exceptions/domain.exception.js';

export class JwtTokenService implements TokenServicePort {
  private readonly secret: string;
  private readonly expiresIn: SignOptions['expiresIn'];

  constructor() {
    this.secret = process.env.JWT_SECRET || 'dev_fallback_secret_must_be_changed_in_prod';
    this.expiresIn = (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];
  }

  generateToken(payload: TokenPayload): string {
    const options: SignOptions = {};
    if (this.expiresIn) {
      options.expiresIn = this.expiresIn;
    }
    return jwt.sign(payload, this.secret, options);
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      if (!decoded || !decoded.userId || !decoded.email) {
        throw new ValidationException('Token malformado o sin claims requeridos.');
      }
      return {
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (err: any) {
      throw new ValidationException('Token de autenticación inválido o expirado.');
    }
  }
}

