package krlweb.filters;

import krlweb.utils.SessionObject;
import krlweb.utils.SessionUtils;

import javax.faces.application.ResourceHandler;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebFilter("/*")
public class AuthFilter implements Filter {

    public AuthFilter(){

    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    private static final String AJAX_REDIRECT_XML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
            + "<partial-response><redirect url=\"%s\"></redirect></partial-response>";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        HttpSession session = request.getSession(false);
        String loginURL = request.getContextPath() + "/faces/login.xhtml";
        String user = request.getContextPath() + "/faces/clientarea.xhtml";  
        boolean loggedIn = (session != null) && (session.getAttribute("session") != null);
        boolean loginRequest = request.getRequestURI().equals(loginURL);
        boolean userRequest = request.getRequestURI().equals(user);
        boolean resourceRequest = request.getRequestURI().contains("javax.faces.resource");
        boolean ajaxRequest = "partial/ajax".equals(request.getHeader("Faces-Request"));

        if (loggedIn || loginRequest || resourceRequest) {
            if (!resourceRequest) { // Prevent browser from caching restricted resources. See also https://stackoverflow.com/q/4194207/157882
                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
                response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
                response.setDateHeader("Expires", 0); // Proxies.
            }

            chain.doFilter(request, response); // So, just continue request.
        }
        else if (ajaxRequest) {
            response.setContentType("text/xml");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().printf(AJAX_REDIRECT_XML, loginURL); // So, return special XML response instructing JSF ajax to send a redirect.
        }
        else if (userRequest){
              chain.doFilter(request, response);
        }
        else {
            response.sendRedirect(loginURL); // So, just perform standard synchronous redirect.
        }
    }

    @Override
    public void destroy() {

    }
}
