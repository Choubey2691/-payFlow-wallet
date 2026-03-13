const sendNotification = (type, userId, data) => {
  const timestamp = new Date().toISOString();
  
  switch(type) {
    case "SEND_SUCCESS":
      console.log(`[NOTIFICATION] ${timestamp}`);
      console.log(`To User: ${userId}`);
      console.log(`Type: Money Sent Successfully`);
      console.log(`Amount: $${data.amount}`);
      console.log(`To: ${data.receiverName} (${data.receiverEmail})`);
      console.log(`Reference: ${data.transactionId}\n`);
      break;

    case "SEND_FAILED":
      console.log(`[NOTIFICATION] ${timestamp}`);
      console.log(`To User: ${userId}`);
      console.log(`Type: Money Transfer Failed`);
      console.log(`Amount: $${data.amount}`);
      console.log(`Reason: ${data.reason}`);
      console.log(`Reference: ${data.transactionId}\n`);
      break;

    case "RECEIVE_SUCCESS":
      console.log(`[NOTIFICATION] ${timestamp}`);
      console.log(`To User: ${userId}`);
      console.log(`Type: Money Received`);
      console.log(`Amount: $${data.amount}`);
      console.log(`From: ${data.senderName} (${data.senderEmail})`);
      console.log(`Reference: ${data.transactionId}\n`);
      break;

    case "ADD_MONEY_SUCCESS":
      console.log(`[NOTIFICATION] ${timestamp}`);
      console.log(`To User: ${userId}`);
      console.log(`Type: Money Added to Wallet`);
      console.log(`Amount: $${data.amount}`);
      console.log(`New Balance: $${data.newBalance}\n`);
      break;

    default:
      console.log(`[NOTIFICATION] ${timestamp}`);
      console.log(`To User: ${userId}`);
      console.log(`Data:`, data);
  }
};

module.exports = { sendNotification };
