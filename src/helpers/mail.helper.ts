import mailService from "../service/mail.service";
import S3Service from "../service/s3.service";
import { getInstructionEmailTemplate } from "../templates/instruction-email.template";
import type { Product } from "../types/global";

export const sendInstructionEmail = async (
  email: string,
  product: Product
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
