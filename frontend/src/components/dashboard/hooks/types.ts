import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { Category } from "../category";

export interface CategorizedDataPoints {
  category: Category;
  dataPoints: DataPoint[];
}

export interface DataPoint {
  groupName: string;
  solutions?: CurrentAnalysis[];
  x: number;
  y: number;
}

export interface GroupBase {
  key: string;
  label: string;
}

export interface SolutionGroupAssignment {
  solution: CurrentAnalysis;
  groupKey: string;
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
