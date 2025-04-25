import { describe, it, expect } from 'vitest'
import {
  IManagerUser,
  IGetMyManagersRes,
  IGetMySubordinatesRes,
} from '@/types/manager'

describe('Manager Types', () => {
  describe('IManagerUser Interface', () => {
    it('올바른 매니저 사용자 객체가 타입을 만족한다', () => {
      const validManager: IManagerUser = {
        userUuid: 'user-123',
        name: '홍길동',
        profileImage: 'https://example.com/profile.jpg',
        email: 'test@example.com',
        isManager: true,
      }

      expect(validManager).toBeDefined()
      expect(typeof validManager.userUuid).toBe('string')
      expect(typeof validManager.name).toBe('string')
      expect(typeof validManager.profileImage).toBe('string')
      expect(typeof validManager.email).toBe('string')
      expect(typeof validManager.isManager).toBe('boolean')
    })
  })

  describe('IGetMyManagersRes Interface', () => {
    it('IGetMyManagersRes는 IManagerUser 배열을 확장한다', () => {
      const validResponse: IGetMyManagersRes = [
        {
          userUuid: 'user-123',
          name: '홍길동',
          profileImage: 'https://example.com/profile.jpg',
          email: 'test@example.com',
          isManager: true,
        },
      ]

      expect(validResponse).toBeDefined()
      expect(Array.isArray(validResponse)).toBe(true)
      expect(validResponse[0]).toBeDefined()
      expect(typeof validResponse[0].userUuid).toBe('string')
      expect(typeof validResponse[0].name).toBe('string')
      expect(typeof validResponse[0].profileImage).toBe('string')
      expect(typeof validResponse[0].email).toBe('string')
      expect(typeof validResponse[0].isManager).toBe('boolean')
    })
  })

  describe('IGetMySubordinatesRes Interface', () => {
    it('IGetMySubordinatesRes는 IManagerUser 배열을 확장한다', () => {
      const validResponse: IGetMySubordinatesRes = [
        {
          userUuid: 'user-123',
          name: '홍길동',
          profileImage: 'https://example.com/profile.jpg',
          email: 'test@example.com',
          isManager: true,
        },
      ]

      expect(validResponse).toBeDefined()
      expect(Array.isArray(validResponse)).toBe(true)
      expect(validResponse[0]).toBeDefined()
      expect(typeof validResponse[0].userUuid).toBe('string')
      expect(typeof validResponse[0].name).toBe('string')
      expect(typeof validResponse[0].profileImage).toBe('string')
      expect(typeof validResponse[0].email).toBe('string')
      expect(typeof validResponse[0].isManager).toBe('boolean')
    })
  })
})
