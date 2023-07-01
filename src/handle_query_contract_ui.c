#include "solidifi_plugin.h"

void handle_wrap_ui(ethQueryContractUI_t *msg, const context_t *context) {
    const uint8_t *eth_amount = msg->pluginSharedRO->txContent->value.value;
    uint8_t eth_amount_size = msg->pluginSharedRO->txContent->value.length;

    switch (msg->screenIndex) {
        case 0:
            strlcpy(msg->title, "Wrap", msg->titleLength);

            // Converts the uint256 number located in `eth_amount` to its string representation and
            // copies this to `msg->msg`.
            amountToString(eth_amount,
                           eth_amount_size,
                           WEI_TO_ETHER,
                           "FLR",
                           msg->msg,
                           msg->msgLength);
            break;
        case 1:
            strlcpy(msg->title, "Receive", msg->titleLength);

            amountToString(eth_amount,
                           eth_amount_size,
                           WEI_TO_ETHER,
                           "WFLR",
                           msg->msg,
                           msg->msgLength);

            break;
        default:
            PRINTF("Received an invalid screenIndex\n");
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }

    msg->result = ETH_PLUGIN_RESULT_OK;
}

void handle_unwrap_ui(ethQueryContractUI_t *msg, const context_t *context) {
    const uint8_t *eth_amount = context->amount_received;
    uint8_t eth_amount_size = sizeof(context->amount_received);

    switch (msg->screenIndex) {
        case 0:
            strlcpy(msg->title, "Unwrap", msg->titleLength);

            // Converts the uint256 number located in `eth_amount` to its string representation and
            // copies this to `msg->msg`.
            amountToString(eth_amount,
                           eth_amount_size,
                           WEI_TO_ETHER,
                           "WFLR",
                           msg->msg,
                           msg->msgLength);

            break;
        case 1:
            strlcpy(msg->title, "Receive", msg->titleLength);

            amountToString(eth_amount,
                           eth_amount_size,
                           WEI_TO_ETHER,
                           "FLR",
                           msg->msg,
                           msg->msgLength);

            break;
        default:
            PRINTF("Received an invalid screenIndex\n");
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }

    msg->result = ETH_PLUGIN_RESULT_OK;
}

void handle_query_contract_ui(void *parameters) {
    ethQueryContractUI_t *msg = (ethQueryContractUI_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;

    // msg->title is the upper line displayed on the device.
    // msg->msg is the lower line displayed on the device.

    // Clean the display fields.
    memset(msg->title, 0, msg->titleLength);
    memset(msg->msg, 0, msg->msgLength);

    switch (context->selectorIndex) {
        case WRAP:
            handle_wrap_ui(msg, context);
            break;
        case UNWRAP:
            handle_unwrap_ui(msg, context);
            break;
        default:
            PRINTF("Selector index: %d not supported\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}
