import mailService from "../service/mail.service";
import S3Service from "../service/s3.service";
import cartRepository from "../repository/cart.repository";
import { getInstructionEmailTemplate } from "../templates/instruction-email.template";
import type { Product } from "../types/global";

export const sendInstructionsForCart = async (
  cartId: number
): Promise<void> => {
  const context = await cartRepository.getCartInstructionContext(cartId);

  if (!context?.email || !context.products.length) {
    return;
  }

  for (const product of context.products) {
    await sendInstructionEmail(context.email, {
      id: product.id,
      name: product.name,
      instruction: product.instruction,
    } as Product);
  }
};

export const sendInstructionEmail = async (
  email: string,
  product: Pick<Product, "id" | "name" | "instruction">
): Promise<void> => {
  const pdfBuffer = await S3Service.getFileBuffer(product.instruction);
  const fileName = `${product.name}_инструкция.pdf`;

  await mailService.sendMail({
    to: email,
    subject: "Инструкция " + product.name,
    html: getInstructionEmailTemplate(product.name),
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};
