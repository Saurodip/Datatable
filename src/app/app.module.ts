import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppService } from './app.service';
import { AppComponent } from './app.component';
import { DataTableModule } from './datatable/datatable.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, RouterModule, DataTableModule],
  providers: [AppService],
  bootstrap: [AppComponent]
})

export class AppModule { }
