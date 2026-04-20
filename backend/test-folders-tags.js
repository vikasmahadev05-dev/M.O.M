const axios = require('axios');

async function testFoldersAndTags() {
    try {
        console.log('Testing Folder & Tag Logic...');
        
        // 1. Create Folder
        const folderRes = await axios.post('http://localhost:5000/api/folders', { name: 'Test Hierarchy' });
        const folderId = folderRes.data._id;
        console.log('Created Folder ID:', folderId);

        // 2. Create Tag
        const tagRes = await axios.post('http://localhost:5000/api/tags', { name: 'automatedTest' });
        const tagName = tagRes.data.name; // Should auto prepend #
        console.log('Created Custom Tag:', tagName);

        // 3. Create Note inside Folder with Tag
        const noteRes = await axios.post('http://localhost:5000/api/notes', {
            title: 'Hierarchical Note',
            content: 'Testing cascading deletes',
            folderId: folderId,
            tags: [tagName]
        });
        const noteId = noteRes.data._id;
        console.log('Created Note inside Folder:', noteId);

        // 4. Test Deleting Tag -> Does it remove from Note?
        await axios.delete(`http://localhost:5000/api/tags/${tagRes.data._id}`);
        const checkNote1 = await axios.get(`http://localhost:5000/api/notes/${noteId}`);
        if(checkNote1.data.tags.includes(tagName)){
            throw new Error("Cascading Tag Delete FAILLURE");
        }
        console.log('Cascading Tag Delete SUCCESS');
        
        // 5. Test Deleting Folder -> Does it delete the Note?
        await axios.delete(`http://localhost:5000/api/folders/${folderId}`);
        try {
           await axios.get(`http://localhost:5000/api/notes/${noteId}`);
           throw new Error("Cascading Folder Delete FAILURE");
        } catch(e) {
           if(e.response && e.response.status === 404){
               console.log('Cascading Folder Delete SUCCESS');
           } else {
               throw e;
           }
        }
        
        console.log('ALL TESTS PASSED!');
    } catch (error) {
        console.error('API TEST FAILED:', error.message);
        if (error.response) {
            console.error(error.response.data);
        }
    }
}

testFoldersAndTags();
