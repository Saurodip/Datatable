import { Injectable } from '@angular/core';

@Injectable()
export class DataTableElementReferenceService {
    constructor() {
    }

    /**
     * This method is responsible for getting reference of the requested HTML element from DOM
     * @param domElement { string } Requested element
     * @param index? { number } Index of the requested element
     * return HTML element reference
     */
    public getHTMLElementRefernce = (domElement: string, index?: number): HTMLElement => {
        switch (domElement) {
            case 'datatable-frozen-area': return document.querySelector('.datatable-frozen-area');
            case 'datatable-scrollable-area': return document.querySelector('.datatable-scrollable-area');
            case 'datatable-scrollable-header-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-header-wrapper');
            case 'datatable-header-container': return document.querySelector('.datatable-header-container');
            case 'datatable-scrollable-filter-wrapper': return document.querySelector('.datatable-scrollable-area .datatable-filter-wrapper');
            case 'datatable-filter-container': return document.querySelector('.datatable-filter-container');
            case 'datatable-select-all-checkbox': return document.querySelector('#datatable-select-all-checkbox');
            case 'action-container': return document.querySelector('.action-container');
            case 'frozen-area-datatable-body': return document.querySelector('.datatable-frozen-area .datatable-body');
            case 'scrollable-area-datatable-body': return document.querySelector('.datatable-scrollable-area .datatable-body');
            case 'datatable-row': return document.querySelector('.datatable-row');
            case 'current-datatable-checkbox': return document.querySelector('#datatable-checkbox-' + index);
            case 'datatable-footer': return document.querySelector('.datatable-footer');
            case 'previous-pagination-arrow': return document.querySelector('#previous-pagination-arrow');
            case 'pagination-tab': return document.querySelector('.pagination-tab-' + index);
            case 'next-pagination-arrow': return document.querySelector('#next-pagination-arrow');
            default: break;
        }
    }

    /**
     * This method is responsible for getting all the matched references of requested HTML element from DOM
     * @param domElement { string } Requested element
     * @param index? { number } Index of the requested element
     * return all matched HTML element references
     */
    public getNodeListReference = (domElement: string, index?: number): NodeList => {
        switch (domElement) {
            case 'current-datatable-row': return document.querySelectorAll('.datatable-row-' + index);
            case 'datatable-header': return document.querySelectorAll('.datatable-header');
            case 'pagination-tab': return document.querySelectorAll('.pagination-tab');
            default: break;
        }
    }
}
