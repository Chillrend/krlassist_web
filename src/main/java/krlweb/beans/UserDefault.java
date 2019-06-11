package krlweb.beans;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sun.org.apache.xml.internal.security.Init;
import krlweb.apipojo.AuthDefault;
import krlweb.apipojo.AuthKey;
import krlweb.apipojo.FbUser;
import krlweb.apipojo.Users;
import krlweb.apipojo.autherror.AuthError;
import krlweb.utils.*;
import krlweb.utils.interfaces.AuthDefaultInterface;
import krlweb.utils.interfaces.FbCallInterface;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.Serializable;
import java.util.concurrent.ExecutionException;

public class UserDefault implements Serializable {
    private String email;
    private String display_name;
    private String password;
    private String pp_link;
    private String role;
    private String stat_mgd;
    private String auth;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplay_name() {
        return display_name;
    }

    public void setDisplay_name(String display_name) {
        this.display_name = display_name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPp_link() {
        return pp_link;
    }

    public void setPp_link(String pp_link) {
        this.pp_link = pp_link;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStat_mgd() {
        return stat_mgd;
    }

    public void setStat_mgd(String stat_mgd) {
        this.stat_mgd = stat_mgd;
    }

    public String getAuth() {
        return auth;
    }

    public void setAuth(String auth) {
        this.auth = auth;
    }

    public String goLogin(){

        ApiCall authCall = new ApiCall();
        AuthDefaultInterface authDefaultInterface = authCall.getClient().create(AuthDefaultInterface.class);
        Call<AuthDefault> calls = authDefaultInterface.authuser(email,password,true);

        try{
            Response<AuthDefault> response = calls.execute();

            if(response.code() > 300){
                Gson gson = new GsonBuilder().create();
                AuthError errormsg = new AuthError();
                try{
                    errormsg = gson.fromJson(response.errorBody().string(), AuthError.class);

                    String errormessage = errormsg.getError().getMessage();

                    FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_ERROR, "Error Logging in " + errormessage, null);
                    FacesContext.getCurrentInstance().addMessage("loginForm:btnSubmit", msg);
                    return "login";

                }catch (IOException e){
                    e.printStackTrace();
                    return null;
                }
            }else{
                AuthDefault res = response.body();

                String email = res.getEmail();
                String id_token = res.getIdToken();
                String refresh_token = res.getRefreshToken();

                String db_email = email.replace(".", ",");


                Firestore db = new InitFirestore().getDb();
                DocumentReference users = db.collection("users").document(email);

                ApiFuture<DocumentSnapshot> future = users.get();
                DocumentSnapshot userSnapshot = future.get();

                Users userPojo = null;
                if(userSnapshot.exists()){
                    userPojo = userSnapshot.toObject(Users.class);

                    HttpSession session = SessionUtils.getSession();
                    SessionObject sesObj = new SessionObject(email,userPojo.getDisplayname(),userPojo.getPp_loc(),userPojo.getRole(),userPojo.getStat_mgd());
                    session.setAttribute("session", sesObj);

                    return "admin";
                }else{
                    FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_ERROR, "You are not in database yet", null);
                    FacesContext.getCurrentInstance().addMessage("loginForm:btnSubmit", msg);

                    return "login";
                }
            }

        }catch (IOException | InterruptedException | ExecutionException e){
            e.printStackTrace();
            return null;
        }

    }

    public String goLoginWithGoogle(){
        try{
            Firestore db = new InitFirestore().getDb();

            DocumentReference users = db.collection("users").document(email);

            ApiFuture<DocumentSnapshot> future = users.get();
            DocumentSnapshot userSnapshot = future.get();

            Users user = null;
            if(userSnapshot.exists()){

                user = userSnapshot.toObject(Users.class);

                HttpSession session = SessionUtils.getSession();
                SessionObject sesObj = new SessionObject(email,user.getDisplayname(),user.getPp_loc(),user.getRole(),user.getStat_mgd());
                session.setAttribute("session", sesObj);

                return "admin";
            }else{

                FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_INFO, "You haven't regiestered yet, please register first", null);
                FacesContext.getCurrentInstance().addMessage("loginForm:btnSubmit", msg);

                return "noDatainDb";
            }

        }catch (ExecutionException | InterruptedException e){
            e.printStackTrace();
            return null;
        }
    }

    public String goRegisterAndLoginWithGoogle(){
        Firestore db = new InitFirestore().getDb();

        CollectionReference collection = db.collection("auth_key");
        DocumentReference auth_key = collection.document(auth);

        ApiFuture<DocumentSnapshot> future = auth_key.get();

        try{
            DocumentSnapshot auth_key_docs = future.get();
            AuthKey authKeyPojo = null;
            if(auth_key_docs.exists()){
                authKeyPojo = auth_key_docs.toObject(AuthKey.class);

                Users userspojo = new Users(display_name,true,pp_link,authKeyPojo.getTo_role(),authKeyPojo.getTo_stat());
                ApiFuture<WriteResult> writeResultApiFuture = db.collection("users").document(email).set(userspojo);

                HttpSession session = SessionUtils.getSession();
                SessionObject sesObj = new SessionObject(email,display_name,pp_link,authKeyPojo.getTo_role(),authKeyPojo.getTo_stat());
                session.setAttribute("session", sesObj);

                return "admin";
            } else {
                FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_INFO, "Auth Key salah, silahkan coba lagi", null);
                FacesContext.getCurrentInstance().addMessage("loginForm:btnSubmit", msg);

                return "noDatainDb";
            }
        }catch(ExecutionException | InterruptedException e){
            e.printStackTrace();
            return null;
        }



    }
}
