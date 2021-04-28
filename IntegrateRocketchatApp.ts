import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { GimmeCommand } from './commands/asciiart/GimmeCommand';
import { LennyCommand } from './commands/asciiart/LennyCommand';
import { ShrugCommand } from './commands/asciiart/ShrugCommand';
import { TableflipCommand } from './commands/asciiart/TableflipCommand';
import { UnflipCommand } from './commands/asciiart/UnflipCommand';
import { GiphyCommand } from './commands/GiphyCommand';
import { GifGetter } from './helpers/GifGetter';

export class IntegrateRocketchatApp extends App {
    private gimmeId = 'gimmie_cmd';
    private lennyId = 'lenny_cmd';
    private shrugId = 'shrug_cmd';
    private flipId = 'flip_cmd';
    private unflipId = 'unflip_cmd';
    private giphyId = 'giphy_cmd';

    private readonly gifGetter: GifGetter;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);

        this.gifGetter = new GifGetter();
    }

    public getGifGetter(): GifGetter {
        return this.gifGetter;
    }

    public async onEnable(environmentRead: IEnvironmentRead, configModify: IConfigurationModify): Promise<boolean> {
        const sets = environmentRead.getSettings();

        await this.enableOrDisableCommand(this.gimmeId, await sets.getValueById(this.gimmeId), configModify);
        await this.enableOrDisableCommand(this.lennyId, await sets.getValueById(this.lennyId), configModify);
        await this.enableOrDisableCommand(this.shrugId, await sets.getValueById(this.shrugId), configModify);
        await this.enableOrDisableCommand(this.flipId, await sets.getValueById(this.flipId), configModify);
        await this.enableOrDisableCommand(this.unflipId, await sets.getValueById(this.unflipId), configModify);
        await this.enableOrDisableCommand(this.giphyId, await sets.getValueById(this.giphyId), configModify);

        return true;
    }

    public async onSettingUpdated(setting: ISetting, configModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        await this.enableOrDisableCommand(setting.id, setting.value as boolean, configModify);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.settings.provideSetting({
            id: this.gimmeId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            required: false,
            public: false,
            i18nLabel: 'Enable_Gimme_Command',
            i18nDescription: 'Enable_Gimme_Command_Description',
        });

        await configuration.settings.provideSetting({
            id: this.lennyId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            required: false,
            public: false,
            i18nLabel: 'Enable_Lenny_Command',
            i18nDescription: 'Enable_Lenny_Command_Description',
        });

        await configuration.settings.provideSetting({
            id: this.shrugId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            required: false,
            public: false,
            i18nLabel: 'Enable_Shrug_Command',
            i18nDescription: 'Enable_Shrug_Command_Description',
        });

        await configuration.settings.provideSetting({
            id: this.flipId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            required: false,
            public: false,
            i18nLabel: 'Enable_Tableflip_Command',
            i18nDescription: 'Enable_Tableflip_Command_Description',
        });

        await configuration.settings.provideSetting({
            id: this.unflipId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            required: false,
            public: false,
            i18nLabel: 'Enable_Unflip_Table_Command',
            i18nDescription: 'Enable_Unflip_Table_Command_Description',
        });

        await configuration.settings.provideSetting({
            id: this.giphyId,
            type: SettingType.BOOLEAN,
            packageValue: true,
            required: false,
            public: false,
            i18nLabel: 'Enable_GiphyId_Table_Command',
            i18nDescription: 'Enable_GiphyId_Table_Command_Description',
        });

        await configuration.slashCommands.provideSlashCommand(new GimmeCommand());
        await configuration.slashCommands.provideSlashCommand(new LennyCommand());
        await configuration.slashCommands.provideSlashCommand(new ShrugCommand());
        await configuration.slashCommands.provideSlashCommand(new TableflipCommand());
        await configuration.slashCommands.provideSlashCommand(new UnflipCommand());
        await configuration.slashCommands.provideSlashCommand(new GiphyCommand(this));
    }

    private async enableOrDisableCommand(id: string, doEnable: boolean, configModify: IConfigurationModify): Promise<void> {
        switch (id) {
            case this.gimmeId:
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(GimmeCommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(GimmeCommand.CommandName);
                }
                return;
            case this.lennyId:
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(LennyCommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(LennyCommand.CommandName);
                }
                return;
            case this.shrugId:
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(ShrugCommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(ShrugCommand.CommandName);
                }
                return;
            case this.flipId:
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(TableflipCommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(TableflipCommand.CommandName);
                }
                return;
            case this.unflipId:
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(UnflipCommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(UnflipCommand.CommandName);
                }
                return;
            case this.giphyId:
                if (doEnable) {
                    await configModify.slashCommands.enableSlashCommand(GiphyCommand.CommandName);
                } else {
                    await configModify.slashCommands.disableSlashCommand(GiphyCommand.CommandName);
                }
                return;
        }
    }
}
