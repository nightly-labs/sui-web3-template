import { NightlyConnectSuiAdapter } from "@nightlylabs/wallet-selector-sui";

let _adapter: NightlyConnectSuiAdapter | undefined;
export const getAdapter = async (persisted = true) => {
  if (_adapter) return _adapter;
  _adapter = await NightlyConnectSuiAdapter.build(
    {
      appMetadata: {
        name: "Sui Template",
        description: "Sui Template",
        icon: "https://docs.nightly.app/img/logo.png",
      },
      persistent: persisted,
    },
    {}
  );
  return _adapter;
};
