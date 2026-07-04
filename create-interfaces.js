const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'libs', 'sdk', 'company-sdk', 'src', 'lib', 'interfaces');
const content = `export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  logo: string;
  logoDark: string;
  companyInfo: CompanyInfo;
  languages: Language[];
  stores: Store[];
}

export interface CompanyInfo {
  phone: string;
  email: string;
  location: string;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  logo: string;
  isDefault: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  name: string;
}

export interface WebProfile {
  id: string;
  companyId: string;
  name: string;
  status: string;
}

export interface SectionConfig {
  id: string;
  type: 'header' | 'hero' | 'about' | 'services' | 'testimonials' | 'footer';
  layout: string;
  settingsJson: any;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}`;

fs.mkdirSync(targetDir, {recursive: true});
fs.writeFileSync(path.join(targetDir, 'company.interfaces.ts'), content);
console.log('File created successfully at: ' + path.join(targetDir, 'company.interfaces.ts'));
