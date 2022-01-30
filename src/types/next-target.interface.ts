export enum NextTargetType {
  Category = 'category',
  // Channel = 'channel',
  Common = 'common',
}

export enum CommonOptionValue {
  Current = 'current',
  // Followed = 'followed',
  Popular = 'popular',
}

export interface NextBaseTarget {
  type: NextTargetType;
}

export interface NextCategory extends NextBaseTarget {
  type: NextTargetType.Category;
  value: string;
  image: string;
  id: string;
}

export interface NextChannel extends NextBaseTarget {
  // type: NextTargetType.Channel;
  value: string;
}

export interface NextCommonOption extends NextBaseTarget {
  type: NextTargetType.Common;
  value: CommonOptionValue;
}

export type NextTarget = NextCategory | NextCommonOption;
// export type NextTarget = NextCategory | NextChannel | NextCommonOption;

export type NextTargetGroupedList = {
  [x in NextTargetType]: (NextTarget & { index: number })[];
};
