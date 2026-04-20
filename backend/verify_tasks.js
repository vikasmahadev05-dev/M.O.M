const axios = require('axios');

async function verifyTasks() {
  try {
    console.log('--- Verifying Task API ---');
    
    // 1. Create a task
    const createRes = await axios.post('http://localhost:5000/api/tasks', {
      title: 'Test smart detection task',
      source: 'note',
      priority: 'High'
    });
    console.log('✅ Task Created:', createRes.data.title);
    
    // 2. Fetch all tasks
    const getRes = await axios.get('http://localhost:5000/api/tasks');
    console.log('✅ Tasks Fetched:', getRes.data.length);
    
    // 3. Cleanup
    await axios.delete(`http://localhost:5000/api/tasks/${createRes.data._id}`);
    console.log('✅ Task Deleted');
    
    console.log('\n--- ALL BACKEND TESTS PASSED ---');
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

verifyTasks();
