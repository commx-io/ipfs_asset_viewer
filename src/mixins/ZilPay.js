//contract address deployed by Sven


export default {
  data() {
    return {
      account: null,
      contractAddress: 'zil...'
    };
  },
  methods: {
    observableAccount() {
      const isZilPay = this.isZilPay();

      if (isZilPay < 2) {
        return null;
      }
      window.zilPay
            .wallet
            .observableAccount()
            .subscribe(account => this.account = account);
      this.account = window.zilPay.wallet.defaultAccount;
    },
    async XXXX(value) {
      const isZilPay = this.isZilPay();

      if (isZilPay < 4 && process.env.NODE_ENV === 'prodaction') {
        return null;
      }

      const utils = window.zilPay.utils;
      const contracts = window.zilPay.contracts;
      const amount = utils.units.toQa(
        0, utils.units.Units.Zil
      );
      const gasPrice = utils.units.toQa(
        '10000', utils.units.Units.Li
      );
      const contract = contracts.at(this.contractAddress);
      
      this.account = window.zilPay.wallet.defaultAccount;

      return await contract.call(
        'register', [
          {
            vname: "parent",
            type: "ByStr32",
            value: this.account.base16
          },
          {
            vname: "label",
            type: "String",
            value: value.replace('.zil', '')
          }
        ],
        {
          amount: amount,
          gasPrice: gasPrice,
          gasLimit: utils.Long.fromNumber(1000)
        }
      );
    },
    async connectToZilPay() {
      try {
        const isConnect = await window.zilPay.wallet.connect();
        this.account = window.zilPay.wallet.defaultAccount;
        return isConnect;
      } catch (err) {
        return false;
      }
    },
    isZilPay() {
      if (typeof window.zilPay === 'undefined') {
        return 0;
      } else if (!window.zilPay.wallet.isEnable) {
        return 1;
      } else if (window.zilPay.wallet.isConnect) {
        return 2;
      } else if (window.zilPay.wallet.net !== 'mainnet') {
        return 3;
      }
      
      return 4;
    }
  }
};


/*
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
    validateAddress(address) {
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

*/
