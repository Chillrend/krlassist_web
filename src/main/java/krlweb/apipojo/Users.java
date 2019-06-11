package krlweb.apipojo;

public class Users {
    private String displayname;
    private Boolean isGoogleUsed;
    private String pp_loc;
    private String role;
    private String stat_mgd;

    public Users(){

    }

    public Users(String displayname, Boolean isGoogleUsed, String pp_loc, String role, String stat_mgd) {
        this.displayname = displayname;
        this.isGoogleUsed = isGoogleUsed;
        this.pp_loc = pp_loc;
        this.role = role;
        this.stat_mgd = stat_mgd;
    }

    public String getDisplayname() {
        return displayname;
    }

    public void setDisplayname(String displayname) {
        this.displayname = displayname;
    }

    public Boolean getGoogleUsed() {
        return isGoogleUsed;
    }

    public void setGoogleUsed(Boolean googleUsed) {
        isGoogleUsed = googleUsed;
    }

    public String getPp_loc() {
        return pp_loc;
    }

    public void setPp_loc(String pp_loc) {
        this.pp_loc = pp_loc;
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
}
