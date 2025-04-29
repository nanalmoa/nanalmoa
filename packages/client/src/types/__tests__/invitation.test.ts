import { describe, it, expect } from 'vitest'
import {
  InvitationTypeEnum,
  InvitationStatusEnum,
  InvitationRoleEnum,
  IInvitation,
  IGroupInvitations,
  IManagerInvitations,
  GetInvitationsUserRes,
  IInvitationRes,
} from '@/types/invitations'

describe('Invitation Types', () => {
  describe('InvitationTypeEnum', () => {
    it('모든 초대 타입이 올바른 값을 가진다', () => {
      expect(InvitationTypeEnum.Group).toBe('group')
      expect(InvitationTypeEnum.Manager).toBe('manager')
    })

    it('초대 타입은 변경되지 않아야 한다', () => {
      const types = Object.values(InvitationTypeEnum)
      expect(types).toHaveLength(2)
      expect(types).toContain('group')
      expect(types).toContain('manager')
    })
  })

  describe('InvitationRoleEnum', () => {
    it('모든 초대 역할이 올바른 값을 가진다', () => {
      expect(InvitationRoleEnum.MANAGER).toBe('MANAGER')
      expect(InvitationRoleEnum.SUBORDINATE).toBe('SUBORDINATE')
      expect(InvitationRoleEnum.GROUP_ADMIN).toBe('GROUP_ADMIN')
      expect(InvitationRoleEnum.GROUP_MEMBER).toBe('GROUP_MEMBER')
    })

    it('초대 역할은 변경되지 않아야 한다', () => {
      const roles = Object.values(InvitationRoleEnum)
      expect(roles).toHaveLength(4)
      expect(roles).toContain('MANAGER')
      expect(roles).toContain('SUBORDINATE')
      expect(roles).toContain('GROUP_ADMIN')
      expect(roles).toContain('GROUP_MEMBER')
    })
  })

  describe('InvitationStatusEnum', () => {
    it('모든 초대 상태가 올바른 값을 가진다', () => {
      expect(InvitationStatusEnum.PENDING).toBe('PENDING')
      expect(InvitationStatusEnum.ACCEPTED).toBe('ACCEPTED')
      expect(InvitationStatusEnum.REJECTED).toBe('REJECTED')
      expect(InvitationStatusEnum.CANCELED).toBe('CANCELED')
      expect(InvitationStatusEnum.REMOVED).toBe('REMOVED')
    })

    it('초대 상태는 변경되지 않아야 한다', () => {
      const statuses = Object.values(InvitationStatusEnum)
      expect(statuses).toHaveLength(5)
      expect(statuses).toContain('PENDING')
      expect(statuses).toContain('ACCEPTED')
      expect(statuses).toContain('REJECTED')
      expect(statuses).toContain('CANCELED')
      expect(statuses).toContain('REMOVED')
    })
  })

  describe('IGroupInvitations Interface', () => {
    it('올바른 그룹 초대 객체가 타입을 만족한다', () => {
      const validInvitation: IGroupInvitations = {
        invitationId: 1,
        invitationType: InvitationTypeEnum.Group,
        status: InvitationStatusEnum.PENDING,
        inviterUuid: 'inviter-123',
        inviteeUuid: 'invitee-456',
        createdAt: new Date(),
        updatedAt: new Date(),
        inviterName: '홍길동',
        inviteeName: '김철수',
        groupId: 1,
        groupName: '테스트 그룹',
      }

      expect(validInvitation).toBeDefined()
      expect(typeof validInvitation.invitationId).toBe('number')
      expect(validInvitation.invitationType).toBe(InvitationTypeEnum.Group)
      expect(typeof validInvitation.status).toBe('string')
      expect(typeof validInvitation.inviterUuid).toBe('string')
      expect(typeof validInvitation.inviteeUuid).toBe('string')
      expect(validInvitation.createdAt).toBeInstanceOf(Date)
      expect(validInvitation.updatedAt).toBeInstanceOf(Date)
      expect(typeof validInvitation.inviterName).toBe('string')
      expect(typeof validInvitation.inviteeName).toBe('string')
      expect(typeof validInvitation.groupId).toBe('number')
      expect(typeof validInvitation.groupName).toBe('string')
    })
  })

  describe('IManagerInvitations Interface', () => {
    it('올바른 매니저 초대 객체가 타입을 만족한다', () => {
      const validInvitation: IManagerInvitations = {
        invitationId: 1,
        invitationType: InvitationTypeEnum.Manager,
        status: InvitationStatusEnum.PENDING,
        inviterUuid: 'inviter-123',
        inviteeUuid: 'invitee-456',
        createdAt: new Date(),
        updatedAt: new Date(),
        inviterName: '홍길동',
        inviteeName: '김철수',
      }

      expect(validInvitation).toBeDefined()
      expect(typeof validInvitation.invitationId).toBe('number')
      expect(validInvitation.invitationType).toBe(InvitationTypeEnum.Manager)
      expect(typeof validInvitation.status).toBe('string')
      expect(typeof validInvitation.inviterUuid).toBe('string')
      expect(typeof validInvitation.inviteeUuid).toBe('string')
      expect(validInvitation.createdAt).toBeInstanceOf(Date)
      expect(validInvitation.updatedAt).toBeInstanceOf(Date)
      expect(typeof validInvitation.inviterName).toBe('string')
      expect(typeof validInvitation.inviteeName).toBe('string')
    })
  })

  describe('IInvitation Interface', () => {
    it('올바른 초대 응답이 타입을 만족한다', () => {
      const validResponse: IInvitation = {
        sent: {
          groupInvitations: [],
          managerInvitations: [],
        },
        received: {
          groupInvitations: [],
          managerInvitations: [],
        },
      }

      expect(validResponse).toBeDefined()
      expect(validResponse.sent).toBeDefined()
      expect(validResponse.received).toBeDefined()
      expect(Array.isArray(validResponse.sent.groupInvitations)).toBe(true)
      expect(Array.isArray(validResponse.sent.managerInvitations)).toBe(true)
      expect(Array.isArray(validResponse.received.groupInvitations)).toBe(true)
      expect(Array.isArray(validResponse.received.managerInvitations)).toBe(
        true,
      )
    })
  })

  describe('GetInvitationsUserRes Interface', () => {
    it('GetInvitationsUserRes는 IInvitation을 확장한다', () => {
      const validResponse: GetInvitationsUserRes = {
        sent: {
          groupInvitations: [],
          managerInvitations: [],
        },
        received: {
          groupInvitations: [],
          managerInvitations: [],
        },
      }

      expect(validResponse).toBeDefined()
      expect(validResponse.sent).toBeDefined()
      expect(validResponse.received).toBeDefined()
      expect(Array.isArray(validResponse.sent.groupInvitations)).toBe(true)
      expect(Array.isArray(validResponse.sent.managerInvitations)).toBe(true)
      expect(Array.isArray(validResponse.received.groupInvitations)).toBe(true)
      expect(Array.isArray(validResponse.received.managerInvitations)).toBe(
        true,
      )
    })
  })

  describe('IInvitationRes Interface', () => {
    it('올바른 초대 응답이 타입을 만족한다', () => {
      const validResponse: IInvitationRes = {
        invitationId: 1,
        invitationType: InvitationTypeEnum.Manager,
        status: InvitationStatusEnum.PENDING,
        inviterUuid: 'inviter-123',
        inviteeUuid: 'invitee-456',
        createdAt: new Date(),
        updatedAt: new Date(),
        inviterName: '홍길동',
        inviteeName: '김철수',
        groupId: 1,
        groupName: '테스트 그룹',
      }

      expect(validResponse).toBeDefined()
      expect(typeof validResponse.invitationId).toBe('number')
      expect(validResponse.invitationType).toBe(InvitationTypeEnum.Manager)
      expect(typeof validResponse.status).toBe('string')
      expect(typeof validResponse.inviterUuid).toBe('string')
      expect(typeof validResponse.inviteeUuid).toBe('string')
      expect(validResponse.createdAt).toBeInstanceOf(Date)
      expect(validResponse.updatedAt).toBeInstanceOf(Date)
      expect(typeof validResponse.inviterName).toBe('string')
      expect(typeof validResponse.inviteeName).toBe('string')
      expect(typeof validResponse.groupId).toBe('number')
      expect(typeof validResponse.groupName).toBe('string')
    })
  })
})
