const ExcelJS = require('exceljs');

async function exportBoqToExcel(projectData, boqCategories) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('BOQ Sheet');

    // Page Setup agar siap cetak rapi
    worksheet.pageSetup.orientation = 'portrait';
    worksheet.pageSetup.paperSize = 9; // A4

    // 1. Header Logo & Judul
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'PM-BOQ ENTERPRISE';
    worksheet.getCell('A1').font = { name: 'Arial', size: 10, bold: true, color: { argb: '7F7F7F' } };
    worksheet.getCell('A1').alignment = { horizontal: 'left' };

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = 'BILL OF QUANTITY (BOQ)';
    worksheet.getCell('A2').font = { name: 'Arial', size: 16, bold: true, color: { argb: '1F4E78' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.getCell('A4').value = 'Nama Proyek:';
    worksheet.getCell('B4').value = projectData.name;
    worksheet.getCell('B4').font = { bold: true };

    worksheet.getCell('A5').value = 'Klien:';
    worksheet.getCell('B5').value = projectData.clientName;
    worksheet.getCell('B5').font = { bold: true };

    worksheet.getCell('A6').value = 'Lokasi:';
    worksheet.getCell('B6').value = projectData.location;

    worksheet.getCell('A7').value = 'Tanggal Cetak:';
    worksheet.getCell('B7').value = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // 2. Table Header
    const headers = ['No', 'Kategori Pekerjaan / Item Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan', 'Total Harga', 'Keterangan'];
    worksheet.addRow([]); // Row 8 Kosong
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 26;

    // Header styling - Dark Blue
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1F4E78' } // Dark blue
        };
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' }
        };
    });

    let globalRowCounter = 10;
    let categoryIndexes = [];

    // Currency Format: Rp #,##0.00
    const currencyFmt = '"Rp "  #,##0.00;("Rp "  #,##0.00);"-"';

    // 3. Iterasi Data BOQ
    boqCategories.forEach((cat, catIdx) => {
        // Row Kategori Pekerjaan (Parent)
        const catRow = worksheet.addRow([catIdx + 1, cat.name, '', '', '', '', '']);
        worksheet.mergeCells(`B${globalRowCounter}:D${globalRowCounter}`);

        // Style Category Row: Dark Slate/Blue background, White text
        catRow.eachCell((cell, colNum) => {
            cell.font = { bold: true, name: 'Arial', size: 11, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } }; // Soft dark slate (#1E293B)
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };
        });

        globalRowCounter++;

        const perangkatItems = (cat.items || []).filter(i => i.type === 'PERANGKAT');
        const jasaItems = (cat.items || []).filter(i => i.type === 'JASA');
        const otherItems = (cat.items || []).filter(i => i.type !== 'PERANGKAT' && i.type !== 'JASA');

        const typesToRender = [
            { name: 'PERANGKAT', items: perangkatItems, label: 'A' },
            { name: 'JASA', items: jasaItems, label: 'B' },
            { name: 'LAINNYA', items: otherItems, label: 'C' }
        ];

        let catSubTotalFormulas = [];

        typesToRender.forEach(typeGroup => {
            if (typeGroup.items.length === 0) return;

            // Row Tipe Pekerjaan (Perangkat / Jasa)
            const typeRow = worksheet.addRow(['', `${typeGroup.label}. ${typeGroup.name}`, '', '', '', '', '']);
            worksheet.mergeCells(`B${globalRowCounter}:D${globalRowCounter}`);
            typeRow.eachCell((cell) => {
                cell.font = { bold: true, italic: true, name: 'Arial', size: 10, color: { argb: '000000' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                };
            });
            let startTypeItemRow = globalRowCounter + 1;
            globalRowCounter++;

            // Item-item di bawah Tipe
            typeGroup.items.forEach((item, itemIdx) => {
                const itemRow = worksheet.addRow([
                    `${catIdx + 1}.${typeGroup.label}.${itemIdx + 1}`,
                    item.description,
                    item.volume,
                    item.unit,
                    parseFloat(item.unitPrice),
                    { formula: `C${globalRowCounter}*E${globalRowCounter}` },
                    item.remarks || ''
                ]);

                // Formatting currency & alignment
                itemRow.getCell(3).numFmt = '#,##0.00';
                itemRow.getCell(5).numFmt = currencyFmt;
                itemRow.getCell(6).numFmt = currencyFmt;
                itemRow.getCell(3).alignment = { horizontal: 'right' };
                itemRow.getCell(4).alignment = { horizontal: 'center' };
                itemRow.getCell(5).alignment = { horizontal: 'right' };
                itemRow.getCell(6).alignment = { horizontal: 'right' };
                itemRow.alignment = { vertical: 'middle' };

                itemRow.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                    };
                });

                globalRowCounter++;
            });

            let endTypeItemRow = globalRowCounter - 1;
            
            // Subtotal per Tipe
            const subTotalTypeRow = worksheet.addRow(['', `Sub-Total ${typeGroup.name}`, '', '', '', { formula: `SUM(F${startTypeItemRow}:F${endTypeItemRow})` }, '']);
            worksheet.mergeCells(`B${globalRowCounter}:E${globalRowCounter}`);
            subTotalTypeRow.getCell(6).numFmt = currencyFmt;
            subTotalTypeRow.getCell(6).alignment = { horizontal: 'right' };
            subTotalTypeRow.eachCell((cell) => {
                cell.font = { italic: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                };
            });
            catSubTotalFormulas.push(`F${globalRowCounter}`);
            globalRowCounter++;
        });

        // Subtotal per Kategori Pekerjaan
        let categoryFormula = catSubTotalFormulas.length > 0 ? catSubTotalFormulas.join('+') : '0';
        const subTotalRow = worksheet.addRow(['', `Sub-Total ${cat.name}`, '', '', '', { formula: categoryFormula }, '']);
        worksheet.mergeCells(`B${globalRowCounter}:E${globalRowCounter}`);
        
        subTotalRow.getCell(6).numFmt = currencyFmt;
        subTotalRow.getCell(6).alignment = { horizontal: 'right' };
        
        subTotalRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } }; // Soft gray (#E2E8F0)
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };
        });

        categoryIndexes.push(globalRowCounter);
        globalRowCounter++;
    });

    // 4. Grand Total & PPN Summary Section
    const subTotalFormula = categoryIndexes.map(idx => `F${idx}`).join('+');

    // Grand Total
    const totalRow = worksheet.addRow(['', 'GRAND TOTAL (Excl. PPN)', '', '', '', { formula: subTotalFormula }, '']);
    worksheet.mergeCells(`B${globalRowCounter}:E${globalRowCounter}`);
    totalRow.getCell(6).numFmt = currencyFmt;
    totalRow.getCell(6).alignment = { horizontal: 'right' };
    totalRow.eachCell((c) => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
        c.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    });
    globalRowCounter++;

    // PPN 11%
    const ppnRow = worksheet.addRow(['', 'PPN 11%', '', '', '', { formula: `F${globalRowCounter - 1}*0.11` }, '']);
    worksheet.mergeCells(`B${globalRowCounter}:E${globalRowCounter}`);
    ppnRow.getCell(6).numFmt = currencyFmt;
    ppnRow.getCell(6).alignment = { horizontal: 'right' };
    ppnRow.eachCell((c) => {
        c.font = { italic: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
        c.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    });
    globalRowCounter++;

    // TOTAL BIAYA AKHIR (Grand Total + PPN)
    const finalRow = worksheet.addRow(['', 'TOTAL BIAYA AKHIR', '', '', '', { formula: `F${globalRowCounter - 2}+F${globalRowCounter - 1}` }, '']);
    worksheet.mergeCells(`B${globalRowCounter}:E${globalRowCounter}`);
    finalRow.getCell(6).numFmt = currencyFmt;
    finalRow.getCell(6).alignment = { horizontal: 'right' };
    finalRow.eachCell((c) => {
        c.font = { bold: true, color: { argb: 'FFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } }; // Dark blue
        c.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    });

    // 5. Auto-fit Column Widths dengan padding aman
    worksheet.columns.forEach((column) => {
        let maxLen = 12;
        column.eachCell({ includeEmpty: true }, (cell) => {
            if (cell.value && !cell.value.formula) {
                const len = cell.value.toString().length;
                if (len > maxLen) maxLen = len;
            }
        });
        column.width = maxLen + 5;
    });

    return workbook;
}

module.exports = { exportBoqToExcel };