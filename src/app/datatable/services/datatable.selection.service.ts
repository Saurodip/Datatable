import { Injectable } from '@angular/core';
import { DataTableElementReferenceService } from './datatable.element-reference.service';

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
     * @param dataCollection { object[] } Total number of datatable rows
     * @param isCheckboxSelectionEnabled { boolean } Value provided from the invoked component to display checkbox selection or not
     * @param selectionColor? { string } Optional - Selection color provided from the invoked component
     */
    public onSelectDataTableSelectAll = (selectAllCheckboxState: string, dataCollection: object[], isCheckboxSelectionEnabled: boolean, selectionColor?: string): void => {
        if (dataCollection && dataCollection.length > 0) {
            if (selectAllCheckboxState === 'checked') {
                this.noOfRowsSelected = dataCollection.length;
            } else if (selectAllCheckboxState === 'unchecked') {
                this.noOfRowsSelected = 0;
            }
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
     * @param selectedDataTableRow { object } Currently selected datatable row
     * @param dataCollection { object[] } Total number of datatable rows
     * @param isCheckboxSelectionEnabled { boolean } Value provided from the invoked component to display checkbox selection or not
     * @param selectionColor? { string } Optional - Selection color provided from the invoked component
     * return selectAllCheckboxState { string } State of the 'Select All' checkbox
     */
    public onSelectDataTableRow = (selectedDataTableRow: object, dataCollection: object[], isCheckboxSelectionEnabled: boolean, selectionColor?: string): string => {
        this.noOfRowsSelected = selectedDataTableRow['RowSelected'] ? ++this.noOfRowsSelected : --this.noOfRowsSelected;
        const dataTableRow: NodeList = this.dataTableElementReferenceService.getNodeListReference('current-datatable-row', selectedDataTableRow['Index']);
        if (dataTableRow && dataTableRow.length > 0) {
            for (let i = 0; i < dataTableRow.length; i++) {
                if (selectedDataTableRow['RowSelected']) {
                    if (selectionColor) {
                        dataTableRow[i]['style'].backgroundColor = selectionColor;
                    } else {
                        const defaultSelectionBackgroundColor: string = '#a1a1a1';
                        dataTableRow[i]['style'].backgroundColor = defaultSelectionBackgroundColor;
                    }
                } else {
                    dataTableRow[i]['style'].backgroundColor = '';
                }
            }
        }
        if (isCheckboxSelectionEnabled) {
            const checkboxElement: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('current-datatable-checkbox', selectedDataTableRow['Index']);
            if (checkboxElement) {
                checkboxElement['checked'] = selectedDataTableRow['RowSelected'];
            }
        }
        const selectAllCheckboxState: string = this.determineSelectAllCheckboxState(dataCollection && dataCollection.length);
        return selectAllCheckboxState;
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
