import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/meetingtabTab/index.html")
@PreventIframe("/meetingtabTab/config.html")
@PreventIframe("/meetingtabTab/remove.html")
export class MeetingtabTab {
}
