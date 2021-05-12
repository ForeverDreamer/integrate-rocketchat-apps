import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUIKitBlockIncomingInteraction } from '@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes';

import { createPollBlocks } from './createPollBlocks';
import { getPoll } from './getPoll';
import { storeVote } from './storeVote';

export async function votePoll({ data, read, persistence, modify }: {
    data: IUIKitBlockIncomingInteraction,
    read: IRead,
    persistence: IPersistence,
    modify: IModify,
}) {
    if (!data.message) {
        return {
            success: true,
        };
    }

    const poll = await getPoll(String(data.message.id), read);
    if (!poll) {
        throw new Error('no such poll');
    }

    if (poll.finished) {
        throw new Error('poll is already finished');
    }

    await storeVote(poll, parseInt(String(data.value), 10), data.user, { persis: persistence });

    const messageUpdater = await modify.getUpdater().message(data.message.id as string, data.user);
    messageUpdater.setEditor(messageUpdater.getSender());

    const blockBuilder = modify.getCreator().getBlockBuilder();

    // const showNames = await read.getEnvironmentReader().getSettings().getById('use-user-name');

    // createPollBlocks(block, poll.question, poll.options, poll, showNames.value);
    createPollBlocks(blockBuilder, poll.question, poll.options, poll, false);

    messageUpdater.setBlocks(blockBuilder);

    return modify.getUpdater().finish(messageUpdater);
}
