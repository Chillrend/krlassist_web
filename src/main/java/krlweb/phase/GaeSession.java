package krlweb.phase;

import javax.faces.context.FacesContext;
import javax.faces.event.PhaseEvent;
import javax.faces.event.PhaseId;
import javax.faces.event.PhaseListener;

public class GaeSession implements PhaseListener {
    private static final long serialVersionUID = 1L;

    @Override
    public void afterPhase(PhaseEvent arg0) {
        FacesContext.getCurrentInstance().getExternalContext().getSessionMap().put("CURRENT_TIME", System.currentTimeMillis());
    }

    @Override
    public void beforePhase(PhaseEvent arg0) {
    }

    @Override
    public PhaseId getPhaseId() {
        return PhaseId.ANY_PHASE;
    }

}

//WHAT THE F, GOOGLE APP ENGINE, WHY R U MAKING MY LIFE HARD ???!!
