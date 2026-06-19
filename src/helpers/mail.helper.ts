import mailService from "../service/mail.service";
import S3Service from "../service/s3.service";
import cartRepository from "../repository/cart.repository";
import { getInstructionEmailTemplate } from "../templates/instruction-email.template";
import type { Product } from "../types/global";

type InstructionProduct = Pick<Product, "id" | "name" | "instruction">;

const buildAttachmentFileName = (product: InstructionProduct) => {
  const safeName = product.name.replace(/[<>:"/\\|?*]/g, "_").trim();
  return `${safeName || `product_${product.id}`}_инструкция.pdf`;
};

const getAttachments = async (products: InstructionProduct[]) => {
  return Promise.all(
    products.map(async (product) => ({
      filename: buildAttachmentFileName(product),
      content: await S3Service.getFileBuffer(product.instruction),
      contentType: "application/pdf",
    }))
  );
};

const getSubject = (products: InstructionProduct[], cartId?: number) => {
  if (products.length === 1) {
    return `Инструкция ${products[0].name}`;
  }

  return `Инструкции к заказу №${cartId}`;
};

export const sendInstructionsForCart = async (
  cartId: number
): Promise<void> => {
  const context = await cartRepository.getCartInstructionContext(cartId);

  if (!context?.email || !context.products.length) {
    return;
  }

  const products = context.products as InstructionProduct[];

  await sendInstructionEmail(context.email, products, cartId);
};

export const sendInstructionEmail = async (
  email: string,
  products: InstructionProduct | InstructionProduct[],
  cartId?: number
): Promise<void> => {
  const productList = Array.isArray(products) ? products : [products];
  const productNames = productList.map((product) => product.name);
  const attachments = await getAttachments(productList);

  await mailService.sendMail({
    to: email,
    subject: getSubject(productList, cartId),
    html: getInstructionEmailTemplate(productNames),
    attachments,
  });
};
