package krlweb.beans;

import krlweb.utils.SessionObject;
import krlweb.utils.SessionUtils;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpSession;

public class SessionInitializer {

    private String email;
    private String display_name;
    private String pp_link;
    private String role;
    private String stat_mgd;

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

    @PostConstruct
    public void getSessionFirstTime(){
        HttpSession session = SessionUtils.getSession();
        try{
            SessionObject sessionObject = (SessionObject) session.getAttribute("session");
            this.email = sessionObject.getEmail();
            this.display_name = sessionObject.getDisplay_name();
            this.pp_link = sessionObject.getPp_link();
            this.role = sessionObject.getRole();
            this.stat_mgd = sessionObject.getStat_mgd();
        }catch (NullPointerException e){
            e.printStackTrace();
        }


    }
}
