import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

import { UIType } from '../definitions/MiscType';
import { IntegrateRocketchatApp } from '../IntegrateRocketchatApp';
import { notifyError } from '../lib/errorHandlers';
import { createModal } from '../lib/functions/ui/poll/createModal';

export class CreateUICommand implements ISlashCommand {
    public static CommandName = 'create_ui';

    public command = CreateUICommand.CommandName;
    public i18nParamsExample = 'modal|buttons';
    public i18nDescription = '创建用户交互界面';
    public providesPreview = false;

    constructor(private readonly app: IntegrateRocketchatApp) {
    }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const triggerId = context.getTriggerId();
        const data = {
            room: (context.getRoom() as any).value,
            threadId: context.getThreadId(),
        };
        const args = context.getArguments();

        if (args.length === 0) {
            await notifyError(context.getRoom(), context.getSender(), '请输入要创建的ui类型', modify);
            return;
        }

        if (!triggerId) {
            await notifyError(context.getRoom(), context.getSender(), 'triggerId未定义', modify);
            return;
        }

        async function createUi(uiType: UIType, tId) {
            switch (uiType) {
                case 'modal': {
                    const modal = await createModal({ args, persistence: persis, modify, data });
                    await modify.getUiController().openModalView(modal, { triggerId: tId }, context.getSender());
                    break;
                }
                case 'buttons': {
                    break;
                }
                default: {
                    await notifyError(context.getRoom(), context.getSender(), 'ui类型不支持', modify);
                    break;
                }
            }
        }
        try {
            await createUi(args[0] as UIType, triggerId);
        } catch (e) {
            await notifyError(context.getRoom(), context.getSender(), e.message, modify);
        }
    }
}
