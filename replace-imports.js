const fs = require('fs');
const glob = require('glob');

// ADMIN
const adminFiles = glob.sync('packages/admin/src/**/*.{ts,tsx}');
for (const file of adminFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('../services/content.service')) {
    content = content.replace(/from\s+['"]\.\.\/services\/content\.service['"]/g, "from '@thaiakha/shared/src/services'");
    changed = true;
  }
  if (content.includes('../../services/content.service')) {
    content = content.replace(/from\s+['"]\.\.\/\.\.\/services\/content\.service['"]/g, "from '@thaiakha/shared/src/services'");
    changed = true;
  }
  if (changed) fs.writeFileSync(file, content);
}

// FRONT
const frontFiles = glob.sync('packages/front/src/**/*.{ts,tsx}');
for (const file of frontFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // ContentService
  if (content.includes('../services/contentService')) {
    content = content.replace(/from\s+['"]\.\.\/services\/contentService['"]/g, "from '@thaiakha/shared/src/services'");
    changed = true;
  }
  if (content.includes('../../services/contentService')) {
    content = content.replace(/from\s+['"]\.\.\/\.\.\/services\/contentService['"]/g, "from '@thaiakha/shared/src/services'");
    changed = true;
  }

  // AuthService
  if (content.includes('../services/authService')) {
    content = content.replace(/from\s+['"]\.\.\/services\/authService['"]/g, "from '../services/auth.service'");
    changed = true;
  }
  if (content.includes('../../services/authService')) {
    content = content.replace(/from\s+['"]\.\.\/\.\.\/services\/authService['"]/g, "from '../../services/auth.service'");
    changed = true;
  }
  
  if (changed) fs.writeFileSync(file, content);
}
console.log('Imports replaced successfully');
