import {IModify, IPersistence} from '@rocket.chat/apps-engine/definition/accessors';
import {RocketChatAssociationModel, RocketChatAssociationRecord} from '@rocket.chat/apps-engine/definition/metadata';
import {ButtonStyle, TextObjectType} from '@rocket.chat/apps-engine/definition/uikit';
import {IUIKitModalViewParam} from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

import {IModalContext} from '../../../definitions/IModalContext';
import {uuid} from '../../utils';

export async function createModal({id = '', args, persistence, data, modify, options = 3}: {
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
        blockId: 'title_block',
        element: blockBuilder.newPlainTextInputElement({
            actionId: 'title',
            placeholder: blockBuilder.newPlainTextObject('请输入标题'),
            initialValue: args[0],
            multiline: false,
        }),
        label: blockBuilder.newPlainTextObject('标题'),
        optional: false,
    })
        .addDividerBlock()
        .addInputBlock({
            blockId: 'description_block',
            element: blockBuilder.newPlainTextInputElement({
                actionId: 'description',
                placeholder: blockBuilder.newPlainTextObject('请输入描述'),
                initialValue: args[0],
                multiline: true,
            }),
            label: blockBuilder.newPlainTextObject('描述'),
            optional: true,
        })
        .addDividerBlock()
        .addImageBlock({
            blockId: 'title_image_block',
            title: {type: TextObjectType.PLAINTEXT, text: '钢铁侠', emoji: false},
            imageUrl: 'https://pics5.baidu.com/feed/810a19d8bc3eb135edb0963f5ae668d5fc1f443a.jpeg?token=4c91ff62ff586ba714063ab12bb60993',
            altText: '钢铁侠提示语',
        });

    for (let i = 0; i < options; i++) {
        blockBuilder.addInputBlock({
            blockId: 'poll' + i + '_block',
            optional: false,
            element: blockBuilder.newPlainTextInputElement({
                actionId: `option-${i}`,
                placeholder: blockBuilder.newPlainTextObject('Insert an option'),
                initialValue: '投票选项' + i,
                multiline: false,
            }),
            label: blockBuilder.newPlainTextObject('poll' + i),
        });
    }

    blockBuilder.addActionsBlock({
        blockId: 'config_block',
        elements: [
            blockBuilder.newStaticSelectElement({
                actionId: 'mode',
                placeholder: blockBuilder.newPlainTextObject('Multiple choices'),
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
                style: ButtonStyle.DANGER,
                url: 'http://www.baidu.com',
            }),
            blockBuilder.newStaticSelectElement({
                actionId: 'visibility',
                placeholder: blockBuilder.newPlainTextObject('Open vote'),
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
            blockBuilder.newMultiStaticElement({
                actionId: 'reason',
                placeholder: blockBuilder.newPlainTextObject('选择原因'),
                initialValue: ['毛色', '体型', '颜值', '其它'],
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
            blockBuilder.newOverflowMenuElement({
                options: [
                    {
                        text: blockBuilder.newPlainTextObject('Overflow 1'),
                        value: 'overflow1',
                    },
                    {
                        text: blockBuilder.newPlainTextObject('Overflow 2'),
                        value: 'overflow2',
                    },
                ],
            }),
        ],
    });

    // blockBuilder.addConditionalBlock()
    // blockBuilder.addContextBlock()
    // blockBuilder.addSectionBlock()

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
