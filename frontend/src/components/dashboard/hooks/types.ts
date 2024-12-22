import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { Category } from "../category";

export interface FilteredAnalysis {
  analysis: CurrentAnalysis;
  matchesAllFilters: boolean;
}

export interface CategorizedDataPoint extends DataPoint {
  category: Category;
  groupKey: string;
  analyses: CurrentAnalysis[];
}

export interface DataPoint {
  groupKey: string;
  groupName: string;
  analyses: CurrentAnalysis[];
  x: number;
  y: number;
}

export interface GroupBase {
  groupKey: string;
  groupLabel: string;
}

export interface ManualGroup extends GroupBase {
  minX: number;
  maxX: number;

  minY: number;
  maxY: number;
}

export interface AutomaticGroup extends GroupBase, DataPoint {}

export type Group = ManualGroup | AutomaticGroup;

export interface AutomaticGroupWithSolutions {
  category: Category;
  group: AutomaticGroup;
  solutions: CurrentAnalysis[];
}
