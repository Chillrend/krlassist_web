package krlweb.utils.interfaces;


import krlweb.apipojo.FbUser;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Url;

public interface FbCallInterface {
    @GET
    Call<FbUser> getUserFromFirebase(@Url String request_url);

}
