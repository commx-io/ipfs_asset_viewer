<template>
  <div id="app">
    <div style="display: flex; flex-direction: column;">
      <b-modal
        :ref="code.notZilPay"
        hide-footer
        title="ZilPay is not installed!"
      >
        <b-row class="justify-content-md-center">
          <img src="/img/home.png" />
        </b-row>

        <b-row class="justify-content-md-center">
          <a
            href="https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd"
            target="_blank"
            class="btn btn-success m-2"
            >FireFox</a
          >
          <a
            href="https://addons.mozilla.org/en-GB/firefox/addon/zilpay/"
            target="_blank"
            class="btn btn-success m-2"
            >Chrome</a
          >
        </b-row>
      </b-modal>

      <b-modal :ref="code.notEnable" hide-footer title="ZilPay is not Enable!">
        <b-row class="justify-content-md-center">
          <img src="/img/lock.png" />
        </b-row>
      </b-modal>

      <!-- Upload Interface -->
      <div id="upload">
        <div v-if="this.$root.$data.loading === false">
          <p class="lead">Wallet address: {{ wallet.account }}</p>
          <h1>Post Here!</h1>
          <!-- <h4 v-if="this.$root.$data.walletConnected">Account connected: {{currentAccount}}</h4> -->

          <!-- Form for file choose, caption text and submission -->
          <form class="margin-sm" @submit.stop.prevent="handleSubmit">
            <div class="border-style">
              <b-form-file plain @change="captureFile" />
            </div>
            <b-button class="margin-xs" variant="secondary" @click="handleOk">
              Upload
            </b-button>
          </form>
        </div>
        <div
          v-if="this.$root.$data.loading === true"
          style="margin-top: 10%; margin-bottom: 5%"
        >
          <img
            class="upload-load"
            src="https://media.giphy.com/media/2A6xoqXc9qML9gzBUE/giphy.gif"
          />
        </div>
      </div>

      <!-- Register Interface -->
      <div id="register">
        <div v-if="this.$root.$data.loading === false">
          <!-- <p class="lead">Wallet address: {{ wallet.account }}</p> -->
          <!-- <h1>Post Here!</h1> -->
          <!-- <h4 v-if="this.$root.$data.walletConnected">Account connected: {{currentAccount}}</h4> -->

          <!-- Form for ipfs hash & metadata registration -->
          <form class="margin-sm" @submit.stop.prevent="handleSubmit">
            <b-form-textarea
              v-model="ipfs_hash"
              label="ipfs_hash"
              placeholder="ipfs_hash"
              :rows="1"
              :max-rows="1"
              class="margin-xs"
            />
            <b-form-textarea
              v-model="metadata"
              placeholder="metadata"
              :rows="4"
              :max-rows="16"
              class="margin-xs"
            />
            <b-button class="margin-xs" variant="secondary" @click="handleRegister">
              Register
            </b-button>
          </form>
        </div>
        <div
          v-if="this.$root.$data.loading === true"
          style="margin-top: 10%; margin-bottom: 5%"
        >
          <img
            class="upload-load"
            src="https://media.giphy.com/media/2A6xoqXc9qML9gzBUE/giphy.gif"
          />
        </div>
      </div>

      <!-- Posts Interface -->
      <ul class="home-list">
        <li
          v-for="item in this.$root.$data.currentPosts"
          :key="item.key"
          :item="item"
        >
          <!-- Card UI for post's image & caption text -->
          <b-card border-variant="secondary" :img-src="item.src">
            <p class="home-card-text">
              {{ item.caption }}
            </p>
          </b-card>
        </li>
      </ul>

    </div>
  </div>
</template>

<script>
import ipfs from "./mixins/ipfs";
import ZilPayMixin from "./mixins/ZilPay";
import {ProofIPFS_API} from "./contracts/ProofIPFS_API"

