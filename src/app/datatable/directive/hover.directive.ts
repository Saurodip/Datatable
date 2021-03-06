import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appDataTableRowHover]'
})
export class DataTableHoverDirective {
    @Input() private hoverColor: string;

    constructor(private elementRef: ElementRef) {
    }

    @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent) {
        const defaultBackgroundColor: string = '#c3d6e4';
        this.setHoverColor(event, 'mouseenter', this.hoverColor || defaultBackgroundColor);
    }

    @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent) {
        this.setHoverColor(event, 'mouseleave', null);
    }

    /**
     * This method is resposible for highlighting row on mouse hover
     * @param event { MouseEvent } Mouse hover event
     * @param eventType { string } Type of event (mouse enter or leave)
     * @param hoverColor { string } Highlighted row background color provided by the invoked component
     */
    private setHoverColor = (event: MouseEvent, eventType: string, hoverColor: string): void => {
        if (event && event.currentTarget) {
            let rowSelectionClassName: string = 'selected-row';
            let selectedRowIndex: number = event.currentTarget['id'] && event.currentTarget['id'].replace(/^\D+/g, '');
            let dataTableRow: NodeList = document.querySelectorAll('.datatable-row-' + selectedRowIndex);
            if (dataTableRow && dataTableRow.length > 0) {
                for (let i: number = 0; i < dataTableRow.length; i++) {
                    let isSelectedRowClassPresent: boolean = dataTableRow[i]['className'] && dataTableRow[i]['className'].indexOf(rowSelectionClassName) !== -1 ? true : false;
                    if (!isSelectedRowClassPresent) {
                        if (eventType === 'mouseenter') {
                            dataTableRow[i]['style'].backgroundColor = hoverColor;
                        } else if (eventType === 'mouseleave') {
                            dataTableRow[i]['style'].backgroundColor = hoverColor;
                        }
                    }
                }
            }
        }
    }
}
