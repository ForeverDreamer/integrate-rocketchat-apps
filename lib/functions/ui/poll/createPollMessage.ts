import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import {
    IUIKitViewSubmitIncomingInteraction,
} from '@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes';

import { IModalContext, IPoll } from '../../../../definitions/Poll';
import { createPollBlocks } from './createPollBlocks';

export async function createPollMessage(data: IUIKitViewSubmitIncomingInteraction, read: IRead, modify: IModify, persistence: IPersistence, uid: string) {
    const { view: { id } } = data;
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id);
    const [record] = await read.getPersistenceReader().readByAssociation(association) as Array<IModalContext>;
    if (!record.room) {
        throw new Error('Invalid room');
    }

    // const { state }: {
    //     state?: any;
    // } = data.view;
    const { state }: {
        state: {
            poll_question: {
                question: string,
                [option: string]: string,
            },
            poll_config: {
                mode: string,
                visibility: string,
            },
        },
    } = data.view as any;

    if (!state.poll_question || !state.poll_question.question || state.poll_question.question.trim() === '') {
        throw { question: '请输入调查问题' };
    }

    const options = Object.entries<any>(state.poll_question || {})
        .filter(([key]) => key !== 'question')
        .map(([, option]) => option)
        .filter((option) => option.trim() !== '');

    if (options.length === 0) {
        throw {
            'option-0': '请输入投票选项',
            'option-1': '请输入投票选项',
        };
    }

    if (options.length === 1) {
        if (!state.poll_question['option-0'] || state.poll_question['option-0'].trim() === '') {
            throw {
                'option-0': '请输入投票选项',
            };
        }
        if (!state.poll_question['option-1'] || state.poll_question['option-1'].trim() === '') {
            throw {
                'option-1': '请输入投票选项',
            };
        }
    }

    try {
        const { poll_config = { mode: 'multiple', visibility: 'open' } } = state;
        const { mode = 'multiple', visibility = 'open' } = poll_config;

        // const showNames = await read.getEnvironmentReader().getSettings().getById('use-user-name');

        const messageBuilder = modify.getCreator().startMessage()
            // .setUsernameAlias((showNames.value && data.user.name) || data.user.username)
            .setUsernameAlias(data.user.username)
            .setRoom(record.room)
            .setText(state.poll_question.question);

        // if poll created from inside a thread, need to set the thread id
        if (record.threadId) {
            messageBuilder.setThreadId(record.threadId);
        }

        const poll: IPoll = {
            question: state.poll_question.question,
            uid,
            msgId: '',
            options,
            totalVotes: 0,
            votes: options.map(() => ({ quantity: 0, voters: [] })),
            confidential: visibility === 'confidential',
            singleChoice: mode === 'single',
        };

        const blockBuilder = modify.getCreator().getBlockBuilder();
        // createPollBlocks(block, poll.question, options, poll, showNames.value);
        createPollBlocks(blockBuilder, poll.question, options, poll, false);

        messageBuilder.setBlocks(blockBuilder);

        const messageId = await modify.getCreator().finish(messageBuilder);
        poll.msgId = messageId;

        const pollAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, messageId);

        await persistence.createWithAssociation(poll, pollAssociation);
    } catch (e) {
        throw e;
    }
}
