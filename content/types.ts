import type { ReactNode } from "react";

export interface TechSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface TechContent {
  sections: TechSection[];
}
