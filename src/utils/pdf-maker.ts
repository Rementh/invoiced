import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.tableLayouts = {
    companyLayout: {
        fillColor: rowIndex => rowIndex === 0 && '#ededed',
        hLineWidth: i => (i === 0 ? 1 : 0),
        vLineWidth: () => 0,
    },
    invoiceLayout: {
        fillColor: rowIndex => rowIndex === 0 && '#ededed',
    },
};

export const makePdf = pdfMake.createPdf;
