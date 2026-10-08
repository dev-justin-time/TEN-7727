import { Route, Switch } from "wouter";
import Index from "./pages/index";
import { Provider } from "./components/provider";
import { Layout } from "./components/layout";
import Join from "./pages/join";
import Forge from "./pages/forge";
import Pitch from "./pages/pitch";
import Project from "./pages/project";
import Projects from "./pages/projects";
import Portfolio from "./pages/portfolio";
import Studio from "./pages/studio";
import Exchange from "./pages/exchange";
import IpDesk from "./pages/ipdesk";
import Scores from "./pages/scores";
import House from "./pages/house";
import Hub from "./pages/hub";
import Compliance from "./pages/compliance";
import Sole from "./pages/sole";
import Orbital from "./pages/orbital";
import { PageHead } from "./components/bits";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { log } from "./lib/log";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function RouteLog() {
  const [path] = useLocation();
  useEffect(() => { log.decide("navigation", "Page opened", { path }); window.scrollTo(0, 0); }, [path]);
  return null;
}
function App() {
  return (
    <Provider>
      <RouteLog />
      <Layout>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/join" component={Join} />
        <Route path="/forge/pitch" component={Pitch} />
        <Route path="/forge/project/:id" component={Project} />
        <Route path="/forge" component={Forge} />
        <Route path="/projects" component={Projects} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/studio" component={Studio} />
        <Route path="/exchange" component={Exchange} />
        <Route path="/ipdesk" component={IpDesk} />
        <Route path="/scores" component={Scores} />
        <Route path="/house" component={House} />
        <Route path="/hub" component={Hub} />
        <Route path="/compliance" component={Compliance} />
        <Route path="/sole" component={Sole} />
        <Route path="/orbital" component={Orbital} />
        <Route><PageHead kicker="404" title="Off the map">This room doesn't exist. Use the navigation to return to the network.</PageHead></Route>
      </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
