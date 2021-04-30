import { IModify, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

import { IModalContext } from '../../../definitions/IModalContext';
import { uuid } from '../../utils';

export async function createModal({ id = '', args, persistence, data, modify, options = 3 }: {
    id?: string,
    args: Array<string>,
    persistence: IPersistence,
    data: IModalContext,
    modify: IModify,
    options?: number,
}): Promise<IUIKitModalViewParam> {
    const viewId = id || uuid();
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, viewId);
    await persistence.createWithAssociation(data, association);
    const blockBuilder = modify.getCreator().getBlockBuilder();
    blockBuilder.addInputBlock({
        blockId: 'title_block_id',
        element: blockBuilder.newPlainTextInputElement({ initialValue: args[0], actionId: 'title' }),
        label: blockBuilder.newPlainTextObject('请输入标题'),
    })
        .addDividerBlock()
        .addImageBlock({
            title: {type: TextObjectType.PLAINTEXT, text: '钢铁侠', emoji: false},
            imageUrl: 'https://pics5.baidu.com/feed/810a19d8bc3eb135edb0963f5ae668d5fc1f443a.jpeg?token=4c91ff62ff586ba714063ab12bb60993',
            altText: '钢铁侠提示语',
        });

    for (let i = 0; i < options; i++) {
        blockBuilder.addInputBlock({
            blockId: 'poll',
            optional: true,
            element: blockBuilder.newPlainTextInputElement({
                actionId: `option-${i}`,
                placeholder: blockBuilder.newPlainTextObject('Insert an option'),
            }),
            label: blockBuilder.newPlainTextObject(''),
        });
    }

    blockBuilder
        .addActionsBlock({
            blockId: 'config',
            elements: [
                blockBuilder.newStaticSelectElement({
                    placeholder: blockBuilder.newPlainTextObject('Multiple choices'),
                    actionId: 'mode',
                    initialValue: 'multiple',
                    options: [
                        {
                            text: blockBuilder.newPlainTextObject('Multiple choices'),
                            value: 'multiple',
                        },
                        {
                            text: blockBuilder.newPlainTextObject('Single choice'),
                            value: 'single',
                        },
                    ],
                }),
                blockBuilder.newButtonElement({
                    actionId: 'addChoice',
                    text: blockBuilder.newPlainTextObject('Add a choice'),
                    value: String(options + 1),
                }),
                blockBuilder.newStaticSelectElement({
                    placeholder: blockBuilder.newPlainTextObject('Open vote'),
                    actionId: 'visibility',
                    initialValue: 'open',
                    options: [
                        {
                            text: blockBuilder.newPlainTextObject('Open vote'),
                            value: 'open',
                        },
                        {
                            text: blockBuilder.newPlainTextObject('Confidential vote'),
                            value: 'confidential',
                        },
                    ],
                }),
            ],
        });

    return {
        id: viewId,
        title: blockBuilder.newPlainTextObject(args[0]),
        submit: blockBuilder.newButtonElement({
            text: blockBuilder.newPlainTextObject(args[1] || '确认'),
        }),
        close: blockBuilder.newButtonElement({
            text: blockBuilder.newPlainTextObject(args[2] || '取消'),
        }),
        blocks: blockBuilder.getBlocks(),
    };
}