export default {
  name: "App",
  mixins: [ZilPayMixin, ipfs], // , ProofIPFS_API],
  // data variables
  data() {
    return {
      filename: "",
      buffer: "",
      // caption: "",
      wallet: {
        account: null
      },
      ipfs_hash: "",
      metadata: ""
    };
  },
  mounted() {
    window.addEventListener("load", async () => {
      const test = await this.zilpayTest();

      if (test === this.code.notZilPay) {
        this.$refs[this.code.notZilPay].show();
      } else if (test === this.code.notEnable) {
        this.$refs[this.code.notEnable].show();
      } else if (test === this.code.notConnect) {
        await window.zilPay.wallet.connect();
      }
    });

    try {
      this.observableAccount();
    } catch (err) {
      /* eslint-disable */
    }
    this.$root.loading = false;
  },
  methods: {
    observableAccount() {
      setTimeout(() => {
        this.wallet.account = window.zilPay.wallet.defaultAccount.bech32;
        window.zilPay.wallet.observableAccount().subscribe(account => {
          console.log("account changed : account.bech32 =", account.bech32);
          this.wallet.account = account.bech32;
        });
        window.zilPay.wallet.observableNetwork().subscribe(net => {
          console.log("network changed : net =", net);
          this.network = net;
        });

      }, 1000);
    },

    /* used to catch chosen file
     */
    captureFile(event) {
      const reader = new FileReader();
      if (typeof event !== "undefined") {
        console.log({event});
        const fileObj = event.target.files[0]
        reader.readAsArrayBuffer(fileObj);
        reader.onloadend = async () => {
          this.buffer = await this.convertToBuffer(reader.result);
          this.filename = fileObj.name;
        };
      } else this.buffer = "";
    },
    /**
     * converts ArrayBuffer to
     * Buffer for IPFS upload.
     */
    async convertToBuffer(reader) {
      return Buffer.from(reader);
    },
    /**
     * submits buffered image & text to IPFS
     * and retrieves the hashes, then store
     * it in the Contract via sendHash().
     */
    async onSubmit() {
      // alert("Uploading to IPFS...");
      this.$root.loading = true;
      let imgHash;

      const hashedImg = await ipfs.add(this.buffer);
      console.log({hashedImg});
      imgHash = hashedImg[0].hash;
      this.ipfs_hash = imgHash;
      this.metadata  = "{\nfilename : '" + this.filename + "'\n}";
      console.log("ipfs_hash =", this.ipfs_hash);
      this.$root.loading = false;

    },
    /**
     * validates if file buffer is valid before submission
     */
    handleOk() {
      if (!this.buffer) { // || !this.caption) {
        alert("Please select a file to upload.");
      } else {
        this.onSubmit();
      }
    },

    async handleRegister() {
      console.log("handleRegister()");
      console.log("ipfs_hash =", this.ipfs_hash);
      console.log("metadata  =", this.metadata);

      const zilliqa = window.zilPay;

      const chain_id_map = {
        private : 111,
        testnet : 333,
        mainnet : 1
      };
      // https://zilpay.xyz/Documentation/zilliqa-provider/#properties
      const chain_id = chain_id_map[zilliqa.wallet.net];
      console.log({chain_id});
     
      const result = await zilliqa.blockchain.getBlockChainInfo();
      console.log("blockchain.getBlockChainInfo() =", result);

      const contract_proof_ipfs = zilliqa.contracts.at('zil13jjcwrph3zrz04ua45gsz6295wycaa7r5ar4c9'); // Testnet v1.0
      // const contract_proof_ipfs = zilliqa.contracts.at('0x97Ef723bC7e64cDD01E40B753c0C1f0d2A98Bf6D'); // Kaya Testnet
      console.log({contract_proof_ipfs});

      const contract_api = new ProofIPFS_API(contract_proof_ipfs, chain_id);
      
      console.log('calling getPrice())');
      console.log(await contract_api.getPrice() );
      const tx1 = await contract_api.registerOwnership(this.ipfs_hash, this.metadata);
	    console.log({tx1});
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  justify-content: center;
  color: #2c3e50;
  margin-top: 3%;
}

.home-load {
  width: 50px;
  height: 50px;
}

.card img {
  object-fit: cover;
  height: 500px;
  width: 500px;
}

.card {
  text-align: left;
  width: 500px;
  margin-bottom: 20px;
}

.home-list {
  padding: 0;
  list-style: none;
}

.home-card-text {
  text-align: justify;
  margin-top: 10px;
}

#upload {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 5%;
  width: 500px;
}

.upload-load {
  width: 50px;
  height: 50px;
}

.margin-xs {
  margin-top: 3%;
}

.margin-sm {
  margin-top: 7%;
}

.border-style {
  border: 1px solid #ced4da;
}
</style>
