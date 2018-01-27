import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { FormsModule } from '@angular/forms';

// import { HttpModule } from '@angular/http'; //<<< ovaj je deprecated! treba koristiti HttpClientModule umesto HttpModule, a za ono sto je tebi bilo potrebno u ovom projektu mozes kasnije u  servisima uvesti samo HttpClient koji je zapravo samo deo ovog dole HttpClientModule >>> https://stackoverflow.com/questions/48124136/angular-4-difference-between-httpclient-and-httpclientmodule
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { AllGalleriesComponent } from './components/all-galleries/all-galleries.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyGalleriesComponent } from './components/my-galleries/my-galleries.component';
import { CreateNewGalleryComponent } from './components/create-new-gallery/create-new-gallery.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthService } from './shared/services/auth.service';
import { GalleryService } from './shared/services/gallery.service';
import { AuthGuard } from './shared/guards/auth.guard';
import { GuestGuard } from './shared/guards/guest.guard';


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
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    // HttpModule,
    HttpClientModule    
  ],
  providers: [AuthService, GalleryService, AuthGuard, GuestGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
