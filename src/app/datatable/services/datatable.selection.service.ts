import { Injectable } from '@angular/core';
import { DataTableElementReferenceService } from './datatable.element-reference.service';
import { DataTableHeader } from '../datatable.model';

@Injectable()
export class DataTableSelectionService {
    private noOfRowsSelected: number;

    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService) {
        this.noOfRowsSelected = 0;
    }

    /**
     * This method gets triggered on selection of 'Select All' checkbox placed most top left corner of the datatable
     * It will select or deselect all the available rows based on the state of 'Select All' checkbox
     * @param selectAllCheckboxState { string } State of the 'Select All' checkbox on selection
     * @param dataCollection { object[] } Number of datatable rows available to display
     * @param isCheckboxSelectionEnabled { boolean } Value provided from the invoked component to display checkbox selection or not
     * @param selectionColor? { string } Optional - Selection color provided from the invoked component
     */
    public onSelectDataTableSelectAll = (selectAllCheckboxState: string, dataCollection: object[], isCheckboxSelectionEnabled: boolean, selectionColor?: string): void => {
        if (dataCollection && dataCollection.length > 0) {
            this.noOfRowsSelected = (selectAllCheckboxState === 'checked') ? dataCollection.length : 0;
            dataCollection.forEach((row: object) => {
                if (selectAllCheckboxState === 'checked') {
                    row['RowSelected'] = true;
                } else if (selectAllCheckboxState === 'unchecked') {
                    row['RowSelected'] = false;
                }
                const dataTableRow: NodeList = this.dataTableElementReferenceService.getNodeListReference('current-datatable-row', row['Index']);
                if (dataTableRow && dataTableRow.length > 0) {
                    for (let i: number = 0; i < dataTableRow.length; i++) {
                        if (row['RowSelected']) {
                            if (selectionColor) {
                                dataTableRow[i]['style'].backgroundColor = selectionColor;
                            }
                        } else {
                            dataTableRow[i]['style'].backgroundColor = '';
                        }
                    }
                }
                if (isCheckboxSelectionEnabled) {
                    const checkboxElement: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('current-datatable-checkbox', row['Index']);
                    if (checkboxElement) {
                        checkboxElement['checked'] = row['RowSelected'];
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
     * @param selectionColor? { string } Optional - Selection color provided from the invoked component
     * return selectAllCheckboxState { string } State of the 'Select All' checkbox
     */
    public onSelectDataTableRow = (event: MouseEvent, dataCollection: object[], isCheckboxSelectionEnabled: boolean, selectionColor?: string): string => {
        if (event && event.currentTarget) {
            const selectedRowIndex: number = event.currentTarget['id'] && parseInt(event.currentTarget['id'].replace(/^\D+/g, ''), 10);
            const matchedRow: object = dataCollection && dataCollection.find((row: object) => row['Index'] === selectedRowIndex);
            if (matchedRow) {
                matchedRow['RowSelected'] = !matchedRow['RowSelected'];
            }
            this.noOfRowsSelected = matchedRow['RowSelected'] ? ++this.noOfRowsSelected : --this.noOfRowsSelected;
            const dataTableRow: NodeList = this.dataTableElementReferenceService.getNodeListReference('current-datatable-row', selectedRowIndex);
            if (dataTableRow && dataTableRow.length > 0) {
                for (let i = 0; i < dataTableRow.length; i++) {
                    if (matchedRow['RowSelected']) {
                        if (selectionColor) {
                            dataTableRow[i]['style'].backgroundColor = selectionColor;
                        }
                    } else {
                        dataTableRow[i]['style'].backgroundColor = '';
                    }
                }
            }
            if (isCheckboxSelectionEnabled) {
                const checkboxElement: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('current-datatable-checkbox', selectedRowIndex);
                if (checkboxElement) {
                    checkboxElement['checked'] = matchedRow['RowSelected'];
                }
            }
            const selectAllCheckboxState: string = this.determineSelectAllCheckboxState(dataCollection && dataCollection.length);
            return selectAllCheckboxState;
        }
    }

    /**
     * This method is responsible for determining the state of 'Select All' checkbox based on the row selection
     * @param totalNoOfRows { number } Total number of datatable rows
     * return selectAllCheckboxState { string } State of the 'Select All' checkbox
     */
    private determineSelectAllCheckboxState = (totalNoOfRows: number): string => {
        if (totalNoOfRows > 0) {
            const selectAllCheckbox: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-select-all-checkbox');
            let selectAllCheckboxState: string = '';
            if (selectAllCheckbox) {
                selectAllCheckbox['indeterminate'] = false;
                if (this.noOfRowsSelected === 0) {
                    selectAllCheckbox['checked'] = false;
                    selectAllCheckboxState = 'unchecked';
                } else if (this.noOfRowsSelected === totalNoOfRows) {
                    selectAllCheckbox['checked'] = true;
                    selectAllCheckboxState = 'checked';
                } else {
                    selectAllCheckbox['indeterminate'] = true;
                    selectAllCheckboxState = 'indeterminate';
                }
            }
            return selectAllCheckboxState;
        }
    }
}
