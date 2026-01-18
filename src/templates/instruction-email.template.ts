export const getInstructionEmailTemplate = (productName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Ваша инструкция!</h1>
      <p style="font-size: 16px; color: #555;">
        Спасибо за покупку <strong>${productName}</strong>!
      </p>
      <p style="font-size: 16px; color: #555;">
        Инструкция прикреплена к письму в формате PDF.
      </p>
      <p style="font-size: 14px; color: #888; margin-top: 30px;">
        Если вы не видите вложение, проверьте папку "Спам" или настройки почтового клиента.
      </p>
    </div>
  `;
};
