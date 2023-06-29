import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, nano_models} from './test.fixture';
import { ethers } from "ethers";
import { parseEther} from "ethers/lib/utils";
import { test, jest} from '@jest/globals';

const contractAddr = "0x1d80c49bbbcd1c0911346656b529df9e5c2f783d";
const pluginName = "solidifi";
const testNetwork = "flare";
const abi_path = `../networks/${testNetwork}/${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);

// Test from constructed transaction
nano_models.forEach(function(model) {
  jest.setTimeout(2000000)
  test('[Nano ' + model.prefix + '] Wrap FLR', zemu(model, async (sim, eth) => {

  const contract = new ethers.Contract(contractAddr, abi);
  const {data} = await contract.populateTransaction.deposit();

  // Get the generic transaction template
  const unsignedTx = {
    ...genericTx,
    to: contractAddr,
    data: data,
    value:  parseEther("0.1")
  };

  // Create serializedTx and remove the "0x" prefix
  const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

  // const resolution = await ledgerService.resolveTransaction(serializedTx,{},{
  //   erc20: true,
  //   externalPlugins: true,
  //   nft: false,
  // })

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
    // resolution
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);

  // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
  const right_clicks = 6;
  const shouldWaitForScreen = model.name !== 'nanox'
  await sim.navigateAndCompareSnapshots('.', model.name + '_wrap', [right_clicks, 0],shouldWaitForScreen);

  await tx;
  }));
});

