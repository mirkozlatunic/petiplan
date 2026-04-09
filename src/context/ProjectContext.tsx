import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { ProjectState } from '../types';
import { projectReducer, initialState, type ProjectAction } from '../reducers/projectReducer';

const ProjectStateContext = createContext<ProjectState>(initialState);
const ProjectDispatchContext = createContext<Dispatch<ProjectAction>>(() => {});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectStateContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>
        {children}
      </ProjectDispatchContext.Provider>
    </ProjectStateContext.Provider>
  );
}

export function useProjectState(): ProjectState {
  return useContext(ProjectStateContext);
}

export function useProjectDispatch(): Dispatch<ProjectAction> {
  return useContext(ProjectDispatchContext);
}
