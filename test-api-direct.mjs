// Direct API test script
const RAPIDAPI_KEY = 'd9bfef0bf0msh72b2a853ecfde67bf60760janb1550a1600a6';
const RAPIDAPI_HOST = 'sportsapi7.p.rapidapi.com';

async function testEndpoint(endpoint, description) {
    console.log(`\nTesting: ${description}`);
    console.log(`URL: https://${RAPIDAPI_HOST}${endpoint}`);
    
    try {
        const response = await fetch(`https://${RAPIDAPI_HOST}${endpoint}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': RAPIDAPI_KEY,
            },
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Test various endpoints
await testEndpoint('/api/v1/sport/categories/list', 'Categories List');
await testEndpoint('/api/v1/sport/event/current', 'Current Live Events');
await testEndpoint('/api/v1/sport/live/categories', 'Live Categories');
