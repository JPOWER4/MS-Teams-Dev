import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/taskTab/index.html")
@PreventIframe("/taskTab/config.html")
@PreventIframe("/taskTab/remove.html")
export class TaskTab {
}
