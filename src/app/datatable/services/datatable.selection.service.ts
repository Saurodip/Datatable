import { Injectable } from '@angular/core';
import { DataTableElementReferenceService } from './datatable.element-reference.service';

@Injectable()
export class DataTableSelectionService {
    private rowSelectionClassName: string;
    private noOfRowsSelected: number;

    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService) {
        this.rowSelectionClassName = 'selected-row';
        this.noOfRowsSelected = 0;
    }

    /**
     * This method gets triggered on selection of 'Select All' checkbox placed most top left corner of the datatable
     * It will select or deselect all the available rows based on the state of 'Select All' checkbox
     * @param isSelectAllChecked { boolean } State of the 'Select All' checkbox on selection
     * @param dataCollection { object[] } Number of datatable rows available to display
     * @param isCheckboxSelectionEnabled { boolean } Value provided from the invoked component to display checkbox selection or not
     * @param selectionColor { string } Optional - Selection color provided from the invoked component
     */
    public onSelectDataTableSelectAll = (isSelectAllChecked: boolean, dataCollection: object[], isCheckboxSelectionEnabled: boolean, selectionColor?: string): void => {
        if (dataCollection && dataCollection.length > 0) {
            this.noOfRowsSelected = isSelectAllChecked ? dataCollection.length : 0;
            dataCollection.forEach((row: object) => {
                const dataTableRow: NodeList = this.dataTableElementReferenceService.getNodeListReference('current-datatable-row', row['Index']);
                if (dataTableRow && dataTableRow.length > 0) {
                    for (let i: number = 0; i < dataTableRow.length; i++) {
                        if (isSelectAllChecked) {
                            const isRowAlreadySelected: boolean = dataTableRow[i]['className'] && dataTableRow[i]['className'].indexOf(this.rowSelectionClassName) >= 0 ? true : false;
                            if (!isRowAlreadySelected) {
                                dataTableRow[i]['className'] = this.rowSelectionClassName + ' ' + dataTableRow[i]['className'];
                                if (selectionColor) {
                                    dataTableRow[i]['style'].backgroundColor = selectionColor;
                                }
                            }
                        } else {
                            dataTableRow[i]['className'] = dataTableRow[i]['className'] && dataTableRow[i]['className'].replace(this.rowSelectionClassName, '').trim();
                            dataTableRow[i]['style'].backgroundColor = '';
                        }
                    }
                }
                if (isCheckboxSelectionEnabled) {
                    const checkboxElement: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('current-datatable-checkbox', row['Index']);
                    if (checkboxElement) {
                        checkboxElement['checked'] = isSelectAllChecked;
                    }
                }
            });
        }
    }

    /**
     * This method is responsible to select or deselect datatable rows based on user interaction
     * @param event { MouseEvent } MouseEvent to get the state of the 'Select All' checkbox on selection
     * @param dataCollection { object[] } Number of datatable rows available to display
     * @param isCheckboxSelectionEnabled { boolean } Value provided from the invoked component to display checkbox selection or not
     * @param selectionColor { string } Optional - Selection color provided from the invoked component
     */
    public onSelectDataTableRow = (event: MouseEvent, dataCollection: object[], isCheckboxSelectionEnabled: boolean, selectionColor?: string): void => {
        if (event && event.currentTarget) {
            let isRowAlreadySelected: boolean = false;
            const selectedRowIndex: number = event.currentTarget['id'] && event.currentTarget['id'].replace(/^\D+/g, '');
            isRowAlreadySelected = event.currentTarget['className'] && event.currentTarget['className'].indexOf(this.rowSelectionClassName) >= 0 ? true : false;
            this.noOfRowsSelected = !isRowAlreadySelected ? ++this.noOfRowsSelected : --this.noOfRowsSelected;
            const dataTableRow: NodeList = this.dataTableElementReferenceService.getNodeListReference('current-datatable-row', selectedRowIndex);
            if (dataTableRow && dataTableRow.length > 0) {
                for (let i = 0; i < dataTableRow.length; i++) {
                    if (!isRowAlreadySelected) {
                        dataTableRow[i]['className'] = this.rowSelectionClassName + ' ' + dataTableRow[i]['className'];
                        if (selectionColor) {
                            dataTableRow[i]['style'].backgroundColor = selectionColor;
                        }
                    } else {
                        dataTableRow[i]['className'] = dataTableRow[i]['className'] && dataTableRow[i]['className'].replace(this.rowSelectionClassName, '').trim();
                        dataTableRow[i]['style'].backgroundColor = '';
                    }
                }
            }
            if (isCheckboxSelectionEnabled) {
                const checkboxElement: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('current-datatable-checkbox', selectedRowIndex);
                if (checkboxElement) {
                    checkboxElement['checked'] = !isRowAlreadySelected;
                }
            }
            this.determineSelectAllCheckboxState(dataCollection && dataCollection.length);
        }
    }

    /**
     * This method is responsible for determining the state of 'Select All' checkbox based on the row selection
     * @param totalNoOfRows { number } Total number of datatable rows
     */
    private determineSelectAllCheckboxState = (totalNoOfRows: number): void => {
        if (totalNoOfRows > 0) {
            const selectAllCheckbox: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-select-all-checkbox');
            if (selectAllCheckbox) {
                selectAllCheckbox['indeterminate'] = false;
                if (this.noOfRowsSelected === 0) {
                    selectAllCheckbox['checked'] = false;
                } else if (this.noOfRowsSelected === totalNoOfRows) {
                    selectAllCheckbox['checked'] = true;
                } else {
                    selectAllCheckbox['indeterminate'] = true;
                }
            }
        }
    }
}
