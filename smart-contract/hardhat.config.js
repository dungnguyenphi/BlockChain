//https://eth-ropsten.alchemyapi.io/v2/9gZ2cJaaD6t632U971VBX8SymhZZdsEi

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/9gZ2cJaaD6t632U971VBX8SymhZZdsEi",
      accounts: [
        "16e6992fbd751d6f56511c1d8d80bd0583450ec33b89ecf2bde5ea50051c4855",
      ],
    },
  },
};
