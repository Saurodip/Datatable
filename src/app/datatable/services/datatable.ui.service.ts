import { Injectable } from '@angular/core';
import { DataTableElementReferenceService } from './datatable.element-reference.service';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle } from '../interfaces/datatable.interface';

@Injectable()
export class DataTableUIService {
    constructor(
        private dataTableElementReferenceService: DataTableElementReferenceService) {
    }

    /**
     * This method is responsible for calculating height of the vertical scrollable region (excluding header, filter and footer region)
     * @param height { string } Total datatable height provided in pixel from the invoked component
     * return verticalScrollableRegion { string } Height of the vertical scrollable region
     */
    public onSetDataTableRowWrapperHeight = (height: string): string => {
        const dataTableHeaderContainer: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-header-container');
        const dataTableFilterContainer: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-filter-container');
        const dataTableFooter: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-footer');
        let verticalScrollableRegion: string;
        if (dataTableHeaderContainer && dataTableFilterContainer && dataTableFooter) {
            verticalScrollableRegion = parseFloat(height) - (dataTableHeaderContainer['offsetHeight'] + dataTableFilterContainer['offsetHeight'] + dataTableFooter['offsetHeight']) + 'px';
        }
        return verticalScrollableRegion || '';
    }

    /**
     * This method is responsible for calculating total height of the datatable row container based on the number of rows available
     * @param dataCollection { object[] } Data collection to get number of rows
     * return dataTableRowContainerHeight { string } Height of the datatable row container
     */
    public onSetDataTableRowContainerHeight = (dataCollection: object[]): string => {
        const dataTableRow: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-row');
        let dataTableRowContainerHeight: string = '0px';
        if (dataTableRow && (dataCollection && dataCollection.length > 0)) {
            dataTableRowContainerHeight = dataTableRow['offsetHeight'] * dataCollection.length + 'px';
        }
        return dataTableRowContainerHeight;
    }

    /**
     * This method is responsible for calculating width of the datatable header columns
     * @param datatable { HTMLElement } Reference of the datatable native element
     * @param dataTableHeader { DataTableHeader[] } Datatable header information provided from the invoked component
     * @param isColumnResponsive { boolean } Determine responsiveness of the column width based on it
     * return DataTableHeaderInfo { object } Datatable header information
     */
    public onCalculateDataTableHeaderWidth = (dataTable: HTMLElement, dataTableHeader: DataTableHeader[], isColumnResponsive: boolean): object => {
        const DataTableHeaderInfo: object = {
            columnResponsive: isColumnResponsive,
            responsiveColumnWidth: '0px',
            scrollableAreaWidth: '0px'
        };
        const scrollbarWidth: number = 17;
        const actionContainer: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('action-container');
        if (dataTable && (dataTableHeader && dataTableHeader.length > 0) && actionContainer) {
            /* In case, column resonsiveness is not explicitly set,
               measuring the entire width of the columns provided from the invoked component
               to check whether it has covered the available space or not
            */
            if (!isColumnResponsive) {
                let totalDataTableHeaderColumnsWidth: number = 0;
                dataTableHeader.forEach((header: DataTableHeader, index: number) => {
                    totalDataTableHeaderColumnsWidth += parseFloat(header.columnWidth) || 0;
                    if (index === dataTableHeader.length - 1) {
                        /* If not, enabling column responsiveness, so that available space will be distributed accross columns */
                        if (totalDataTableHeaderColumnsWidth <= dataTable['offsetWidth']) {
                            isColumnResponsive = true;
                            DataTableHeaderInfo['columnResponsive'] = true;
                        }
                    }
                });
            }
            if (isColumnResponsive) {
                DataTableHeaderInfo['responsiveColumnWidth'] = Math.floor((dataTable['offsetWidth'] - (actionContainer['offsetWidth'] + scrollbarWidth)) / dataTableHeader.length) + 'px';
            } else {
                const frozenHeader: DataTableHeader[] = dataTableHeader.filter((header: DataTableHeader) => header.frozen === true);
                let frozenHeaderAreaWidth: number = actionContainer['offsetWidth'];
                if (frozenHeader && frozenHeader.length > 0) {
                    frozenHeader.forEach((header: DataTableHeader) => {
                        frozenHeaderAreaWidth += parseFloat(header.columnWidth) || 0;
                    });
                }
                DataTableHeaderInfo['scrollableAreaWidth'] = (dataTable['offsetWidth'] - frozenHeaderAreaWidth) + 'px';
            }
        }
        return DataTableHeaderInfo;
    }

