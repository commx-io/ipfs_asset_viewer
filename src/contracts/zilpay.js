var zilliqa;
  
  // ZilPay injected after full loading page.
  window.addEventListener("load", () => {

    if (window.zilPay) {
    
        zilliqa = window.zilPay;
    
        console.log('ZilPay detected');
        if (window.zilPay.wallet.isConnect) {
            // Request account access if needed
            window.zilPay.wallet.connect();
        }}
    else {
      alert('Please connect / install ZilPay for the app to work');
    }
  });
 export default zilliqa;
