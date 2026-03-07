import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateInvoice = async (
    elementId: string,
    invoiceNumber: string,
    showDownload: boolean = true,
    props: any
): Promise<Blob | null> => {
    try {
        const { items, customerDetails, subtotal, delivery, total, date } = props;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;

        // Fine-tuned heights for our 800px template
        const rowHeight = 72;
        const firstPageHeaderHeight = 360;
        const subPageHeaderHeight = 160;
        const footerHeight = 240;
        const maxContentHeight = 1050;

        // Get the global bridge for React communication
        const updateInvoiceData = (window as any).updateInvoiceData;
        if (!updateInvoiceData) throw new Error('updateInvoiceData helper not found on window');

        let currentItemIndex = 0;
        let pageNum = 0;

        while (currentItemIndex < items.length) {
            pageNum++;
            if (pageNum > 1) pdf.addPage();

            const isFirstPage = pageNum === 1;
            let availableHeight = maxContentHeight;
            if (isFirstPage) availableHeight -= firstPageHeaderHeight;
            else availableHeight -= subPageHeaderHeight;

            const pageItemsSnapshot = [];
            let currentPageUsedHeight = 0;
            const startIdx = currentItemIndex;

            while (currentItemIndex < items.length) {
                if (currentPageUsedHeight + rowHeight > availableHeight) break;
                pageItemsSnapshot.push(items[currentItemIndex]);
                currentPageUsedHeight += rowHeight;
                currentItemIndex++;
            }

            const isLastItemsBatch = currentItemIndex >= items.length;
            const canFitTotals = (availableHeight - currentPageUsedHeight) > footerHeight;
            const showTotals = isLastItemsBatch && canFitTotals;

            // Render THIS page segment
            await updateInvoiceData({
                items: pageItemsSnapshot,
                startIndex: startIdx,
                showBillingInfo: isFirstPage,
                showTotals: showTotals,
                showFooter: showTotals // Only show footer if we're showing totals
            });

            // Wait for React to sync DOM
            await new Promise(resolve => setTimeout(resolve, 80));

            const element = document.getElementById(elementId);
            if (!element) throw new Error('Invoice element not found');

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, (canvas.height * imgWidth) / canvas.width);

            // Handle case where totals didn't fit on the last item page
            if (isLastItemsBatch && !showTotals) {
                pdf.addPage();
                await updateInvoiceData({
                    items: [], // Totals only page
                    startIndex: currentItemIndex,
                    showBillingInfo: false,
                    showTotals: true,
                    showFooter: true // Show footer on the totals-only page
                });
                await new Promise(resolve => setTimeout(resolve, 80));

                const finalCanvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const finalImgData = finalCanvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(finalImgData, 'JPEG', 0, 0, imgWidth, (finalCanvas.height * imgWidth) / finalCanvas.width);
            }
        }

        if (showDownload) {
            pdf.save(`Invoice_LHF_${invoiceNumber}.pdf`);
        }

        return pdf.output('blob');
    } catch (error) {
        console.error('Failed to generate invoice:', error);
        return null;
    }
};
