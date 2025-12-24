import crypto from "crypto";

class PaymentService {
  private readonly MERCHANT_LOGIN = process.env.ROBOKASSA_MERCHANT_LOGIN;
  private readonly PASSWORD_1 = process.env.ROBOKASSA_PASSWORD_1;
  private readonly PASSWORD_2 = process.env.ROBOKASSA_PASSWORD_2;
  private readonly IS_TEST = process.env.ROBOKASSA_TEST_MODE === "1";

  generateSignature(
    merchantLogin: string,
    outSum: string,
    invId: string,
    password: string
  ): string {
    const signatureString = `${merchantLogin}:${outSum}:${invId}:${password}`;
    return crypto.createHash("md5").update(signatureString).digest("hex");
  }

  getPaymentUrl(orderId: number, amount: number, description: string): string {
    if (!this.MERCHANT_LOGIN || !this.PASSWORD_1) {
      throw new Error("Robokassa credentials are not configured");
    }

    const outSum = amount.toFixed(2);
    const invId = orderId.toString();
    const signature = this.generateSignature(
      this.MERCHANT_LOGIN,
      outSum,
      invId,
      this.PASSWORD_1
    );

    const baseUrl = "https://auth.robokassa.ru/Merchant/Index.aspx";

    const params = new URLSearchParams({
      MerchantLogin: this.MERCHANT_LOGIN,
      OutSum: outSum,
      InvId: invId,
      Description: description,
      SignatureValue: signature,
      IsTest: this.IS_TEST ? "1" : "0",
    });

    return `${baseUrl}?${params.toString()}`;
  }

  verifyResultSignature(
    outSum: string,
    invId: string,
    signatureValue: string
  ): boolean {
    if (!this.MERCHANT_LOGIN || !this.PASSWORD_2) {
      throw new Error("Robokassa credentials are not configured");
    }

    const expectedSignature = this.generateSignature(
      this.MERCHANT_LOGIN,
      outSum,
      invId,
      this.PASSWORD_2
    );

    return expectedSignature.toLowerCase() === signatureValue.toLowerCase();
  }
}

export default new PaymentService();
