import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

import { GiphyResult } from '../helpers/GiphyResult';
import { IntegrateRocketchatApp } from '../IntegrateRocketchatApp';

export class GiphyCommand implements ISlashCommand {
    public static CommandName = 'giphy';

    public command: string;
    public i18nParamsExample: string;
    public i18nDescription: string;
    public providesPreview: boolean;

    constructor(private readonly app: IntegrateRocketchatApp) {
        this.command = GiphyCommand.CommandName;
        this.i18nParamsExample = 'your_message_optional';
        this.i18nDescription = 'Slash_giphy_Description';
        this.providesPreview = true;
    }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        // if there are no args or args[0] === 'random'
        // then get a single one

        // otherwise, fetch the results and get a random one
        // as the max amount returned will be ten
        // throw new Error('Method not implemented.');
        const builder = modify.getCreator().startMessage()
            .setSender(context.getSender()).setRoom(context.getRoom())
            .setText('giphy' + context.getArguments().join(' '));

        await modify.getCreator().finish(builder);
    }

    public async previewer(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<ISlashCommandPreview> {
        let gifs: Array<GiphyResult>;
        let items: Array<ISlashCommandPreviewItem>;

        try {
            gifs = await this.app.getGifGetter().search(this.app.getLogger(), http, context.getArguments().join(' '));
            items = gifs.map((gif) => gif.toPreviewItem());
        } catch (e) {
            this.app.getLogger().error('Failed on something:', e);
            return {
                i18nTitle: 'TODO ERROR',
                items: [],
            };
        }

        return {
            i18nTitle: 'TODO',
            items,
        };
    }

    public async executePreviewItem(item: ISlashCommandPreviewItem, context: SlashCommandContext, read: IRead,
                                    modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const builder = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());

        try {
            const gif = await this.app.getGifGetter().getOne(this.app.getLogger(), http, item.id);
            builder.addAttachment({
                title: {
                    value: gif.title,
                },
                imageUrl: gif.originalUrl,
            });

            await modify.getCreator().finish(builder);
        } catch (e) {
            this.app.getLogger().error('Failed getting a gif', e);
            builder.setText('An error occured when trying to send the gif :disappointed_relieved:');

            await modify.getNotifier().notifyUser(context.getSender(), builder.getMessage());
        }
    }
}
