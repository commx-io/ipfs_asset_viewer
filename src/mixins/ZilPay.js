export default {
  data() {
    return {
      code: {
        notZilPay: "isZilPay",
        notEnable: "isEnable",
        notConnect: "notConnect"
      }
    };
  },
  methods: {
    validateAddreas(address) {
      const zilliqa = window.zilPay;
      const { validation } = zilliqa.utils;
      const {
        decodeBase58,
        toChecksumAddress,
        fromBech32Address,
        isValidChecksumAddress
      } = zilliqa.crypto;

      if (validation.isAddress(address)) {
        address = isValidChecksumAddress(address);
      } else if (validation.isBase58(address)) {
        address = decodeBase58(address);
      } else if (validation.isBech32(address)) {
        address = fromBech32Address(address);
      }
      return toChecksumAddress(address);
    },
    zilpayTest() {
      if (typeof window.zilPay === "undefined") {
        return this.code.notZilPay;
      } else if (!window.zilPay.wallet.isEnable) {
        return this.code.notEnable;
      } else if (!window.zilPay.wallet.isConnect) {
        return this.code.notConnect;
      }

      return true;
    }
  }
};
