import {
  CommonOptionValue,
  type NextCommonOption,
  type NextTarget,
  type NextTargetGroupedList,
  NextTargetType,
} from '@/types/next-target.interface';

import type { UiOption } from '@/types/option.interface';
import type { Category } from '@/types/categories.response';

export function formatImage(url: string, width = 50, height = 72): string {
  return url.replace('{width}', width.toString()).replace('{height}', height.toString());
}

export function buildCategoriesList(categories: Category[]): NextTarget[] {
  return categories
    .map((x) => ({
      type: NextTargetType.Category as const,
      value: x.name,
      image: formatImage(x.box_art_url),
      id: x.id,
    }))
    .slice(0, 9);
}

export function groupByType(list: NextTarget[]): NextTargetGroupedList {
  return list
    .map((x, index) => ({ ...x, index }))
    .reduce((acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    }, {} as NextTargetGroupedList);
}

export function buildCommonOptionsList(): NextCommonOption[] {
  return Object.values(CommonOptionValue).map((x) => ({ type: NextTargetType.Common, value: x }));
}

export function buildAllOptionsList(): UiOption[] {
  return [
    ...buildCommonOptionsList(),
    ...Object.values(NextTargetType)
      .map((x) => ({ type: x }))
      .filter((x) => x.type !== NextTargetType.Common),
  ];
}

export function nextTargetToUiOption(nextTarget: NextTarget): UiOption {
  return nextTarget.type === NextTargetType.Common ? nextTarget : { type: nextTarget.type };
}

export function isCommonOption(option: UiOption): option is NextCommonOption {
  return option.type === NextTargetType.Common;
}
