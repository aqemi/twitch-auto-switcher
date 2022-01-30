import {
  NextTargetType,
  NextTargetGroupedList,
  CommonOptionValue,
  NextTarget,
  NextCommonOption,
} from '@/types/next-target.interface';
import { Option } from '@/types/option.interface';
import { Game } from '@/types/categories.response';

export function buildCategoriesList(categories: Game[]): NextTarget[] {
  return categories
    .map((x) => ({ type: NextTargetType.Category as const, value: x.name, image: x.box.small, id: x._id?.toString() }))
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

export function buildAllOptionsList(): Option[] {
  return [
    ...buildCommonOptionsList(),
    ...Object.values(NextTargetType)
      .map((x) => ({ type: x }))
      .filter((x) => x.type !== NextTargetType.Common),
  ];
}

export function nextTargetToOption(nextTarget: NextTarget): Option {
  return nextTarget.type === NextTargetType.Common ? nextTarget : { type: nextTarget.type };
}

export function isCommonOption(option: Option): option is NextCommonOption {
  return option.type === NextTargetType.Common;
}
