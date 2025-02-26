import React, { useState, useCallback, useEffect, useRef } from 'react'

interface Column {
  name: string
  options: Array<{
    value: string
    label: string
  }>
}

interface PickerProps {
  columns: Column[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  title?: string
}

const Picker: React.FC<PickerProps> = ({
  columns,
  values,
  onChange,
  placeholder = '선택해주세요',
  title = '선택',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [tempValues, setTempValues] = useState(values)
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])
  const optionRefs = useRef<Map<string, HTMLDivElement>[]>(
    columns.map(() => new Map()),
  )
  const isDragging = useRef<boolean[]>(columns.map(() => false))
  const startY = useRef<number[]>(columns.map(() => 0))
  const scrollTop = useRef<number[]>(columns.map(() => 0))

  useEffect(() => {
    setTempValues(values)
  }, [values])

  // 컴포넌트가 열릴 때 선택된 값을 중앙에 위치시킴
  useEffect(() => {
    if (isVisible) {
      // 약간의 지연을 두고 스크롤 위치 조정
      setTimeout(() => {
        tempValues.forEach((value, columnIndex) => {
          if (
            value &&
            columnRefs.current[columnIndex] &&
            optionRefs.current[columnIndex].has(value)
          ) {
            scrollToOption(columnIndex, value)
          }
        })
      }, 100)
    }
  }, [isVisible, tempValues])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setTempValues(values)
    requestAnimationFrame(() => setIsVisible(true))
  }, [values])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setIsOpen(false), 300)
  }, [])

  const handleConfirm = useCallback(() => {
    onChange(tempValues)
    handleClose()
  }, [onChange, tempValues, handleClose])

  const handleCancel = useCallback(() => {
    setTempValues(values)
    handleClose()
  }, [values, handleClose])

  const scrollToOption = (columnIndex: number, value: string) => {
    const columnEl = columnRefs.current[columnIndex]
    const optionEl = optionRefs.current[columnIndex].get(value)

    if (columnEl && optionEl) {
      // 선택된 요소의 위치 계산
      const optionTop = optionEl.offsetTop
      const optionHeight = optionEl.offsetHeight
      const containerHeight = columnEl.clientHeight

      // 선택된 요소가 중앙에 오도록 스크롤 위치 계산
      const scrollPosition = optionTop - containerHeight / 2 + optionHeight / 2

      // 부드러운 스크롤 적용
      columnEl.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      })
    }
  }

  const handleSelect = (columnIndex: number, value: string) => {
    const newValues = [...tempValues]
    newValues[columnIndex] = value
    setTempValues(newValues)

    // 선택 시 자동으로 중앙으로 스크롤
    scrollToOption(columnIndex, value)
  }

  const handleMouseDown = (columnIndex: number, e: React.MouseEvent) => {
    isDragging.current[columnIndex] = true
    startY.current[columnIndex] = e.pageY
    if (columnRefs.current[columnIndex]) {
      scrollTop.current[columnIndex] =
        columnRefs.current[columnIndex]!.scrollTop
    }
  }

  const handleMouseMove = (columnIndex: number, e: React.MouseEvent) => {
    if (!isDragging.current[columnIndex] || !columnRefs.current[columnIndex])
      return
    const delta = (startY.current[columnIndex] - e.pageY) * 1.5
    columnRefs.current[columnIndex]!.scrollTop =
      scrollTop.current[columnIndex] + delta
    e.preventDefault()
  }

  const handleMouseUp = (columnIndex: number) => {
    isDragging.current[columnIndex] = false

    // 마우스 드래그 후 스크롤이 멈추면 가장 가까운 옵션으로 스냅
    if (columnRefs.current[columnIndex]) {
      const columnEl = columnRefs.current[columnIndex]!
      const scrollPosition = columnEl.scrollTop
      const containerHeight = columnEl.clientHeight
      const midPoint = scrollPosition + containerHeight / 2

      // 현재 스크롤 위치에서 가장 가까운 옵션 찾기
      let closestOption: { value: string; distance: number } | null = null

      optionRefs.current[columnIndex].forEach((optionEl, value) => {
        const optionTop = optionEl.offsetTop
        const optionHeight = optionEl.offsetHeight
        const optionMid = optionTop + optionHeight / 2
        const distance = Math.abs(midPoint - optionMid)

        if (!closestOption || distance < closestOption.distance) {
          closestOption = { value, distance }
        }
      })

      // 가장 가까운 옵션으로 자동 스크롤 및 선택
      // if (closestOption) {
      //   handleSelect(columnIndex, closestOption.value);
      // }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg border bg-white p-3 text-sm"
      >
        <span
          className={values.every((v) => v) ? 'text-gray-900' : 'text-gray-400'}
        >
          {values.every((v) => v)
            ? columns
                .map(
                  (col, i) =>
                    col.options.find((opt) => opt.value === values[i])?.label,
                )
                .join(' ')
            : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isVisible ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={handleCancel}
          />

          <div
            className={`absolute bottom-0 left-0 right-0 transform rounded-t-xl bg-white transition-all duration-300 ease-out ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-full opacity-0'
            }`}
          >
            <div className="flex items-center justify-between border-b p-4">
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-500"
              >
                취소
              </button>
              <span className="font-medium">{title}</span>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-blue-500"
              >
                확인
              </button>
            </div>

            <div
              className="relative flex w-full divide-x"
              style={{ height: '240px' }}
            >
              {/* 중앙 선택 영역 표시 - 모든 컬럼에 걸쳐서 적용 */}
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 -mt-5 h-10 bg-gray-100/30"></div>

              {columns.map((column, columnIndex) => (
                <div key={column.name} className="relative flex-1">
                  <div
                    ref={(el) => (columnRefs.current[columnIndex] = el)}
                    className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                    onMouseDown={(e) => handleMouseDown(columnIndex, e)}
                    onMouseMove={(e) => handleMouseMove(columnIndex, e)}
                    onMouseUp={() => handleMouseUp(columnIndex)}
                    onMouseLeave={() => handleMouseUp(columnIndex)}
                  >
                    {/* 상단 여백 */}
                    <div className="h-20"></div>

                    {column.options.map((option) => (
                      <div
                        key={option.value}
                        ref={(el) => {
                          if (el)
                            optionRefs.current[columnIndex].set(
                              option.value,
                              el,
                            )
                        }}
                        className={`select-none py-3 text-center transition-colors ${
                          tempValues[columnIndex] === option.value
                            ? 'font-medium text-blue-500'
                            : 'text-gray-400'
                        }`}
                        onClick={() => handleSelect(columnIndex, option.value)}
                      >
                        {option.label}
                      </div>
                    ))}

                    {/* 하단 여백 */}
                    <div className="h-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Picker
