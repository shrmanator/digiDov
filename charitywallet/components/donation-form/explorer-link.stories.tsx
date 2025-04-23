import { ExplorerLink } from "./explorer-link";

export default {
  title: "DonationForm/ExplorerLink",
  component: ExplorerLink,
};

export const Empty = {
  args: {
    txHash: "",
  },
};

export const WithHash = {
  args: {
    txHash: "0xDEADBEEF0123456789abcdef",
  },
};
