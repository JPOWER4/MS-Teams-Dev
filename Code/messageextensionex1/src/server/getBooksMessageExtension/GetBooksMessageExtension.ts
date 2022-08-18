import * as debug from "debug";
import { PreventIframe } from "express-msteams-host";
import { TurnContext, CardFactory,MessagingExtensionAttachment, MessagingExtensionQuery, MessagingExtensionResult } from "botbuilder";
import { IMessagingExtensionMiddlewareProcessor } from "botbuilder-teams-messagingextensions";

// Initialize debug logging module
const log = debug("msteams");

@PreventIframe("/getBooksMessageExtension/config.html")
export default class GetBooksMessageExtension implements IMessagingExtensionMiddlewareProcessor {

    public async onQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResult> {
        let isbnnumber = "ISBN:9780789748591";
        if (query && query.parameters && query.parameters[0].name === "searchKeyword" && query.parameters[0].value) {
            isbnnumber = query.parameters[0].value;
        }
        const request = require("request");
        const url = "https://www.googleapis.com/books/v1/volumes?q=" + isbnnumber + "&limit=10&offset=0";

        let messagingExtensionResult;
        const attachments: MessagingExtensionAttachment[] = [];

        
        return new Promise<MessagingExtensionResult>((resolve, reject) => {
            request(url, { json: true }, (err, res, body) => {
                if (err) {
                    return;
                }
                const data = body;

                const searchResultsCards: MessagingExtensionAttachment[] = [];
                data.items.forEach((book) => {
                    searchResultsCards.push(this.getBookResultCard(book));
                });

                messagingExtensionResult = {
                    type: "result",
                    attachmentLayout: "list",
                    attachments: searchResultsCards
                };

                resolve(messagingExtensionResult);

            });
        });
       
    }
    private getBookResultCard(selectedBook: any): MessagingExtensionAttachment {
        return CardFactory.heroCard(selectedBook.volumeInfo.title, selectedBook.volumeInfo.description);
    }


    public async onCardButtonClicked(context: TurnContext, value: any): Promise<void> {
        // Handle the Action.Submit action on the adaptive card
        if (value.action === "moreDetails") {
            log(`I got this ${value.id}`);
        }
        return Promise.resolve();
    }

    // this is used when canUpdateConfiguration is set to true
    public async onQuerySettingsUrl(context: TurnContext): Promise<{ title: string, value: string }> {
        return Promise.resolve({
            title: "getBooks Configuration",
            value: `https://${process.env.PUBLIC_HOSTNAME}/getBooksMessageExtension/config.html?name={loginHint}&tenant={tid}&group={groupId}&theme={theme}`
        });
    }

    public async onSettings(context: TurnContext): Promise<void> {
        // take care of the setting returned from the dialog, with the value stored in state
        const setting = context.activity.value.state;
        log(`New setting: ${setting}`);
        return Promise.resolve();
    }

}
