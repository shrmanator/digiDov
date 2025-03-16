import { client } from "@/lib/thirdwebClient";
import { getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";

const customContractAddress = "0x1c8ed2efaed9f2d4f13e8f95973ac8b50a862ef0";

export const customContract = getContract({
  client,
  address: customContractAddress,
  chain: polygon,
});
