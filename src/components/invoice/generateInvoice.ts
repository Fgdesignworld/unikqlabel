import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateInvoice = async (elementId: string, invoiceNumber: string, showDownload: boolean = true): Promise<Blob | null> => {
    try {
        const element = document.getElementById(elementId);
        if (!element) throw new Error('Invoice element not found');

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 5000,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        if (showDownload) {
            pdf.save(`Invoice_LHF_${invoiceNumber}.pdf`);
        }

        return pdf.output('blob');
    } catch (error) {
        console.error('Failed to generate invoice:', error);
        return null;
    }
};