    /**
     * This method is responsible for setting custom styles of datatable received from the invoked component
     * @param headerStyle { DataTableHeaderStyle } Custom datatable header style
     * @param rowStyle { DataTableRowStyle } Custom datatable row style
     */
    public onSetDataTableStyle = (headerStyle: DataTableHeaderStyle, rowStyle: DataTableRowStyle, index: number): void => {
        const headElement = document.getElementsByTagName('head') && document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `#datatable${index}`;
        if (Object.getOwnPropertyNames(headerStyle).length !== 0) {
            let cssProperties: string = '';
            for (let property in headerStyle) {
                if (headerStyle.hasOwnProperty(property)) {
                    let cssProperty = property.replace(/[A-Z]/g, (propertyName: string) => '-' + propertyName.toLowerCase());
                    cssProperties += `${ cssProperty }: ${ headerStyle[property] } !important; `;
                }
            }
            style.innerHTML += ` .custom-header-style { ${cssProperties}}`;
        }
        if (Object.getOwnPropertyNames(rowStyle).length !== 0) {
            let cssProperties: string = '';
            for (let property in rowStyle) {
                if (rowStyle.hasOwnProperty(property) && property !== 'selectionColor') {
                    let cssProperty = property.replace(/[A-Z]/g, (propertyName: string) => '-' + propertyName.toLowerCase());
                    cssProperties += `${ cssProperty }: ${ rowStyle[property] } !important; `;
                }
            }
            style.innerHTML += ` .custom-row-style { ${cssProperties}}`;
        }
        if (headElement) {
            headElement.appendChild(style);
        }
    }

    /**
     * This method is responsible for controlling position of the hidden scrollbars
     * (horizontal scrollbars of header and filter region, vertical scrollbar of fixed region)
     * based on scrolling position of the scrollbars appeared for the visible scrollable region
     */
    public onActivateScrollingForHiddenScrollbars = (): void => {
        const dataTableScrollableHeaderWrapper: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-scrollable-header-wrapper');
        const dataTableScrollableFilterWrapper: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('datatable-scrollable-filter-wrapper');
        const frozenAreaDataTableBody: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('frozen-area-datatable-body');
        const scrollableDataTableBody: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('scrollable-area-datatable-body');
        scrollableDataTableBody.addEventListener('scroll', (event: MouseEvent) => {
            let scrollLeftPosition: number;
            let scrollTopPosition: number;
            let listOfHorizontalScrollbars: HTMLElement[] = [];
            let listOfVerticalScrollbars: HTMLElement[] = [];
            if (event && event.currentTarget) {
                scrollLeftPosition = event.currentTarget['scrollLeft'] || 0;
                scrollTopPosition = event.currentTarget['scrollTop'] || 0;
            }
            listOfHorizontalScrollbars = [dataTableScrollableHeaderWrapper, dataTableScrollableFilterWrapper];
            listOfHorizontalScrollbars.forEach((element: HTMLElement) => element.scrollLeft = scrollLeftPosition);
            listOfVerticalScrollbars = [frozenAreaDataTableBody];
            listOfVerticalScrollbars.forEach((element: HTMLElement) => element.scrollTop = scrollTopPosition);
        });
    }

    /**
     * This method is responsible for highlighting selected DOM element and unhighlight other elements
     * @param event { MouseEvent } Event data
     * @param element { string } Name of the element that needs to be highlighted
     * @param highlightedClass { string } Highlighted class name
     */
    public onHighlightSelectedElement = (event: MouseEvent, element: string, highlightedClass: string): void => {
        const NodeElement: NodeList = this.dataTableElementReferenceService.getNodeListReference(element);
        if (NodeElement && NodeElement.length > 0) {
            for (let i = 0; i < NodeElement.length; i++) {
                NodeElement[i]['className'] = NodeElement[i]['className'] && NodeElement[i]['className'].replace(highlightedClass, '').trim();
            }
        }
        event.currentTarget['parentElement']['className'] = highlightedClass + ' ' + event.currentTarget['parentElement']['className'];
    }

    /**
     * This method is responsible for defining the state (disable or enable) of pagination arrows
     * @param slotIndex { number } Current pagination slot index
     * @param totalNoOfPaginationSlot { number } Total number of available pagination slot
     */
    public onStateChangeOfPaginationArrow = (slotIndex: number, totalNoOfPaginationSlot: number): void => {
        const disabledClassName: string = 'disabled';
        const previousPaginationArrow: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('previous-pagination-arrow');
        const nextPaginationArrow: HTMLElement = this.dataTableElementReferenceService.getHTMLElementRefernce('next-pagination-arrow');
        if (previousPaginationArrow && nextPaginationArrow) {
            previousPaginationArrow['className'] = previousPaginationArrow['className'] && previousPaginationArrow['className'].replace(disabledClassName, '').trim();
            nextPaginationArrow['className'] = nextPaginationArrow['className'] && nextPaginationArrow['className'].replace(disabledClassName, '').trim();
            if (slotIndex === 0) {
                previousPaginationArrow['className'] = disabledClassName + ' ' + previousPaginationArrow['className'];
            }
            if (slotIndex === totalNoOfPaginationSlot - 1) {
                nextPaginationArrow['className'] = disabledClassName + ' ' + nextPaginationArrow['className'];
            }
        }
    }
}
