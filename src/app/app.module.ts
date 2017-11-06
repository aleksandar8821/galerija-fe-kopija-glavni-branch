import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AllGalleriesComponent } from './components/all-galleries/all-galleries.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyGalleriesComponent } from './components/my-galleries/my-galleries.component';
import { CreateNewGalleryComponent } from './components/create-new-gallery/create-new-gallery.component';
import { LayoutComponent } from './components/layout/layout.component';

@NgModule({
  declarations: [
    AppComponent,
    AllGalleriesComponent,
    LoginComponent,
    RegisterComponent,
    MyGalleriesComponent,
    CreateNewGalleryComponent,
    LayoutComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
