"use client";

import { Transak } from "@transak/transak-sdk";
import { useEffect } from "react";

const InstantOffRampEventsSDK = () => {
  useEffect(() => {
    const transak = new Transak({
      apiKey: "7d01c05c-0073-46fa-8665-1329ff6d8244",
      environment: Transak.ENVIRONMENTS.STAGING,
      isTransakStreamOffRamp: true,
      cryptoCurrencyCode: "ETH",
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
