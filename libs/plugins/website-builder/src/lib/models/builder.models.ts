export interface LayoutItem {
  id: string;
  name: string;
  componentName: string;
  previewImage?: string;
}

export interface LayoutGroup {
  typeName: string;
  layouts: LayoutItem[];
}

export interface BuilderSection {
  pageSectionId: string;
  companySectionId: string;
  typeName: string;
  layoutName: string;
  componentName: string;
  previewImage?: string;
  sort: number;
  isVisible: boolean;
  showInMenu: boolean;
  anchorKey?: string;
  settings: Record<string, string>;
  availableLayouts: LayoutItem[];
}

export interface BuilderPage {
  pageId: string;
  pageName: string;
  sections: BuilderSection[];
}

export interface SwitchLayoutResult {
  isRestored: boolean;
  isCloned: boolean;
  newCompanySectionId: string;
}

export interface PageListItem {
  id: string;
  pageName: string;
  slug: string;
  isHomePage: boolean;
  active: boolean;
  isInNavHeader: boolean;
  isInNavFooter: boolean;
  navLabel?: string;
  sitemapPriority: number;
  sitemapChangeFreq: number;
  sitemapInclude: boolean;
  pageStatus: number;
}
