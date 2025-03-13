import { client } from "@/lib/thirdwebClient";
import { getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";

const usdcContractAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

export const usdcContract = getContract({
  client,
  address: usdcContractAddress,
  chain: polygon,
});
