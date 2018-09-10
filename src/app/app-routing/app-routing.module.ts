import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AllGalleriesComponent } from '../components/all-galleries/all-galleries.component';
import { ViewGalleryComponent } from '../components/view-gallery/view-gallery.component';
import { CreateNewGalleryComponent } from '../components/create-new-gallery/create-new-gallery.component';
import { LoginComponent } from '../components/login/login.component';
import { SafeLoginComponent } from '../components/safe-login/safe-login.component';
import { ForgotPasswordComponent } from '../components/forgot-password/forgot-password.component';
import { SafeForgotPasswordComponent } from '../components/safe-forgot-password/safe-forgot-password.component';
import { PasswordResetComponent } from '../components/password-reset/password-reset.component'
import { SafePasswordResetComponent } from '../components/safe-password-reset/safe-password-reset.component'
import { MyAccountComponent } from '../components/my-account/my-account.component'
import { MyGalleriesComponent } from '../components/my-galleries/my-galleries.component';
import { RegisterComponent } from '../components/register/register.component';
import { RegisterVerificationComponent } from '../components/register-verification/register-verification.component';
import { ViewImageComponent } from '../components/view-image/view-image.component';
import { EmptyComponentComponent } from '../components/empty-component/empty-component.component';
import { UserUpdateVerificationComponent } from '../components/user-update-verification/user-update-verification.component';


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
        path: 'reload-component',
        component: EmptyComponentComponent
    },
    {
        path: 'my-account/verification-message',
        canActivate: [UrlGuard],
        component: UserUpdateVerificationComponent
    },
    {
        path: 'my-account/verification/:id/:token',
        component: UserUpdateVerificationComponent
    },
    {
        path: 'my-account/block_revoke_changes/:id/:userUpdateId/:token',
        component: UserUpdateVerificationComponent
    },
    {
        path: 'my-account/block_request_and_account_logout_user/:id/:token',
        component: UserUpdateVerificationComponent
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
        path: 'safe-login/:token',
        canActivate: [GuestGuard],
        component: SafeLoginComponent
    },
    {
        path: 'forgot-password',
        canActivate: [GuestGuard],
        component: ForgotPasswordComponent
    },
    {
        path: 'safe-forgot-password/:token',
        canActivate: [GuestGuard],
        component: SafeForgotPasswordComponent
    },
    {
        path: 'password-reset/:email/:token',
        canActivate: [GuestGuard],
        component: PasswordResetComponent
    },
    {
        path: 'safe-password-reset/:email/:passwordResetToken/:allowAccessToken',
        canActivate: [GuestGuard],
        component: SafePasswordResetComponent
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
