import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.tableLayouts = {
    labelLayout: {
        fillColor: rowIndex => rowIndex === 0 && '#ededed',
        hLineWidth: i => 1,
        vLineWidth: i => 1,
    },
    invoiceLayout: {
        fillColor: rowIndex => rowIndex === 0 && '#ededed',
    },
    detailsLayout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
    },
};

export const makePdf = pdfMake.createPdf;
