import { VNPay, ProductCode, HashAlgorithm } from "vnpay";

// Singleton instance
let vnpayInstance: VNPay | null = null;

export function getVNPayInstance(): VNPay {
  if (!vnpayInstance) {
    vnpayInstance = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE!,
      secureSecret: process.env.VNPAY_HASH_SECRET!,
      vnpayHost: process.env.VNPAY_URL!,
      testMode: true, // Sandbox mode
      enableLog: true,
      /**
       * This hash algorithm is used for signing the request data.
       * The default and recommended value is 'SHA512'.
       */
      hashAlgorithm: HashAlgorithm.SHA512,
    });
  }
  return vnpayInstance;
}

export { ProductCode };
