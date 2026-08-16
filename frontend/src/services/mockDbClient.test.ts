import { describe, it, expect } from 'vitest';
import { 
  getMockUsers, 
  getMockUserById, 
  setStudentOnlineStatus, 
  getRegisteredStudentOpponents,
  insertMockUser
} from './mockDbClient';

describe('mockDbClient', () => {
  it('gets mock users', async () => {
    const users = await getMockUsers();
    expect(users.length).toBeGreaterThan(0);
  });

  it('gets mock user by id', async () => {
    const user = await getMockUserById('usr_kagiso');
    expect(user).toBeDefined();
    expect(user?.studentNumber).toBe('2481920');
  });

  it('sets student online status', async () => {
    setStudentOnlineStatus('usr_kagiso', true);
    const user = await getMockUserById('usr_kagiso');
    expect(user?.isOnline).toBe(true);
  });

  it('gets registered student opponents', async () => {
    const opponents = await getRegisteredStudentOpponents('usr_kagiso');
    expect(opponents.some(o => o.id === 'usr_kagiso')).toBe(false);
  });

  it('inserts mock user', async () => {
    const newUser = await insertMockUser({
      username: 'test_user',
      email: 'test@wits.ac.za'
    });
    expect(newUser.id).toBeDefined();
    expect(newUser.username).toBe('test_user');
    expect(newUser.email).toBe('test@wits.ac.za');
  });
});
