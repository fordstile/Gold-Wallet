const bcrypt = require('bcrypt');

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  const adminHash = await bcrypt.hash('Admin123!', 12);
  console.log('Admin Password: Admin123!');
  console.log('Admin Hash:', adminHash);
  console.log('');
  
  const testHash = await bcrypt.hash('Test123!', 12);
  console.log('Test Password: Test123!');
  console.log('Test Hash:', testHash);
  console.log('');
  
  console.log('Copy these hashes into seed-data.sql');
}

generateHashes();

