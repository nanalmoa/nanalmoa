import { DateFormatTypeEnum } from '@/types/common'
import { IMediaAnalysisResult } from '@/types/schedules'
import { formatDate } from '@/utils/format-date'
import { CategoryTag } from '../common'
import { NextIcon, PrevIcon } from '../icons'
import { cn } from '@/utils/cn'
import { categoryLabels } from '@/constants/schedules'
import { Categories } from '@/types/category'

type Props = {
  results: Array<IMediaAnalysisResult>
  selectedResult: IMediaAnalysisResult | null
  handleSelectedResultChange: (result: IMediaAnalysisResult) => void
}

const MediaAnaysisResultCarousel = ({
  results,
  selectedResult,
  handleSelectedResultChange,
}: Props) => {
  if (!selectedResult) {
    return null
  }

  const currentIndex = results.indexOf(selectedResult)

  const toKST = (dateString: Date) => {
    const utcDate = new Date(dateString)
    return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000) // KST로 변환
  }

  return (
    <div className="relative flex w-full gap-x-4">
      <button
        onClick={() =>
          handleSelectedResultChange(
            results[(results.length - 1 - currentIndex) % results.length],
          )
        }
      >
        <PrevIcon />
      </button>
      <div className="flex w-full flex-col items-center justify-center gap-y-3">
        <div className="flex items-center">
          {results.map((result, index) => (
            <div
              key={`${index}-${result.title}`}
              className={cn(
                'hidden',
                index === currentIndex &&
                  'flex h-32 w-full flex-col items-center justify-center rounded-md border-2 border-neutral-400 p-2',
              )}
              data-carousel-item
            >
              <p>
                {formatDate(
                  DateFormatTypeEnum.DateWithKorean,
                  toKST(result.startDate),
                )}
              </p>
              <div className="flex items-center gap-x-1">
                <CategoryTag
                  label={
                    categoryLabels[selectedResult.categoryId] as Categories
                  }
                />
                <p>{result.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Slider indicators */}
        <div className="flex space-x-3 rtl:space-x-reverse">
          {Array.from({ length: results.length }, () => true).map(
            (_, index) => (
              <button
                key={index}
                type="button"
                className="h-2 w-2 rounded-full bg-neutral-300"
                aria-current={currentIndex === index ? 'true' : 'false'}
                aria-label="Slide 1"
                data-carousel-slide-to={`${index}`}
              />
            ),
          )}
        </div>
      </div>
      <button
        onClick={() =>
          handleSelectedResultChange(
            results[(results.length - 1 - currentIndex) % results.length],
          )
        }
      >
        <NextIcon />
      </button>
    </div>
  )
}

export default MediaAnaysisResultCarousel
