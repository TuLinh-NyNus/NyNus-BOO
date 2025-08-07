/**
 * Client-safe token blacklist - không import Redis modules
 */

export async function blacklistTokenClientSafe(token: string, reason: string): Promise<void> {
  // Tạm thời disable để fix build - sẽ implement trong backend API
  console.log(`Token blacklist request: ${token} with reason: ${reason}`);

  // TODO: Implement proper token blacklisting trong backend API
  // Hiện tại tokens sẽ expire tự nhiên theo JWT expiration time
}

export const BLACKLIST_REASONS = {
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  SECURITY_BREACH: 'SECURITY_BREACH',
  ADMIN_REVOKE: 'ADMIN_REVOKE'
};
