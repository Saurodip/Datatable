import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { DataTablePipeType, DataTableColumnType, DataTableFilterType, DataTableLoadingPattern } from './datatable/enumerations/datatable.enum';
import { DataTableHeader, DataTableHeaderStyle, DataTableRowStyle, DataTableToolbar, DataTableVirtualScrolling } from './datatable/interfaces/datatable.interface';
import { DataTablePagination, DataTablePipe, DataTablePopup } from './datatable/models/datatable.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  public data: any[];
  public dataTableFilterType = DataTableFilterType;
  public dataTableLoadingPattern = DataTableLoadingPattern;
  public error: string;
  public header: DataTableHeader[];
  public headerStyle: DataTableHeaderStyle;
  public paginationData: DataTablePagination;
  public popupData: DataTablePopup;
  public rowStyle: DataTableRowStyle;
  public toolbarData: DataTableToolbar;
  public virtualScrollingData: DataTableVirtualScrolling;

  constructor(private appService: AppService) {
    this.data = [];
    this.error = '';
    this.header = [];
    this.headerStyle = {};
    this.paginationData = { numberOfRowsPerTab: 10, numberOfTabsPerSlot: 2 };
    this.popupData = new DataTablePopup();
    this.rowStyle = {};
    this.toolbarData = { delete: true, edit: true, reset: true, save: true };
    this.virtualScrollingData = { numberOfRowsPerScroll: 10 };
  }

  ngOnInit() {
    this.getDataTableData();
    this.prepareDataTableHeader();
    this.setDataTableStyle();
  }

  private getDataTableData = (): void => {
    this.appService.getRequest('assets/data/datatable.json').subscribe(
      (data) => this.data = data,
      (error) => this.error = error
    );
  }

  private prepareDataTableHeader = (): void => {
    this.header = [
      {
        propertyName: 'SerialNo',
        title: 'Serial No.',
        type: DataTableColumnType.Integer,
        columnWidth: '150px',
        frozen: true,
        tooltip: true
      },
      {
        propertyName: 'ProductName',
        title: 'Product Name',
        type: DataTableColumnType.String,
        columnWidth: '200px',
        pipe: new DataTablePipe(DataTablePipeType.UpperCasePipe),
        frozen: true,
        tooltip: true
      },
      {
        propertyName: 'Manufacturer',
        title: 'Manufacturer',
        type: DataTableColumnType.String,
        columnWidth: '400px',
        tooltip: true
      },
      {
        propertyName: 'Version',
        title: 'Version',
        type: DataTableColumnType.Custom,
        columnWidth: '400px',
        tooltip: true
      },
      {
        propertyName: 'Date',
        title: 'Date',
        type: DataTableColumnType.Date,
        columnWidth: '400px',
        pipe: new DataTablePipe(DataTablePipeType.DatePipe, 'dd-MM-yyyy hh:mm:ss'),
        tooltip: true
      },
      {
        propertyName: 'Price',
        title: 'Price',
        type: DataTableColumnType.String,
        pipe: new DataTablePipe(DataTablePipeType.CurrencyPipe, '1.2-2', 'INR', '₹ '),
        columnWidth: '250px',
        tooltip: true
      }
    ];
  }

  private setDataTableStyle = (): void => {
    this.headerStyle = {
      backgroundColor: 'pink',
      borderRight: '1px solid red',
      color: 'blue',
      fontSize: '18px',
      fontStyle: 'italic',
      textAlign: 'left'
    };

    this.rowStyle = {
      height: '30px'
    };
  }
}
