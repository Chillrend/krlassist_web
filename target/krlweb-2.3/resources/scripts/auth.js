var firebaseConfig = {
    apiKey: "AIzaSyDqx68SCj15nrCxO-w4Ur_Ex-eOm006mSw",
    authDomain: "proj1engine.firebaseapp.com",
    databaseURL: "https://proj1engine.firebaseio.com",
    projectId: "proj1engine",
    storageBucket: "proj1engine.appspot.com",
    messagingSenderId: "772605542698",
    appId: "1:772605542698:web:fb8bd1171301c301"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().useDeviceLanguage();

$('#googlesignin').click(function () {
   firebase.auth().signInWithPopup(provider).then(function (res) {
       let userInfo =  res.user;

       let hiddenInputEmail = document.getElementById('hiddenGoogleForm:hiddenEmail');
       let hiddenInputName = document.getElementById('hiddenGoogleForm:hiddenDname');
       let hiddenPpLoc = document.getElementById('hiddenGoogleForm:hiddenPploc');

       let display_name = userInfo.displayName;
       let email = userInfo.email;
       let pp_loc = userInfo.photoURL;

       hiddenInputEmail.value = email;
       hiddenInputName.value = display_name;
       hiddenPpLoc.value = pp_loc;

       let form = document.getElementById("hiddenGoogleForm");
       let btnSubmit = document.getElementById("hiddenGoogleForm:btnSubmitHiddenForm");

       btnSubmit.click();

       console.log(display_name + email + pp_loc);
       console.log(userInfo);
   }).catch(function (err) {
      let errorcode = err.code;
      let errorMsg = err.message;
      let email = err.email;
      let credential = err.credential;

      console.log(errorcode + ";" + errorMsg + ";" + email)
   });
});


$(document).ready(function(){

});