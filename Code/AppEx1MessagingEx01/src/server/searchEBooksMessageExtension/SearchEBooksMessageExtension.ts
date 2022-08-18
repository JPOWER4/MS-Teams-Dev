import * as debug from "debug";
import { PreventIframe } from "express-msteams-host";
import { TurnContext, CardFactory, 
    MessagingExtensionQuery, MessagingExtensionResult, MessagingExtensionAttachment, AppBasedLinkQuery } from "botbuilder";
import { IMessagingExtensionMiddlewareProcessor } from "botbuilder-teams-messagingextensions";
import { request } from "express";

// Initialize debug logging module
const log = debug("msteams");

@PreventIframe("/searchEBooksMessageExtension/config.html")
export default class SearchEBooksMessageExtension implements IMessagingExtensionMiddlewareProcessor {

    public async onQueryLink(context: TurnContext, query: AppBasedLinkQuery): Promise<MessagingExtensionResult> {
    let messagingExtensionResult;
    const url: any = query.url;
    const card = CardFactory.thumbnailCard(
        "Link unfurling", url, ["http://jenkinsblogs.com/wp-content/uploads/2018/04/cropped-icon.png"]
    );

    messagingExtensionResult = {
        type: "result",
        attachmentLayout: "list",
        attachments: [card]
    };

    return messagingExtensionResult;
        
    }


    public async onQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResult> {
        let isbnnumber = "ISBN:9780789748591";
        if(query && query.parameters && query.parameters[0].name === "searchKeyword" && query.parameters[0].value){
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
        return CardFactory.heroCard(selectedBook.volumeInfo.title, selectedBook.volumeInfo.publisher);
    }

    public async onCardButtonClicked(context: TurnContext, value: any): Promise<void> {
        // Handle the Action.Submit action on the adaptive card
        if (value.action === "moreDetails") {
            log(`I got this ${value.id}`);
        }
        return Promise.resolve();
    }

}
