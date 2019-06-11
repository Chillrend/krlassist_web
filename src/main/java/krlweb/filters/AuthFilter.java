package krlweb.filters;

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

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException,ServletException {

        try{
            HttpServletRequest reqt = (HttpServletRequest) req;
            HttpServletResponse resp = (HttpServletResponse) res;

            HttpSession session = reqt.getSession(false);
            String request_uri = reqt.getRequestURI();

            if(request_uri.contains("javax.faces.resource")){
                chain.doFilter(req,res);
            }else {
                reqt.getRequestDispatcher("/faces/login.xhtml").forward(req,res);
//                resp.sendRedirect(reqt.getContextPath() + "/faces/login.xhtml");
//                reqt.getSession().getServletContext().getRequestDispatcher("/faces/login.xhtml").forward(req,res);
            }

        }catch(Exception e){
            e.printStackTrace();
            System.out.print(e.getMessage());
        }

    }

    @Override
    public void destroy() {

    }
}
