package krlweb.apipojo;

public class AuthKey {
    private String assignedby;
    private String to_role;
    private String to_stat;

    public AuthKey(){

    }

    public AuthKey(String assignedby, String to_role, String to_stat) {
        this.assignedby = assignedby;
        this.to_role = to_role;
        this.to_stat = to_stat;
    }

    public String getAssignedby() {
        return assignedby;
    }

    public void setAssignedby(String assignedby) {
        this.assignedby = assignedby;
    }

    public String getTo_role() {
        return to_role;
    }

    public void setTo_role(String to_role) {
        this.to_role = to_role;
    }

    public String getTo_stat() {
        return to_stat;
    }

    public void setTo_stat(String to_stat) {
        this.to_stat = to_stat;
    }
}
