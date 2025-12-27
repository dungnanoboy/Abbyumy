// Test Authentication APIs
// Run with: node test-auth.js

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('🔐 Testing Login API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: '123456',
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('User:', data.user.name, '-', data.user.email);
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testRegister() {
  console.log('\n📝 Testing Register API...');
  
  const testEmail = `test${Date.now()}@example.com`;
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: '123456',
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Register successful!');
      console.log('New user:', data.user.name, '-', data.user.email);
    } else {
      console.log('❌ Register failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testGetUsers() {
  console.log('\n👥 Testing Get Users API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/users`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.users.length} users`);
      data.users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.recipeCount || 0} recipes`);
      });
    } else {
      console.log('❌ Failed to get users:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Starting Authentication Tests\n');
  console.log('Make sure the server is running at', BASE_URL);
  console.log('=' .repeat(50));
  
  await testLogin();
  await testRegister();
  await testGetUsers();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
}

runTests();
