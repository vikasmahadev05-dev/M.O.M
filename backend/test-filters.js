const axios = require('axios');

async function testNotesFilters() {
    try {
        console.log('Testing Notes Filters API...');
        
        // 1. Create a note with tags
        const createRes = await axios.post('http://localhost:5000/api/notes', {
            title: 'Meeting Notes API',
            content: 'Discussing the new M.O.M aesthetic design.',
            tags: ['#meeting', '#idea']
        });
        console.log('Created note ID:', createRes.data._id);
        const noteId = createRes.data._id;

        // 2. Fetch all notes
        const fetchAll = await axios.get('http://localhost:5000/api/notes');
        console.log(`Total notes fetched: ${fetchAll.data.length}`);

        // 3. Search note by keyword 'aesthetic'
        const fetchSearch = await axios.get('http://localhost:5000/api/notes?search=aesthetic');
        console.log(`Notes matching "aesthetic": ${fetchSearch.data.length}`);
        
        // 4. Filter note by tag '#meeting'
        const fetchTag = await axios.get('http://localhost:5000/api/notes?tag=%23meeting'); // %23 is URL encoded #
        console.log(`Notes matching tag "#meeting": ${fetchTag.data.length}`);

        // 5. Delete note
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

testNotesFilters();
