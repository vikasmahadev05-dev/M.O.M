const axios = require('axios');

async function testNotes() {
    try {
        console.log('Testing Notes API...');
        
        // 1. Create a note
        const createRes = await axios.post('http://localhost:5000/api/notes', {
            title: 'Test Notebook Title',
            content: 'Hello aesthetic world!'
        });
        console.log('Created:', createRes.data);
        const noteId = createRes.data._id;

        // 2. Fetch notes
        const fetchRes = await axios.get('http://localhost:5000/api/notes');
        console.log(`Fetched ${fetchRes.data.length} notes.`);

        // 3. Delete note
        await axios.delete(`http://localhost:5000/api/notes/${noteId}`);
        console.log('Deleted successfully.');
        
        console.log('ALL API TESTS PASSED!');
    } catch (error) {
        console.error('API TEST FAILED:', error.message);
        if (error.response) {
            console.error(error.response.data);
        }
    }
}

testNotes();
