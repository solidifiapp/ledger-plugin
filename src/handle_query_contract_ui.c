#include "solidifi_plugin.h"

// EDIT THIS: You need to adapt / remove the static functions (set_send_ui, set_receive_ui ...) to
// match what you wish to display.

// Set UI for the "Send" screen.
// EDIT THIS: Adapt / remove this function to your needs.
static void set_send_ui(ethQueryContractUI_t *msg, const context_t *context) {

    const uint8_t *eth_amount = msg->pluginSharedRO->txContent->value.value;
    uint8_t eth_amount_size = msg->pluginSharedRO->txContent->value.length;

    const char *ticker = "FLR";
    const char *title = "Wrap";

    if (context->selectorIndex == UNWRAP) {
        ticker = "WFLR";
        title = "Unwrap";
    }

    strlcpy(msg->title, title, msg->titleLength);

    // Converts the uint256 number located in `eth_amount` to its string representation and
    // copies this to `msg->msg`.
    amountToString(eth_amount, eth_amount_size, WEI_TO_ETHER, ticker, msg->msg, msg->msgLength);
}

// Set UI for "Receive" screen.
// EDIT THIS: Adapt / remove this function to your needs.
static void set_receive_ui(ethQueryContractUI_t *msg, const context_t *context) {
    strlcpy(msg->title, "Receive", msg->titleLength);

    uint8_t decimals = context->decimals;
    const char *ticker = context->ticker;

    // If the token look up failed, use the default network ticker along with the default decimals.
    if (!context->token_found) {
        decimals = WEI_TO_ETHER;
        ticker = msg->network_ticker;
    }

    if (context->selectorIndex == WRAP) {
        ticker = "WFLR";
        const uint8_t *eth_amount = msg->pluginSharedRO->txContent->value.value;
        uint8_t eth_amount_size = msg->pluginSharedRO->txContent->value.length;
        amountToString(eth_amount,
                       eth_amount_size,
                       WEI_TO_ETHER,
                       ticker,
                       msg->msg,
                       msg->msgLength);
    } else {
        amountToString(context->amount_received,
                       sizeof(context->amount_received),
                       decimals,
                       ticker,
                       msg->msg,
                       msg->msgLength);
   }
}

void handle_query_contract_ui(void *parameters) {
    ethQueryContractUI_t *msg = (ethQueryContractUI_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;

    // msg->title is the upper line displayed on the device.
    // msg->msg is the lower line displayed on the device.

    // Clean the display fields.
    memset(msg->title, 0, msg->titleLength);
    memset(msg->msg, 0, msg->msgLength);

    msg->result = ETH_PLUGIN_RESULT_OK;

    // EDIT THIS: Adapt the cases for the screens you'd like to display.
    switch (msg->screenIndex) {
        case 0:
            set_send_ui(msg, context);
            break;
        case 1:
            set_receive_ui(msg, context);
            break;
        default:
            PRINTF("Received an invalid screenIndex\n");
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }
}
