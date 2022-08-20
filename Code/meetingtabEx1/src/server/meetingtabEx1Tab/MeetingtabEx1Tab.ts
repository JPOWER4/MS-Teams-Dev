import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/meetingtabEx1Tab/index.html")
@PreventIframe("/meetingtabEx1Tab/config.html")
@PreventIframe("/meetingtabEx1Tab/remove.html")
export class MeetingtabEx1Tab {
}
