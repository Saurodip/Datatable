import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appDataTableRowSelection]'
})

export class SelectionDirective {
    @Input() private hoverColor: string;

    constructor(private elementRef: ElementRef) {
    }

    @HostListener('mouseenter') onMouseEnter() {
        if (this.hoverColor) {
            this.setHoverColor(this.hoverColor);
        }
    }

    @HostListener('mouseleave') onMouseLeave() {
        if (this.hoverColor) {
            this.setHoverColor(null);
        }
    }

    private setHoverColor(hoverColor: string) {
        if (this.elementRef && this.elementRef.nativeElement) {
            this.elementRef.nativeElement.style.backgroundColor = hoverColor;
        }
    }
}
