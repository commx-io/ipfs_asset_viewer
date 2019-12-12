import IPFS from "ipfs-http-client";

// https://github.com/ipfs/js-ipfs-http-client#in-a-web-browser

// const ipfs_host = "ipfs.infura.io"
// const ipfs_host = "api.ipfs.temporal.cloud";

const ipfs_host = "localhost";

const ipfs = new IPFS({ host: ipfs_host, port: 5001, protocol: "http" });

export default ipfs;
