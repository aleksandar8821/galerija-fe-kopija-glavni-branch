import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AllGalleriesComponent } from '../components/all-galleries/all-galleries.component';
import { ViewGalleryComponent } from '../components/view-gallery/view-gallery.component';
import { CreateNewGalleryComponent } from '../components/create-new-gallery/create-new-gallery.component';
import { LoginComponent } from '../components/login/login.component';
import { ForgotPasswordComponent } from '../components/forgot-password/forgot-password.component';
import { PasswordResetComponent } from '../components/password-reset/password-reset.component'
import { MyAccountComponent } from '../components/my-account/my-account.component'
import { MyGalleriesComponent } from '../components/my-galleries/my-galleries.component';
import { RegisterComponent } from '../components/register/register.component';
import { RegisterVerificationComponent } from '../components/register-verification/register-verification.component';
import { ViewImageComponent } from '../components/view-image/view-image.component';


import { AuthGuard } from '../shared/guards/auth.guard';
import { GuestGuard } from '../shared/guards/guest.guard';
import { UrlGuard } from '../shared/guards/url.guard';


const appRoutes: Routes = [
	{
        path: '',
        redirectTo: '/galleries',
        pathMatch: 'full'
    },
    {
        path: 'galleries',
        component: AllGalleriesComponent,
    },
    {
        path: 'galleries/:galleryID',
        data: { reuse: true },
        component: ViewGalleryComponent
    },
    {
        path: 'galleries/:galleryID/:imageID',
        data: { reuse: true },
        component: ViewGalleryComponent
    },
    {
        path: 'my-account',
        canActivate: [AuthGuard],
        component: MyAccountComponent
    },
    {
        path: 'my-galleries',
        canActivate: [AuthGuard],
        component: MyGalleriesComponent
    },
    {
        path: 'create',
        canActivate: [AuthGuard],
        component: CreateNewGalleryComponent
    },
    {
        path: 'login',
        canActivate: [GuestGuard],
        component: LoginComponent
    },
    {
        path: 'forgot-password',
        canActivate: [GuestGuard],
        component: ForgotPasswordComponent
    },
    {
        path: 'password-reset/:email/:token',
        canActivate: [GuestGuard],
        component: PasswordResetComponent
    },
    {
        path: 'register',
        canActivate: [GuestGuard],
        component: RegisterComponent
    },
    {
        path: 'register/verification-message',
        canActivate: [UrlGuard],
        component: RegisterVerificationComponent
    },
    {
        path: 'register/verification/:email/:token',
        canActivate: [GuestGuard],
        component: RegisterVerificationComponent
    },
    
];


@NgModule({
	imports: [
	CommonModule,
	RouterModule.forRoot(
		appRoutes
		)
	],
	exports: [
	RouterModule
	],
	declarations: []
})
export class AppRoutingModule { }
