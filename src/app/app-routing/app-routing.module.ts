import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AllGalleriesComponent } from '../components/all-galleries/all-galleries.component';
import { CreateNewGalleryComponent } from '../components/create-new-gallery/create-new-gallery.component';
import { LoginComponent } from '../components/login/login.component';
import { MyGalleriesComponent } from '../components/my-galleries/my-galleries.component';
import { RegisterComponent } from '../components/register/register.component';
import { RegisterVerificationComponent } from '../components/register-verification/register-verification.component';

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
