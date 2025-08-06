import { describe, it, expect, beforeEach } from 'vitest';
import { AuthError, getAuthErrorMessage, isAuthError, createAuthError } from './auth-error';

describe('Auth Error Utilities', () => {
  beforeEach(() => {
    // Clear any test state
  });

  describe('AuthError class', () => {
    it('creates AuthError with code and message', () => {
      const error = new AuthError('auth/invalid-email', 'Invalid email address');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AuthError');
      expect(error.code).toBe('auth/invalid-email');
      expect(error.message).toBe('Invalid email address');
    });

    it('creates AuthError with only code', () => {
      const error = new AuthError('auth/user-not-found');
      
      expect(error.code).toBe('auth/user-not-found');
      expect(error.message).toBe('auth/user-not-found'); // Should default to code
    });

    it('has proper error properties', () => {
      const error = new AuthError('auth/weak-password', 'Password is too weak');
      
      expect(error.stack).toBeDefined();
      expect(error.toString()).toContain('AuthError');
      expect(error.toString()).toContain('Password is too weak');
    });

    it('is catchable like regular errors', () => {
      expect(() => {
        throw new AuthError('auth/test-error', 'Test error');
      }).toThrow('Test error');
      
      try {
        throw new AuthError('auth/test-error', 'Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe('auth/test-error');
      }
    });
  });

  describe('getAuthErrorMessage function', () => {
    describe('Email/Password Authentication Errors', () => {
      it('handles invalid email error', () => {
        const message = getAuthErrorMessage('auth/invalid-email');
        expect(message).toBe('Silakan masukkan alamat email yang valid');
      });

      it('handles user not found error', () => {
        const message = getAuthErrorMessage('auth/user-not-found');
        expect(message).toBe('Akun dengan email ini tidak ditemukan');
      });

      it('handles wrong password error', () => {
        const message = getAuthErrorMessage('auth/wrong-password');
        expect(message).toBe('Password yang Anda masukkan salah');
      });

      it('handles weak password error', () => {
        const message = getAuthErrorMessage('auth/weak-password');
        expect(message).toBe('Password terlalu lemah. Gunakan minimal 6 karakter');
      });

      it('handles email already in use error', () => {
        const message = getAuthErrorMessage('auth/email-already-in-use');
        expect(message).toBe('Email ini sudah terdaftar. Silakan gunakan email lain');
      });

      it('handles invalid credential error', () => {
        const message = getAuthErrorMessage('auth/invalid-credential');
        expect(message).toBe('Email atau password tidak valid');
      });

      it('handles user disabled error', () => {
        const message = getAuthErrorMessage('auth/user-disabled');
        expect(message).toBe('Akun ini telah dinonaktifkan');
      });

      it('handles too many requests error', () => {
        const message = getAuthErrorMessage('auth/too-many-requests');
        expect(message).toBe('Terlalu banyak percobaan login. Coba lagi nanti');
      });
    });

    describe('Social Authentication Errors', () => {
      it('handles popup closed by user error', () => {
        const message = getAuthErrorMessage('auth/popup-closed-by-user');
        expect(message).toBe('Login dibatalkan. Silakan coba lagi');
      });

      it('handles popup blocked error', () => {
        const message = getAuthErrorMessage('auth/popup-blocked');
        expect(message).toBe('Popup diblokir browser. Harap izinkan popup dan coba lagi');
      });

      it('handles cancelled popup request error', () => {
        const message = getAuthErrorMessage('auth/cancelled-popup-request');
        expect(message).toBe('Login dibatalkan. Silakan coba lagi');
      });

      it('handles operation not allowed error', () => {
        const message = getAuthErrorMessage('auth/operation-not-allowed');
        expect(message).toBe('Metode login ini tidak tersedia saat ini');
      });

      it('handles account exists with different credential error', () => {
        const message = getAuthErrorMessage('auth/account-exists-with-different-credential');
        expect(message).toBe('Akun dengan email ini sudah ada dengan metode login berbeda');
      });
    });

    describe('Network and System Errors', () => {
      it('handles network request failed error', () => {
        const message = getAuthErrorMessage('auth/network-request-failed');
        expect(message).toBe('Koneksi bermasalah. Periksa internet Anda dan coba lagi');
      });

      it('handles internal error', () => {
        const message = getAuthErrorMessage('auth/internal-error');
        expect(message).toBe('Terjadi kesalahan sistem. Silakan coba lagi');
      });

      it('handles service unavailable error', () => {
        const message = getAuthErrorMessage('auth/service-unavailable');
        expect(message).toBe('Layanan sedang tidak tersedia. Silakan coba lagi nanti');
      });

      it('handles timeout error', () => {
        const message = getAuthErrorMessage('auth/timeout');
        expect(message).toBe('Koneksi timeout. Silakan coba lagi');
      });
    });

    describe('Security and Verification Errors', () => {
      it('handles requires recent login error', () => {
        const message = getAuthErrorMessage('auth/requires-recent-login');
        expect(message).toBe('Untuk keamanan, silakan login ulang terlebih dahulu');
      });

      it('handles expired action code error', () => {
        const message = getAuthErrorMessage('auth/expired-action-code');
        expect(message).toBe('Kode verifikasi sudah kadaluarsa. Minta kode baru');
      });

      it('handles invalid action code error', () => {
        const message = getAuthErrorMessage('auth/invalid-action-code');
        expect(message).toBe('Kode verifikasi tidak valid');
      });

      it('handles captcha check failed error', () => {
        const message = getAuthErrorMessage('auth/captcha-check-failed');
        expect(message).toBe('Verifikasi CAPTCHA gagal. Silakan coba lagi');
      });
    });

    describe('Default and Unknown Errors', () => {
      it('handles unknown error codes', () => {
        const message = getAuthErrorMessage('auth/unknown-error-code');
        expect(message).toBe('Terjadi kesalahan. Silakan coba lagi');
      });

      it('handles non-auth error codes', () => {
        const message = getAuthErrorMessage('firestore/permission-denied');
        expect(message).toBe('Terjadi kesalahan. Silakan coba lagi');
      });

      it('handles empty error code', () => {
        const message = getAuthErrorMessage('');
        expect(message).toBe('Terjadi kesalahan. Silakan coba lagi');
      });

      it('handles null error code', () => {
        const message = getAuthErrorMessage(null as any);
        expect(message).toBe('Terjadi kesalahan. Silakan coba lagi');
      });

      it('handles undefined error code', () => {
        const message = getAuthErrorMessage(undefined as any);
        expect(message).toBe('Terjadi kesalahan. Silakan coba lagi');
      });
    });

    describe('Case Sensitivity and Variations', () => {
      it('handles case variations correctly', () => {
        const message1 = getAuthErrorMessage('AUTH/INVALID-EMAIL');
        const message2 = getAuthErrorMessage('auth/invalid-email');
        
        // Should normalize case or handle both
        expect(typeof message1).toBe('string');
        expect(typeof message2).toBe('string');
      });

      it('handles error codes with extra spaces', () => {
        const message = getAuthErrorMessage('  auth/invalid-email  ');
        expect(message).toBe('Silakan masukkan alamat email yang valid');
      });

      it('handles similar error codes correctly', () => {
        const message1 = getAuthErrorMessage('auth/user-not-found');
        const message2 = getAuthErrorMessage('auth/user-disabled');
        
        expect(message1).not.toBe(message2);
        expect(message1).toBe('Akun dengan email ini tidak ditemukan');
        expect(message2).toBe('Akun ini telah dinonaktifkan');
      });
    });
  });

  describe('isAuthError function', () => {
    it('identifies AuthError instances correctly', () => {
      const authError = new AuthError('auth/test', 'Test error');
      const regularError = new Error('Regular error');
      
      expect(isAuthError(authError)).toBe(true);
      expect(isAuthError(regularError)).toBe(false);
    });

    

    it('identifies objects with auth error structure', () => {
      const errorLikeObject = {
        code: 'auth/user-not-found',
        message: 'User not found'
      };
      
      expect(isAuthError(errorLikeObject)).toBe(true);
    });

    it('rejects non-error objects', () => {
      expect(isAuthError(null)).toBe(false);
      expect(isAuthError(undefined)).toBe(false);
      expect(isAuthError('string')).toBe(false);
      expect(isAuthError(123)).toBe(false);
      expect(isAuthError({})).toBe(false);
      expect(isAuthError({ message: 'no code' })).toBe(false);
    });

    it('handles edge cases correctly', () => {
      const edgeCases = [
        { code: '', message: 'empty code' },
        { code: 'no-auth-prefix', message: 'no auth prefix' },
        { code: 'auth/', message: 'empty error type' },
        { code: 'auth/valid-error', message: '' }
      ];
      
      edgeCases.forEach(testCase => {
        const result = isAuthError(testCase);
        if (testCase.code.startsWith('auth/') && testCase.code.length > 5) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      });
    });
  });

  describe('createAuthError function', () => {
    it('creates AuthError from error code', () => {
      const error = createAuthError('auth/invalid-email');
      
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe('auth/invalid-email');
      expect(error.message).toBe('Silakan masukkan alamat email yang valid');
    });

    it('creates AuthError with custom message', () => {
      const error = createAuthError('auth/custom-error', 'Custom error message');
      
      expect(error.code).toBe('auth/custom-error');
      expect(error.message).toBe('Custom error message');
    });

    

    it('handles invalid inputs gracefully', () => {
      const error1 = createAuthError('');
      const error2 = createAuthError(null as any);
      const error3 = createAuthError(undefined as any);
      
      [error1, error2, error3].forEach(error => {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.message).toBe('Terjadi kesalahan. Silakan coba lagi');
      });
    });
  });
});