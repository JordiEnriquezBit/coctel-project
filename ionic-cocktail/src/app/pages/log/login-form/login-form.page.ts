import { LogComunicationService } from './../../../shared/services/firebase/log-comunication.service';
import { FireAuthService } from './../../../shared/services/firebase/fire-auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import "@codetrix-studio/capacitor-google-auth";

import { Plugins} from "@capacitor/core" 


const {Storage} = Plugins;
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.page.html',
  styleUrls: ['./login-form.page.scss'],
})
export class LoginFormPage implements OnInit {

  googleUser;
  loginUser: FormGroup;

  constructor(private fb: FormBuilder,
              private route: Router,
              private fireAuthService:FireAuthService,
              private logCom : LogComunicationService)
  {

   
  }
   async ngOnInit() {
    this.checkUser();
    this.buildForm();
  }
 async checkUser(){
    const user = await this.fireAuthService.isLogged$().toPromise();

    if (user && user.uid) {
      this.route.navigate(['/tabs'])

    }
  }
  insertToStorage(keyValue,value){
    Storage.set({key:keyValue, value: value});
  }
  async loginWithGoogle(){
     //google additionalUserInfo.profile.email = "jordienmo@gmail.com"
    //google additionalUserInfo.profile.given_name =  "Jordi"
    const googleUser = await Plugins.GoogleAuth.signIn();
    console.log("userGoogle : ", googleUser.givenName );
    this.googleUser = googleUser;
    if(googleUser!=null){
      console.log("jordi_googleUser: ",googleUser)

     let dataGoogle = this.fireAuthService.loginWithGoogle(googleUser);
     dataGoogle.
     then(
       data=>
       {
        console.log("jordi_data: ",data)
        this.logCom.logIn(true);
        this.insertToStorage("logged",true);
        this.insertToStorage("name",googleUser.givenName);
        this.insertToStorage("email",googleUser.email);
         //this.openSnackBar("Loggin Successful","successful");
        this.route.navigate(['/tabs'])
       }
       ).catch(error=>console.log("jordi_Eror: ",error));
     
     
    }
   
  }
  loginWithFacebook(){
    //facebook additionalUserInfo.profile.email = "jordi_enmo@hotmail.com"
    //facebook additionalUserInfo.profile.first_name = "Jordi"
    let user = this.loginUser.value;
    let response = this.fireAuthService.loginWithFacebook();
    response.then((data:any)=>{
     this.logCom.logIn(true);
    this.insertToStorage("logged",true);
    this.insertToStorage("name",data.additionalUserInfo.profile.first_name);
    this.insertToStorage("email",data.additionalUserInfo.profile.email);
     //this.openSnackBar("Loggin Successful","successful");
    this.route.navigate(['/tabs'])
   }).catch((error)=>{
     console.log(error)

     //this.openSnackBar("Register Error","error");
   });
   
  }
  login(){
    let user = this.loginUser.value;
    let response = this.fireAuthService.login(user);
    response.then(data=>{
      this.logCom.logIn(true);
      this.insertToStorage("logged",true);
      this.insertToStorage("name",data.providerData[0].displayName);
      this.insertToStorage("email",data.providerData[0].email);

      //this.openSnackBar("Loggin Successful","successful");
      this.route.navigate(['/tabs'])
    }).catch((error)=>{
      console.log(error)
      //this.openSnackBar("Register Error","error");
    });
  }

  private buildForm(){
    const minPassLength = 6;
    this.loginUser = this.fb.group({
      email: ['o@o.com', [Validators.required, Validators.email]],
      password: ['jordi123', [Validators.required,Validators.minLength(minPassLength),]]
    });
  }
}
