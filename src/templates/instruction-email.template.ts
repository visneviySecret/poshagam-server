export const getInstructionEmailTemplate = (
  productNames: string | string[]
): string => {
  const names = Array.isArray(productNames) ? productNames : [productNames];
  const purchaseText =
    names.length === 1
      ? `Спасибо за покупку <strong>${names[0]}</strong>!`
      : `Спасибо за покупку: ${names
          .map((name) => `<strong>${name}</strong>`)
          .join(", ")}!`;
  const attachmentText =
    names.length === 1
      ? "Инструкция прикреплена к письму в формате PDF."
      : "Инструкции прикреплены к письму в формате PDF.";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Ваши инструкции</h1>
      <p style="font-size: 16px; color: #555;">
        ${purchaseText}
      </p>
      <p style="font-size: 16px; color: #555;">
        ${attachmentText}
      </p>
      <p style="font-size: 14px; color: #888; margin-top: 30px;">
        Если вы не видите вложение, проверьте папку "Спам" или настройки почтового клиента.
      </p>
    </div>
  `;
};
