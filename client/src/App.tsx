import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminDashboard from "./pages/AdminDashboard";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import GovernancePage from "./pages/GovernancePage";
import Home from "./pages/Home";
import NewsPage from "./pages/NewsPage";
import NewsDetail from "./pages/NewsDetail";
import EventsPage from "./pages/EventsPage";
import SurveyAdminPage from "./pages/SurveyAdminPage";
import SurveyPage from "./pages/SurveyPage";
import MobileBottomNav from "./components/MobileBottomNav";
import { MobileRouteFrame, MobileRouteTransitionProvider } from "./components/MobileRouteTransition";

/**
 * الجمعية التعاونية الزراعية للتطوير والاستدامة
 * موقع عربي مؤسسي فاخر وحديث يعكس هوية زراعية سعودية مستدامة.
 */
function Router() {
  return (
    <MobileRouteFrame>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/about"} component={AboutPage} />
        <Route path={"/news"} component={NewsPage} />
        <Route path={"/news/:id"} component={NewsDetail} />
        <Route path={"/events"} component={EventsPage} />
        <Route path={"/governance"} component={GovernancePage} />
        <Route path={"/contact"} component={ContactPage} />
        <Route path={"/survey"} component={SurveyPage} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/admin/surveys"} component={SurveyAdminPage} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </MobileRouteFrame>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <MobileRouteTransitionProvider>
            <Toaster position="top-center" />
            <Router />
            <MobileBottomNav />
          </MobileRouteTransitionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
