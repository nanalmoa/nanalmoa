import { describe, it, expect } from 'vitest'
import {
  GetGroupUserRes,
  PostGroupReq,
  PostGroupRes,
  GetGroupDetail,
  GroupInvitationEnum,
  DeleteGroupUser,
} from '@/types/group'

describe('Group Types', () => {
  describe('GetGroupUserRes Interface', () => {
    it('올바른 그룹 사용자 응답이 타입을 만족한다', () => {
      const validResponse: GetGroupUserRes = {
        groupId: 1,
        groupName: '테스트 그룹',
        createdAt: new Date(),
        memberCount: 5,
        isAdmin: true,
      }

      expect(validResponse).toBeDefined()
      expect(typeof validResponse.groupId).toBe('number')
      expect(typeof validResponse.groupName).toBe('string')
      expect(validResponse.createdAt).toBeInstanceOf(Date)
      expect(typeof validResponse.memberCount).toBe('number')
      expect(typeof validResponse.isAdmin).toBe('boolean')
    })
  })

  describe('PostGroupReq Interface', () => {
    it('올바른 그룹 생성 요청이 타입을 만족한다', () => {
      const validRequest: PostGroupReq = {
        groupName: '새로운 그룹',
      }

      expect(validRequest).toBeDefined()
      expect(typeof validRequest.groupName).toBe('string')
    })
  })

  describe('PostGroupRes Interface', () => {
    it('PostGroupRes는 GetGroupUserRes를 확장한다', () => {
      const validResponse: PostGroupRes = {
        groupId: 1,
        groupName: '테스트 그룹',
        createdAt: new Date(),
        memberCount: 5,
        isAdmin: true,
      }

      expect(validResponse).toBeDefined()
      expect(typeof validResponse.groupId).toBe('number')
      expect(typeof validResponse.groupName).toBe('string')
      expect(validResponse.createdAt).toBeInstanceOf(Date)
      expect(typeof validResponse.memberCount).toBe('number')
      expect(typeof validResponse.isAdmin).toBe('boolean')
    })
  })

  describe('GetGroupDetail Interface', () => {
    it('올바른 그룹 상세 정보가 타입을 만족한다', () => {
      const validDetail: GetGroupDetail = {
        groupId: 1,
        groupName: '테스트 그룹',
        createdAt: new Date(),
        memberCount: 5,
        isAdmin: true,
        members: [
          {
            userUuid: 'user-123',
            name: '홍길동',
            isAdmin: true,
            joinedAt: new Date(),
          },
        ],
      }

      expect(validDetail).toBeDefined()
      expect(typeof validDetail.groupId).toBe('number')
      expect(typeof validDetail.groupName).toBe('string')
      expect(validDetail.createdAt).toBeInstanceOf(Date)
      expect(typeof validDetail.memberCount).toBe('number')
      expect(typeof validDetail.isAdmin).toBe('boolean')
      expect(Array.isArray(validDetail.members)).toBe(true)
      expect(validDetail.members[0]).toBeDefined()
      expect(typeof validDetail.members[0].userUuid).toBe('string')
      expect(typeof validDetail.members[0].name).toBe('string')
      expect(typeof validDetail.members[0].isAdmin).toBe('boolean')
      expect(validDetail.members[0].joinedAt).toBeInstanceOf(Date)
    })
  })

  describe('GroupInvitationEnum', () => {
    it('그룹 초대 상태가 올바른 값을 가진다', () => {
      expect(GroupInvitationEnum.PENDING).toBe('요청중')
    })

    it('그룹 초대 상태는 변경되지 않아야 한다', () => {
      const statuses = Object.values(GroupInvitationEnum)
      expect(statuses).toHaveLength(1)
      expect(statuses).toContain('요청중')
    })
  })

  describe('DeleteGroupUser Interface', () => {
    it('올바른 그룹 사용자 삭제 요청이 타입을 만족한다', () => {
      const validRequest: DeleteGroupUser = {
        groupId: 1,
        memberUuid: 'user-123',
      }

      expect(validRequest).toBeDefined()
      expect(typeof validRequest.groupId).toBe('number')
      expect(typeof validRequest.memberUuid).toBe('string')
    })
  })
})
