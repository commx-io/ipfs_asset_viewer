import Web3 from 'web3';

let currentWeb3;

if (window.ethereum) {
    let instance = new Web3(window.ethereum);
    try {
        // Request account access if needed
        window.ethereum.enable();
        // Acccounts now exposed
        currentWeb3 = instance;
    } catch (error) {
        alert('Please connect metamask for the app to work');
    }
} else if (window.web3) {
    currentWeb3 = new Web3(web3.currentProvider);
}
else {
    console.log('Non-Ethereum browser detected.');
}

export default currentWeb3;
