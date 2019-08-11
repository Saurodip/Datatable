import { Injectable } from '@angular/core';

@Injectable()
export class DataTableExportService {
    constructor() {
    }

    /**
     * This method is responsible for exporting datatable data into csv format
     * @param dataCollection { object[] } Collection of data
     * @param fileName? { string } Name of the csv file
     */
    public onExcelExportDataTableData = (dataCollection: object[], fileName?: string): void => {
        const csvHeaders: any = Object.keys(dataCollection[0]);
        let csvRows: any = [];
        csvRows.push(csvHeaders.join(','));
        for (const row of dataCollection) {
            const values = csvHeaders.map((header) => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        let final = csvRows.join('\n');
        const blob = new Blob([final], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'download.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * This method is responsible for exporting datatable data into pdf format
     * @param dataCollection { object[] } Collection of data
     * @param fileName? { string } Name of the pdf file
     */
    public onPDFExportDataTableData = (dataCollection: object[], fileName?: string): void => {

    }
}
