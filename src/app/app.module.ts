import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { HttpModule } from '@angular/http'; //<<< ovaj je deprecated! treba koristiti HttpClientModule umesto HttpModule, a za ono sto je tebi bilo potrebno u ovom projektu mozes kasnije u  servisima uvesti samo HttpClient koji je zapravo samo deo ovog dole HttpClientModule >>> https://stackoverflow.com/questions/48124136/angular-4-difference-between-httpclient-and-httpclientmodule
import { HttpClientModule } from '@angular/common/http';
// import {PopoverModule} from "ngx-popover";
import { Subject } from 'rxjs/Subject';


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
import { UrlGuard } from './shared/guards/url.guard';
import { RegisterVerificationComponent } from './components/register-verification/register-verification.component';
import { SanitizeHtmlPipe } from './shared/pipes/sanitize-html.pipe';
import { AddImageComponent } from './components/add-image/add-image.component';
import { DomService } from './shared/services/dom.service';
import { AddImageRefDirective } from './shared/directives/add-image-ref.directive';
import { ViewGalleryComponent } from './components/view-gallery/view-gallery.component';
import { ReversePipe } from './shared/pipes/reverse.pipe';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { ViewImageComponent } from './components/view-image/view-image.component';
import { ViewImageService } from './shared/services/view-image.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { EmptyComponentComponent } from './components/empty-component/empty-component.component';
import { UserUpdateVerificationComponent } from './components/user-update-verification/user-update-verification.component';
import { SafeLoginComponent } from './components/safe-login/safe-login.component';
import { SafeForgotPasswordComponent } from './components/safe-forgot-password/safe-forgot-password.component';
import { SafePasswordResetComponent } from './components/safe-password-reset/safe-password-reset.component';


@NgModule({
  declarations: [
    AppComponent,
    AllGalleriesComponent,
    LoginComponent,
    RegisterComponent,
    MyGalleriesComponent,
    CreateNewGalleryComponent,
    LayoutComponent,
    RegisterVerificationComponent,
    SanitizeHtmlPipe,
    AddImageComponent,
    AddImageRefDirective,
    ViewGalleryComponent,
    ReversePipe,
    ForgotPasswordComponent,
    PasswordResetComponent,
    ViewImageComponent,
    MyAccountComponent,
    EmptyComponentComponent,
    UserUpdateVerificationComponent,
    SafeLoginComponent,
    SafeForgotPasswordComponent,
    SafePasswordResetComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    // HttpModule,
    HttpClientModule,
    // PopoverModule,
    BrowserAnimationsModule,
    ImageCropperModule,
    ReactiveFormsModule,
  ],
  providers: [AuthService, GalleryService, AuthGuard, GuestGuard, UrlGuard, Subject, DomService],
  bootstrap: [AppComponent],
  entryComponents: [ AddImageComponent, ViewImageComponent ]
})
export class AppModule { }
