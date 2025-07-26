const handler = async (event, context) => {
  console.log('🚀 Simple test function working!');
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      message: 'Simple test function is working!',
      timestamp: new Date().toISOString()
    }),
  };
};

module.exports = { handler };