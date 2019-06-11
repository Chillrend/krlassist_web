package krlweb.apipojo;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

public class FbUser {

    @SerializedName("isGoogleUsed")
    @Expose
    private Boolean isGoogleUsed;
    @SerializedName("name")
    @Expose
    private String name;
    @SerializedName("pploc")
    @Expose
    private String pploc;
    @SerializedName("role")
    @Expose
    private String role;
    @SerializedName("stasiun_managed")
    @Expose
    private String stasiunManaged;

    public Boolean getIsGoogleUsed() {
        return isGoogleUsed;
    }

    public void setIsGoogleUsed(Boolean isGoogleUsed) {
        this.isGoogleUsed = isGoogleUsed;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPploc() {
        return pploc;
    }

    public void setPploc(String pploc) {
        this.pploc = pploc;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStasiunManaged() {
        return stasiunManaged;
    }

    public void setStasiunManaged(String stasiunManaged) {
        this.stasiunManaged = stasiunManaged;
    }

}