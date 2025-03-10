import { Transak } from "@transak/transak-sdk";
import { useEffect } from "react";

const InstantOffRampEventsSDK = () => {
  const globalStagingAPIKey = "a2374be4-c59a-400e-809b-72c226c74b8f";

  useEffect(() => {
    const transak = new Transak({
      apiKey: globalStagingAPIKey,
      environment: Transak.ENVIRONMENTS.STAGING,
      isTransakStreamOffRamp: true,
      cryptoCurrencyCode: "USDT",
      network: "ethereum",
    });

    transak.init();

    // The .close() method contains the callback data for the Transak Stream for a user.
    Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, (eventData) => {
      console.log(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, eventData);
      transak.close();
    });

    return () => {
      transak.cleanup();
    };
  }, []);

  return <div id="transakMount" />;
};

export default InstantOffRampEventsSDK;
