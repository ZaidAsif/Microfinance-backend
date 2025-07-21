import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  return await QRCode.toDataURL(data);
};
