import Zemu, {DEFAULT_START_OPTIONS, IDeviceModel} from '@zondax/zemu';
import Eth from '@ledgerhq/hw-app-eth';
import { generate_plugin_config } from './generate_plugin_config';
import { parseEther, parseUnits } from "ethers/lib/utils";
import { jest} from '@jest/globals';

const transactionUploadDelay = 60000;

export async function waitForAppScreen(sim) {
    await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot(), transactionUploadDelay);
}

const sim_options_nano = {
    ...DEFAULT_START_OPTIONS,
    logging: true,
    X11: true,
    startDelay: 5000,
    startText: 'is ready',
    startTimeout: 30000,
};

const Resolve = require('path').resolve;

const NANOS_ETH_PATH = Resolve('elfs/ethereum_nanos.elf');
const NANOSP_ETH_PATH = Resolve('elfs/ethereum_nanosp.elf');
const NANOX_ETH_PATH = Resolve('elfs/ethereum_nanox.elf');

const NANOS_PLUGIN_PATH = Resolve('elfs/plugin_nanos.elf');
const NANOSP_PLUGIN_PATH = Resolve('elfs/plugin_nanosp.elf');
const NANOX_PLUGIN_PATH = Resolve('elfs/plugin_nanox.elf');

const eth_paths = {
    nanos: NANOS_ETH_PATH,
    nanosp: NANOSP_ETH_PATH,
    nanox: NANOX_ETH_PATH,
}

export const nano_models: IDeviceModel[] = [
    { name: 'nanos', prefix: 'S', path: NANOS_PLUGIN_PATH, },
    { name: 'nanosp', prefix: 'SP', path: NANOSP_PLUGIN_PATH, },
    { name: 'nanox', prefix: 'X', path: NANOX_PLUGIN_PATH,  }
];

const solidifiJSON = generate_plugin_config();

const RANDOM_ADDRESS = '0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj'

export let genericTx = {
    nonce: Number(0),
    gasLimit: Number(21000),
    gasPrice: parseUnits('1', 'gwei'),
    value: parseEther('1'),
    chainId: 14,
    to: RANDOM_ADDRESS,
    data: null,
};

const TIMEOUT = 1000000;

/**
 * Setup the Zemu Simulator
 *
 * @param device The device to setup the simulator for
 * @param func Callback function after successful setup
 */
export const zemu = (device: IDeviceModel, func: (sim: Zemu, eth: Eth) => void) => {
    return async () => {
        jest.setTimeout(TIMEOUT);

        const elf_path = eth_paths[device.name];
        const lib_elf = { 'SolidiFi': device.path };

        const sim = new Zemu(elf_path, lib_elf);
        try {
            await sim.start({...sim_options_nano, model: device.name});
            const transport = await sim.getTransport();
            const eth = new Eth(transport);
            eth.setLoadConfig({
                extraPlugins: solidifiJSON,
            });
            await func(sim, eth);
        } finally {
            await sim.close();
        }
    };
}

