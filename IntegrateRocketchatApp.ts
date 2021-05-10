import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IEnvironmentRead,
    IHttp,
    ILogger, IMessageBuilder, IModify, IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPreMessageSentModify } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';
import {
    IUIKitInteractionHandler,
    UIKitBlockInteractionContext,
    UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import { UIKitViewCloseInteractionContext } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionContext';

import { CreateUICommand } from './commands/CreateUICommand';
import { GiphyCommand } from './commands/GiphyCommand';
import { GifGetter } from './helpers/GifGetter';
// import { createPollMessage } from './lib/functions/ui/poll/createPollMessage';

export class IntegrateRocketchatApp extends App implements IUIKitInteractionHandler, IPreMessageSentModify {
    private giphyId = 'giphy_cmd';
    private createUiId = 'create_ui_cmd';

    private readonly gifGetter: GifGetter;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);

        this.gifGetter = new GifGetter();
    }

    public getGifGetter(): GifGetter {
        return this.gifGetter;
    }

    public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        const data = context.getInteractionData();

        this.getLogger().error(data);

        // const { state }: {
        //     state: {
        //         poll: {
        //             question: string,
        //             [option: string]: string,
        //         },
        //         config?: {
        //             mode?: string,
        //             visibility?: string,
        //         },
        //     },
        // } = data.view as any;
        //
        // if (!state) {
        //     return context.getInteractionResponder().viewErrorResponse({
        //         viewId: data.view.id,
        //         errors: {
        //             question: 'Error creating poll',
        //         },
        //     });
        // }
        //
        // try {
        //     await createPollMessage(data, read, modify, persistence, data.user.id);
        // } catch (err) {
        //     return context.getInteractionResponder().viewErrorResponse({
        //         viewId: data.view.id,
        //         errors: err,
        //     });
        // }

        return {
            success: true,
        };
    }

    public async executeBlockActionHandler(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        return {
            success: true,
        };
    }

    public asyncexecuteViewClosedHandler(context: UIKitViewCloseInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
        return {
            success: true,
        };
    }

    public async checkPreMessageSentModify(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        return true;
    }

    // tslint:disable-next-line:max-line-length
    public async executePreMessageSentModify(message: IMessage, builder: IMessageBuilder, read: IRead, http: IHttp, persistence: IPersistence): Promise<IMessage> {
        return message;
    }

    public async onEnable(environmentRead: IEnvironmentRead, configModify: IConfigurationModify): Promise<boolean> {
        const sets = environmentRead.getSettings();

        await this.enableOrDisableCommand(this.giphyId, await sets.getValueById(this.giphyId), configModify);

        return true;
    }

    public async onSettingUpdated(setting: ISetting, configModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        await this.enableOrDisableCommand(setting.id, setting.value as boolean, configModify);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {

        await configuration.settings.provideSetting({
            id: this.giphyId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            value: true,
            required: true,
            public: false,
            i18nLabel: '启用/禁用giphy命令',
        });
        await configuration.settings.provideSetting({
            id: this.createUiId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            value: true,
            required: true,
            public: false,
            i18nLabel: '启用/禁用create_ui命令',
        });

        await configuration.slashCommands.provideSlashCommand(new GiphyCommand(this));
        await configuration.slashCommands.provideSlashCommand(new CreateUICommand(this));
    }

    private async enableOrDisableCommand(id: string, doEnable: boolean, configModify: IConfigurationModify): Promise<void> {
        switch (id) {
            case this.giphyId: {
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(GiphyCommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(GiphyCommand.CommandName);
                }
                break;
            }
            case this.createUiId: {
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(CreateUICommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(CreateUICommand.CommandName);
                }
                break;
            }
        }
    }
}
