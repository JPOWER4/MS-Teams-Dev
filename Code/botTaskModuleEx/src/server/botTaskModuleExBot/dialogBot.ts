import {
    ConversationState,
    UserState,
    TeamsActivityHandler,
    TurnContext,
    TaskModuleRequest,
    TaskModuleResponse,
    TaskModuleTaskInfo,
    ActivityTypes,
    CardFactory
} from "botbuilder";
import { MainDialog } from "./dialogs/mainDialog";
import * as Util from "util";
import { CardFooter } from "@fluentui/react-northstar";
import { request } from "express";
const TextEncoder = Util.TextEncoder;

export class DialogBot extends TeamsActivityHandler {
    public dialogState: any;

    constructor(public conversationState: ConversationState, public userState: UserState, public dialog: MainDialog) {
        super();
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty("DialogState");

        this.onMessage(async (context, next) => {

            switch (context.activity.type) {
                case ActivityTypes.Message:

                    const card = CardFactory.heroCard("Learn about Teams", undefined, [{
                        type: "invoke",
                        title: "Please click below link to visit the video",
                        value: { type: "task/fetch", taskmodule: "player", videoId: "RW6iP6Ic6sY" }
                    }]);

                    await context.sendActivity({ attachments: [card] });

                default:
                    break;
            }


            // Run the MainDialog with the new message Activity.
            //await this.dialog.run(context, this.dialogState);
            await next();
        });
    }

    protected handleTeamsTaskModuleFetch(_context: TurnContext, _taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        let response: TaskModuleResponse;
        response = {
            task: {
                type: "continue",
                value: {
                    title: "You tube Player",
                    url: `https://${process.env.PUBLIC_HOSTNAME}/player.html?vid=RW6iP6Ic6sY`,
                    width: 1000,
                    height: 700
                } as TaskModuleTaskInfo
            }
        } as TaskModuleResponse
        return Promise.resolve(response);
    }


    public async run(context: TurnContext) {
        await super.run(context);
        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}
