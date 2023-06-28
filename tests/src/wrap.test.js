import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, nano_models,SPECULOS_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";
import {ledgerService} from '@ledgerhq/hw-app-eth';

// EDIT THIS: Replace with your contract address
const contractAddr = "0x1d80c49bbbcd1c0911346656b529df9e5c2f783d";
// EDIT THIS: Replace `boilerplate` with your plugin name
const pluginName = "solidifi";
const testNetwork = "flare";
const abi_path = `../networks/${testNetwork}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

// // Test from replayed transaction: https://etherscan.io/tx/0x0160b3aec12fd08e6be0040616c7c38248efb4413168a3372fc4d2db0e5961bb
// // EDIT THIS: build your own test
// nano_models.forEach(function(model) {
//   jest.setTimeout(20000)
//   test('[Nano ' + model.letter + '] Wrap FLR', zemu(model, async (sim, eth) => {
//
//   // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0xb27a69cd3190ad0712da39f6b809ecc019ecbc319d3c17169853270226d18a8a
//   const serializedTx = txFromEtherscan("0x7abe8ef607a98c736fd4ac98181b3167096117f88e3d263670c77118e06838d8");
//
//   const tx = eth.signTransaction(
//     "44'/60'/0'/0",
//     serializedTx,
//   );
//
//   const right_clicks = model.letter === 'S' ? 12 : 6;
//
//   // Wait for the application to actually load and parse the transaction
//   await waitForAppScreen(sim);
//   // Navigate the display by pressing the right button `right_clicks` times, then pressing both buttons to accept the transaction.
//   await sim.navigateAndCompareSnapshots('.', model.name + '_wrap_raw', [right_clicks, 0]);
//
//   await tx;
//   }));
// });

// Test from constructed transaction
// EDIT THIS: build your own test
nano_models.forEach(function(model) {
  jest.setTimeout(2000000)
  test('[Nano ' + model.letter + '] Wrap FLR', zemu(model, async (sim, eth) => {
  const contract = new ethers.Contract(contractAddr, abi);

  // Constants used to create the transaction
  // EDIT THIS: Remove what you don't need
  const amount = parseEther("0.1");

  // EDIT THIS: adapt the signature to your method
  // signature: swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
  // EDIT THIS: don't call `swapExactETHForTokens` but your own method and adapt the arguments.
  const {data} = await contract.populateTransaction.withdraw(amount);

  // Get the generic transaction template
  let unsignedTx = genericTx;
  // Modify `to` to make it interact with the contract
  unsignedTx.to = contractAddr;
  // Modify the attached data
  unsignedTx.data = data;
  // EDIT THIS: get rid of this if you don't wish to modify the `value` field.
  // Modify the number of ETH sent
  unsignedTx.value = parseEther("0.1");

  // Create serializedTx and remove the "0x" prefix
  const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

  // const resolution = await ledgerService.resolveTransaction(serializedTx,{},{
  //   erc20: true,
  //   externalPlugins: true,
  //   nft: true
  // })

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
    // resolution
  );

  const right_clicks = model.letter === 'S' ? 5 : 5;

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
  // EDIT THIS: modify `10` to fix the number of screens you are expecting to navigate through.
  await sim.navigateAndCompareSnapshots('.', model.name + '_unwrap', [right_clicks, 0]);

  await tx;
  }));
});

