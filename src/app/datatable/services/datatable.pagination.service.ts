import { Injectable } from '@angular/core';
import { DataTableUIService } from './datatable.ui.service';
import { DataTablePagination } from '../models/datatable.model';

@Injectable()
export class DataTablePaginationService {
    private paginationData: object[];

    constructor(
        private dataTableUIService: DataTableUIService) {
        this.paginationData = [];
    }

    /**
     * This method is responsible for preparing data structure of pagination tabs
     * @param dataCollection { object[] } Total number of datatable rows
     * @param paginationInfo { DataTablePagination } Pagination information provided through invoked component
     * return paginationData { object[] } Segregated data into pagination tabs
     */
    public preparePaginationTabs = (dataCollection: object[], paginationInfo: DataTablePagination): object[] => {
        if ((dataCollection && dataCollection.length > 0) && Object.getOwnPropertyNames(paginationInfo).length !== 0) {
            let paginationTabCollection: object[] = [];
            let counter: number = 0;
            this.paginationData = [];
            for (let i: number = 0; i < dataCollection.length; i += paginationInfo.numberOfRowsPerTab) {
                let paginationTab: object[] = dataCollection.slice(i, i + paginationInfo.numberOfRowsPerTab);
                paginationTabCollection.push({ index: ++counter, data: paginationTab });
            }
            counter = 0;
            for (let i: number = 0; i < paginationTabCollection.length; i += paginationInfo.numberOfTabsPerSlot) {
                let paginationTab: object[] = paginationTabCollection.slice(i, i + paginationInfo.numberOfTabsPerSlot);
                this.paginationData.push({ slot: ++counter, data: paginationTab });
            }
            return this.paginationData;
        }
    }

    /**
     * This method gets triggered on select of pagination tab
     * @param currentPaginationSlot { object } Current pagination slot
     * @param index { number } Selected tab index
     * return dataToDisplay { object[] } Number of rows to be displayed on selection
     */
    public onSelectPaginationTab = (currentPaginationSlot: object, index: number): object[] => {
        const dataToDisplay: object[] = [...currentPaginationSlot['data'][index]['data']];
        return dataToDisplay;
    }

    /**
     * This method gets triggered on change of pagination slot
     * @param slotIndex { number } Pagination slot index
     * return currentPaginationSlot { object } Selected pagination slot data, if present
     */
    public onChangePaginationSlot = (slotIndex: number): object => {
        const currentPaginationSlot: object = this.paginationData[slotIndex];
        return currentPaginationSlot;
    }
}
