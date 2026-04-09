// @ts-ignore
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';
// @ts-ignore
import autoTable from 'https://esm.sh/jspdf-autotable@3.8.2';

interface InvoiceData {
    orderId: string;
    date: string;
    amount: number;
    planType: string;
    userName: string;
    userEmail: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFillColor(11, 79, 108); // Brand Navy-Teal
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('JOBS AGENT', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Cari Kerja Cerdas dengan AI', 20, 32);

    doc.setFontSize(18);
    doc.text('INVOICE', pageWidth - 60, 25);

    // --- Invoice Info ---
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text('Diterbitkan Untuk:', 20, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(data.userName, 20, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(data.userEmail, 20, 67);

    doc.text('Nomor Pesanan:', 120, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(data.orderId, 120, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal: ${data.date}`, 120, 67);

    // --- Table ---
    autoTable(doc, {
        startY: 80,
        head: [['Deskripsi', 'Paket', 'Total']],
        body: [
            [
                `Langganan Jobs Agent - ${data.planType.toUpperCase()}`,
                data.planType.charAt(0).toUpperCase() + data.planType.slice(1),
                `Rp ${data.amount.toLocaleString('id-ID')}`
            ]
        ],
        headStyles: { fillColor: [11, 79, 108], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 248, 250] },
        styles: { fontSize: 10, cellPadding: 8 }
    });

    // --- Footer & Summary ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Total Pembayaran:', pageWidth - 80, finalY + 10);
    doc.text(`Rp ${data.amount.toLocaleString('id-ID')}`, pageWidth - 40, finalY + 10, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, finalY + 30, pageWidth - 20, finalY + 30);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Ini adalah bukti pembayaran sah dari Jobs Agent. Terima kasih atas kepercayaan Anda.', pageWidth / 2, finalY + 40, { align: 'center' });

    // --- Save ---
    doc.save(`Invoice_${data.orderId}.pdf`);
};
