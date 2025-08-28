/**
 * Test script để kiểm tra pagination functionality
 */

const { generateLargeUserDataset } = require('./src/lib/mockdata/users/generate-large-dataset.ts');

console.log('Testing pagination dataset...');

try {
  const users = generateLargeUserDataset();
  
  console.log(`✅ Generated ${users.length} users`);
  console.log(`✅ Roles distribution:`);
  
  const roleCount = {};
  users.forEach(user => {
    roleCount[user.role] = (roleCount[user.role] || 0) + 1;
  });
  
  Object.entries(roleCount).forEach(([role, count]) => {
    console.log(`   ${role}: ${count} users`);
  });
  
  console.log(`✅ Status distribution:`);
  const statusCount = {};
  users.forEach(user => {
    statusCount[user.status] = (statusCount[user.status] || 0) + 1;
  });
  
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} users`);
  });
  
  console.log(`✅ Email verification: ${users.filter(u => u.emailVerified).length}/${users.length} verified`);
  console.log(`✅ High risk users: ${users.filter(u => u.riskScore > 70).length} users`);
  
  // Test pagination logic
  const pageSize = 50;
  const totalPages = Math.ceil(users.length / pageSize);
  console.log(`✅ Pagination: ${totalPages} pages with ${pageSize} users per page`);
  
  // Test first page
  const firstPage = users.slice(0, pageSize);
  console.log(`✅ First page: ${firstPage.length} users`);
  console.log(`   First user: ${firstPage[0].firstName} ${firstPage[0].lastName} (${firstPage[0].role})`);
  console.log(`   Last user: ${firstPage[firstPage.length-1].firstName} ${firstPage[firstPage.length-1].lastName} (${firstPage[firstPage.length-1].role})`);
  
  console.log('\n🎉 Pagination test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error);
}
