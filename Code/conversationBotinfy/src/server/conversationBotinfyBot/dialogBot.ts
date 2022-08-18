import {
    ConversationState,
    UserState,
    TeamsActivityHandler,
    TurnContext,
    MessageFactory,
    CardFactory,
    TeamsInfo
} from "botbuilder";
import { MainDialog } from "./dialogs/mainDialog";
import ResponseCard from "./cards/ResponseCard";
import videocard from "./cards/VideoCard";
import { app, authentication } from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";

export class DialogBot extends TeamsActivityHandler {
    public dialogState: any;

    constructor(public conversationState: ConversationState, public userState: UserState, public dialog: MainDialog) {
        super();
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty("DialogState");

        this.onMessage(async (context, next) => {
            let name = "";
            authentication.getAuthToken({
                resources: ["api://", process.env.PUBLIC_HOSTNAME as string, "/",process.env.TAB_APP_ID as string],
                silent: false
            } as authentication.AuthTokenRequestParameters).then(token => {
                const decoded: { [key: string]: any; } = jwtDecode(token) as { [key: string]: any; };
                name = decoded!.name;
                app.notifySuccess();
            }).catch(message => {
                app.notifyFailure({
                    reason: app.FailedReason.AuthFailed,
                    message
                });
            });
            
            let text = context.activity.text;
            if (text.startsWith("mentionme")) {
                await this.handleMessageMentionMeOneOnOne(context);
                return;
            } else if (text.startsWith("video")) {
                const cardv = CardFactory.adaptiveCard(videocard);
                await context.sendActivity({ attachments: [cardv] });

            } else {
                await context.sendActivity("Name : " + name);
            }
            // Run the MainDialog with the new message Activity.
            //await this.dialog.run(context, this.dialogState);
            await next();
        });

        this.onConversationUpdate(async (context, next): Promise<void> => {

            const welcomemsg = "Welcome to Teams Training!";

            if (welcomemsg !== undefined) {
                await context.sendActivity(welcomemsg + " object id : " + context.activity.from.aadObjectId + " id : " + context.activity.from.id);
            }
            await next();
        });
    }

    private async handleMessageMentionMeOneOnOne(context: TurnContext): Promise<void> {
        const mention = {
            mentioned: context.activity.from,
            text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
            type: "mention"
        };
        const replyactivity = MessageFactory.text(`Hey ${mention.text} from a 1:1 chat.`);
        replyactivity.entities = [mention];
        await context.sendActivity(replyactivity);
    }



    public async run(context: TurnContext) {
        await super.run(context);
        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}
