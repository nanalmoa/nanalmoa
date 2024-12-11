/**
 * categoryId 순서대로 배치
 * e.g.)
 * 병원 categoryId = 1
 * 가족 categoryId = 2
 * 종교 categoryId = 3
 * ...
 */

export enum CategoryEnum {
  병원 = 'bg-blue-500',
  가족 = 'bg-red-400',
  종교 = 'bg-violet-500',
  운동 = 'bg-teal-600',
  경조사 = 'bg-pink-400',
  복약 = 'bg-sky-500',
  기타 = 'bg-stone-400',
}

export type Categories = keyof typeof CategoryEnum
