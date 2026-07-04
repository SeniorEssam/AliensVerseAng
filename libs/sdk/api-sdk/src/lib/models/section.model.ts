export interface SectionItem {
  id: string;
  type: string;
  layout: string;
  component?: string;
  sortOrder: number;
  isVisible: boolean;
  showInMenu: boolean;
  menuTitle: string | null;
  settings: Record<string, unknown>;
  data: Record<string, unknown>;
}
