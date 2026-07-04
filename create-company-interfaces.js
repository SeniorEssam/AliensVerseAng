const fs = require('fs');
const path = require('path');

const dirPath = 'libs/sdk/company-sdk/src/lib/interfaces';
const filePath = path.join(dirPath, 'company.interfaces.ts');

// Create directories recursively
fs.mkdirSync(dirPath, { recursive: true });
console.log('✓ Directory structure created');

// Write the file
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
  layout: string;  // 'default', 'variant_1', etc.
  settingsJson: any;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ File created successfully\n');

// Verify by reading back
const fullPath = path.resolve(filePath);
console.log('Complete file path (Windows format):');
console.log(fullPath + '\n');

console.log('Verifying file contents:');
const readContent = fs.readFileSync(filePath, 'utf8');
console.log(readContent);
