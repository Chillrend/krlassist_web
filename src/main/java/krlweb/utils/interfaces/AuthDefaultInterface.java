package krlweb.utils.interfaces;

import krlweb.apipojo.AuthDefault;
import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

public interface AuthDefaultInterface {

    @FormUrlEncoded
    @POST("https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=\n" +
            "AIzaSyDqx68SCj15nrCxO-w4Ur_Ex-eOm006mSw")
    Call<AuthDefault> authuser(@Field("email") String email, @Field("password") String password, @Field("returnSecureToken") boolean returnSecureToken);

}
