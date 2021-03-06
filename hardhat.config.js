require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    version: "0.8.1",
    version: "0.8.4",
  },
  paths: {
    artifacts: "./client/src/artifacts", // we are changing the location where the artifacts are generated when we compile so the frontend has easier access to them
  }
};
