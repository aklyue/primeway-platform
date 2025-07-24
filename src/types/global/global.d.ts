export {};

declare global {
  interface Window {
    pay: (
      form: HTMLFormElement,
      options: {
        completeCallback: (paymentResult: PaymentResult) => void;
      }
    ) => void;
    YaSendSuggestToken?: (
      callbackUrl: string,
      options: { status: string }
    ) => void;
    YaAuthSuggest?: {
      init: (...args: any[]) => Promise<{ handler: () => Promise<any> }>;
    };
  }
}
