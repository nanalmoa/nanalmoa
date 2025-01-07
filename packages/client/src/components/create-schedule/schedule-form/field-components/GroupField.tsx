import { useQuery } from '@tanstack/react-query'
import BaseSection from './BaseSection'
import { useCallback, useRef, useState } from 'react'
import Select, { components, MenuProps, MultiValue } from 'react-select'
import { GroupMember } from '@/types/group'
import { QUERY_KEYS } from '@/constants/api'
import { getGroupUser } from '@/api/group/get-group-user'
import { getGroupDetail } from '@/api/group/get-group-detail'
import { toast } from 'react-toastify'
import { IGroup } from '@/types/schedules'
import { FieldError } from 'react-hook-form'

type Props = {
  value?: IGroup[]
  onChange: (value: IGroup[]) => void
  error?: FieldError
  /** 해당 필드가 필수 작성 필드일때 true */
  required?: boolean
}

const GroupField = ({ value, onChange }: Props) => {
  const prevSelectedMembersRef = useRef<GroupMember[]>([])

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  // 현재 선택된 그룹 id
  const [selectedGroupId, setSelectedGroupId] = useState(0)
  // 선택된 member uuid 배열
  const [selectedMembers, setSelectedMembers] = useState<
    MultiValue<GroupMember>
  >([])
  // payload에 담을 group member 배열
  const [selectedGroupData, setSelectedGroupData] = useState<IGroup[]>(
    value || [],
  )

  // Select에서 선택 이벤트가 발생한 경우
  const handleChange = useCallback((newValue: MultiValue<GroupMember>) => {
    const newSelectedMembers = newValue as GroupMember[]
    const prevSelectedMembers = prevSelectedMembersRef.current

    // 추가된 사용자 찾기
    const addedMembers = newSelectedMembers.filter(
      (user) =>
        !prevSelectedMembers.some(
          (prevUser) => prevUser.userUuid === user.userUuid,
        ),
    )

    // 삭제된 사용자 찾기
    const removedMembers = prevSelectedMembers.filter(
      (user) =>
        !newSelectedMembers.some(
          (newUser) => newUser.userUuid === user.userUuid,
        ),
    )

    // 추가된 사용자 처리
    addedMembers.forEach((user) => {
      console.log('추가된 사용자:', user)
      if (
        selectedGroupData.some((group) => group.groupId === selectedGroupId)
      ) {
        const newData = selectedGroupData.map((group) =>
          group.groupId === selectedGroupId
            ? {
                ...group,
                userUuids: [...(group.userUuids || []), user.userUuid],
              }
            : group,
        )
        setSelectedGroupData(newData)
        onChange(newData)
      } else {
        const newData = [
          ...selectedGroupData,
          {
            groupId: selectedGroupId,
            userUuids: [user.userUuid],
          },
        ]

        setSelectedGroupData(newData)
        onChange(newData)
      }
    })

    // 삭제된 사용자 처리
    removedMembers.forEach((user) => {
      console.log('삭제된 사용자:', user)
      // 모든 그룹에서 해당 사용자 제거
      const updatedGroups = selectedGroupData.map((group) => ({
        ...group,
        userUuids: group.userUuids.filter((uuid) => uuid !== user.userUuid),
      }))

      // 비어있는 그룹 제거
      const nonEmptyGroups = updatedGroups.filter(
        (group) => group.userUuids.length > 0,
      )

      setSelectedGroupData(nonEmptyGroups)
      onChange(nonEmptyGroups)
    })

    // 상태 업데이트
    setSelectedMembers(newSelectedMembers)
    prevSelectedMembersRef.current = newSelectedMembers
  }, [onChange, selectedGroupData, selectedGroupId])

  const handleMenuOpen = () => setMenuIsOpen(true)
  const handleMenuClose = () => setMenuIsOpen(false)

  // Select 컴포넌트 커스텀
  const CustomMenu = (props: MenuProps<GroupMember, true>) => {
    /** 내 그룹 조회 */
    const { data: userGroupList } = useQuery({
      queryKey: [QUERY_KEYS.GET_GROUP_USER],
      queryFn: getGroupUser,
    })

    /** 특정 그룹 상세 조회 */
    const { data: GroupDetail } = useQuery({
      queryKey: [QUERY_KEYS.GET_GROUP_DETAIL, selectedGroupId],
      queryFn: () => getGroupDetail(selectedGroupId),
      enabled: !!selectedGroupId,
    })

    const handleGroupClick = (groupValue: number) => {
      setSelectedGroupId(groupValue)
    }

    return (
      <components.Menu {...props}>
        <div className="p-2">
          <div className="flex overflow-hidden rounded border">
            {userGroupList && !userGroupList.length && (
              <div className="flex min-h-[100px] w-full items-center justify-center text-neutral-500">
                ❌ 그룹이 없습니다!
              </div>
            )}

            {userGroupList && userGroupList.length && (
              <>
                {/* 그룹 목록 */}
                <div className="w-1/3 border-r">
                  <h3 className="border-b bg-neutral-100 p-2 font-semibold">
                    그룹 목록
                  </h3>
                  {userGroupList && (
                    <ul>
                      {userGroupList.map((group) => (
                        <li
                          key={group.groupId}
                          className={`cursor-pointer p-2 ${
                            selectedGroupId === group.groupId
                              ? 'bg-blue-100'
                              : ''
                          }`}
                          onClick={() => handleGroupClick(group.groupId)}
                        >
                          {group.groupName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* 그룹 내 사용자 목록 */}
                <div className="w-2/3">
                  <h3 className="border-b bg-neutral-100 p-2 font-semibold">
                    사용자 목록
                  </h3>
                  {!GroupDetail && (
                    <div className="flex min-h-[100px] items-center justify-center text-neutral-500">
                      ⬅️ 그룹을 먼저 선택해주세요
                    </div>
                  )}
                  {GroupDetail && (
                    <ul>
                      {GroupDetail.members.map((member) => (
                        <li
                          key={member.userUuid}
                          className={`flex cursor-pointer items-center p-2 ${
                            props
                              .getValue()
                              .some((v) => v.userUuid === member.userUuid)
                              ? 'bg-red-100'
                              : ''
                          }`}
                          onClick={() => {
                            const currentValue = props.getValue()
                            if (
                              currentValue.some(
                                (v) => v.userUuid === member.userUuid,
                              )
                            ) {
                              toast.error('이미 선택된 그룹원입니다!')
                              return
                            }
                            props.setValue(
                              [...currentValue, member],
                              'select-option',
                            )
                          }}
                        >
                          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-300">
                            {member.name[0]}
                          </div>
                          <span>{member.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </components.Menu>
    )
  }

  return (
    <BaseSection label="공유 그룹">
      <div className="w-full">
        <Select<GroupMember, true>
          isMulti
          value={selectedMembers}
          onChange={handleChange}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.userUuid}
          placeholder="공유할 그룹원을 선택해주세요"
          components={{ Menu: CustomMenu }}
          menuIsOpen={menuIsOpen}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          className="w-full"
          classNames={{
            control: ({ isFocused }) =>
              `border ${isFocused ? 'border-neutral-400' : 'border-neutral-300'} shadow-none hover:border-neutral-400`,
            menu: () => 'mt-1 shadow-sm',
          }}
        />
      </div>
    </BaseSection>
  )
}

export default GroupField
