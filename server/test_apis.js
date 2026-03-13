async function testAPIs() {
  const baseURL = 'http://localhost:5000/api';

  async function apiCall(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseURL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`);
    return data;
  }

  try {
    // 1. Register a test user with Phone
    const phoneNum = `999${Date.now().toString().slice(-7)}`;
    const email = `test_${Date.now()}@example.com`;
    console.log(`Registering user: ${email} with phone: ${phoneNum}`);
    const regRes = await apiCall('POST', '/auth/register', {
      name: 'Backend Test User',
      email: email,
      phone: phoneNum,
      password: 'password123'
    });
    
    const token = regRes.token;
    console.log('✅ Register success, got token');
    
    // 2. Add Money
    console.log('\nAdding money...');
    const addRes = await apiCall('POST', '/wallet/add-money', { amount: 100 }, token);
    console.log(`✅ Add money success, new balance: $${addRes.balance}`);
    
    // 3. Register a recipient and send money via PHONE
    console.log('\nRegistering recipient...');
    const recipientPhone = `888${Date.now().toString().slice(-7)}`;
    const recipientEmail = `recipient_${Date.now()}@example.com`;
    await apiCall('POST', '/auth/register', {
      name: 'Recipient User',
      email: recipientEmail,
      phone: recipientPhone,
      password: 'password123'
    });
    console.log('✅ Recipient registered');

    console.log(`\nSending money via PHONE NUMBER ${recipientPhone}...`);
    const sendRes = await apiCall('POST', '/wallet/send-money', {
      recipient: recipientPhone,
      amount: 40
    }, token);
    console.log(`✅ Send money success via Phone, new balance: $${sendRes.balance}`);

    // 4. Get QR Code
    console.log('\nFetching QR Code...');
    const qrRes = await apiCall('GET', '/wallet/qr', null, token);
    console.log(`✅ QR Code generation success: URL is ${qrRes.paymentUrl}`);

    // 5. Get Balance
    console.log('\nFetching balance...');
    const balRes = await apiCall('GET', '/wallet/balance', null, token);
    console.log(`✅ Balance check success: $${balRes.balance}`);

    // 6. Get Transactions
    console.log('\nFetching transactions...');
    const txRes = await apiCall('GET', '/wallet/transactions', null, token);
    console.log(`✅ Transactions check success: Found ${txRes.transactions.length} transactions`);
    
    // Ensure the new Transaction format resolves receiver
    const firstTx = txRes.transactions[0];
    if (firstTx.receiver && firstTx.receiver.phone) {
       console.log(`✅ New Transaction format populated correctly (Receiver Phone: ${firstTx.receiver.phone})`);
    } else {
       console.log('⚠️ Failed to populate receiver in transaction history.');
    }

    console.log('\n🎉 ALL APIS WORKING SUCCESSFULLY');
  } catch (error) {
    console.error('\n❌ API TEST FAILED');
    console.error(error.message);
  }
}

testAPIs();
